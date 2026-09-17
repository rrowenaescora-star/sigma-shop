import Storefront from "./storefront-client";
import { getStorefrontBootstrap } from "@/lib/storefront-products";

export const dynamic = "force-dynamic";

export default async function StealAnEggPage() {
  const data = await getStorefrontBootstrap("steal-an-egg");

  return (
    <Storefront
      initialProducts={data.products}
      initialCapital={data.capital}
      initialPhpRate={data.phpRate}
      initialInrRate={data.inrRate}
    />
  );
}
