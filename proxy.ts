import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function extractEveryThirdCharacter(value: string) {
  return value
    .split("")
    .filter((_, index) => (index + 1) % 3 === 0)
    .join("");
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (pathname === "/admin-access") {
    const key = request.nextUrl.searchParams.get("key");

    if (key === process.env.ADMIN_NFC_KEY_A) {
      const response = NextResponse.redirect(
        new URL("/admin/verify-second-key", request.url)
      );

      response.cookies.set("bloxhop_nfc_step_1", "true", {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60,
        path: "/",
      });

      return response;
    }

    if (key === process.env.ADMIN_NFC_KEY_B) {
      const hasStepOne =
        request.cookies.get("bloxhop_nfc_step_1")?.value === "true";

      if (!hasStepOne) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }

      const response = NextResponse.redirect(
        new URL("/admin/products", request.url)
      );

      response.cookies.set("bloxhop_admin_bypass", "true", {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 5,
        path: "/",
      });

      response.cookies.delete("bloxhop_nfc_step_1");

      return response;
    }

    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (pathname.startsWith("/admin/login-")) {
    const slug = pathname.replace("/admin/login-", "");
    const extracted = extractEveryThirdCharacter(slug);

    if (extracted !== process.env.ADMIN_URL_PATTERN_SECRET) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return NextResponse.rewrite(new URL("/admin/login", request.url));
  }

  if (pathname === "/admin/login") {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
if (pathname === "/admin/verify-second-key") {
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const bypass = request.cookies.get("bloxhop_admin_bypass")?.value === "true";

  if (bypass) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};