import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { AuthService } from "@/services/auth.service";
import { isUserRole } from "@/lib/roles";

export const {
  handlers,
  signIn,
  signOut,
  auth,
  unstable_update
} = NextAuth({
  session: {
    strategy: "jwt"
  },
  providers:[
    Credentials({
      credentials: {
        email: {},
        password: {},
        role: {}
      },
      async authorize(credentials) {
        const result = await AuthService.validateCredentials({
          email: credentials?.email as string,
          password: credentials?.password as string,
          role: credentials?.role as string
        });

        if (!result.ok || !result.user) {
          return null;
        }

        return {
          id: String(result.user._id),
          name: result.user.fullname,
          email: result.user.email,
          role: result.role,
          roles: result.roles
        };

      }

    })

  ],
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
        session.user.role = isUserRole(role)
          ? role
          : "teacher";
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

});
