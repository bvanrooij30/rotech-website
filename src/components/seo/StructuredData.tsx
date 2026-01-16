interface StructuredDataProps {
  type: "organization" | "website" | "localBusiness" | "service" | "faqPage" | "breadcrumb" | "article";
  data?: Record<string, unknown>;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ro-techdevelopment.com";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Ro-Tech Development",
  alternateName: "BVR Services",
  url: baseUrl,
  logo: `${baseUrl}/images/rotech/rotech-logo.svg`,
  description: "Ro-Tech Development bouwt professionele websites, webshops en web applicaties op maat.",
  email: "contact@ro-techdevelopment.com",
  telephone: "+31657235574",
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
    telephone: "+31657235574",
    contactType: "customer service",
    availableLanguage: ["Dutch", "English"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Ro-Tech Development",
  url: baseUrl,
  description: "Professionele websites, webshops en web applicaties op maat",
  publisher: {
    "@type": "Organization",
    name: "Ro-Tech Development",
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
  name: "Ro-Tech Development",
  image: `${baseUrl}/images/rotech/rotech-logo.svg`,
  url: baseUrl,
  telephone: "+31657235574",
  email: "contact@ro-techdevelopment.com",
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
      "@type": "City",
      name: "Veldhoven",
    },
    {
      "@type": "City",
      name: "Eindhoven",
    },
    {
      "@type": "State",
      name: "Noord-Brabant",
    },
    {
      "@type": "Country",
      name: "Nederland",
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
    areaServed: {
      "@type": "Country",
      name: "Nederland",
    },
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
