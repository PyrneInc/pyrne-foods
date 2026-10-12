import type { AuthStore, Category, Product, StoreType } from "@/types/marketplace";
import { Order, OrdersResponse } from "@/types/order";
import { AdminOrder, AdminOrderListItem } from "@/types/store-admin";

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

// ─────────────────────────────────────────────
// Store Session
// ─────────────────────────────────────────────

export async function getStoreSession() {
  return request<{
    data: {
      store: AuthStore | null;
    };
  }>("/api/v1/store-admin/session");
}

export async function selectStore(storeId: string) {
  return request<{
    data: {
      store: AuthStore;
    };
  }>("/api/v1/store-admin/session", {
    method: "POST",
    body: JSON.stringify({ storeId }),
  });
}

export async function clearStoreSession() {
  return request<{
    data: {
      success: boolean;
    };
  }>("/api/v1/store-admin/session", {
    method: "DELETE",
  });
}

// ─────────────────────────────────────────────
// Store Management
// ─────────────────────────────────────────────


export async function getAdminStores() {
  return request<{
    data: AuthStore[];
  }>("/api/v1/store-admin/stores");
}

export async function createAdminStore(data: {
  name: string;
  slug: string;
  description?: string | null;
  type: StoreType;
  logoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}) {
  return request<{
    data: AuthStore;
  }>("/api/v1/store-admin/stores", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAdminStore(storeId: string) {
  return request<{
    data: AuthStore;
  }>(
    `/api/v1/store-admin/stores/${encodeURIComponent(storeId)}`,
  );
}

export async function updateAdminStore(
  storeId: string,
  data: {
    name?: string;
    slug?: string;
    description?: string | null;
    type?: StoreType;
    logoUrl?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    isActive?: boolean;
  },
) {
  return request<{
    data: AuthStore;
  }>(
    `/api/v1/store-admin/stores/${encodeURIComponent(storeId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteAdminStore(storeId: string) {
  return request<{
    data: {
      success: boolean;
    };
  }>(
    `/api/v1/store-admin/stores/${encodeURIComponent(storeId)}`,
    {
      method: "DELETE",
    },
  );
}

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────

export async function getAdminProducts() {
  return request<{
    data: Product[];
  }>("/api/v1/store-admin/products");
}

export async function createAdminProduct(data: {
  name: string;
  description?: string | null;
  price: string;
  imageUrl?: string | null;
  categoryId?: string | null;
  isAvailable?: boolean;
  sortOrder?: number;
}) {
  return request<{
    data: Product;
  }>("/api/v1/store-admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAdminProduct(
  productId: string,
  data: {
    name?: string;
    description?: string | null;
    price?: string;
    imageUrl?: string | null;
    categoryId?: string | null;
    isAvailable?: boolean;
    sortOrder?: number;
  },
) {
  return request<{
    data: Product;
  }>(
    `/api/v1/store-admin/products/${encodeURIComponent(productId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteAdminProduct(productId: string) {
  return request<{
    data: {
      success: boolean;
    };
  }>(
    `/api/v1/store-admin/products/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
    },
  );
}

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────

export async function getAdminCategories() {
  return request<{
    data: Category[];
  }>("/api/v1/store-admin/categories");
}

export async function createAdminCategory(data: {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}) {
  return request<{
    data: Category;
  }>("/api/v1/store-admin/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAdminCategory(
  categoryId: string,
  data: {
    name?: string;
    description?: string | null;
    imageUrl?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  },
) {
  return request<{
    data: Category;
  }>(
    `/api/v1/store-admin/categories/${encodeURIComponent(categoryId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteAdminCategory(categoryId: string) {
  return request<{
    data: {
      success: boolean;
    };
  }>(
    `/api/v1/store-admin/categories/${encodeURIComponent(categoryId)}`,
    {
      method: "DELETE",
    },
  );
}

// ─────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────

export type AdminOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

export async function getAdminOrders(params?: {
  status?: AdminOrderStatus;
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params?.status) {
    searchParams.set("status", params.status);
  }

  if (params?.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params?.offset !== undefined) {
    searchParams.set("offset", String(params.offset));
  }

  const query = searchParams.toString();

  return request<{
    data: AdminOrderListItem[];
    meta: {
      limit: number;
      offset: number;
      count: number;
    };
  }>(
    `/api/v1/store-admin/orders${query ? `?${query}` : ""}`,
  );
}

export async function getAdminOrder(orderNumber: string) {
  return request<{
    data: AdminOrder;
  }>(
    `/api/v1/store-admin/orders/${encodeURIComponent(orderNumber)}`,
  );
}

export async function updateAdminOrderStatus(
  orderNumber: string,
  status: AdminOrderStatus,
) {
  return request<{
    data: AdminOrder;
  }>(
    `/api/v1/store-admin/orders/${encodeURIComponent(orderNumber)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

// ─────────────────────────────────────────────
// Dashboard Summary
// ─────────────────────────────────────────────

export async function getAdminSummary() {
  return request<{
    data: {
      store: {
        id: string;
        name: string;
        slug: string;
        role: "OWNER" | "MANAGER" | "STAFF";
      };
      orders: {
        total: number;
        pending: number;
        completed: number;
        sales: string;
      };
      products: {
        total: number;
        available: number;
      };
    };
  }>("/api/v1/store-admin/summary");
}