import { Resend } from "resend";

const RESEND_API_KEY: string =
  process.env.RESEND_API_KEY ??
  (() => {
    throw new Error("RESEND_API_KEY is not set in the environment");
  })();

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "Vault <onboarding@resend.dev>";

const resend = new Resend(RESEND_API_KEY);

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Reset your Vault password",
    html: `
      <p>We received a request to reset your Vault password.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}
