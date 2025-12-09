'use server';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getLocale } from 'next-intl/server';

import { sendLeadNotification } from '@/lib/api/resend';
import { getLeadById, insertLead, updateLeadStatus } from '@/lib/d1/client';
import { checkRateLimit } from '@/lib/rate-limit';
import { leadSchema } from '@/lib/schemas/lead';
import { verifyTurnstile } from '@/lib/turnstile/verify';

export interface SubmitLeadState {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

function getString(value: FormDataEntryValue | null): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export async function submitLead(
  _previousState: SubmitLeadState,
  formData: FormData
): Promise<SubmitLeadState> {
  const locale = await getLocale();

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
  };

  const parsed = leadSchema.safeParse(rawData);

  if (!parsed.success) {
    // Using flatten() for simpler field error structure (treeifyError would be overkill here)
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const { fieldErrors } = parsed.error.flatten();
    return {
      success: false,
      message: 'validation_error',
      errors: fieldErrors as Record<string, string[]>,
    };
  }

  const { env } = await getCloudflareContext<CloudflareEnv>({ async: true });
  const email = parsed.data.email.toLowerCase();
  let leadId: string | undefined;

  try {
    const turnstileSecretKey = env.TURNSTILE_SECRET_KEY;
    const turnstileResult = await verifyTurnstile(
      parsed.data.turnstileToken,
      turnstileSecretKey
    );
    if (!turnstileResult.success) {
      return { success: false, message: 'turnstile_failed' };
    }

    const kv = env.NEXT_INC_CACHE_KV;
    if (!kv) {
      throw new Error('KV namespace not configured');
    }
    const rateLimitResult = await checkRateLimit(kv, `lead:${email}`);
    if (!rateLimitResult.allowed) {
      return { success: false, message: 'rate_limited' };
    }

    const { turnstileToken: _, ...leadData } = parsed.data;
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
    };

    leadId = await insertLead(env.CONTACT_FORM_D1, normalizedLead);

    // Process lead synchronously (Queue requires Workers Paid plan)
    // When Queue is available, replace this block with: await env.LEAD_QUEUE.send({ leadId });
    const lead = await getLeadById(env.CONTACT_FORM_D1, leadId);
    if (lead && env.RESEND_API_KEY && env.RESEND_FROM_EMAIL && env.RESEND_TO_EMAIL) {
      await sendLeadNotification({
        lead,
        apiKey: env.RESEND_API_KEY,
        fromEmail: env.RESEND_FROM_EMAIL,
        toEmail: env.RESEND_TO_EMAIL,
      }).catch((error) => {
        console.error('Email notification failed:', error);
      });
      await updateLeadStatus(env.CONTACT_FORM_D1, leadId, 'processed');
    }

    return { success: true, message: 'success' };
  } catch (error) {
    console.error('submitLead failed', error);
    if (leadId) {
      await updateLeadStatus(env.CONTACT_FORM_D1, leadId, 'failed').catch(Boolean);
    }
    return { success: false, message: 'server_error' };
  }
}
