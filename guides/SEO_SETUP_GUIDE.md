# SEO Setup Guide for Gary Experience

This comprehensive guide covers all essential SEO optimizations for the Gary Experience AI-powered business coaching application.

## Table of Contents
1. [Current SEO Status](#current-seo-status)
2. [Essential Meta Tags](#essential-meta-tags)
3. [Open Graph & Social Media Optimization](#open-graph--social-media-optimization)
4. [Structured Data & Schema Markup](#structured-data--schema-markup)
5. [Sitemap & robots.txt Configuration](#sitemap--robotstxt-configuration)
6. [Performance Optimizations](#performance-optimizations)
7. [Content Optimization Strategies](#content-optimization-strategies)
8. [Technical SEO Implementation](#technical-seo-implementation)
9. [Analytics & Monitoring](#analytics--monitoring)
10. [Implementation Checklist](#implementation-checklist)

## Current SEO Status

The Gary Experience application currently has basic SEO setup in `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://chat.vercel.ai'),
  title: 'Gary Experience',
  description: 'Gary Hormozi Pro - AI-powered business coaching and insights.',
};
```

**Current Issues:**
- Missing Open Graph tags
- No Twitter Card configuration
- No structured data
- No sitemap or robots.txt
- Limited meta information
- No canonical URLs
- Missing hreflang support

## Essential Meta Tags

### Enhanced Layout Metadata

Update `app/layout.tsx` with comprehensive metadata:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://chat.vercel.ai'),
  title: {
    default: 'Gary Experience - AI Business Coaching',
    template: '%s | Gary Experience'
  },
  description: 'Transform your business with AI-powered coaching from Gary Hormozi. Get personalized insights, strategies, and actionable advice to scale your business.',
  keywords: [
    'Gary Hormozi',
    'AI business coaching',
    'business strategy',
    'entrepreneurship',
    'business growth',
    'AI mentor',
    'business consulting',
    'startup advice'
  ],
  authors: [{ name: 'Gary Hormozi Team' }],
  creator: 'Gary Experience',
  publisher: 'Gary Experience',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_SITE_VERIFICATION,
    yahoo: process.env.YAHOO_SITE_VERIFICATION,
  },
};
```

### Page-Specific Metadata

Create dynamic metadata for different pages:

```typescript
// app/chat/page.tsx
export const metadata: Metadata = {
  title: 'AI Business Coach Chat',
  description: 'Chat with our AI-powered business coach and get personalized advice for your business challenges.',
  openGraph: {
    title: 'AI Business Coach Chat | Gary Experience',
    description: 'Get instant business advice from our AI coach powered by Gary Hormozi\'s strategies.',
  },
};

// app/ideator/page.tsx
export const metadata: Metadata = {
  title: 'Business Idea Generator',
  description: 'Generate innovative business ideas using AI. Validate and refine your entrepreneurial concepts.',
  openGraph: {
    title: 'Business Idea Generator | Gary Experience',
    description: 'AI-powered business idea generation and validation tool.',
  },
};
```

## Open Graph & Social Media Optimization

### Comprehensive Open Graph Configuration

Update `app/layout.tsx` with Open Graph tags:

```typescript
export const metadata: Metadata = {
  // ... existing metadata
  openGraph: {
    title: 'Gary Experience - AI Business Coaching',
    description: 'Transform your business with AI-powered coaching from Gary Hormozi',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Gary Experience',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gary Experience - AI Business Coaching Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gary Experience - AI Business Coaching',
    description: 'Transform your business with AI-powered coaching from Gary Hormozi',
    siteId: '@garyhormozi',
    creator: '@garyhormozi',
    images: ['/twitter-image.jpg'],
  },
  other: {
    'twitter:label1': 'Pricing',
    'twitter:data1': 'Free Trial Available',
    'twitter:label2': 'Category',
    'twitter:data2': 'Business Coaching',
  },
};
```

### Dynamic Open Graph Images

Create dynamic OG images for different pages:

```typescript
// app/chat/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '40px',
        }}
      >
        <div style={{ fontSize: '64px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
          AI Business Coach Chat
        </div>
        <div style={{ fontSize: '24px', opacity: 0.9, textAlign: 'center' }}>
          Get personalized business advice from Gary Hormozi's AI
        </div>
        <div style={{ fontSize: '18px', marginTop: '40px', opacity: 0.8 }}>
          garyexperience.com
        </div>
      </div>
    )
  )
}
```

## Structured Data & Schema Markup

### Organization Schema

Add organization schema to layout:

```typescript
// app/layout.tsx
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Gary Experience',
  url: process.env.NEXT_PUBLIC_APP_URL,
  logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
  description: 'AI-powered business coaching platform featuring Gary Hormozi\'s strategies and insights',
  founder: {
    '@type': 'Person',
    name: 'Gary Hormozi',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'support@garyexperience.com',
  },
  sameAs: [
    'https://twitter.com/garyhormozi',
    'https://linkedin.com/in/garyhormozi',
    'https://youtube.com/garyhormozi',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, '\\u003c'),
          }}
        />
        {/* existing head content */}
      </head>
      {/* rest of layout */}
    </html>
  );
}
```

### Product Schema for Subscription Plans

```typescript
// components/subscription-schema.tsx
interface SubscriptionPlan {
  name: string;
  price: string;
  currency: string;
  features: string[];
}

export function SubscriptionSchema({ plans }: { plans: SubscriptionPlan[] }) {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Gary Experience AI Business Coaching',
    provider: {
      '@type': 'Organization',
      name: 'Gary Experience',
    },
    serviceType: 'Business Coaching',
    offers: plans.map((plan) => ({
      '@type': 'Offer',
      name: plan.name,
      price: plan.price,
      priceCurrency: plan.currency,
      availability: 'https://schema.org/InStock',
      description: plan.features.join(', '),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(productSchema).replace(/</g, '\\u003c'),
      }}
    />
  );
}
```

## Sitemap & robots.txt Configuration

### Dynamic Sitemap Generation

Create `app/sitemap.ts`:

```typescript
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chat.vercel.ai'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/chat`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ideator`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/subscription`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]
}
```

### robots.txt Configuration

Create `app/robots.ts`:

```typescript
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chat.vercel.ai'
  
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: '/api/',
        disallow: '/admin/',
        disallow: '/_next/',
        disallow: '/private/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: '/api/',
        disallow: '/admin/',
        disallow: '/_next/',
        disallow: '/private/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

