import { createRouter } from "./context";
import { z } from "zod";
import { User } from "../../types";

export const authRouter = createRouter()
  .mutation("setUser", {
    input: z.object({
      email: z.string(),
      userId: z.number().min(1),
      storeHash: z.string(),
      username: z.string().optional(),
    }),
    resolve({ input, ctx }) {
      ctx.prisma.users.upsert({
        where: {
          userId: input.userId,
        },
        update: {
          ...input,
        },
        create: {
          ...input,
        },
      });
    },
  })
  .mutation("setStore", {
    input: z.object({
      accessToken: z.string().optional(),
      scope: z.string().optional(),
      storeHash: z.string(),
    }),
    resolve({ input, ctx }) {
      ctx.prisma.stores.upsert({
        where: {
          storeHash: input.storeHash,
        },
        update: {
          ...input,
        },
        create: {
          ...input,
        },
      });
    },
  })
  .query("getStoreToken", {
    input: z.object({
      storeHash: z.string(),
    }),
    resolve({ input, ctx }) {
      return ctx.prisma.stores.findUnique({
        where: {
          storeHash: input.storeHash,
        },
        select: {
          accessToken: true,
        },
      });
    },
  })
  .mutation("deleteStore", {
    input: z.object({
      storeHash: z.string(),
    }),
    resolve({ input, ctx }) {
      return ctx.prisma.stores.delete({
        where: {
          storeHash: input.storeHash,
        },
      });
    },
  });
