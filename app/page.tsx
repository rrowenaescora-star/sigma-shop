import LandingPage from "./landing-client";
import { getLandingFeaturedImages } from "@/lib/storefront-products";

export const revalidate = 300;

export default async function Page() {
  const featuredImages = await getLandingFeaturedImages();
  return <LandingPage initialFeaturedImages={featuredImages} />;
}
