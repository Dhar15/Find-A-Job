// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import LinkedInProvider from 'next-auth/providers/linkedin';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

const handler = NextAuth({
  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
      issuer: 'https://www.linkedin.com/oauth',
      jwks_endpoint: 'https://www.linkedin.com/oauth/openid/jwks',
      profile(profile) {
        return {
          id: profile.id || profile.sub || "",
          name: profile.localizedFirstName && profile.localizedLastName 
            ? `${profile.localizedFirstName} ${profile.localizedLastName}`
            : profile.name || "LinkedIn User",
          email: profile.emailAddress || profile.email || "",
          image: profile.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier || profile.picture || '',
        };
      },
    }),
  ],
  debug: process.env.NODE_ENV === 'development', // Only enable debug in development
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        if (profile) {
          token.profile = profile;
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client
      if (session.user) {
        // Ensure we have a string for ID
        session.user.id = token.sub || "";
        if (token.picture) {
          session.user.image = token.picture;
        }
        // Add the access token to the session
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      } else if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };

