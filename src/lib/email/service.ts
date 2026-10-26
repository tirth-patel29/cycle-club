import { db } from '@/lib/db';
import { CyclingEvent, Registration, Payment } from '@/types';
import { sendEmail } from './resend';
import { generateConfirmationEmailHtml, generateConfirmationEmailText } from './templates/confirmation';

export interface ConfirmationEmailParams {
  registration: Registration;
  event: CyclingEvent;
  payment?: Payment | null;
}

export interface EmailDispatchResult {
  sent: boolean;
  skipped?: boolean;
  reason?: string;
  emailId?: string;
  recipient?: string;
  error?: string;
}

/**
 * Safely dispatches the official registration confirmation email via Resend.
 *
 * Rules:
 * 1. Only dispatches if registration.status === 'confirmed'.
 * 2. Idempotent: checks delivery tracking to prevent duplicate sends.
 * 3. Never throws; email provider failure will never interrupt registration or payment.
 * 4. Resolves recipient from registration.email or associated rider profile.
 */
export async function sendConfirmationEmailSafely({
  registration,
  event,
  payment
}: ConfirmationEmailParams): Promise<EmailDispatchResult> {
  try {
    // 1. Guard: must be confirmed
    if (registration.status !== 'confirmed') {
      console.log(
        `[EmailService] Registration ${registration.public_reference} status is "${registration.status}". Skipping confirmation email.`
      );
      return {
        sent: false,
        skipped: true,
        reason: `Registration status is ${registration.status}, not confirmed`
      };
    }

    // 2. Resolve recipient email
    let recipientEmail = registration.email?.trim();

    if (!recipientEmail && registration.rider_id) {
      try {
        const profile = await db.getRiderProfile(registration.rider_id);
        if (profile?.email && profile.email !== 'rider@example.in') {
          recipientEmail = profile.email.trim();
        }
      } catch {
        // Ignored
      }
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.warn(
        `[EmailService] No valid recipient email address for registration ${registration.public_reference}. Skipping email dispatch.`
      );
      return {
        sent: false,
        skipped: true,
        reason: 'No valid recipient email address found'
      };
    }

    // 3. Idempotency Check: prevent duplicate emails
    const alreadySent = await db.isEmailDelivered(registration.id, 'event_confirmation');
    if (alreadySent) {
      console.log(
        `[EmailService] Confirmation email already recorded for registration ${registration.public_reference} (${registration.id}). Skipping duplicate dispatch.`
      );
      return {
        sent: false,
        skipped: true,
        reason: 'Duplicate send prevented by idempotency check',
        recipient: recipientEmail
      };
    }

    // 4. Generate Branded Templates
    const subject = `Official Pass Confirmed • ${event.title} [${registration.public_reference}]`;
    const html = generateConfirmationEmailHtml({
      registration,
      event,
      payment
    });
    const text = generateConfirmationEmailText({
      registration,
      event,
      payment
    });

    // 5. Send via Resend
    const result = await sendEmail({
      to: recipientEmail,
      subject,
      html,
      text
    });

    if (result.success) {
      // Record successful delivery
      await db.recordEmailDelivery({
        registrationId: registration.id,
        recipientEmail,
        emailType: 'event_confirmation',
        resendEmailId: result.id,
        status: 'sent'
      });

      await db.logAudit('system', 'CONFIRMATION_EMAIL_SENT', 'registration', registration.id, {
        reference: registration.public_reference,
        recipient: recipientEmail,
        resend_id: result.id,
        simulated: Boolean(result.simulated)
      });

      console.log(
        `[EmailService] Confirmation email successfully sent to ${recipientEmail} for pass ${registration.public_reference} (ID: ${result.id})`
      );

      return {
        sent: true,
        emailId: result.id,
        recipient: recipientEmail
      };
    } else {
      // Record failed delivery attempt for diagnostic/retry
      await db.recordEmailDelivery({
        registrationId: registration.id,
        recipientEmail,
        emailType: 'event_confirmation',
        status: 'failed',
        errorMessage: result.error
      });

      console.error(
        `[EmailService] Failed to deliver confirmation email for ${registration.public_reference} to ${recipientEmail}: ${result.error}`
      );

      return {
        sent: false,
        recipient: recipientEmail,
        error: result.error
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown exception in email dispatch';
    console.error(`[EmailService] Exception during confirmation email dispatch: ${errorMsg}`);
    return {
      sent: false,
      error: errorMsg
    };
  }
}
