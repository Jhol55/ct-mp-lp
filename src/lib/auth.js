import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getSubdomainFromHost } from "@/lib/subdomain";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Self-host (VPS / reverse proxy): allow Host header to be trusted.
  // You can also control this via AUTH_TRUST_HOST env var if preferred.
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        try {
          const backendUrl = process.env.BACKEND_URL;
          const hostHeader = request?.headers?.get("host") || "";
          const subdomain = getSubdomainFromHost(hostHeader);
          const firstLabel = (subdomain.split(".")[0] || "").toLowerCase();
          const isAdminSubdomain = firstLabel === "admin";

          ///////////////////////////////////
          if (!backendUrl) {
            throw new Error("BACKEND_URL não configurado");
          }

          const response = await fetch(`${backendUrl}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          const user = {
            id: data.user?.id || data.user_id,
            email: data.user?.email || credentials.email,
            name: data.user?.name || data.user_name,
            token: data.token,
            role: data.user?.role || data.role,
          };
          ///////////////////////////////////////////////////////

          
          if (isAdminSubdomain && user.role !== "ADMIN") {
            return null;
          }

          return user;
        } catch (error) {
          console.error("Auth error: Failed to authenticate");
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.id = user.id;
        token.role = user.role;
        token.leaderSlug = user.leaderSlug;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.leaderSlug = token.leaderSlug;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
});
