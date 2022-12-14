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

export async function hasStoreUser(storeHash: string, userId: number) {
  if (!storeHash || !userId) return null;

  const result = await prisma.storeUsers.findFirst({
    where: {
      storeHash,
      userId,
    },
  });

  return !!result;
}

export async function setStoreUser(session: SessionProps) {
  const {
    access_token: accessToken,
    context,
    owner,
    sub,
    user: { id: userId },
  } = session;
  if (!userId) return null;

  const contextString = context ?? sub;
  const storeHash = contextString?.split("/")[1] || "";

  const storeUser = await prisma.storeUsers.findMany({
    where: {
      storeHash,
      userId,
    },
  });

  if (accessToken) {
    if (!storeUser.length) {
      await prisma.storeUsers.create({
        data: {
          isAdmin: true,
          storeHash,
          userId,
        },
      });
    } else if (!storeUser[0]?.isAdmin) {
      await prisma.storeUsers.updateMany({
        where: {
          storeHash,
          userId,
        },
        data: {
          isAdmin: true,
        },
      });
    }
  } else {
    if (!storeUser.length) {
      await prisma.storeUsers.create({
        data: {
          isAdmin: owner?.id === userId,
          storeHash,
          userId,
        },
      });
    }
  }
}
