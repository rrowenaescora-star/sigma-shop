import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
export const FREE_ORDER_COOKIE = "bloxhop_free_order";
export function freeOrderToken(id: string) {
  return `${id}.${createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY!).update(`free-order:${id}`).digest("hex")}`;
}
export function matchesFreeOrder(id: string, token?: string) {
  if (!token) return false;
  const expected = Buffer.from(freeOrderToken(id)), actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
