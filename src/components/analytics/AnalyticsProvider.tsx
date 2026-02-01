'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { GA_MEASUREMENT_ID, pageview, isAnalyticsEnabled, trackEvent } from '@/lib/analytics';

/**
 * Analytics Provider Component
 * 
 * Laadt Google Analytics 4 en tracked automatisch pageviews.
 * Voeg toe aan layout.tsx:
 * 
 * import { AnalyticsProvider } from '@/components/analytics';
 * 
 * <AnalyticsProvider />
 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Track pageviews bij route changes
  useEffect(() => {
    if (!isAnalyticsEnabled()) return;
    
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    pageview(url);
    
    // Track specifieke pagina events
    if (pathname === '/prijzen') {
      trackEvent.pricingViewed();
    } else if (pathname === '/contact') {
      trackEvent.contactPageViewed();
    } else if (pathname === '/onderhoud') {
      trackEvent.onderhoudViewed();
    } else if (pathname === '/offerte') {
      trackEvent.offerteStarted();
    } else if (pathname.startsWith('/diensten/')) {
      const dienst = pathname.replace('/diensten/', '');
      trackEvent.dienstenViewed(dienst);
    } else if (pathname.startsWith('/projecten/')) {
      const project = pathname.replace('/projecten/', '');
      trackEvent.projectViewed(project);
    } else if (pathname.startsWith('/blog/')) {
      const article = pathname.replace('/blog/', '');
      trackEvent.blogViewed(article);
    }
  }, [pathname, searchParams]);
  
  // Alleen renderen als GA_MEASUREMENT_ID is ingesteld
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    return null;
  }
  
  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
    </>
  );
}

/**
 * Hook voor het tracken van CTA clicks
 */
export function useTrackCTA() {
  return (ctaName: string, location: string) => {
    trackEvent.ctaClicked(ctaName, location);
  };
}

/**
 * Hook voor het tracken van externe links (email, telefoon)
 */
export function useTrackExternalLinks() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href) return;
      
      if (href.startsWith('tel:')) {
        trackEvent.phoneClicked();
      } else if (href.startsWith('mailto:')) {
        trackEvent.emailClicked();
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
}