## Performance Optimizations

### Next.js Configuration for SEO

Update `next.config.ts`:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

### Font Optimization

Update font configuration in `app/layout.tsx`:

```typescript
const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
  preload: true,
  fallback: ['monospace'],
});

export const metadata: Metadata = {
  // ... existing metadata
  other: {
    'preconnect': 'https://fonts.googleapis.com',
    'preconnect': 'https://fonts.gstatic.com',
    'dns-prefetch': 'https://fonts.googleapis.com',
  },
};
```

## Content Optimization Strategies

### Semantic HTML Structure

Ensure proper semantic HTML in landing page:

```typescript
// components/landingpage.tsx
export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="relative">
        <nav aria-label="Main navigation">
          {/* Navigation content */}
        </nav>
      </header>
      
      <section aria-labelledby="hero-heading">
        <h1 id="hero-heading" className="sr-only">
          Gary Experience - AI Business Coaching Platform
        </h1>
        {/* Hero content */}
      </section>
      
      <section aria-labelledby="features-heading">
        <h2 id="features-heading">Features</h2>
        {/* Features content */}
      </section>
      
      <section aria-labelledby="testimonials-heading">
        <h2 id="testimonials-heading">Testimonials</h2>
        {/* Testimonials content */}
      </section>
      
      <footer aria-label="Site footer">
        {/* Footer content */}
      </footer>
    </main>
  );
}
```

### Internal Linking Strategy

Create an internal linking component:

```typescript
// components/internal-link.tsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface InternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function InternalLink({ 
  href, 
  children, 
  className = '',
  ariaLabel 
}: InternalLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href}
      className={className}
      aria-current={isActive ? 'page' : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}
```

## Technical SEO Implementation

### Canonical URLs

Add canonical URL support:

