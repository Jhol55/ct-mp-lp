export function formatPhoneInternationalBR(raw) {
  const digits = String(raw ?? "").replace(/[^\d]/g, "");
  if (!digits) return "";

  // Common cases:
  // - 13 digits: CC(2) + DDD(2) + 9-digit number => +55 (19) 97161-0189
  // - 12 digits: CC(2) + DDD(2) + 8-digit number => +55 (19) 7161-0189
  // - 11 digits: DDD(2) + 9-digit number => (19) 97161-0189
  // - 10 digits: DDD(2) + 8-digit number => (19) 7161-0189

  if (digits.length === 13) {
    const cc = digits.slice(0, 2);
    const ddd = digits.slice(2, 4);
    const n = digits.slice(4);
    return `+${cc} (${ddd}) ${n.slice(0, 5)}-${n.slice(5)}`;
  }

  if (digits.length === 12) {
    const cc = digits.slice(0, 2);
    const ddd = digits.slice(2, 4);
    const n = digits.slice(4);
    return `+${cc} (${ddd}) ${n.slice(0, 4)}-${n.slice(4)}`;
  }

  if (digits.length === 11) {
    const ddd = digits.slice(0, 2);
    const n = digits.slice(2);
    return `(${ddd}) ${n.slice(0, 5)}-${n.slice(5)}`;
  }

  if (digits.length === 10) {
    const ddd = digits.slice(0, 2);
    const n = digits.slice(2);
    return `(${ddd}) ${n.slice(0, 4)}-${n.slice(4)}`;
  }

  // Fallback: just show digits with a + prefix if it looks like it contains CC.
  return digits.length > 11 ? `+${digits}` : digits;
}
