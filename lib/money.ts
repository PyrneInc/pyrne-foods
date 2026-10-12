export function toCents(
  value: string | number,
) {
  return Math.round(
    Number(value) * 100,
  );
}

export function fromCents(
  value: number,
) {
  return (value / 100).toFixed(2);
}