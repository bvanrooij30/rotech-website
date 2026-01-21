interface StructuredDataProps {
  type: "organization" | "website" | "localBusiness" | "service" | "faqPage" | "breadcrumb" | "article" | "howTo" | "product" | "review" | "speakable";
  data?: Record<string, unknown>;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ro-techdevelopment.dev";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RoTech Development",
  alternateName: "BVR Services",
  url: baseUrl,
  logo: `${baseUrl}/images/rotech/rotech-logo.svg`,
  description: "RoTech Development bouwt professionele websites, webshops en web applicaties op maat.",
  email: "contact@ro-techdevelopment.dev",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kruisstraat 64",
    postalCode: "5502 JG",
    addressRegion: "Noord-Brabant",
    addressCountry: "NL",
    addressLocality: "Veldhoven",
  },
  sameAs: [
    "https://linkedin.com/company/ro-tech-development",
  ],
  founder: {
    "@type": "Person",
    name: "Bart van Rooij",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@ro-techdevelopment.dev",
    contactType: "customer service",
    availableLanguage: ["Dutch", "English"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RoTech Development",
  url: baseUrl,
  description: "Professionele websites, webshops en web applicaties op maat",
  publisher: {
    "@type": "Organization",
    name: "RoTech Development",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${baseUrl}/zoeken?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${baseUrl}/#localbusiness`,
  name: "RoTech Development",
  image: `${baseUrl}/images/rotech/rotech-logo.svg`,
  url: baseUrl,
  email: "contact@ro-techdevelopment.dev",
  description: "Web development agency gespecialiseerd in websites, webshops en web applicaties op maat.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kruisstraat 64",
    postalCode: "5502 JG",
    addressLocality: "Veldhoven",
    addressRegion: "Noord-Brabant",
    addressCountry: "NL",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 51.4208,
    longitude: 5.4038,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:30",
    },
  ],
  priceRange: "€€-€€€",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5.0",
    reviewCount: "10",
  },
  areaServed: [
    {
      "@type": "Country",
      name: "Nederland",
    },
    {
      "@type": "Country",
      name: "België",
    },
  ],
};

export function StructuredData({ type, data }: StructuredDataProps) {
  let schema: Record<string, unknown>;

  switch (type) {
    case "organization":
      schema = organizationSchema;
      break;
    case "website":
      schema = websiteSchema;
      break;
    case "localBusiness":
      schema = localBusinessSchema;
      break;
    case "service":
      schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        ...data,
      };
      break;
    case "faqPage":
      schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        ...data,
      };
      break;
    case "breadcrumb":
      schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        ...data,
      };
      break;
    case "article":
      schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        ...data,
      };
      break;
    case "howTo":
      schema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        ...data,
      };
      break;
    case "product":
      schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        ...data,
      };
      break;
    case "review":
      schema = {
        "@context": "https://schema.org",
        "@type": "Review",
        ...data,
      };
      break;
    case "speakable":
      schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["article", ".speakable"],
        },
        ...data,
      };
      break;
    default:
      schema = {};
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ServiceSchema({ service }: { service: { title: string; description: string; slug: string; startingPrice: string } }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    url: `${baseUrl}/diensten/${service.slug}`,
    provider: {
      "@type": "Organization",
      name: "RoTech Development",
      url: baseUrl,
    },
    areaServed: [
      {
        "@type": "Country",
        name: "Nederland",
      },
      {
        "@type": "Country",
        name: "België",
      },
    ],
    offers: {
      "@type": "Offer",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: service.startingPrice.replace(/[^0-9]/g, ""),
        priceCurrency: "EUR",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ items }: { items: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// HowTo Schema for tutorials and guides
export function HowToSchema({ 
  name, 
  description, 
  steps,
  totalTime,
  estimatedCost,
}: { 
  name: string; 
  description: string;
  steps: { name: string; text: string; url?: string; image?: string }[];
  totalTime?: string; // ISO 8601 duration format, e.g., "PT30M"
  estimatedCost?: { currency: string; value: string };
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    ...(totalTime && { totalTime }),
    ...(estimatedCost && {
      estimatedCost: {
        "@type": "MonetaryAmount",
        currency: estimatedCost.currency,
        value: estimatedCost.value,
      },
    }),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.url && { url: step.url }),
      ...(step.image && { image: step.image }),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Product/Service Offer Schema
export function OfferSchema({
  name,
  description,
  url,
  priceRange,
  areaServed,
}: {
  name: string;
  description: string;
  url: string;
  priceRange?: string;
  areaServed?: string[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: url.startsWith("http") ? url : `${baseUrl}${url}`,
    provider: {
      "@type": "Organization",
      name: "RoTech Development",
      url: baseUrl,
    },
    ...(priceRange && { priceRange }),
    ...(areaServed && {
      areaServed: areaServed.map((area) => ({
        "@type": "Country",
        name: area,
      })),
    }),
    serviceType: "Web Development",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Review/Testimonial Schema
export function ReviewSchema({
  itemReviewed,
  reviewRating,
  author,
  reviewBody,
  datePublished,
}: {
  itemReviewed: { type: string; name: string };
  reviewRating: { ratingValue: number; bestRating?: number };
  author: string;
  reviewBody: string;
  datePublished?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": itemReviewed.type,
      name: itemReviewed.name,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: reviewRating.ratingValue,
      bestRating: reviewRating.bestRating || 5,
    },
    author: {
      "@type": "Person",
      name: author,
    },
    reviewBody,
    ...(datePublished && { datePublished }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Aggregate Rating Schema
export function AggregateRatingSchema({
  itemType,
  itemName,
  ratingValue,
  reviewCount,
  bestRating = 5,
}: {
  itemType: string;
  itemName: string;
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": itemType,
    name: itemName,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue,
      bestRating,
      reviewCount,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Speakable Schema for voice search
export function SpeakableSchema({
  url,
  cssSelector = ["article", "h1", ".description"],
}: {
  url: string;
  cssSelector?: string[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: url.startsWith("http") ? url : `${baseUrl}${url}`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Software Application Schema (for web apps)
export function SoftwareApplicationSchema({
  name,
  description,
  applicationCategory,
  operatingSystem = "Web",
  offers,
}: {
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem?: string;
  offers?: { price: string; priceCurrency: string };
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory,
    operatingSystem,
    ...(offers && {
      offers: {
        "@type": "Offer",
        price: offers.price,
        priceCurrency: offers.priceCurrency,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
