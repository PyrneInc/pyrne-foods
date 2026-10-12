import type { StoreMemberRole } from "@/types/store-admin";

export type StorePermission =
  | "VIEW_ORDERS"
  | "MANAGE_ORDERS"
  | "VIEW_PRODUCTS"
  | "MANAGE_PRODUCTS"
  | "VIEW_CATEGORIES"
  | "MANAGE_CATEGORIES"
  | "MANAGE_STORE"
  | "MANAGE_MEMBERS";

const permissions: Record<
  StoreMemberRole,
  StorePermission[]
> = {
  OWNER: [
    "VIEW_ORDERS",
    "MANAGE_ORDERS",
    "VIEW_PRODUCTS",
    "MANAGE_PRODUCTS",
    "VIEW_CATEGORIES",
    "MANAGE_CATEGORIES",
    "MANAGE_STORE",
    "MANAGE_MEMBERS",
  ],

  MANAGER: [
    "VIEW_ORDERS",
    "MANAGE_ORDERS",
    "VIEW_PRODUCTS",
    "MANAGE_PRODUCTS",
    "VIEW_CATEGORIES",
    "MANAGE_CATEGORIES",
  ],

  STAFF: [
    "VIEW_ORDERS",
    "MANAGE_ORDERS",
  ],
};

export function hasStorePermission(
  role: StoreMemberRole,
  permission: StorePermission,
) {
  return permissions[role].includes(permission);
}

export function canManageOrders(
  role: StoreMemberRole,
) {
  return hasStorePermission(
    role,
    "MANAGE_ORDERS",
  );
}

export function canManageProducts(
  role: StoreMemberRole,
) {
  return hasStorePermission(
    role,
    "MANAGE_PRODUCTS",
  );
}

export function canManageCategories(
  role: StoreMemberRole,
) {
  return hasStorePermission(
    role,
    "MANAGE_CATEGORIES",
  );
}

export function canManageStore(
  role: StoreMemberRole,
) {
  return hasStorePermission(
    role,
    "MANAGE_STORE",
  );
}

export function canManageMembers(
  role: StoreMemberRole,
) {
  return hasStorePermission(
    role,
    "MANAGE_MEMBERS",
  );
}