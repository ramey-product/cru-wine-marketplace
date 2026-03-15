/**
 * Shared email layout wrapper — branded HTML template for all Cru emails.
 * Uses inline styles for maximum email client compatibility.
 */

const BRAND_COLOR = '#722F37' // Burgundy/wine
const MUTED_COLOR = '#6b7280'
const BG_COLOR = '#faf9f7'

export function emailLayout(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cru</title>
</head>
<body style="margin:0;padding:0;background-color:${BG_COLOR};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_COLOR};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;background-color:${BRAND_COLOR};">
              <span style="font-size:24px;font-weight:700;color:#ffffff;font-style:italic;letter-spacing:0.5px;">Cru</span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:${MUTED_COLOR};line-height:1.5;">
                This email was sent by Cru. If you have questions about your order, please contact the retailer directly or reply to this email.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:${MUTED_COLOR};">
                &copy; ${new Date().getFullYear()} Cru Wine Marketplace
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
