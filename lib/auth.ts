import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "@/auth.config";
import { AuthService } from "@/services/auth.service";

export const {
  handlers,
  signIn,
  signOut,
  auth,
  unstable_update
} = NextAuth({
  ...authConfig,
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

  ]
});
