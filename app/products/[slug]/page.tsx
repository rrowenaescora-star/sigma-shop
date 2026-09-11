import ProductDetails from "./product-details-client";
import { getStorefrontProduct } from "@/lib/storefront-products";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let key = slug;
  try { key = decodeURIComponent(slug); } catch {}
  const product = await getStorefrontProduct(key);
  return <ProductDetails initialProduct={product} />;
}
