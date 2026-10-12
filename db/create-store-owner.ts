import "dotenv/config";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  stores,
  storeMembers,
  users,
} from "@/db/schema";

async function main() {
  const email =
    "mark@example.com";

  const user =
    await db.query.users.findFirst({
      where: eq(
        users.email,
        email,
      ),
    });

  if (!user) {
    throw new Error(
      "User not found.",
    );
  }

  const store =
    await db.query.stores.findFirst({
      where: eq(
        stores.slug,
        "maandazi-treats",
      ),
    });

  if (!store) {
    throw new Error(
      "Maandazi Treats store not found.",
    );
  }

  const existing =
    await db.query.storeMembers.findFirst({
      where: (
        storeMembers,
        { and, eq },
      ) =>
        and(
          eq(
            storeMembers.userId,
            user.id,
          ),
          eq(
            storeMembers.storeId,
            store.id,
          ),
        ),
    });

  if (existing) {
    console.log(
      "Store membership already exists.",
    );

    return;
  }

  await db
    .insert(storeMembers)
    .values({
      userId: user.id,
      storeId: store.id,
      role: "OWNER",
    });

  console.log(
    `Added ${email} as owner of ${store.name}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });