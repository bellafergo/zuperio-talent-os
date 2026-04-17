import { MessageCircleIcon } from "lucide-react";

function sanitizePhoneForWhatsApp(phone: string): string | null {
  // Keep only digits and leading +
  const digits = phone.replace(/[^\d+]/g, "");
  // Remove leading + for wa.me URL (it handles the + internally)
  const digitsOnly = digits.replace(/^\+/, "");
  // Must have at least 7 digits
  return digitsOnly.length >= 7 ? digitsOnly : null;
}

export function CandidateWhatsAppButton({ phone }: { phone: string }) {
  const waNumber = sanitizePhoneForWhatsApp(phone);
  if (!waNumber) return null;

  return (
    <a
      href={`https://wa.me/${waNumber}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
      aria-label={`Enviar WhatsApp a ${phone}`}
    >
      <MessageCircleIcon className="size-3.5 text-[#25D366]" aria-hidden />
      WhatsApp
    </a>
  );
}
