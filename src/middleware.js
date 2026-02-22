import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSubdomainFromHost } from "@/lib/subdomain";

export default auth((request) => {
  const url = request.nextUrl;
  const { pathname } = url;

  const hostHeader = request.headers.get("host") || url.hostname || "";
  const subdomain = getSubdomainFromHost(hostHeader);
  

  const publicRoutes = ["/", "/login"];
  const isPublicRoute = publicRoutes.includes(pathname);

  const isAdminSubdomain = (subdomain.split(".")[0] || "") === "admin";

  const isIndexPath = pathname === "/";
  const isLoginPath = pathname.startsWith("/login");
  const isAdminPath = pathname.startsWith("/admin");
  const subdomainPath = "/" + subdomain;

  const session = request.auth;
  let isAuthenticated = !!session?.user;
  let isAdmin = session?.user?.role === "ADMIN";


  // isAuthenticated = true;
  // isAdmin = true;
  // isUser = true;


  if (isAdminSubdomain) {
    if (isAdminPath) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!isAuthenticated || !isAdmin) {
      return NextResponse.rewrite(new URL("/admin/login", request.url));
    }
    
    if (isAuthenticated && isAdmin && (isIndexPath || isLoginPath)) {
      return NextResponse.redirect(new URL(`/home`, request.url));
    }

    if ((isAuthenticated && isAdmin) || (!isAuthenticated && isPublicRoute)) {
      return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url));
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