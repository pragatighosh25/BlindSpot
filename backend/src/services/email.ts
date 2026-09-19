import nodemailer from "nodemailer";
import dns from "dns";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from backend/.env and root .env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const dnsPromises = dns.promises;

/**
 * Verify whether an email's domain actually exists and has active MX/A DNS records.
 */
export async function verifyEmailDomainExists(email: string): Promise<{ valid: boolean; error?: string }> {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, error: "Please enter a valid email address." };
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
    "mailinator.com",
    "10minutemail.com",
  ];

  if (invalidDomainPatterns.includes(domain)) {
    return {
      valid: false,
      error: `The email domain '@${domain}' does not accept real mail. Please use a valid email address.`,
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
          error: `The email domain '${domain}' does not exist or has no active mail servers. Please check your email address.`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Send email via Resend API if RESEND_API_KEY is available
 */
async function sendViaResend(toEmail: string, code: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "BlindSpot AI <onboarding@resend.dev>",
      to: [toEmail],
      subject: "Your BlindSpot Verification Code",
      html: getEmailHtml(code),
      text: `Your BlindSpot verification code is: ${code}\nThis code will expire in 10 minutes.`,
    }),
  });

  const data = (await res.json()) as any;
  if (!res.ok) {
    throw new Error(data?.message || "Failed to send email via Resend.");
  }
  return true;
}

/**
 * Create transport for delivering emails via standard SMTP or Gmail
 */
function createTransporter() {
  const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASS || process.env.GMAIL_PASS || process.env.EMAIL_PASS;

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  }

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

  return null;
}

function getEmailHtml(code: string): string {
  return `
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
  `;
}

/**
 * Send the 6-digit verification code to the user's email address.
 * NEVER prints or exposes the OTP code in terminal.
 */
export async function sendVerificationEmail(toEmail: string, code: string): Promise<void> {
  const cleanEmail = toEmail.trim().toLowerCase();

  // First verify the domain existence via DNS MX
  const domainCheck = await verifyEmailDomainExists(cleanEmail);
  if (!domainCheck.valid) {
    throw new Error(domainCheck.error || "Email domain is invalid or does not exist.");
  }

  // 1. Try Resend API if key is present
  if (process.env.RESEND_API_KEY) {
    try {
      await sendViaResend(cleanEmail, code);
      return;
    } catch (err: any) {
      console.warn(`[Email Service] Resend dispatch failed: ${err.message}`);
    }
  }

  // 2. Try Configured SMTP / Gmail transporter
  const transporter = createTransporter();
  if (transporter) {
    const sender = process.env.SMTP_FROM || process.env.GMAIL_USER || `"BlindSpot AI" <no-reply@blindspot.ai>`;
    await transporter.sendMail({
      from: sender,
      to: cleanEmail,
      subject: "Your BlindSpot Verification Code",
      text: `Your BlindSpot account verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
      html: getEmailHtml(code),
    });
    return;
  }

  // 3. Fallback: Direct MX connection attempt
  try {
    const domain = cleanEmail.split("@")[1];
    const mxList = await dnsPromises.resolveMx(domain);
    if (mxList && mxList.length > 0) {
      const bestMx = mxList.sort((a, b) => a.priority - b.priority)[0].exchange;
      const directTransporter = nodemailer.createTransport({
        host: bestMx,
        port: 25,
        secure: false,
        tls: { rejectUnauthorized: false },
        connectionTimeout: 5000,
      });

      await directTransporter.sendMail({
        from: `"BlindSpot Security" <verify@blindspot.ai>`,
        to: cleanEmail,
        subject: "Your BlindSpot Verification Code",
        text: `Your BlindSpot account verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
        html: getEmailHtml(code),
      });
      return;
    }
  } catch (directErr: any) {
    // If direct port 25 is blocked by ISP / cloud firewall (common on residential networks)
    // Throw descriptive guidance
    throw new Error(
      `Could not deliver email to ${cleanEmail}. Please configure SMTP credentials (e.g. GMAIL_USER & GMAIL_APP_PASS, or RESEND_API_KEY) in backend/.env to send real emails.`
    );
  }
}
