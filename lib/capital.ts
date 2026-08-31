import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * Deducts the actual product cost for a paid order. The database function is
 * idempotent, so payment-provider retries can never deduct an order twice.
 */
export async function deductCapitalForPaidOrder(orderId: number) {
  const { data, error } = await supabase.rpc("deduct_capital_for_paid_order", {
    p_order_id: orderId,
  });

  if (error) {
    throw new Error("Capital deduction failed: " + error.message);
  }

  return data;
}