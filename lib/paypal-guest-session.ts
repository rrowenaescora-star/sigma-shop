import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
export const PAYPAL_GUEST_COOKIE="bloxhop_paypal_checkout";
export function createGuestCheckoutSession(){const token=randomBytes(32).toString("base64url");return {token,hash:hashGuestCheckoutSession(token)};}
export function hashGuestCheckoutSession(token:string){return createHash("sha256").update(token).digest("hex");}
export function guestSessionsMatch(token:string|undefined,hash:string|undefined|null){if(!token||!hash)return false;const a=Buffer.from(hashGuestCheckoutSession(token)),b=Buffer.from(hash);return a.length===b.length&&timingSafeEqual(a,b);}
