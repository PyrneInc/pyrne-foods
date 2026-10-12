import type { Product } from "./marketplace";

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartStore = {
  storeId: string;
  storeName: string;
  storeSlug: string;
  items: CartItem[];
};
