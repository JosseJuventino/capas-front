import NextAuth, { AuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { api } from "./api";
import { AuthResponse } from "../types/types";

declare module "next-auth" {
  interface User {
    id: string;
    token: string;
    userId: string;
    nombreCompleto: string;
    email: string;
    image?: string;
    role?: string;
    isActive?: boolean;
  }

  interface Session {
    token: string;
    info: {
      userId: string;
      nombreCompleto: string;
      email: string;
      image?: string;
      role?: string;
      isActive?: boolean;
    };
    expires: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    token: string;
    info: {
      userId: string;
      nombreCompleto: string;
      email: string;
      image?: string;
      role?: string;
      isActive?: boolean;
    };
    exp?: number;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await api.post<AuthResponse>("auth/login", {
          email: credentials.email,
          password: credentials.password,
        });
        console.log("Respuesta de autenticación:", res.data);
        const { token, info } = res.data.data;
        if (!token || !info) return null;

        return {
          id: info.userId,
          userId: info.userId,
          nombreCompleto: info.nombreCompleto,
          email: info.email,
          image: info.image,
          role: info.role,
          isActive: info.isActive,
          token,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.token = user.token;
        token.info = {
          userId: user.userId,
          nombreCompleto: user.nombreCompleto,
          email: user.email,
          image: user.image,
          role: user.role,
          isActive: user.isActive,
        };
        token.exp = Math.floor(Date.now() / 1000) + 2 * 60 * 60;
      }
      return token;
    },

    async session({
      session,
      token,
    }): Promise<Session> {
      session.token = token.token;
      session.info = token.info;
      session.expires = token.exp
        ? new Date(token.exp * 1000).toISOString()
        : session.expires;
      return session;
    },

    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },

  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 2 * 60 * 60 },
  jwt: { maxAge: 2 * 60 * 60 },
  pages: { signIn: "/", error: "/" },
};

export default NextAuth(authOptions);
