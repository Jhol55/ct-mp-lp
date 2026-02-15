export function buildWhatsAppLink({ phone, message }) {
  const normalizedPhone = String(phone ?? "").replace(/[^\d]/g, "");
  const safeMessage = String(message ?? "");

  // If there's no phone, fall back to WhatsApp home so the link never breaks.
  if (!normalizedPhone) return "https://www.whatsapp.com/";

  const base = `https://wa.me/${normalizedPhone}`;
  if (!safeMessage) return base;

  return `${base}?text=${encodeURIComponent(safeMessage)}`;
}
