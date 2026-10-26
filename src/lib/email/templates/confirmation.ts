import { CyclingEvent, Registration, Payment } from '@/types';
import { CLUB_NAME, CLUB_LOCATION, CLUB_CONTACT_PHONE, CLUB_CONTACT_EMAIL, formatDateIndian, formatTimeIndian, formatINR } from '@/lib/constants';

interface EmailTemplateProps {
  registration: Registration;
  event: CyclingEvent;
  payment?: Payment | null;
  appUrl?: string;
}

function resolveAppUrl(provided?: string): string {
  if (provided && !provided.includes('localhost')) {
    return provided.replace(/\/$/, '');
  }
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/$/, '');
  }
  return 'https://cycleclub.tirthpatel.tech';
}

export function generateConfirmationEmailHtml({
  registration,
  event,
  payment,
  appUrl
}: EmailTemplateProps): string {
  const isFree = registration.amount_due_paise === 0;
  const baseUrl = resolveAppUrl(appUrl);
  const passUrl = `${baseUrl}/registrations/${encodeURIComponent(registration.public_reference)}`;
  const venueMapQuery = encodeURIComponent(`${event.venue}, ${CLUB_LOCATION}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${venueMapQuery}`;

  const feeDisplay = isFree ? 'FREE ENTRY (₹0)' : formatINR(registration.amount_due_paise);
  const paymentStatusDisplay = isFree 
    ? 'COMPLIMENTARY ACCESS' 
    : (payment?.status === 'succeeded' || registration.status === 'confirmed' ? 'PAYMENT VERIFIED' : 'PENDING');

  const txnRef = payment?.provider_payment_reference ? `Txn Ref: ${payment.provider_payment_reference}` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Official Event Pass • ${escapeHtml(event.title)}</title>
  <style>
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #F7F7F2;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #171914;
    }
    table {
      border-collapse: collapse;
    }
    img {
      border: 0;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    @media only screen and (max-width: 620px) {
      .container {
        width: 100% !important;
        padding: 12px !important;
      }
      .mobile-stack {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .mobile-padding {
        padding: 20px !important;
      }
      .title-large {
        font-size: 24px !important;
        line-height: 28px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F7F2;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F7F2; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <!-- Email Container -->
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; margin: 0 auto;">
          
          <!-- BRAND TOP BAR -->
          <tr>
            <td style="padding: 0 0 20px 0; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <div style="font-size: 13px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: #171914;">
                      ${escapeHtml(CLUB_NAME)}
                    </div>
                    <div style="font-size: 11px; color: #62645C; font-weight: 500; margin-top: 2px;">
                      Gujarat • Premier Peloton Collective
                    </div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: #EAEDE2; border: 1px solid #E5E6DE; color: #171914; font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 10px; border-radius: 999px;">
                      PASS CONFIRMED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CARD -->
          <tr>
            <td style="background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E5E6DE; overflow: hidden; box-shadow: 0 4px 20px -4px rgba(23, 25, 20, 0.06);">
              
              <!-- Dark Hero Banner with Bib -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #171914; color: #FFFFFF;">
                <tr>
                  <td style="padding: 28px 28px 24px 28px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="left" style="vertical-align: top;">
                          <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #C7F36B; font-family: monospace;">
                            OFFICIAL PARTICIPANT BIB
                          </div>
                          <div style="font-size: 26px; font-weight: 900; letter-spacing: 0.08em; color: #FFFFFF; margin-top: 4px; font-family: monospace;">
                            ${escapeHtml(registration.public_reference)}
                          </div>
                        </td>
                        <td align="right" style="vertical-align: top;">
                          <div style="display: inline-block; background-color: #C7F36B; color: #171914; font-size: 11px; font-weight: 900; padding: 6px 12px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.05em;">
                            ✓ ENTRY VERIFIED
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Main Content Body -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 28px 24px 28px;" class="mobile-padding">
                <tr>
                  <td>
                    <!-- Greeting -->
                    <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #62645C; font-weight: 700;">
                      Namaste, ${escapeHtml(registration.full_name)}
                    </div>
                    <div class="title-large" style="font-size: 26px; font-weight: 900; line-height: 32px; color: #171914; text-transform: uppercase; margin-top: 6px; letter-spacing: -0.01em;">
                      ${escapeHtml(event.title)}
                    </div>
                    <div style="font-size: 14px; color: #62645C; line-height: 22px; margin-top: 10px;">
                      Your race entry is locked in. We have registered your bib for the upcoming club stage. Please review the reporting schedule and gear checklist below.
                    </div>

                    <!-- DIVIDER -->
                    <div style="height: 1px; background-color: #E5E6DE; margin: 24px 0;"></div>

                    <!-- STAGE SPECIFICATIONS GRID -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" class="mobile-stack" style="vertical-align: top; padding-bottom: 16px; padding-right: 8px;">
                          <div style="background-color: #F7F7F2; border: 1px solid #E5E6DE; border-radius: 12px; padding: 14px;">
                            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #62645C;">
                              FLAG-OFF DATE & TIME
                            </div>
                            <div style="font-size: 14px; font-weight: 800; color: #171914; margin-top: 4px;">
                              ${escapeHtml(formatDateIndian(event.starts_at))}
                            </div>
                            <div style="font-size: 12px; color: #171914; font-weight: 600; margin-top: 2px;">
                              ${escapeHtml(formatTimeIndian(event.starts_at))} (Reporting: ${escapeHtml(event.reporting_time || '05:30 AM')})
                            </div>
                          </div>
                        </td>
                        <td width="50%" class="mobile-stack" style="vertical-align: top; padding-bottom: 16px; padding-left: 8px;">
                          <div style="background-color: #F7F7F2; border: 1px solid #E5E6DE; border-radius: 12px; padding: 14px;">
                            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #62645C;">
                              STAGE DISTANCE & CATEGORY
                            </div>
                            <div style="font-size: 14px; font-weight: 800; color: #171914; margin-top: 4px;">
                              ${event.distance_km} KM (${escapeHtml(event.difficulty)})
                            </div>
                            <div style="font-size: 12px; color: #62645C; margin-top: 2px;">
                              Elevation: +${event.elevation_gain_m}m
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="vertical-align: top; padding-bottom: 16px;">
                          <div style="background-color: #F7F7F2; border: 1px solid #E5E6DE; border-radius: 12px; padding: 14px;">
                            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #62645C;">
                              STARTING VENUE
                            </div>
                            <div style="font-size: 14px; font-weight: 800; color: #171914; margin-top: 4px;">
                              ${escapeHtml(event.venue)}
                            </div>
                            ${event.location_description ? `<div style="font-size: 12px; color: #62645C; margin-top: 2px;">${escapeHtml(event.location_description)}</div>` : ''}
                            <div style="margin-top: 8px;">
                              <a href="${mapsUrl}" target="_blank" style="font-size: 12px; color: #171914; font-weight: 800; text-decoration: underline;">
                                📍 Open in Google Maps &rarr;
                              </a>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- RIDER & EQUIPMENT DETAILS -->
                    <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #171914; margin: 12px 0 10px 0;">
                      Rider Registration Summary
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border: 1px solid #E5E6DE; border-radius: 12px; font-size: 12px;">
                      <tr>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #E5E6DE; color: #62645C; font-weight: 600;" width="40%">Participant</td>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #E5E6DE; color: #171914; font-weight: 800;" width="60%">${escapeHtml(registration.full_name)} (Age: ${registration.age}, ${escapeHtml(registration.gender)})</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #E5E6DE; color: #62645C; font-weight: 600;">Registered Bicycle</td>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #E5E6DE; color: #171914; font-weight: 800;">
                          <span style="display: inline-block; background-color: #EAEDE2; padding: 2px 8px; border-radius: 4px; font-size: 11px;">
                            ${escapeHtml(registration.bicycle_type || 'Road')}
                          </span>
                          ${registration.bicycle_brand ? ` ${escapeHtml(registration.bicycle_brand)} ${escapeHtml(registration.bicycle_model || '')}` : ''}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #E5E6DE; color: #62645C; font-weight: 600;">Club Apparel Size</td>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #E5E6DE; color: #171914; font-weight: 800;">${escapeHtml(registration.jersey_size || 'None')}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #E5E6DE; color: #62645C; font-weight: 600;">Mobile Number</td>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #E5E6DE; color: #171914; font-weight: 800;">+91 ${escapeHtml(registration.mobile_number)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 14px; color: #62645C; font-weight: 600;">Registration Fee</td>
                        <td style="padding: 10px 14px; color: #171914; font-weight: 800;">
                          ${feeDisplay} &bull; <span style="color: #2e6900;">${paymentStatusDisplay}</span>
                          ${txnRef ? `<div style="font-size: 10px; color: #62645C; font-family: monospace; margin-top: 2px;">${escapeHtml(txnRef)}</div>` : ''}
                        </td>
                      </tr>
                    </table>

                    <!-- PRIMARY CTA: VIEW DIGITAL PASS -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0 16px 0;">
                      <tr>
                        <td align="center">
                          <a href="${passUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(180deg, #d8ff85 0%, #b8f04c 45%, #9dd428 100%); color: #0c1204; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; text-align: center; padding: 16px 24px; border-radius: 12px; text-decoration: none; border-top: 1.5px solid rgba(255,255,255,0.9); box-shadow: 0 4px 14px -2px rgba(184, 240, 76, 0.5);">
                            VIEW OFFICIAL DIGITAL PASS & BIB &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- RIDE DAY INSTRUCTIONS -->
                    <div style="background-color: #EAEDE2; border: 1px solid #E5E6DE; border-radius: 12px; padding: 16px; margin-top: 20px;">
                      <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; color: #171914;">
                        Flag-off Protocols:
                      </div>
                      <ul style="margin: 8px 0 0 0; padding-left: 18px; font-size: 12px; color: #171914; line-height: 20px;">
                        <li><strong>Helmet is strictly mandatory</strong> for all participants at start line.</li>
                        <li>Report 30 minutes prior to flag-off to collect your physical bike bib plate.</li>
                        <li>Hydration support and backup SAG escort van accompany the entire peloton.</li>
                        <li>Hot masala chai & Gujarati breakfast awaits at the finish arch.</li>
                      </ul>
                    </div>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px 8px; text-align: center; font-size: 11px; color: #62645C; line-height: 18px;">
              <div style="font-weight: 700; color: #171914; text-transform: uppercase; letter-spacing: 0.05em;">
                ${escapeHtml(CLUB_NAME)}
              </div>
              <div style="margin-top: 4px;">
                ${escapeHtml(CLUB_LOCATION)} &bull; Helpline: <a href="tel:${CLUB_CONTACT_PHONE.replace(/\s+/g, '')}" style="color: #171914; font-weight: 700; text-decoration: none;">${escapeHtml(CLUB_CONTACT_PHONE)}</a>
              </div>
              <div style="margin-top: 2px;">
                Email: <a href="mailto:${CLUB_CONTACT_EMAIL}" style="color: #171914; font-weight: 700; text-decoration: underline;">${escapeHtml(CLUB_CONTACT_EMAIL)}</a>
              </div>
              <div style="margin-top: 14px; font-size: 10px; color: #62645C; opacity: 0.8;">
                This is an automated confirmation sent to ${escapeHtml(registration.email || 'your registered address')}.
                <br>Registration reference: ${escapeHtml(registration.public_reference)}
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateConfirmationEmailText({
  registration,
  event,
  payment,
  appUrl
}: EmailTemplateProps): string {
  const isFree = registration.amount_due_paise === 0;
  const baseUrl = resolveAppUrl(appUrl);
  const passUrl = `${baseUrl}/registrations/${encodeURIComponent(registration.public_reference)}`;
  const feeDisplay = isFree ? 'FREE ENTRY (₹0)' : formatINR(registration.amount_due_paise);
  const paymentStatus = isFree ? 'Complimentary Access' : (payment?.status === 'succeeded' || registration.status === 'confirmed' ? 'Payment Verified' : 'Pending');

  return `========================================================
${CLUB_NAME.toUpperCase()} — OFFICIAL EVENT CONFIRMATION
========================================================

Namaste ${registration.full_name},

Your registration for ${event.title} is confirmed!

BIB REFERENCE: ${registration.public_reference}
ENTRY STATUS: Confirmed (Verified)

--------------------------------------------------------
EVENT SPECIFICATIONS
--------------------------------------------------------
Event: ${event.title}
Date: ${formatDateIndian(event.starts_at)}
Flag-off Time: ${formatTimeIndian(event.starts_at)}
Reporting Time: ${event.reporting_time || '05:30 AM IST'}
Distance: ${event.distance_km} KM (${event.difficulty})
Elevation: +${event.elevation_gain_m}m
Starting Venue: ${event.venue}
${event.location_description ? `Route: ${event.location_description}` : ''}
Google Maps: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue}, ${CLUB_LOCATION}`)}

--------------------------------------------------------
RIDER & EQUIPMENT DETAILS
--------------------------------------------------------
Rider: ${registration.full_name} (Age: ${registration.age}, Gender: ${registration.gender})
Bicycle Type: ${registration.bicycle_type || 'Road'}${registration.bicycle_brand ? ` (${registration.bicycle_brand} ${registration.bicycle_model || ''})` : ''}
Apparel Size: ${registration.jersey_size || 'None'}
Mobile: +91 ${registration.mobile_number}
Entry Fee: ${feeDisplay} (${paymentStatus})
${payment?.provider_payment_reference ? `Transaction Reference: ${payment.provider_payment_reference}` : ''}

--------------------------------------------------------
VIEW YOUR DIGITAL PASS
--------------------------------------------------------
Access your official digital bib pass anytime:
${passUrl}

--------------------------------------------------------
RIDE DAY PROTOCOLS
--------------------------------------------------------
• Cycling helmet is strictly mandatory at start line.
• Report 30 minutes prior to flag-off to collect physical bib plate.
• Hydration stations and SAG escort van available throughout the route.
• Hot masala chai & breakfast at the finish arch.

Questions or assistance?
Helpline: ${CLUB_CONTACT_PHONE}
Email: ${CLUB_CONTACT_EMAIL}
Location: ${CLUB_LOCATION}
`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
