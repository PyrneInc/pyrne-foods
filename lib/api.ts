import type {
  Category,
  Product,
  Store,
} from "@/types/marketplace";


import type { Order, OrdersResponse } from "@/types/order";

import type {
  StoreOrder,
} from "@/types/store-admin";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }

  return (
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000"
  );
};

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${getBaseUrl()}${path}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error || "Something went wrong.",
    );
  }

  return data;
}

export async function getProducts() {
  return request<{
    data: Product[];
  }>("/api/v1/products");
}

export async function getCategories() {
  return request<{
    data: Category[];
  }>("/api/v1/categories");
}

export async function getStores() {
  return request<{
    data: Store[];
  }>("/api/v1/stores");
}

export async function getStore(slug: string) {
  return request<{
    data: Store;
  }>(`/api/v1/stores/${encodeURIComponent(slug)}`);
}

export async function getStoreProducts(
  slug: string,
) {
  return request<{
    data: Product[];
  }>(
    `/api/v1/stores/${encodeURIComponent(slug)}/products`,
  );
}

export async function checkout(payload: {
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  orderType: "PICKUP" | "DELIVERY";
  items: {
    productId: string;
    quantity: number;
  }[];
  deliveryAddress?: string;
  deliveryNotes?: string;
}) {
  return request<{
    data: {
      orders: {
        id: string;
        orderNumber: string;
        storeId: string;
        subtotal: string;
        deliveryFee: string;
        total: string;
      }[];
    };
  }>("/api/v1/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getOrders(
  orderNumbers: string[],
) {
  const numbers = orderNumbers.join(",");

  return request<OrdersResponse>(
    `/api/v1/orders?numbers=${encodeURIComponent(numbers)}`,
  );
}

export async function getOrder(
  orderNumber: string,
) {
  return request<{ data: Order }>(
    `/api/v1/orders/${encodeURIComponent(orderNumber)}`,
  );
}

export async function getStoreOrders() {
  return request<{
    data: StoreOrder[];
  }>(
    "/api/v1/store-admin/orders",
  );
}

export async function updateOrderStatus(
  orderNumber: string,
  status: StoreOrder["status"],
) {
  return request<{
    data: {
      id: string;
      orderNumber: string;
      status: StoreOrder["status"];
      updatedAt: string;
    };
  }>(
    `/api/v1/store-admin/orders/${encodeURIComponent(
      orderNumber,
    )}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    },
  );
}