/**
 * Queue Consumer for Async Lead Processing
 *
 * STATUS: Ready for activation (requires Workers Paid plan)
 *
 * This consumer handles lead notifications asynchronously:
 * - Sends email notifications via Resend
 * - Syncs lead data to Airtable (if configured)
 * - Manages lead status in D1 database
 *
 * ACTIVATION STEPS:
 * 1. Upgrade to Workers Paid plan
 * 2. Uncomment queue bindings in wrangler.toml
 * 3. Regenerate types: pnpm wrangler types
 * 4. Update submit-lead.ts to use Queue (see comments there)
 * 5. Deploy: pnpm wrangler deploy
 *
 * BENEFITS OF QUEUE-BASED PROCESSING:
 * - Faster user response (form submission returns immediately)
 * - Automatic retries on failure (message.retry())
 * - Better error isolation (failures don't affect user experience)
 * - Batch processing capability (max_batch_size=10)
 */

import { syncLeadToAirtable } from '@/lib/api/airtable'
import { sendLeadNotification } from '@/lib/api/resend'
import { getLeadById, updateLeadStatus } from '@/lib/d1/client'

interface QueueMessage {
  leadId: string
}

interface QueueEnvironment {
  CONTACT_FORM_D1: D1Database
  RESEND_API_KEY: string
  RESEND_FROM_EMAIL: string
  RESEND_TO_EMAIL: string
  AIRTABLE_API_KEY: string
  AIRTABLE_BASE_ID: string
  AIRTABLE_TABLE_NAME: string
}

export default {
  async queue(
    batch: MessageBatch<QueueMessage>,
    environment: QueueEnvironment,
  ): Promise<void> {
    for (const message of batch.messages) {
      const { leadId } = message.body

      try {
        const lead = await getLeadById(environment.CONTACT_FORM_D1, leadId)

        if (!lead) {
          console.error(`Lead not found: ${leadId}`)
          message.ack()
          continue
        }

        const emailResult = await sendLeadNotification({
          lead,
          apiKey: environment.RESEND_API_KEY,
          fromEmail: environment.RESEND_FROM_EMAIL,
          toEmail: environment.RESEND_TO_EMAIL,
        })

        if (!emailResult.success) {
          console.error(`Email failed for ${leadId}:`, emailResult.error)
          await updateLeadStatus(environment.CONTACT_FORM_D1, leadId, 'failed')
          message.retry()
          continue
        }

        if (environment.AIRTABLE_API_KEY && environment.AIRTABLE_BASE_ID) {
          const airtableResult = await syncLeadToAirtable({
            lead,
            apiKey: environment.AIRTABLE_API_KEY,
            baseId: environment.AIRTABLE_BASE_ID,
            tableName: environment.AIRTABLE_TABLE_NAME || 'Leads',
          })

          if (!airtableResult.success) {
            console.error(
              `Airtable sync failed for ${leadId}:`,
              airtableResult.error,
            )
            await updateLeadStatus(
              environment.CONTACT_FORM_D1,
              leadId,
              'failed',
            )
            message.retry()
            continue
          }
        }

        await updateLeadStatus(environment.CONTACT_FORM_D1, leadId, 'processed')
        message.ack()
      } catch (error) {
        console.error(`Queue processing failed for ${leadId}:`, error)
        await updateLeadStatus(environment.CONTACT_FORM_D1, leadId, 'failed')
        message.retry()
      }
    }
  },
}
