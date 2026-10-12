import postgres from "postgres";

import { and, eq } from "drizzle-orm";

import { drizzle } from "drizzle-orm/postgres-js";

import {
  hashPassword,
} from "@/lib/auth/password";

import * as schema from "./schema";

import {
  categories,
  products,
  stores,
} from "./schema";

const client = postgres(
  process.env.DATABASE_URL!,
);

const db = drizzle(client, {
  schema,
});

async function getOrCreateStore() {
  const existing =
    await db.query.stores.findFirst({
      where: eq(
        stores.slug,
        "maandazi-treats",
      ),
    });

  if (existing) {
    return existing;
  }

  const [store] =
    await db
      .insert(stores)
      .values({
        name: "Maandazi Treats",

        slug: "maandazi-treats",

        description:
          "Fresh maandazi and delicious treats.",

        type: "BAKERY",

        phone: "0701428899",

        address:
          "Nyeri, Kenya",
      })
      .returning();

  return store;
}

async function getOrCreateCategory(
  storeId: string,
  name: string,
  description: string,
  sortOrder: number,
) {
  const existing =
    await db.query.categories.findFirst({
      where: and(
        eq(
          categories.storeId,
          storeId,
        ),
        eq(
          categories.name,
          name,
        ),
      ),
    });

  if (existing) {
    return existing;
  }

  const [category] =
    await db
      .insert(categories)
      .values({
        storeId,

        name,

        description,

        sortOrder,
      })
      .returning();

  return category;
}

async function createProduct(
  values: {
    storeId: string;
    categoryId?: string;
    name: string;
    description: string;
    price: string;
    sortOrder: number;
  },
) {
  const existing =
    await db.query.products.findFirst({
      where: and(
        eq(
          products.storeId,
          values.storeId,
        ),
        eq(
          products.name,
          values.name,
        ),
      ),
    });

  if (existing) {
    return existing;
  }

  const [product] =
    await db
      .insert(products)
      .values(values)
      .returning();

  return product;
}

async function seed() {
  console.log(
    "🌱 Seeding Pyrne Foods...",
  );

  const store =
    await getOrCreateStore();

  const bakery =
    await getOrCreateCategory(
      store.id,

      "Bakery",

      "Freshly prepared baked treats.",

      1,
    );

  const drinks =
    await getOrCreateCategory(
      store.id,

      "Drinks",

      "Refreshing drinks.",

      2,
    );

  await createProduct({
    storeId: store.id,

    categoryId: bakery.id,

    name: "Classic Maandazi",

    description:
      "Fresh, soft and delicious maandazi.",

    price: "10.00",

    sortOrder: 1,
  });

  await createProduct({
    storeId: store.id,

    categoryId: bakery.id,

    name: "5 Maandazi Pack",

    description:
      "A pack of five fresh maandazi.",

    price: "50.00",

    sortOrder: 2,
  });

  await createProduct({
    storeId: store.id,

    categoryId: bakery.id,

    name: "10 Maandazi Pack",

    description:
      "A pack of ten fresh maandazi.",

    price: "100.00",

    sortOrder: 3,
  });

  await createProduct({
    storeId: store.id,

    categoryId: bakery.id,

    name: "Cupcake",

    description:
      "Soft and delicious cupcake.",

    price: "50.00",

    sortOrder: 4,
  });

  await createProduct({
    storeId: store.id,

    categoryId: drinks.id,

    name: "Tea",

    description:
      "Hot Kenyan tea.",

    price: "30.00",

    sortOrder: 1,
  });

  console.log(
    "✅ Seed completed.",
  );
}

seed()
  .catch((error) => {
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });

  const ownerEmail =
  "mark@example.com";

const existingOwner =
  await db.query.users.findFirst({
    where: eq(
      users.email,
      ownerEmail,
    ),
  });

const owner =
  existingOwner ??
  (
    await db
      .insert(users)
      .values({
        name: "Mark",
        email: ownerEmail,
        phone: "0701428899",
        passwordHash:
          await hashPassword(
            "password123",
          ),
        role: "STORE_USER",
      })
      .returning()
  )[0];

const existingMembership =
  await db.query.storeMembers.findFirst({
    where: (
      members,
      { and, eq },
    ) =>
      and(
        eq(
          members.userId,
          owner.id,
        ),
        eq(
          members.storeId,
          store.id,
        ),
      ),
  });

if (!existingMembership) {
  await db
    .insert(storeMembers)
    .values({
      userId: owner.id,
      storeId: store.id,
      role: "OWNER",
    });
}