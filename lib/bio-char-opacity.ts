export function getBioCharOpacity(
  progress: number,
  index: number,
  total: number,
) {
  if (total <= 0) return 1;

  const charStart = index / total;
  const charWidth = 3 / total;
  const t = Math.min(1, Math.max(0, (progress - charStart) / charWidth));
  return 0.2 + 0.8 * t;
}
