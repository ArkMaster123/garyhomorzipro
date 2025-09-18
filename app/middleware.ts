import { auth } from '@/app/(auth)/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/sign-in',
    '/sign-up',
    '/login',
    '/register',
    '/forgot-password',
    '/verify-request',
    '/reset-password',
    '/api/auth',
    '/api/webhooks'
  ]
  
  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  // If it's not a public route and user is not authenticated, redirect to login
  if (!isPublicRoute && !req.auth) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm|ogg)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
