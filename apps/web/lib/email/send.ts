type EmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  fromName?: string;
};

export async function sendEmail({ to, subject, html, from, fromName }: EmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured. Add it to your .env.local file.");

  const fromEmail = from ?? process.env.DEFAULT_FROM_EMAIL ?? "noreply@orghub.app";
  const fromField = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
  const toList = Array.isArray(to) ? to : [to];

  // Resend supports up to 50 recipients per request — batch if needed
  const BATCH = 50;
  for (let i = 0; i < toList.length; i += BATCH) {
    const batch = toList.slice(i, i + BATCH);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromField,
        to: batch,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Resend error ${res.status}: ${text}`);
    }
  }
}

export function inviteEmailHtml({ orgName, joinUrl }: { orgName: string; joinUrl: string }): string {
  return `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 2rem; color: #111827;">
  <h1 style="font-size: 1.5rem; font-weight: 800; margin: 0 0 0.5rem;">You're invited to join ${orgName}</h1>
  <p style="color: #6b7280; margin: 0 0 2rem; line-height: 1.6;">
    You've been invited to create an account on the ${orgName} member portal.
    Click the button below to accept your invitation and get started.
  </p>
  <a href="${joinUrl}" style="display: inline-block; padding: 0.85rem 2rem; background: #3b82f6; color: #fff; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 1rem;">
    Accept invitation →
  </a>
  <p style="color: #9ca3af; font-size: 0.8rem; margin: 2rem 0 0; line-height: 1.5;">
    This link expires in 7 days. If you weren't expecting this, you can ignore this email.
  </p>
</div>`.trim();
}

export function newsletterEmailHtml({
  orgName, title, body, portalUrl,
}: { orgName: string; title: string; body: string; portalUrl: string }): string {
  const escaped = body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const formatted = escaped.replace(/\n/g, "<br>");
  return `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #111827;">
  <p style="font-size: 0.8rem; color: #9ca3af; margin: 0 0 1.5rem; text-transform: uppercase; letter-spacing: 0.08em;">${orgName}</p>
  <h1 style="font-size: 1.75rem; font-weight: 800; margin: 0 0 1.5rem; line-height: 1.2;">${title}</h1>
  <div style="line-height: 1.7; color: #374151;">${formatted}</div>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0;" />
  <p style="color: #9ca3af; font-size: 0.8rem; margin: 0;">
    You're receiving this as a member of ${orgName}.
    <a href="${portalUrl}" style="color: #3b82f6;">Visit the portal →</a>
  </p>
</div>`.trim();
}

export function renewalReminderEmailHtml({
  memberName, orgName, duesPaidThrough, daysUntilExpiry, renewalUrl,
}: {
  memberName: string;
  orgName: string;
  duesPaidThrough: string;
  daysUntilExpiry: number;
  renewalUrl: string;
}): string {
  const expiryDate = new Date(duesPaidThrough + "T00:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const urgentColor = daysUntilExpiry <= 7 ? "#fef2f2" : "#fffbeb";
  const urgentBorder = daysUntilExpiry <= 7 ? "#fecaca" : "#fde68a";
  const urgentText = daysUntilExpiry <= 7 ? "#b91c1c" : "#92400e";
  return `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 2rem; color: #111827;">
  <p style="font-size: 0.8rem; color: #9ca3af; margin: 0 0 1rem; text-transform: uppercase; letter-spacing: 0.08em;">${orgName}</p>
  <h1 style="font-size: 1.4rem; font-weight: 800; margin: 0 0 1rem;">Your membership expires in ${daysUntilExpiry} days</h1>
  <p style="color: #6b7280; margin: 0 0 1.5rem; line-height: 1.6;">Hi ${memberName}, your ${orgName} membership expires on <strong>${expiryDate}</strong>. Renew now to keep access to member benefits.</p>
  <div style="background: ${urgentColor}; border: 1px solid ${urgentBorder}; border-radius: 8px; padding: 0.875rem 1rem; margin-bottom: 1.5rem;">
    <span style="color: ${urgentText}; font-weight: 600; font-size: 0.875rem;">
      ${daysUntilExpiry <= 7 ? "⚠️ Expires soon — renew today to avoid interruption." : "🔔 Renew in the next 30 days to stay current."}
    </span>
  </div>
  <a href="${renewalUrl}" style="display: inline-block; padding: 0.85rem 2rem; background: #3b82f6; color: #fff; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 1rem;">
    Renew my membership →
  </a>
  <p style="color: #9ca3af; font-size: 0.8rem; margin: 2rem 0 0; line-height: 1.5;">
    If you've already renewed, you can ignore this email.
  </p>
</div>`.trim();
}

export function welcomeEmailHtml({
  memberName, orgName, portalUrl,
}: {
  memberName: string;
  orgName: string;
  portalUrl: string;
}): string {
  return `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 2rem; color: #111827;">
  <p style="font-size: 0.8rem; color: #9ca3af; margin: 0 0 1rem; text-transform: uppercase; letter-spacing: 0.08em;">${orgName}</p>
  <h1 style="font-size: 1.5rem; font-weight: 800; margin: 0 0 0.5rem;">Welcome, ${memberName}!</h1>
  <p style="color: #6b7280; margin: 0 0 2rem; line-height: 1.6;">
    Your account for the ${orgName} member portal is ready. You can now access events, newsletters, and all member resources.
  </p>
  <a href="${portalUrl}/dashboard" style="display: inline-block; padding: 0.85rem 2rem; background: #3b82f6; color: #fff; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 1rem;">
    Go to your dashboard →
  </a>
  <p style="color: #9ca3af; font-size: 0.8rem; margin: 2rem 0 0; line-height: 1.5;">
    Questions? Reply to this email and we'll be happy to help.
  </p>
</div>`.trim();
}

export function ticketConfirmationEmailHtml({
  memberName, orgName, eventTitle, eventDate, eventLocation,
  ticketTypeName, quantity, amountCents, eventUrl,
}: {
  memberName: string;
  orgName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string | null;
  ticketTypeName: string;
  quantity: number;
  amountCents: number;
  eventUrl: string;
}): string {
  const amount = `$${(amountCents / 100).toFixed(2)}`;
  return `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 2rem; color: #111827;">
  <p style="font-size: 0.8rem; color: #9ca3af; margin: 0 0 1rem; text-transform: uppercase; letter-spacing: 0.08em;">${orgName}</p>
  <h1 style="font-size: 1.4rem; font-weight: 800; margin: 0 0 0.5rem;">Your ticket is confirmed!</h1>
  <p style="color: #6b7280; margin: 0 0 1.5rem; line-height: 1.6;">Hi ${memberName}, your ticket purchase for <strong>${eventTitle}</strong> has been confirmed.</p>
  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.25rem; margin-bottom: 1.5rem;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 0.4rem 0; color: #6b7280; font-size: 0.875rem;">Event</td><td style="padding: 0.4rem 0; font-weight: 600; text-align: right;">${eventTitle}</td></tr>
      <tr><td style="padding: 0.4rem 0; color: #6b7280; font-size: 0.875rem;">Date</td><td style="padding: 0.4rem 0; font-weight: 600; text-align: right;">${eventDate}</td></tr>
      ${eventLocation ? `<tr><td style="padding: 0.4rem 0; color: #6b7280; font-size: 0.875rem;">Location</td><td style="padding: 0.4rem 0; font-weight: 600; text-align: right;">${eventLocation}</td></tr>` : ""}
      <tr><td style="padding: 0.4rem 0; color: #6b7280; font-size: 0.875rem;">Ticket type</td><td style="padding: 0.4rem 0; font-weight: 600; text-align: right;">${ticketTypeName}</td></tr>
      <tr><td style="padding: 0.4rem 0; color: #6b7280; font-size: 0.875rem;">Quantity</td><td style="padding: 0.4rem 0; font-weight: 600; text-align: right;">${quantity}</td></tr>
      <tr style="border-top: 1px solid #e5e7eb;"><td style="padding: 0.6rem 0 0; font-weight: 700;">Total paid</td><td style="padding: 0.6rem 0 0; font-weight: 800; text-align: right;">${amount}</td></tr>
    </table>
  </div>
  <a href="${eventUrl}" style="display: inline-block; padding: 0.75rem 1.75rem; background: #3b82f6; color: #fff; border-radius: 8px; font-weight: 700; text-decoration: none;">
    View event details →
  </a>
</div>`.trim();
}
