import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('Middleware called for path:', request.nextUrl.pathname);

  // Check if the user is authenticated
  const isAuthenticated = checkAuthentication(request);

  if (!isAuthenticated) {
    console.log('No valid session, redirecting to login');
    // Only redirect if not already on the login page
    if (!request.nextUrl.pathname.startsWith('/login')) {
      console.log('Redirecting to login page');
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } else {
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/') {
      console.log('Valid session exists, redirecting to chat');
      // Redirect to chat if there's a valid session and user is on login or home page
      return NextResponse.redirect(new URL('/chat', request.url))
    } else if (request.nextUrl.pathname.startsWith('/chat')) {
      // Allow all authenticated users to access chat, regardless of subscription status
      console.log('User accessing chat page');
    }
  }

  console.log('Proceeding with the request');
  return NextResponse.next()
}

function checkAuthentication(request: NextRequest): boolean {
  // In a real implementation, you would check the session token from the request headers
  // For this example, we'll just check if the userInfo exists in localStorage
  // Note: This is a simplified example and may not work as-is in a server environment
  // You might need to implement a more robust authentication check
  const userInfo = request.cookies.get('userInfo')?.value;
  if (!userInfo) return false;

  try {
    const parsedUserInfo = JSON.parse(userInfo);
    return parsedUserInfo.sessionToken && new Date().getTime() < parsedUserInfo.expirationTime;
  } catch (error) {
    console.error('Error parsing user info:', error);
    return false;
  }
}

export const config = {
  matcher: ['/chat/:path*', '/login', '/', '/upgrade'],
}
