import { Resend } from 'resend'

/**
 * Shared Resend client instance.
 * Uses RESEND_API_KEY env var (server-only).
 * Falls back to a no-op mode when the key is missing (local dev).
 */
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

/** Default sender address for all Cru transactional emails. */
export const FROM_ADDRESS = 'Cru <orders@cru.wine>'

/** Ops team email for internal alerts. */
export const OPS_ALERT_ADDRESS = process.env.OPS_ALERT_EMAIL ?? 'ops@cru.wine'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

/**
 * Send a transactional email via Resend.
 * Retries once on failure. Falls back to console.log when
 * RESEND_API_KEY is not configured (local development).
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.log('[EMAIL DEV] Would send:', {
      from: FROM_ADDRESS,
      to: options.to,
      subject: options.subject,
    })
    return { success: true }
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      ...(options.replyTo && { replyTo: options.replyTo }),
    })

    if (error) {
      // Retry once
      console.warn('[EMAIL] First attempt failed, retrying:', error.message)
      const retry = await resend.emails.send({
        from: FROM_ADDRESS,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        ...(options.replyTo && { replyTo: options.replyTo }),
      })

      if (retry.error) {
        console.error('[EMAIL] Retry failed:', retry.error.message)
        return { success: false, error: retry.error.message }
      }
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[EMAIL] Exception:', message)
    return { success: false, error: message }
  }
}
