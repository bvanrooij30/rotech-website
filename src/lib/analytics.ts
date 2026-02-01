/**
 * Analytics Library voor Ro-Tech Development
 * 
 * Ondersteunt:
 * - Google Analytics 4 (GA4)
 * - Custom event tracking
 * - Conversion tracking
 * - Pageview tracking
 * 
 * Gebruik:
 * - import { trackEvent, trackConversion } from '@/lib/analytics';
 * - trackEvent.contactFormSubmitted();
 * - trackConversion('offerte_submitted', 2500);
 */

// Google Analytics Measurement ID
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Check of analytics actief is
export const isAnalyticsEnabled = () => {
  return typeof window !== 'undefined' && 
         GA_MEASUREMENT_ID && 
         GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';
};

// Declare gtag on window
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

/**
 * Track een pageview
 */
export const pageview = (url: string) => {
  if (!isAnalyticsEnabled()) return;
  
  window.gtag('config', GA_MEASUREMENT_ID!, {
    page_path: url,
  });
};

/**
 * Track een custom event
 */
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (!isAnalyticsEnabled()) {
    // Log in development voor debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics Event]', { action, category, label, value });
    }
    return;
  }
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

/**
 * Track een conversie (belangrijk voor ROI meting)
 */
export const trackConversion = (
  conversionType: string, 
  value?: number,
  currency: string = 'EUR'
) => {
  event({
    action: 'conversion',
    category: conversionType,
    value: value,
  });
  
  // Ook als purchase event voor Google Ads
  if (isAnalyticsEnabled() && value) {
    window.gtag('event', 'purchase', {
      transaction_id: `${conversionType}_${Date.now()}`,
      value: value,
      currency: currency,
    });
  }
};

/**
 * Pre-defined events voor Ro-Tech
 * 
 * Gebruik: trackEvent.contactFormSubmitted();
 */
export const trackEvent = {
  // ============================================
  // PAGE ENGAGEMENT
  // ============================================
  
  /** Bezoeker bekijkt pricing pagina */
  pricingViewed: () => event({
    action: 'view_pricing',
    category: 'engagement',
  }),
  
  /** Bezoeker bekijkt diensten pagina */
  dienstenViewed: (dienst: string) => event({
    action: 'view_dienst',
    category: 'engagement',
    label: dienst,
  }),
  
  /** Bezoeker bekijkt projecten/portfolio */
  projectViewed: (project: string) => event({
    action: 'view_project',
    category: 'engagement',
    label: project,
  }),
  
  /** Bezoeker bekijkt blog artikel */
  blogViewed: (article: string) => event({
    action: 'view_blog',
    category: 'engagement',
    label: article,
  }),
  
  // ============================================
  // OFFERTE FUNNEL (Belangrijkste conversie!)
  // ============================================
  
  /** Bezoeker start offerte wizard */
  offerteStarted: () => event({
    action: 'offerte_started',
    category: 'conversion_funnel',
  }),
  
  /** Bezoeker selecteert pakket in wizard */
  offertePakketSelected: (pakket: string, price: number) => event({
    action: 'offerte_pakket_selected',
    category: 'conversion_funnel',
    label: pakket,
    value: price,
  }),
  
  /** Bezoeker voegt feature toe */
  offerteFeatureAdded: (feature: string, price: number) => event({
    action: 'offerte_feature_added',
    category: 'conversion_funnel',
    label: feature,
    value: price,
  }),
  
  /** Bezoeker verwijdert feature */
  offerteFeatureRemoved: (feature: string) => event({
    action: 'offerte_feature_removed',
    category: 'conversion_funnel',
    label: feature,
  }),
  
  /** Offerte formulier ingediend (CONVERSIE!) */
  offerteSubmitted: (pakket: string, totalValue: number) => {
    event({
      action: 'offerte_submitted',
      category: 'conversion',
      label: pakket,
      value: totalValue,
    });
    trackConversion('offerte_submitted', totalValue);
  },
  
  // ============================================
  // CONTACT FUNNEL
  // ============================================
  
  /** Contact pagina bekeken */
  contactPageViewed: () => event({
    action: 'contact_page_viewed',
    category: 'engagement',
  }),
  
  /** Contact formulier focus (intentie) */
  contactFormFocused: () => event({
    action: 'contact_form_focused',
    category: 'engagement',
  }),
  
  /** Contact formulier ingediend (CONVERSIE!) */
  contactFormSubmitted: (subject?: string) => {
    event({
      action: 'contact_form_submitted',
      category: 'conversion',
      label: subject,
    });
    trackConversion('contact_submitted');
  },
  
  // ============================================
  // CHAT WIDGET
  // ============================================
  
  /** Chat widget geopend */
  chatOpened: () => event({
    action: 'chat_opened',
    category: 'engagement',
  }),
  
  /** Chat bericht verstuurd */
  chatMessageSent: () => event({
    action: 'chat_message_sent',
    category: 'engagement',
  }),
  
  // ============================================
  // CTA CLICKS
  // ============================================
  
  /** CTA button geklikt */
  ctaClicked: (ctaName: string, location: string) => event({
    action: 'cta_clicked',
    category: 'engagement',
    label: `${ctaName}_${location}`,
  }),
  
  /** Telefoon link geklikt */
  phoneClicked: () => event({
    action: 'phone_clicked',
    category: 'engagement',
  }),
  
  /** Email link geklikt */
  emailClicked: () => event({
    action: 'email_clicked',
    category: 'engagement',
  }),
  
  // ============================================
  // ONDERHOUD / SUBSCRIPTIONS
  // ============================================
  
  /** Onderhoudspakket pagina bekeken */
  onderhoudViewed: () => event({
    action: 'onderhoud_viewed',
    category: 'engagement',
  }),
  
  /** Onderhoudspakket geselecteerd */
  onderhoudSelected: (pakket: string, monthlyPrice: number) => event({
    action: 'onderhoud_selected',
    category: 'conversion_funnel',
    label: pakket,
    value: monthlyPrice,
  }),
  
  // ============================================
  // ERRORS & FRICTION
  // ============================================
  
  /** Formulier validatie error */
  formError: (form: string, field: string) => event({
    action: 'form_error',
    category: 'friction',
    label: `${form}_${field}`,
  }),
  
  /** 404 pagina bezocht */
  notFoundViewed: (path: string) => event({
    action: 'not_found',
    category: 'errors',
    label: path,
  }),
};

/**
 * Analytics Debug Mode
 * Zet dit aan in development om te zien welke events worden gefired
 */
export const enableDebugMode = () => {
  if (typeof window !== 'undefined') {
    window.gtag('config', GA_MEASUREMENT_ID!, { debug_mode: true });
    console.log('[Analytics] Debug mode enabled');
  }
};
