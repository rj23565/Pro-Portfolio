import { jwtVerify } from "jose";
export async function verifySessionEdge(token: string): Promise<boolean> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  try {
    const key = new TextEncoder().encode(secret);
    await jwtVerify(token, key);
    return true;
  } catch { return false; }
}
