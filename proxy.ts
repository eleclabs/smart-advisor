/* import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req)=>{

  const role = req.auth?.user.role;

  if(
    req.nextUrl.pathname.startsWith(
      "/admin"
    )
  ){

    if(role !== "admin")
      return NextResponse.redirect(
        new URL("/login",req.url)
      );

  }

});
 */



import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {

  const role = req.auth?.user?.role;

  const pathname =
    req.nextUrl.pathname;

  if (
    pathname.startsWith("/admin")
  ) {

    if (role !== "admin") {

      return NextResponse.redirect(
        new URL("/login", req.url)
      );

    }

  }

  return NextResponse.next();

});

export const config = {
  matcher: ["/admin/:path*"]
};
