import type { NextAuthConfig } from "next-auth";
import { isUserRole } from "@/lib/roles";

const authConfig = {
  session: {
    strategy: "jwt"
  },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roles = user.roles;
      }

      if (trigger === "update") {
        const requestedRole = String(session?.user?.role || "");
        const roles = Array.isArray(token.roles) ? token.roles : [];

        if (isUserRole(requestedRole) && roles.includes(requestedRole)) {
          token.role = requestedRole;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const role = String(token.role);

        session.user.id = String(token.id);
        session.user.role = isUserRole(role) ? role : "teacher";
        session.user.roles = Array.isArray(token.roles)
          ? token.roles.filter(isUserRole)
          : [session.user.role];
      }

      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
} satisfies NextAuthConfig;

export default authConfig;
