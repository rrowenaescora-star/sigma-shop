import imageManifest from "@/public/products/manifest.json";

const localImages = imageManifest as Record<string, string>;

export function getLocalProductImage(id: number | string, fallback: string | null) {
  return localImages[String(id)] || fallback;
}

export function localizeProductImage<T extends { id: number | string; image_url: string | null }>(product: T): T {
  return { ...product, image_url: getLocalProductImage(product.id, product.image_url) };
}
