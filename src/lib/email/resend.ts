import { Resend } from 'resend';

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_resend_api_key_here' || apiKey.startsWith('re_placeholder')) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export function getSenderEmail(): string {
  // Use verified sender configured in environment or default to verified domain sender
  return process.env.RESEND_FROM_EMAIL?.trim() || 'Anand Cycling Club <rides@tirthpatel.tech>';
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
  simulated?: boolean;
}

/**
 * Sends an email using Resend with graceful fallback if no API key is set.
 * Does not throw unhandled errors; returns structured result.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo
}: SendEmailOptions): Promise<SendEmailResult> {
  const client = getResendClient();
  const recipientList = Array.isArray(to) ? to : [to];
  const from = getSenderEmail();

  if (!client) {
    console.error(
      `[Resend Error] RESEND_API_KEY is not configured on the server. Outbound email to [${recipientList.join(', ')}] was aborted.`
    );
    return {
      success: false,
      error: 'RESEND_API_KEY is not configured in server environment variables',
      simulated: false
    };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to: recipientList,
      subject,
      html,
      text,
      replyTo: replyTo || process.env.RESEND_REPLY_TO || 'support@anandcyclingclub.in'
    });

    if (error) {
      // Log error safely without exposing API keys or secrets
      console.error(`[Resend Error] Delivery failed to [${recipientList.join(', ')}]:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      id: data?.id
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown email provider error';
    console.error(`[Resend Exception] Delivery exception for [${recipientList.join(', ')}]:`, errorMsg);
    return {
      success: false,
      error: errorMsg
    };
  }
}
