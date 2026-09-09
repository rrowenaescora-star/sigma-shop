import "server-only";

const PAYPAL_API_URL = process.env.PAYPAL_ENVIRONMENT === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
type PaypalError = { message?: string; name?: string };
function requiredEnv(name: "NEXT_PUBLIC_PAYPAL_CLIENT_ID" | "PAYPAL_CLIENT_SECRET") { const value = process.env[name]; if (!value) throw new Error("PayPal is not configured."); return value; }
export async function getPaypalAccessToken() {
  const credentials = Buffer.from(`${requiredEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID")}:${requiredEnv("PAYPAL_CLIENT_SECRET")}`).toString("base64");
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, { method: "POST", headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials", cache: "no-store" });
  if (!response.ok) throw new Error("PayPal authentication failed.");
  const payload = (await response.json()) as { access_token?: string }; if (!payload.access_token) throw new Error("PayPal authentication failed."); return payload.access_token;
}
export async function paypalRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${PAYPAL_API_URL}${path}`, { ...init, headers: { Authorization: `Bearer ${await getPaypalAccessToken()}`, "Content-Type": "application/json", ...(init.headers || {}) }, cache: "no-store" });
  if (!response.ok) { const details = (await response.json().catch(() => ({}))) as PaypalError; throw new Error(details.message || details.name || "PayPal request failed."); }
  return response.json() as Promise<T>;
}
export type PaypalOrder = { id: string; status: string; purchase_units?: Array<{ reference_id?: string; custom_id?: string; amount?: { currency_code?: string; value?: string }; payments?: { captures?: Array<{ id?: string; status?: string; amount?: { currency_code?: string; value?: string }; create_time?: string }> } }>; payer?: { email_address?: string }; };
export async function createPaypalOrder(payload: unknown, key: string) { return paypalRequest<PaypalOrder>("/v2/checkout/orders", { method: "POST", headers: { "PayPal-Request-Id": key }, body: JSON.stringify(payload) }); }
export async function capturePaypalOrder(id: string) { return paypalRequest<PaypalOrder>(`/v2/checkout/orders/${encodeURIComponent(id)}/capture`, { method: "POST", headers: { "PayPal-Request-Id": `capture-${id}` }, body: "{}" }); }
export async function getPaypalOrder(id: string) { return paypalRequest<PaypalOrder>(`/v2/checkout/orders/${encodeURIComponent(id)}`, { method: "GET" }); }
export async function verifyPaypalWebhook(headers: Headers, webhookEvent: unknown) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID; if (!webhookId) return false;
  const requiredHeaders = { auth_algo: headers.get("paypal-auth-algo"), cert_url: headers.get("paypal-cert-url"), transmission_id: headers.get("paypal-transmission-id"), transmission_sig: headers.get("paypal-transmission-sig"), transmission_time: headers.get("paypal-transmission-time") };
  if (Object.values(requiredHeaders).some((value) => !value)) return false;
  const result = await paypalRequest<{ verification_status?: string }>("/v1/notifications/verify-webhook-signature", { method: "POST", body: JSON.stringify({ ...requiredHeaders, webhook_id: webhookId, webhook_event: webhookEvent }) }); return result.verification_status === "SUCCESS";
}
