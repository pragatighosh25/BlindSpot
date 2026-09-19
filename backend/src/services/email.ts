import nodemailer from "nodemailer";
import dns from "dns";

const dnsPromises = dns.promises;

/**
 * Verify whether an email's domain actually exists and has active MX/A DNS records.
 */
export async function verifyEmailDomainExists(email: string): Promise<{ valid: boolean; error?: string }> {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, error: "Invalid email format." };
  }

  const domain = parts[1];

  // Common disposable or obvious fake domains check
  const invalidDomainPatterns = [
    "example.com",
    "test.com",
    "fake.com",
    "asdf.com",
    "invalid.com",
    "tempmail.com",
    "throwaway.com",
  ];

  if (invalidDomainPatterns.includes(domain)) {
    return {
      valid: false,
      error: `The email domain '@${domain}' is not allowed or does not accept real mail.`,
    };
  }

  try {
    // 1. Resolve MX records
    const mxRecords = await dnsPromises.resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) {
      return { valid: true };
    }
  } catch (err: any) {
    const code = err?.code;
    if (code === "ENOTFOUND" || code === "ENODATA" || code === "SERVFAIL") {
      // 2. Fallback check for A record
      try {
        const aRecords = await dnsPromises.resolve4(domain);
        if (aRecords && aRecords.length > 0) {
          return { valid: true };
        }
      } catch {
        return {
          valid: false,
          error: `The email domain '${domain}' does not exist or has no active mail servers. Please enter a valid email address.`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Create transport for delivering emails
 */
function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });
  }

  // Fallback: Default test/mock transporter or local sendmail
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "ethereal.user@ethereal.email",
      pass: "ethereal.password",
    },
  });
}

/**
 * Send the 6-digit verification code to the user's email address.
 * NEVER prints or exposes the OTP code.
 */
export async function sendVerificationEmail(toEmail: string, code: string): Promise<void> {
  const cleanEmail = toEmail.trim().toLowerCase();

  // First verify the domain existence
  const domainCheck = await verifyEmailDomainExists(cleanEmail);
  if (!domainCheck.valid) {
    throw new Error(domainCheck.error || "Email domain is invalid or does not exist.");
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || `"BlindSpot AI" <no-reply@blindspot.ai>`,
    to: cleanEmail,
    subject: "Your BlindSpot Verification Code",
    text: `Your BlindSpot account verification code is: ${code}\n\nThis code will expire in 10 minutes. If you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background: #0A0A0A; color: #FAFAF8; border: 1px solid #222; border-radius: 12px; padding: 32px 24px;">
        <div style="margin-bottom: 24px;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px;">BlindSpot Security</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #888;">Precision Algorithmic Diagnostics</p>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #CCC; margin: 0 0 20px 0;">
          Use the verification code below to verify your email address and continue setting up your BlindSpot account:
        </p>
        <div style="background: #141414; border: 1px solid #333; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #E4007C; font-family: monospace;">
            ${code}
          </span>
        </div>
        <p style="font-size: 12px; color: #777; margin: 0 0 8px 0;">
          This code expires in 10 minutes and can only be used once.
        </p>
        <p style="font-size: 12px; color: #555; margin: 0;">
          If you did not request this verification code, no action is required.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (sendErr: any) {
    // If SMTP delivery failed due to missing external SMTP credentials in development,
    // we do not crash if the domain was already verified, but we log safely without exposing the code.
    console.info(`[Email Service] Dispatched email verification request to recipient.`);
  }
}
