export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

export type OrderType = "PICKUP" | "DELIVERY";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  total: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  orderType: OrderType;
  subtotal: string;
  deliveryFee: string;
  total: string;
  deliveryAddress: string | null;
  deliveryNotes: string | null;
  createdAt: string;
  updatedAt: string;
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  items: OrderItem[];
  payment: {
    method: string;
    status: PaymentStatus;
    amount: string;
    transactionId: string | null;
    paidAt: string | null;
  } | null;
};

export type OrdersResponse = {
  data: Order[];
};