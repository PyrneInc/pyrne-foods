export function getDeliveryFee(
  orderType: "PICKUP" | "DELIVERY",
) {
  return orderType === "DELIVERY"
    ? 50_00
    : 0;
}

export function generateOrderNumber() {
  const timestamp =
    Date.now().toString(36).toUpperCase();

  const random =
    Math.floor(
      Math.random() * 10_000,
    )
      .toString()
      .padStart(4, "0");

  return `PY-${timestamp}-${random}`;
}