'use server'

import type { ContactFormErrorKey } from '@/types/intl.d'

import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getLocale } from 'next-intl/server'

import { sendLeadNotification } from '@/lib/api/resend'
import { getLeadById, insertLead, updateLeadStatus } from '@/lib/d1/client'
import { checkRateLimit } from '@/lib/rate-limit'
import { leadSchema } from '@/lib/schemas/lead'
import { verifyTurnstile } from '@/lib/turnstile/verify'

export interface SubmitLeadState {
  success?: boolean
  message?: ContactFormErrorKey
  errors?: Record<string, string[]>
}

function getString(value: FormDataEntryValue | null): string | undefined {
  return typeof value === 'string' ? value : undefined
}

export async function submitLead(
  _previousState: SubmitLeadState,
  formData: FormData,
): Promise<SubmitLeadState> {
  const locale = await getLocale()

  const rawData = {
    name: getString(formData.get('name')),
    email: getString(formData.get('email')),
    phone: getString(formData.get('phone')),
    company: getString(formData.get('company')),
    inquiryType: getString(formData.get('inquiryType')),
    productSlug: getString(formData.get('productSlug')),
    productName: getString(formData.get('productName')),
    formPage: getString(formData.get('formPage')),
    message: getString(formData.get('message')),
    locale,
    turnstileToken: getString(formData.get('cf-turnstile-response')),
  }

  const parsed = leadSchema.safeParse(rawData)

  if (!parsed.success) {
    // Using flatten() for simpler field error structure (treeifyError would be overkill here)
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const { fieldErrors } = parsed.error.flatten()
    return {
      success: false,
      message: 'validation_error',
      errors: fieldErrors as Record<string, string[]>,
    }
  }

  const { env } = await getCloudflareContext<CloudflareEnv>({ async: true })
  const email = parsed.data.email.toLowerCase()
  let leadId: string | undefined

  try {
    const turnstileSecretKey = env.TURNSTILE_SECRET_KEY
    if (!turnstileSecretKey) {
      console.error('TURNSTILE_SECRET_KEY not configured')
      return { success: false, message: 'server_error' }
    }
    const turnstileResult = await verifyTurnstile(
      parsed.data.turnstileToken,
      turnstileSecretKey,
    )
    if (!turnstileResult.success) {
      return { success: false, message: 'turnstile_failed' }
    }

    const kv = env.NEXT_INC_CACHE_KV
    if (!kv) {
      throw new Error('KV namespace not configured')
    }
    const rateLimitResult = await checkRateLimit(kv, `lead:${email}`)
    if (!rateLimitResult.allowed) {
      return { success: false, message: 'rate_limited' }
    }

    const { turnstileToken: _, ...leadData } = parsed.data
    const normalizedLead = {
      ...leadData,
      email,
      phone: leadData.phone ?? undefined,
      company: leadData.company ?? undefined,
      inquiryType: leadData.inquiryType ?? undefined,
      productSlug: leadData.productSlug ?? undefined,
      productName: leadData.productName ?? undefined,
      formPage: leadData.formPage ?? undefined,
      message: leadData.message ?? '',
    }

    leadId = await insertLead(env.CONTACT_FORM_D1, normalizedLead)

    // ------------------------------------------------------------------
    // QUEUE ENABLEMENT: Async Lead Processing
    // ------------------------------------------------------------------
    // Current: Synchronous processing (email sent inline during request)
    // Target:  Async processing via Cloudflare Queue (requires Workers Paid plan)
    //
    // To enable Queue-based processing:
    // 1. Upgrade to Workers Paid plan
    // 2. Uncomment queue bindings in wrangler.toml:
    //    [[queues.producers]]
    //    queue = "lead-notifications"
    //    binding = "LEAD_QUEUE"
    //    [[queues.consumers]]
    //    queue = "lead-notifications"
    //    max_batch_size = 10
    //    max_batch_timeout = 30
    // 3. Add LEAD_QUEUE to CloudflareEnv type (regenerate with: wrangler types)
    // 4. Replace the synchronous block below with:
    //    await env.LEAD_QUEUE.send({ leadId })
    // 5. The consumer in src/queue/consumer.ts handles email + Airtable sync
    // ------------------------------------------------------------------
    const lead = await getLeadById(env.CONTACT_FORM_D1, leadId)
    if (
      lead &&
      env.RESEND_API_KEY &&
      env.RESEND_FROM_EMAIL &&
      env.RESEND_TO_EMAIL
    ) {
      await sendLeadNotification({
        lead,
        apiKey: env.RESEND_API_KEY,
        fromEmail: env.RESEND_FROM_EMAIL,
        toEmail: env.RESEND_TO_EMAIL,
      }).catch((error) => {
        console.error('Email notification failed:', error)
      })
      await updateLeadStatus(env.CONTACT_FORM_D1, leadId, 'processed')
    }

    return { success: true }
  } catch (error) {
    console.error('submitLead failed', error)
    if (leadId) {
      await updateLeadStatus(env.CONTACT_FORM_D1, leadId, 'failed').catch(
        Boolean,
      )
    }
    return { success: false, message: 'server_error' }
  }
}
