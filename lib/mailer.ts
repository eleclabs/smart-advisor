type MailAddress = string | { email: string; name?: string };

type SendMailOptions = {
  to: MailAddress[];
  subject: string;
  html: string;
  text?: string;
};

function normalizeAddress(address: MailAddress) {
  return typeof address === "string" ? { email: address } : address;
}

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export async function sendMail(options: SendMailOptions) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Smart Advisor";

  const to = options.to
    .map(normalizeAddress)
    .filter((address) => address.email);

  if (!apiKey || !senderEmail) {
    console.warn("[mailer] Brevo is not configured; skipping email:", options.subject);
    return { ok: false as const };
  }

  if (to.length === 0) {
    return { ok: false as const };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to,
        subject: options.subject,
        htmlContent: options.html,
        textContent: options.text
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[mailer] Brevo request failed:", response.status, errorBody);
      return { ok: false as const };
    }

    return { ok: true as const };
  } catch (error) {
    console.error("[mailer] Failed to send email via Brevo:", error);
    return { ok: false as const };
  }
}
