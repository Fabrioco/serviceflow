export function formatPhone(digits: string) {
  const d =
    digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;
  if (d.length === 11)
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digits;
}
