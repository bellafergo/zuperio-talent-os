import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
