import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum(
  "user_role",
  [
    "CUSTOMER",
    "STORE_USER",
  ],
);

export const storeTypeEnum = pgEnum("store_type", [
  "BAKERY",
  "RESTAURANT",
  "CAFE",
  "FOOD_VENDOR",
  "OTHER",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
]);

export const orderTypeEnum = pgEnum("order_type", [
  "PICKUP",
  "DELIVERY",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "CASH",
  "MPESA",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
]);

export const storeMemberRoleEnum = pgEnum(
  "store_member_role",
  [
    "OWNER",
    "MANAGER",
    "STAFF",
  ],
);

// --------------------------------------------------
// STORES
// --------------------------------------------------

export const stores = pgTable(
  "stores",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    name: text("name")
      .notNull(),

    slug: text("slug")
      .notNull(),

    description: text("description"),

    type: storeTypeEnum("type")
      .default("FOOD_VENDOR")
      .notNull(),

    logoUrl: text("logo_url"),

    phone: text("phone"),

    email: text("email"),

    address: text("address"),

    isActive: boolean("is_active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("stores_slug_unique")
      .on(table.slug),

    index("stores_active_idx")
      .on(table.isActive),
  ],
);

// --------------------------------------------------
// CATEGORIES
// --------------------------------------------------

export const categories = pgTable(
  "categories",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, {
        onDelete: "cascade",
      }),

    name: text("name")
      .notNull(),

    description: text("description"),

    imageUrl: text("image_url"),

    sortOrder: integer("sort_order")
      .default(0)
      .notNull(),

    isActive: boolean("is_active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex(
      "categories_store_name_unique",
    ).on(
      table.storeId,
      table.name,
    ),

    index("categories_store_id_idx")
      .on(table.storeId),

    index("categories_active_idx")
      .on(
        table.storeId,
        table.isActive,
      ),
  ],
);

// --------------------------------------------------
// PRODUCTS
// --------------------------------------------------

export const products = pgTable(
  "products",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, {
        onDelete: "cascade",
      }),

    categoryId: uuid("category_id")
      .references(() => categories.id, {
        onDelete: "set null",
      }),

    name: text("name")
      .notNull(),

    description: text("description"),

    price: decimal("price", {
      precision: 10,
      scale: 2,
    }).notNull(),

    imageUrl: text("image_url"),

    isAvailable: boolean("is_available")
      .default(true)
      .notNull(),

    sortOrder: integer("sort_order")
      .default(0)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("products_store_id_idx")
      .on(table.storeId),

    index("products_category_id_idx")
      .on(table.categoryId),

    index("products_available_idx")
      .on(
        table.storeId,
        table.isAvailable,
      ),
  ],
);

// --------------------------------------------------
// CUSTOMERS
// --------------------------------------------------

export const customers = pgTable(
  "customers",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, {
        onDelete: "cascade",
      }),

    name: text("name")
      .notNull(),

    phone: text("phone")
      .notNull(),

    email: text("email"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex(
      "customers_store_phone_unique",
    ).on(
      table.storeId,
      table.phone,
    ),

    index("customers_store_id_idx")
      .on(table.storeId),
  ],
);

// --------------------------------------------------
// ORDERS
// --------------------------------------------------

export const orders = pgTable(
  "orders",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id),

    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),

    orderNumber: text("order_number")
      .notNull(),

    status: orderStatusEnum("status")
      .default("PENDING")
      .notNull(),

    orderType: orderTypeEnum("order_type")
      .notNull(),

    subtotal: decimal("subtotal", {
      precision: 10,
      scale: 2,
    }).notNull(),

    deliveryFee: decimal("delivery_fee", {
      precision: 10,
      scale: 2,
    })
      .default("0.00")
      .notNull(),

    total: decimal("total", {
      precision: 10,
      scale: 2,
    }).notNull(),

    deliveryAddress: text(
      "delivery_address",
    ),

    deliveryNotes: text(
      "delivery_notes",
    ),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex(
      "orders_order_number_unique",
    ).on(table.orderNumber),

    index("orders_store_id_idx")
      .on(table.storeId),

    index("orders_customer_id_idx")
      .on(table.customerId),

    index("orders_status_idx")
      .on(
        table.storeId,
        table.status,
      ),

    index("orders_created_at_idx")
      .on(
        table.storeId,
        table.createdAt,
      ),
  ],
);

// --------------------------------------------------
// ORDER ITEMS
// --------------------------------------------------

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, {
        onDelete: "cascade",
      }),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),

    productName: text("product_name")
      .notNull(),

    quantity: integer("quantity")
      .notNull(),

    unitPrice: decimal("unit_price", {
      precision: 10,
      scale: 2,
    }).notNull(),

    total: decimal("total", {
      precision: 10,
      scale: 2,
    }).notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("order_items_order_id_idx")
      .on(table.orderId),

    index("order_items_product_id_idx")
      .on(table.productId),
  ],
);

// --------------------------------------------------
// PAYMENTS
// --------------------------------------------------

