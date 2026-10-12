import type { Category, Product, Store } from "@/types/marketplace";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }

  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
};

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Something went wrong.");
  }

  return data;
}

/**
 * Get a public store by slug.
 */
export async function getStore(slug: string) {
  return request<{
    data: Store;
  }>(`/api/v1/stores/${encodeURIComponent(slug)}`);
}

/**
 * Get public products for a store.
 */
export async function getPublicStoreProducts(slug: string) {
  return request<{
    data: {
      products: Product[];
      store: Store;
    };
  }>(`/api/v1/stores/${encodeURIComponent(slug)}/products`);
}

/**
 * Get public categories for a store.
 */
export async function getPublicStoreCategories(slug: string) {
  return request<{
    data: {
      categories: Category[];
      store: Store;
    };
  }>(`/api/v1/stores/${encodeURIComponent(slug)}/categories`);
}