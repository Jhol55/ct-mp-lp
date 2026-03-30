import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSubdomainFromHost } from "@/lib/subdomain";

export default auth((request) => {
  const url = request.nextUrl;
  const { pathname } = url;

  const hostHeader =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    url.hostname ||
    "";
  const protoHeader =
    request.headers.get("x-forwarded-proto") ||
    url.protocol.replace(":", "") ||
    "https";
  const requestOrigin = `${protoHeader}://${hostHeader}`;
  const subdomain = getSubdomainFromHost(hostHeader);

  const publicRoutes = ["/", "/login"];
  const isPublicRoute = publicRoutes.includes(pathname);

  const isAdminSubdomain = (subdomain.split(".")[0] || "") === "admin";

  const isIndexPath = pathname === "/";
  const isLoginPath = pathname.startsWith("/login");
  const isAdminPath = pathname.startsWith("/admin");

  const session = request.auth;
  let isAuthenticated = !!session?.user;
  let isAdmin = session?.user?.role === "ADMIN";

  if (isAdminSubdomain) {
    // Path already has /admin prefix (result of internal rewrite or direct access).
    // Apply auth check but do NOT redirect further to avoid infinite loops.
    if (isAdminPath) {
      if (!isAuthenticated || !isAdmin) {
        const loginUrl = url.clone();
        loginUrl.pathname = "/admin/login";
        return NextResponse.rewrite(loginUrl);
      }
      return NextResponse.next();
    }

    if (!isAuthenticated || !isAdmin) {
      const loginUrl = url.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.rewrite(loginUrl);
    }

    if (isAuthenticated && isAdmin && (isIndexPath || isLoginPath)) {
      const homeUrl = url.clone();
      homeUrl.pathname = "/admin/home";
      return NextResponse.rewrite(homeUrl);
    }

    if ((isAuthenticated && isAdmin) || (!isAuthenticated && isPublicRoute)) {
      const rewriteUrl = url.clone();
      rewriteUrl.pathname = `/admin${pathname}`;
      return NextResponse.rewrite(rewriteUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
