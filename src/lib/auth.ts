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
}

export async function getSession({ query: { context = "" } }: NextApiRequest) {
  if (typeof context !== "string") return;
  const decodedPayload = decodePayload(context);

  let decodedContext;

  if (typeof decodedPayload === "string") {
    decodedContext = decodedPayload;
  } else {
    decodedContext = decodedPayload?.context;
  }

  const accessToken = await db.getStoreToken(decodedContext);

  return { accessToken, storeHash: decodedContext };
}

export async function removeSession(
  res: NextApiResponse,
  session: SessionProps
) {
  await db.deleteStore(session);
}

export function encodePayload(context: string) {
  return jwt.sign({ context }, JWT_KEY!, { expiresIn: "24h" });
}

export function decodePayload(encodedContext: string) {
  return jwt.verify(encodedContext, JWT_KEY!);
}
