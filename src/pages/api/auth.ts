import { NextApiRequest, NextApiResponse } from "next";
import { getBCAuth, setSession, encodePayload } from "../../lib/auth";

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Authenticate the app on install
    const session = await getBCAuth(req.query);
    const storeHash = session?.context?.split("/")[1] || "";
    const encodedContext = encodePayload(storeHash); // Signed JWT to validate/ prevent tampering

    await setSession(session);
    res.redirect(302, `/?context=${encodedContext}`);
  } catch (error) {
    const { message, response } = error as any;
    res.status(response?.status || 500).json(message);
  }
}
