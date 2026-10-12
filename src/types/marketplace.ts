import type { StoreMemberRole } from "./store-admin";

export type StoreType =
  | "BAKERY"
  | "RESTAURANT"
  | "CAFE"
  | "FOOD_VENDOR"
  | "OTHER";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role:
    | "CUSTOMER"
    | "STORE_USER";
};

export type AuthStore = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: StoreType;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  role: StoreMemberRole;
};

export type Store = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: StoreType;
  logoUrl: string | null;
};

export type Category = {
  id: string;
  name: string;
  storeId: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  store: Store;
  category: Category | null;
};