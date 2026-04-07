import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
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

  // 🔐 Not logged in → redirect to login
  if (isAdminRoute && !user && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // 🔐 Logged in but NOT admin → block
  if (user && user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 🔐 Already logged in → skip login page
  if (user && isLoginPage) {
    return NextResponse.redirect(
      new URL("/admin/products", request.url)
    );
  }

  return response;
}

// IMPORTANT: Only protect admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
