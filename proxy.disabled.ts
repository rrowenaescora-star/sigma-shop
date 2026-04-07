import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

type CookieToSet = {
  name: string;
  value: string;
  options?: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: "lax" | "strict" | "none" | boolean;
    secure?: boolean;
    priority?: "low" | "medium" | "high";
  };
};

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies: CookieToSet[]) {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = request.nextUrl.pathname.startsWith("/admin/login");

  if (isAdminRoute && !user && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const admins = process.env.ADMIN_EMAILS?.split(",") || [];

if (user && !admins.includes(user.email ?? "")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/admin/products", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
