import * as BigCommerce from "node-bigcommerce";
import * as jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { QueryParams, SessionProps } from "../types";
import * as db from "../server/db/mysql";

const { AUTH_CALLBACK, CLIENT_ID, CLIENT_SECRET, JWT_KEY } = process.env;

// Create BigCommerce instance
// https://github.com/bigcommerce/node-bigcommerce/
const bigcommerce = new BigCommerce({
  logLevel: "info",
  clientId: CLIENT_ID,
  secret: CLIENT_SECRET,
  callback: AUTH_CALLBACK,
  responseType: "json",
  headers: { "Accept-Encoding": "*" },
  apiVersion: "v3",
});

const bigcommerceSigned = new BigCommerce({
  secret: CLIENT_SECRET,
  responseType: "json",
});

export function bigcommerceClient(accessToken: string, storeHash: string) {
  return new BigCommerce({
    clientId: CLIENT_ID,
    accessToken,
    storeHash,
    responseType: "json",
    apiVersion: "v3",
  });
}

export function getBCAuth(query: QueryParams) {
  return bigcommerce.authorize(query);
}

export function getBCVerify({ signed_payload_jwt }: QueryParams) {
  return bigcommerceSigned.verifyJWT(signed_payload_jwt);
}

export async function setSession(session: SessionProps) {
  db.setUser(session);
  db.setStore(session);
  db.setStoreUser(session);
}

export async function getSession({ query: { context = "" } }: NextApiRequest) {
  if (typeof context !== "string") return;
  const { context: storeHash, user } = decodePayload(context) as jwt.JwtPayload;
  const hasUser = await db.hasStoreUser(storeHash, user?.id);

  // Before retrieving session/ hitting APIs, check user
  if (!hasUser) {
    throw new Error(
      "User is not available. Please login or ensure you have access permissions."
    );
  }

  const accessToken = await db.getStoreToken(storeHash);

  return { accessToken, storeHash, user };
}

export async function removeSession(
  res: NextApiResponse,
  session: SessionProps
) {
  await db.deleteStore(session);
}

// JWT functions to sign/ verify 'context' query param from /api/auth||load
export function encodePayload({ user, owner, ...session }: SessionProps) {
  const contextString = session?.context ?? session?.sub;
  const context = contextString.split("/")[1] || "";

  return jwt.sign({ context, user, owner }, JWT_KEY!, { expiresIn: "24h" });
}

// Verifies JWT for getSession (product APIs)
export function decodePayload(encodedContext: string) {
  return jwt.verify(encodedContext, JWT_KEY!);
}

// Removes store and storeUser on uninstall
export async function removeDataStore(session: SessionProps) {
  await db.deleteStore(session);
  // await db.deleteUser(session);
}
