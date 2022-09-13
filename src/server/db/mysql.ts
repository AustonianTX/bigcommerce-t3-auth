import { SessionProps, StoreData } from "../../types";

import { prisma } from "../db/client";

export async function setUser({ context, user }: SessionProps) {
  if (!user) return null;

  const { id, email, username } = user;

  const userData = { email, userId: id, username };

  await prisma.users.upsert({
    where: {
      userId: id,
    },
    update: {
      ...userData,
    },
    create: {
      ...userData,
    },
  });
}

export async function setStore(session: SessionProps) {
  const { access_token: accessToken, context, scope } = session;

  if (!accessToken || !scope) return null;

  const storeHash = context?.split("/")[1] || "";

  const storeData: StoreData = { accessToken, scope, storeHash };

  await prisma.stores.upsert({
    where: {
      storeHash,
    },
    update: {
      ...storeData,
    },
    create: {
      ...storeData,
    },
  });
}

export async function getStoreToken(storeHash: string) {
  if (!storeHash) return null;

  const result = await prisma.stores.findUnique({
    where: {
      storeHash,
    },
    select: {
      accessToken: true,
    },
  });

  return result;
}

export async function deleteStore({ store_hash: storeHash }: SessionProps) {
  if (!storeHash) return null;

  return await prisma.stores.delete({
    where: {
      storeHash,
    },
  });
}
