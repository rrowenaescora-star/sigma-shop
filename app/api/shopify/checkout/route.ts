import { NextResponse } from "next/server";

type CartItem = {
  id?: number;
  name: string;
  slug?: string | null;
  price: number;
  quantity: number;
};

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-07";

function normalizeHandle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const HANDLE_ALIASES: Record<string, string[]> = {
  beer: ["bear"],
  bear: ["beer"],
  budha: ["buddha"],
  buddha: ["budha"],
  racoon: ["raccoon"],
  raccoon: ["racoon"],
  "permanent-dragon": ["permanent-dragon"],
  "permanent-gravity": ["permanent-gravity"],
  "dark-blade": ["dark-blade"],
  "black-dragon": ["black-dragon"],
  unicorn: ["unicorn"],
};

async function shopifyGraphql<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new Error(
      "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN."
    );
  }

  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const json = await res.json();

  if (!res.ok || json.errors) {
    throw new Error(
      json?.errors?.[0]?.message ||
        json?.data?.cartCreate?.userErrors?.[0]?.message ||
        "Failed to talk to Shopify."
    );
  }

  return json.data as T;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: CartItem[] = Array.isArray(body.items) ? body.items : [];
    const orderId = body.orderId ? String(body.orderId) : "";

    if (items.length === 0) {
      return NextResponse.json(
        { error: "No items were provided." },
        { status: 400 }
      );
    }

    const cartLines = [];

    for (const item of items) {
      const baseHandle = normalizeHandle(item.slug || item.name);
      const candidateHandles = Array.from(
        new Set([baseHandle, ...(HANDLE_ALIASES[baseHandle] || [])]),
      );

      const productQuery = `
        query ProductByHandle($handle: String!) {
          product(handle: $handle) {
            title
            selectedOrFirstAvailableVariant {
              id
            }
          }
        }
      `;

      let variantId: string | null = null;
      let matchedHandle = baseHandle;

      for (const handle of candidateHandles) {
        const result = await shopifyGraphql<{
          product: {
            title: string;
            selectedOrFirstAvailableVariant: { id: string } | null;
          } | null;
        }>(productQuery, { handle });

        const foundVariantId = result.product?.selectedOrFirstAvailableVariant?.id;

        if (foundVariantId) {
          variantId = foundVariantId;
          matchedHandle = handle;
          break;
        }
      }

      if (!variantId) {
        return NextResponse.json(
          {
            error: `Shopify product not found for "${item.name}".`,
            handle: baseHandle,
            candidateHandles,
          },
          { status: 404 }
        );
      }

      cartLines.push({
        merchandiseId: variantId,
        quantity: Number(item.quantity || 1),
      });
    }

    const cartMutation = `
      mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const cartData = await shopifyGraphql<{
      cartCreate: {
        cart: { id: string; checkoutUrl: string } | null;
        userErrors: { field?: string[] | null; message: string }[];
      };
    }>(cartMutation, {
      input: {
        lines: cartLines,
        attributes: orderId
          ? [
              {
                key: "bloxhop_order_id",
                value: orderId,
              },
            ]
          : [],
      },
    });

    if (cartData.cartCreate.userErrors.length > 0) {
      return NextResponse.json(
        {
          error: cartData.cartCreate.userErrors[0].message,
        },
        { status: 400 }
      );
    }

    const checkoutUrl = cartData.cartCreate.cart?.checkoutUrl;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Shopify did not return a checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl,
    });
  } catch (error) {
    console.error("Shopify checkout error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to start Shopify checkout.",
      },
      { status: 500 }
    );
  }
}
