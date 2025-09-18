import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
    error: '/login',
    verifyRequest: '/verify-request',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      let isLoggedIn = !!auth?.user;
      let isOnRegister = nextUrl.pathname.startsWith('/register');
      let isOnLogin = nextUrl.pathname.startsWith('/login');
      let isOnSignIn = nextUrl.pathname.startsWith('/sign-in');
      let isOnSignUp = nextUrl.pathname.startsWith('/sign-up');
      let isOnGuestSignIn = nextUrl.pathname.startsWith('/guest-signin');

      // Redirect authenticated users away from auth pages
      if (isLoggedIn && (isOnLogin || isOnRegister || isOnSignIn || isOnSignUp)) {
        return Response.redirect(new URL('/chat', nextUrl));
      }

      // Always allow access to auth pages
      if (isOnRegister || isOnLogin || isOnSignIn || isOnSignUp || isOnGuestSignIn) {
        return true;
      }

      // Allow access to the chat interface without authentication (guest access)
      if (nextUrl.pathname.startsWith('/chat')) {
        return true;
      }

      // Allow access to the main page without authentication (guest access)
      if (nextUrl.pathname === '/') {
        return true;
      }

      // For other protected routes, require authentication
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
