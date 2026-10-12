import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { storeMembers, stores } from "@/db/schema";

export async function getUserStores(userId: string) {
  return db
    .select({
      id: stores.id,
      name: stores.name,
      slug: stores.slug,
      description: stores.description,
      type: stores.type,
      logoUrl: stores.logoUrl,
      phone: stores.phone,
      email: stores.email,
      address: stores.address,
      isActive: stores.isActive,
      role: storeMembers.role,
    })
    .from(storeMembers)
    .innerJoin(stores, eq(storeMembers.storeId, stores.id))
    .where(
      and(
        eq(storeMembers.userId, userId),
        eq(stores.isActive, true),
      ),
    );
}

export async function getUserStore(
  userId: string,
  storeId: string,
) {
  const result = await db
    .select({
      id: stores.id,
      name: stores.name,
      slug: stores.slug,
      description: stores.description,
      type: stores.type,
      logoUrl: stores.logoUrl,
      phone: stores.phone,
      email: stores.email,
      address: stores.address,
      isActive: stores.isActive,
      role: storeMembers.role,
    })
    .from(storeMembers)
    .innerJoin(stores, eq(storeMembers.storeId, stores.id))
    .where(
      and(
        eq(storeMembers.userId, userId),
        eq(storeMembers.storeId, storeId),
        eq(stores.isActive, true),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}