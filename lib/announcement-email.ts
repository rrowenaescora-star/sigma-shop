export type AnnouncementContent = {
  subject: string;
  productName: string;
  title: string;
  imageUrl: string;
  message: string;
  secondaryText?: string;
  ctaText: string;
  ctaUrl: string;
};

export function replaceProductToken(value: string, productName: string) {
  return value.replace(/\{FRUIT_NAME\}/gi, productName);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function paragraphs(value: string) {
  return escapeHtml(value)
    .split(/\n{2,}/)
    .map((paragraph) =>
      `<p style="margin:0 0 16px 0; font-size:15px; line-height:1.75; color:#374151;">${paragraph.replace(/\n/g, "<br />")}</p>`,
    )
    .join("");
}

export function renderAnnouncementEmail(
  content: AnnouncementContent,
  appUrl: string,
) {
  const productName = escapeHtml(content.productName);
  const title = escapeHtml(replaceProductToken(content.title, content.productName));
  const message = paragraphs(replaceProductToken(content.message, content.productName));
  const secondary = content.secondaryText
    ? `<div style="border:1px solid #fed7aa; background:#fff7ed; border-radius:12px; padding:16px; margin:4px 0 24px 0;"><p style="margin:0; font-size:13px; line-height:1.65; color:#7c2d12;">${escapeHtml(replaceProductToken(content.secondaryText, content.productName))}</p></div>`
    : "";
  const headerUrl = `${appUrl.replace(/\/$/, "")}/header-email.png`;

  return `
    <!doctype html>
    <html>
      <body style="margin:0; padding:0; background:#eaf0ff; font-family:Arial, Helvetica, sans-serif; color:#111827;">
        <div style="width:100%; background:#eaf0ff; padding:0;">
          <div style="max-width:720px; margin:0 auto; background:#ffffff; overflow:hidden;">
            <img src="${escapeHtml(headerUrl)}" alt="Bloxhop" width="720" style="display:block; width:100%; max-width:720px; height:auto; border:0; outline:none; text-decoration:none;" />
            <div style="padding:34px 38px 30px 38px;">
              <p style="margin:0 0 10px 0; color:#f59e0b; font-size:12px; font-weight:900; letter-spacing:1.8px; text-transform:uppercase;">New at Bloxhop</p>
              <h1 style="margin:0 0 22px 0; font-size:30px; line-height:1.2; color:#111827;">${title}</h1>
              <img src="${escapeHtml(content.imageUrl)}" alt="${productName}" width="644" style="display:block; width:100%; max-width:644px; height:auto; max-height:460px; object-fit:contain; margin:0 0 24px 0; border:0; border-radius:16px; background:#07111f;" />
              <div style="border:1px solid #e5e7eb; border-radius:14px; padding:20px; margin-bottom:22px; background:#ffffff;">
                <p style="margin:0 0 12px 0; font-size:12px; color:#64748b; font-weight:800; letter-spacing:1.4px; text-transform:uppercase;">Featured release</p>
                <p style="margin:0; color:#f59e0b; font-size:24px; line-height:1.25; font-weight:900;">${productName}</p>
              </div>
              ${message}
              ${secondary}
              <div style="text-align:center; padding:8px 0 12px 0;">
                <a href="${escapeHtml(content.ctaUrl)}" style="display:inline-block; background:#fb923c; color:#ffffff; padding:15px 24px; border-radius:10px; text-decoration:none; font-weight:900; font-size:15px;">${escapeHtml(content.ctaText)}</a>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb; padding-top:20px; margin-top:18px;">
                <tr>
                  <td width="33%" valign="top" style="padding-right:12px;"><p style="margin:0 0 6px; font-size:12px; font-weight:900;">FAST DELIVERY</p><p style="margin:0; font-size:11px; color:#64748b; line-height:1.5;">Digital fulfillment as quickly as possible.</p></td>
                  <td width="33%" valign="top" style="padding:0 12px; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;"><p style="margin:0 0 6px; font-size:12px; font-weight:900;">SECURE ORDERS</p><p style="margin:0; font-size:11px; color:#64748b; line-height:1.5;">Your orders are safe and protected.</p></td>
                  <td width="33%" valign="top" style="padding-left:12px;"><p style="margin:0 0 6px; font-size:12px; font-weight:900;">CUSTOMER SUPPORT</p><p style="margin:0; font-size:11px; color:#64748b; line-height:1.5;">Our team is available when you need help.</p></td>
                </tr>
              </table>
            </div>
            <div style="background:#050b16; border-top:5px solid #f59e0b; padding:22px 24px; text-align:center; color:#cbd5e1;">
              <p style="margin:0 0 10px 0; font-size:13px;">Thank you for being part of Bloxhop!</p>
              <p style="margin:0; font-size:11px; color:#94a3b8;">© ${new Date().getFullYear()} Bloxhop. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>`;
}