import type { StoreMemberRole, StoreType } from "./store-admin";

export type UserRole = "CUSTOMER" | "STORE_USER";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
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