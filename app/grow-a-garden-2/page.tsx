import Storefront from "./storefront-client";
import { getStorefrontBootstrap } from "@/lib/storefront-products";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getStorefrontBootstrap("grow-a-garden-2");
  return <Storefront initialProducts={data.products} initialCapital={data.capital} initialPhpRate={data.phpRate} initialInrRate={data.inrRate} />;
}
