// Shared, presentation-agnostic formatting helpers.

/** ₹ lakh → readable string; rolls over to crore past 100 L. */
export function formatLakh(valueLakh: number): string {
  return valueLakh >= 100 ? `₹${(valueLakh / 100).toFixed(1)} Cr` : `₹${valueLakh} L`;
}
