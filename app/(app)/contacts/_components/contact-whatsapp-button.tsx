import { MessageCircleIcon } from "lucide-react";

function sanitizePhoneForWhatsApp(phone: string): string | null {
  // Keep only digits and leading +
  const digits = phone.replace(/[^\d+]/g, "");
  // Remove leading + for wa.me URL
  const digitsOnly = digits.replace(/^\+/, "");
  if (digitsOnly.length < 7) return null;
  // 10-digit Mexican number without country code → prepend 52
  if (digitsOnly.length === 10) return `52${digitsOnly}`;
  return digitsOnly;
}

export function ContactWhatsAppButton({ phone }: { phone: string }) {
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
