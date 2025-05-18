// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Extending the built-in session types
   */
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string
    } & DefaultSession["user"]
    accessToken?: string,
    supabaseAccessToken?: string;
  }

  /**
   * Extending the built-in user types
   */
  interface User {
    id: string
    name: string
    email: string
    image?: string
  }
}

declare module "next-auth/jwt" {
  /** Extending the built-in JWT types */
  interface JWT {
    sub: string
    name?: string
    email?: string
    picture?: string
    accessToken?: string
    profile?: any
  }
}