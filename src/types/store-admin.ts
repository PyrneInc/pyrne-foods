import type {
  OrderStatus,
  // OrderType,
  // PaymentStatus,
} from "./order";

export type StoreMemberRole =
  | "OWNER"
  | "MANAGER"
  | "STAFF";

export type StoreType =
  | "BAKERY"
  | "RESTAURANT"
  | "CAFE"
  | "FOOD_VENDOR"
  | "OTHER";

export type AdminOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

  export type OrderType =
  | "PICKUP"
  | "DELIVERY";

export type PaymentMethod =
  | "CASH"
  | "MPESA";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type StoreAdminStore = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  logoUrl: string | null;
  role: StoreMemberRole;
};

export type StoreOrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  total: string;
};

export type StoreOrder = {
  id: string;
  orderNumber: string;
  storeId: string;
  status: OrderStatus;
  orderType: OrderType;
  subtotal: string;
  deliveryFee: string;
  total: string;
  deliveryAddress: string | null;
  deliveryNotes: string | null;
  createdAt: string;
  updatedAt: string;
  store: StoreAdminStore | null;
  items: StoreOrderItem[];
  payment: {
    orderId: string;
    method: string;
    status: PaymentStatus;
    amount: string;
    transactionId: string | null;
    paidAt: string | null;
  } | null;
};



export type AdminOrderCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

export type AdminOrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  total: string;
};

export type AdminOrderPayment = {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: string;
  transactionId: string | null;
  paidAt: string | null;
};

export type AdminOrder = {
  id: string;
  storeId: string;
  orderNumber: string;
  status: AdminOrderStatus;
  orderType: OrderType;

  subtotal: string;
  deliveryFee: string;
  total: string;

  deliveryAddress: string | null;
  deliveryNotes: string | null;

  customer: AdminOrderCustomer;

  items: AdminOrderItem[];

  payment: AdminOrderPayment | null;

  createdAt: string;
  updatedAt: string;
};

export type AdminOrderListItem = {
  id: string;
  storeId: string;
  orderNumber: string;
  status: AdminOrderStatus;
  orderType: OrderType;

  subtotal: string;
  deliveryFee: string;
  total: string;

  deliveryAddress: string | null;

  customer: AdminOrderCustomer;

  createdAt: string;
  updatedAt: string;
};

export type AdminOrdersResponse = {
  orders: AdminOrderListItem[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
};