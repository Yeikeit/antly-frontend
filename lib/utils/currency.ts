/**
 * Formats a number as Chilean Peso (CLP).
 * CLP has no decimal places — integer only.
 * Examples: 1500000 → "$1.500.000"
 */
export function formatCLP(amount: number | string): string {
  return Number(amount).toLocaleString("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