export const payments = pgTable(
  "payments",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, {
        onDelete: "cascade",
      }),

    method: paymentMethodEnum("method")
      .notNull(),

    status: paymentStatusEnum("status")
      .default("PENDING")
      .notNull(),

    amount: decimal("amount", {
      precision: 10,
      scale: 2,
    }).notNull(),

    transactionId: text(
      "transaction_id",
    ),

    paidAt: timestamp("paid_at"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex(
      "payments_order_id_unique",
    ).on(table.orderId),

    index("payments_store_id_idx")
      .on(table.storeId),
  ],
);


// --------------------------------------------------
// USERS
// --------------------------------------------------

export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    name: text("name")
      .notNull(),

    email: text("email")
      .notNull(),

    phone: text("phone"),

    passwordHash: text(
      "password_hash",
    )
      .notNull(),

    role: userRoleEnum("role")
      .default("CUSTOMER")
      .notNull(),

    isActive: boolean("is_active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex(
      "users_email_unique",
    ).on(table.email),

    index("users_phone_idx")
      .on(table.phone),

    index("users_role_idx")
      .on(table.role),
  ],
);

// --------------------------------------------------
// SESSIONS
// --------------------------------------------------

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    tokenHash: text(
      "token_hash",
    )
      .notNull(),

    expiresAt: timestamp(
      "expires_at",
    )
      .notNull(),

    createdAt: timestamp(
      "created_at",
    )
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex(
      "sessions_token_hash_unique",
    ).on(table.tokenHash),

    index("sessions_user_id_idx")
      .on(table.userId),

    index("sessions_expires_at_idx")
      .on(table.expiresAt),
  ],
);


// --------------------------------------------------
// STORE MEMBERS
// --------------------------------------------------

export const storeMembers = pgTable(
  "store_members",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    storeId: uuid("store_id")
      .notNull()
      .references(
        () => stores.id,
        {
          onDelete: "cascade",
        },
      ),

    userId: uuid("user_id")
      .notNull()
      .references(
        () => users.id,
        {
          onDelete: "cascade",
        },
      ),

    role: storeMemberRoleEnum(
      "role",
    )
      .notNull()
      .default("STAFF"),

    createdAt: timestamp(
      "created_at",
      {
        withTimezone: true,
      },
    )
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex(
      "store_members_store_user_unique",
    ).on(
      table.storeId,
      table.userId,
    ),

    index("store_members_store_id_idx")
      .on(table.storeId),

    index("store_members_user_id_idx")
      .on(table.userId),
  ],
);


// --------------------------------------------------
// RELATIONS
// --------------------------------------------------

export const storesRelations = relations(
  stores,
  ({ many }) => ({
    categories: many(categories),
    products: many(products),
    customers: many(customers),
    orders: many(orders),
    payments: many(payments),
    members: many(storeMembers),
  }),
);

export const categoriesRelations = relations(
  categories,
  ({ one, many }) => ({
    store: one(stores, {
      fields: [categories.storeId],
      references: [stores.id],
    }),

    products: many(products),
  }),
);

export const productsRelations = relations(
  products,
  ({ one, many }) => ({
    store: one(stores, {
      fields: [products.storeId],
      references: [stores.id],
    }),

    category: one(categories, {
      fields: [products.categoryId],
      references: [categories.id],
    }),

    orderItems: many(orderItems),
  }),
);

export const customersRelations = relations(
  customers,
  ({ one, many }) => ({
    store: one(stores, {
      fields: [customers.storeId],
      references: [stores.id],
    }),

    orders: many(orders),
  }),
);

export const ordersRelations = relations(
  orders,
  ({ one, many }) => ({
    store: one(stores, {
      fields: [orders.storeId],
      references: [stores.id],
    }),

    customer: one(customers, {
      fields: [orders.customerId],
      references: [customers.id],
    }),

    items: many(orderItems),

    payment: one(payments),
  }),
);

export const orderItemsRelations = relations(
  orderItems,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderItems.orderId],
      references: [orders.id],
    }),

    product: one(products, {
      fields: [orderItems.productId],
      references: [products.id],
    }),
  }),
);

export const paymentsRelations = relations(
  payments,
  ({ one }) => ({
    store: one(stores, {
      fields: [payments.storeId],
      references: [stores.id],
    }),

    order: one(orders, {
      fields: [payments.orderId],
      references: [orders.id],
    }),
  }),
);

export const usersRelations = relations(
  users,
  ({ many }) => ({
    sessions: many(sessions),
    storeMemberships: many(
      storeMembers,
    ),
  }),
);

export const sessionsRelations = relations(
  sessions,
  ({ one }) => ({
    user: one(users, {
      fields: [sessions.userId],
      references: [users.id],
    }),
  }),
);

export const storeMembersRelations =
  relations(
    storeMembers,
    ({ one }) => ({
      store: one(stores, {
        fields: [
          storeMembers.storeId,
        ],
        references: [
          stores.id,
        ],
      }),

      user: one(users, {
        fields: [
          storeMembers.userId,
        ],
        references: [
          users.id,
        ],
      }),
    }),
  );