```typescript
// lib/seo.ts
export function getCanonicalUrl(path: string = ''): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chat.vercel.ai';
  return `${baseUrl}${path}`;
}

// app/chat/page.tsx
export const metadata: Metadata = {
  // ... existing metadata
  alternates: {
    canonical: getCanonicalUrl('/chat'),
  },
};
```

### Hreflang Support

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  // ... existing metadata
  alternates: {
    canonical: getCanonicalUrl(),
    languages: {
      'en-US': getCanonicalUrl(),
      'en-GB': `${process.env.NEXT_PUBLIC_APP_URL}/en-gb`,
      'es-ES': `${process.env.NEXT_PUBLIC_APP_URL}/es`,
    },
  },
};
```

### Redirects Configuration

Update `next.config.ts` with redirects:

```typescript
async redirects() {
  return [
    {
      source: '/old-chat',
      destination: '/chat',
      permanent: true,
    },
    {
      source: '/business-coaching',
      destination: '/',
      permanent: true,
    },
    {
      source: '/ai-mentor',
      destination: '/chat',
      permanent: true,
    },
  ];
},
```

## Analytics & Monitoring

### SEO Analytics Component

```typescript
// components/seo-analytics.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function SEOAnalytics() {
  const pathname = usePathname();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Google Analytics
      if (typeof window.gtag !== 'undefined') {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_path: pathname,
        });
      }
      
      // Track page view for SEO monitoring
      const seoData = {
        path: pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };
      
      // Send to your analytics endpoint
      fetch('/api/seo-track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seoData),
      }).catch(() => {
        // Silently fail if tracking fails
      });
    }
  }, [pathname]);
  
  return null;
}
```

### SEO Monitoring Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  
  // Log bot visits
  if (userAgent.includes('bot') || userAgent.includes('crawler')) {
    console.log(`Bot visit: ${userAgent} - ${url.pathname}`);
    
    // Optional: Send to monitoring service
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bot-monitoring`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAgent,
        path: url.pathname,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  }
  
  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'all');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}
```

## Implementation Checklist

### Phase 1: Essential SEO Setup
- [ ] Update layout metadata with comprehensive tags
- [ ] Add Open Graph and Twitter Card configuration
- [ ] Create sitemap.ts and robots.ts files
- [ ] Implement basic structured data (Organization schema)
- [ ] Add canonical URL support
- [ ] Configure proper font optimization

### Phase 2: Advanced SEO Features
- [ ] Create dynamic Open Graph images
- [ ] Implement hreflang support for internationalization
- [ ] Add product schema for subscription plans
- [ ] Set up SEO analytics and monitoring
- [ ] Configure redirects for old URLs
- [ ] Implement internal linking strategy

### Phase 3: Performance & Technical SEO
- [ ] Optimize Next.js configuration for SEO
- [ ] Add security headers
- [ ] Implement proper semantic HTML structure
- [ ] Set up bot monitoring middleware
- [ ] Configure image optimization settings
- [ ] Add Core Web Vitals monitoring

### Phase 4: Content & Optimization
- [ ] Create page-specific metadata for all routes
- [ ] Implement content optimization strategies
- [ ] Add structured data for different content types
- [ ] Set up A/B testing for SEO elements
- [ ] Create SEO monitoring dashboard
- [ ] Implement regular SEO audits

### Environment Variables Required

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
GOOGLE_SITE_VERIFICATION=your-google-verification-code
YANDEX_SITE_VERIFICATION=your-yandex-verification-code
YAHOO_SITE_VERIFICATION=your-yahoo-verification-code
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### Testing & Validation

After implementation, validate your SEO setup:

1. **Google Rich Results Test**: Test your structured data
2. **Facebook Sharing Debugger**: Validate Open Graph tags
3. **Twitter Card Validator**: Check Twitter Card implementation
4. **Google Search Console**: Monitor indexing and performance
5. **Sitemap Validation**: Ensure sitemap is accessible and valid
6. **Mobile-Friendly Test**: Verify mobile optimization

### Ongoing Maintenance

- **Monthly**: Check Google Search Console for issues
- **Quarterly**: Update keywords and meta descriptions
- **Bi-annually**: Audit structured data implementation
- **Annually**: Review and update SEO strategy

This comprehensive SEO setup will significantly improve the Gary Experience application's search engine visibility, user engagement, and overall performance.