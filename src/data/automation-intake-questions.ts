/**
 * Automation Intake Questionnaire
 * Questions for onboarding new automation subscription customers
 */

// Workflow types that customers can choose
export const workflowTypes = [
  {
    id: "lead-capture",
    name: "Lead Capture & CRM",
    description: "Automatisch leads verzamelen en naar uw CRM sturen",
    icon: "Users",
  },
  {
    id: "content",
    name: "Content Distributie",
    description: "Blog posts automatisch delen op social media",
    icon: "FileText",
  },
  {
    id: "e-commerce",
    name: "E-commerce & Orders",
    description: "Order processing, facturen, verzending",
    icon: "ShoppingCart",
  },
  {
    id: "invoicing",
    name: "Facturatie & Boekhouding",
    description: "Automatische facturen en boekhouding sync",
    icon: "Receipt",
  },
  {
    id: "customer-service",
    name: "Klantenservice",
    description: "Support tickets, chatbots, escalatie",
    icon: "MessageCircle",
  },
  {
    id: "email-marketing",
    name: "Email Marketing",
    description: "Automatische email sequences en newsletters",
    icon: "Mail",
  },
  {
    id: "notifications",
    name: "Notificaties & Alerts",
    description: "Slack/Teams meldingen, SMS alerts",
    icon: "Bell",
  },
  {
    id: "data-sync",
    name: "Data Synchronisatie",
    description: "Systemen met elkaar syncen",
    icon: "RefreshCw",
  },
  {
    id: "reporting",
    name: "Rapportages",
    description: "Automatische rapporten en dashboards",
    icon: "BarChart3",
  },
  {
    id: "custom",
    name: "Anders / Maatwerk",
    description: "Iets anders dat hier niet staat",
    icon: "Sparkles",
  },
];

// Common systems/integrations
export const commonSystems = [
  // CRM & Sales
  { id: "hubspot", name: "HubSpot", category: "CRM" },
  { id: "pipedrive", name: "Pipedrive", category: "CRM" },
  { id: "salesforce", name: "Salesforce", category: "CRM" },
  { id: "zoho-crm", name: "Zoho CRM", category: "CRM" },
  
  // Productivity
  { id: "google-workspace", name: "Google Workspace", category: "Productiviteit" },
  { id: "microsoft-365", name: "Microsoft 365", category: "Productiviteit" },
  { id: "notion", name: "Notion", category: "Productiviteit" },
  { id: "trello", name: "Trello", category: "Productiviteit" },
  { id: "asana", name: "Asana", category: "Productiviteit" },
  { id: "monday", name: "Monday.com", category: "Productiviteit" },
  { id: "airtable", name: "Airtable", category: "Productiviteit" },
  
  // Communication
  { id: "slack", name: "Slack", category: "Communicatie" },
  { id: "teams", name: "Microsoft Teams", category: "Communicatie" },
  { id: "discord", name: "Discord", category: "Communicatie" },
  { id: "whatsapp-business", name: "WhatsApp Business", category: "Communicatie" },
  
  // E-commerce
  { id: "shopify", name: "Shopify", category: "E-commerce" },
  { id: "woocommerce", name: "WooCommerce", category: "E-commerce" },
  { id: "magento", name: "Magento", category: "E-commerce" },
  { id: "lightspeed", name: "Lightspeed", category: "E-commerce" },
  
  // Payment & Finance
  { id: "mollie", name: "Mollie", category: "Betalingen" },
  { id: "stripe", name: "Stripe", category: "Betalingen" },
  { id: "exact-online", name: "Exact Online", category: "Boekhouding" },
  { id: "moneybird", name: "Moneybird", category: "Boekhouding" },
  { id: "e-boekhouden", name: "e-Boekhouden", category: "Boekhouding" },
  { id: "visma", name: "Visma", category: "Boekhouding" },
  { id: "twinfield", name: "Twinfield", category: "Boekhouding" },
  
  // Marketing
  { id: "mailchimp", name: "Mailchimp", category: "Email Marketing" },
  { id: "activecampaign", name: "ActiveCampaign", category: "Email Marketing" },
  { id: "mailerlite", name: "MailerLite", category: "Email Marketing" },
  { id: "klaviyo", name: "Klaviyo", category: "Email Marketing" },
  
  // Social Media
  { id: "linkedin", name: "LinkedIn", category: "Social Media" },
  { id: "facebook", name: "Facebook/Meta", category: "Social Media" },
  { id: "instagram", name: "Instagram", category: "Social Media" },
  { id: "twitter-x", name: "X (Twitter)", category: "Social Media" },
  { id: "buffer", name: "Buffer", category: "Social Media" },
  { id: "hootsuite", name: "Hootsuite", category: "Social Media" },
  
  // Support
  { id: "zendesk", name: "Zendesk", category: "Support" },
  { id: "freshdesk", name: "Freshdesk", category: "Support" },
  { id: "intercom", name: "Intercom", category: "Support" },
  
  // Other
  { id: "wordpress", name: "WordPress", category: "Website" },
  { id: "webflow", name: "Webflow", category: "Website" },
  { id: "typeform", name: "Typeform", category: "Formulieren" },
  { id: "jotform", name: "JotForm", category: "Formulieren" },
  { id: "calendly", name: "Calendly", category: "Planning" },
  { id: "cal-com", name: "Cal.com", category: "Planning" },
];

// Workflow-specific questions
export interface IntakeQuestion {
  id: string;
  question: string;
  type: "text" | "textarea" | "select" | "multiselect" | "checkbox" | "radio" | "number";
  options?: { value: string; label: string }[];
  required: boolean;
  placeholder?: string;
  helpText?: string;
}

export interface WorkflowQuestions {
  workflowType: string;
  title: string;
  description: string;
  questions: IntakeQuestion[];
}

export const workflowSpecificQuestions: WorkflowQuestions[] = [
  {
    workflowType: "lead-capture",
    title: "Lead Capture & CRM Details",
    description: "Informatie over uw lead capture en CRM wensen",
    questions: [
      {
        id: "lead-sources",
        question: "Waar komen uw leads vandaan?",
        type: "multiselect",
        options: [
          { value: "website-form", label: "Website contactformulier" },
          { value: "landing-pages", label: "Landing pages" },
          { value: "linkedin", label: "LinkedIn" },
          { value: "facebook-ads", label: "Facebook/Instagram Ads" },
          { value: "google-ads", label: "Google Ads" },
          { value: "email", label: "Inkomende emails" },
          { value: "phone", label: "Telefonisch" },
          { value: "referrals", label: "Doorverwijzingen" },
          { value: "events", label: "Events/Beurzen" },
          { value: "other", label: "Anders" },
        ],
        required: true,
      },
      {
        id: "crm-system",
        question: "Welk CRM systeem gebruikt u (of wilt u gebruiken)?",
        type: "select",
        options: [
          { value: "hubspot", label: "HubSpot" },
          { value: "pipedrive", label: "Pipedrive" },
          { value: "salesforce", label: "Salesforce" },
          { value: "zoho", label: "Zoho CRM" },
          { value: "notion", label: "Notion" },
          { value: "airtable", label: "Airtable" },
          { value: "spreadsheet", label: "Google Sheets/Excel" },
          { value: "none", label: "Nog geen CRM" },
          { value: "other", label: "Anders" },
        ],
        required: true,
      },
      {
        id: "lead-notifications",
        question: "Hoe wilt u notificaties ontvangen bij nieuwe leads?",
        type: "multiselect",
        options: [
          { value: "email", label: "Email" },
          { value: "slack", label: "Slack" },
          { value: "teams", label: "Microsoft Teams" },
          { value: "sms", label: "SMS" },
          { value: "whatsapp", label: "WhatsApp" },
          { value: "none", label: "Geen notificaties nodig" },
        ],
        required: true,
      },
      {
        id: "lead-response",
        question: "Moet er automatisch een email naar de lead gestuurd worden?",
        type: "radio",
        options: [
          { value: "yes-standard", label: "Ja, standaard bevestigingsmail" },
          { value: "yes-custom", label: "Ja, gepersonaliseerde welkomstmail" },
          { value: "yes-sequence", label: "Ja, complete email sequence" },
          { value: "no", label: "Nee, alleen naar CRM" },
        ],
        required: true,
      },
      {
        id: "lead-volume",
        question: "Hoeveel leads verwacht u per maand?",
        type: "select",
        options: [
          { value: "1-10", label: "1-10 leads" },
          { value: "11-50", label: "11-50 leads" },
          { value: "51-100", label: "51-100 leads" },
          { value: "101-500", label: "101-500 leads" },
          { value: "500+", label: "Meer dan 500 leads" },
        ],
        required: true,
      },
    ],
  },
  {
    workflowType: "content",
    title: "Content Distributie Details",
    description: "Informatie over uw content en social media strategie",
    questions: [
      {
        id: "content-source",
        question: "Waar komt uw content vandaan?",
        type: "multiselect",
        options: [
          { value: "wordpress", label: "WordPress blog" },
          { value: "webflow", label: "Webflow" },
          { value: "notion", label: "Notion" },
          { value: "google-docs", label: "Google Docs" },
          { value: "rss", label: "RSS feed" },
          { value: "youtube", label: "YouTube" },
          { value: "podcast", label: "Podcast" },
          { value: "manual", label: "Handmatig aanleveren" },
        ],
        required: true,
      },
      {
        id: "social-platforms",
        question: "Naar welke platforms moet content gedeeld worden?",
        type: "multiselect",
        options: [
          { value: "linkedin", label: "LinkedIn" },
          { value: "linkedin-company", label: "LinkedIn Bedrijfspagina" },
          { value: "facebook", label: "Facebook" },
          { value: "instagram", label: "Instagram" },
          { value: "twitter", label: "X (Twitter)" },
          { value: "threads", label: "Threads" },
          { value: "pinterest", label: "Pinterest" },
          { value: "tiktok", label: "TikTok" },
        ],
        required: true,
      },
      {
        id: "posting-frequency",
        question: "Hoe vaak wilt u posten?",
        type: "select",
        options: [
          { value: "per-article", label: "Bij elke nieuwe blog/video" },
          { value: "daily", label: "Dagelijks" },
          { value: "few-per-week", label: "2-3x per week" },
          { value: "weekly", label: "Wekelijks" },
          { value: "custom", label: "Custom schema" },
        ],
        required: true,
      },
      {
        id: "content-transformation",
        question: "Moet de content getransformeerd worden?",
        type: "multiselect",
        options: [
          { value: "shorten", label: "Inkorten voor social" },
          { value: "hashtags", label: "Hashtags toevoegen" },
          { value: "translate", label: "Vertalen (NL ↔ EN)" },
          { value: "images", label: "Afbeeldingen toevoegen/aanpassen" },
          { value: "ai-rewrite", label: "AI herschrijven per platform" },
          { value: "none", label: "Geen transformatie" },
        ],
        required: true,
      },
    ],
  },
  {
    workflowType: "e-commerce",
    title: "E-commerce & Orders Details",
    description: "Informatie over uw webshop en orderverwerking",
    questions: [
      {
        id: "ecommerce-platform",
        question: "Welk e-commerce platform gebruikt u?",
        type: "select",
        options: [
          { value: "shopify", label: "Shopify" },
          { value: "woocommerce", label: "WooCommerce" },
          { value: "magento", label: "Magento" },
          { value: "lightspeed", label: "Lightspeed" },
          { value: "prestashop", label: "PrestaShop" },
          { value: "bigcommerce", label: "BigCommerce" },
          { value: "custom", label: "Custom/maatwerk" },
        ],
        required: true,
      },
      {
        id: "payment-provider",
        question: "Welke payment provider gebruikt u?",
        type: "select",
        options: [
          { value: "mollie", label: "Mollie" },
          { value: "stripe", label: "Stripe" },
          { value: "adyen", label: "Adyen" },
          { value: "multisafepay", label: "MultiSafepay" },
          { value: "pay", label: "Pay.nl" },
          { value: "shopify-payments", label: "Shopify Payments" },
          { value: "other", label: "Anders" },
        ],
        required: true,
      },
      {
        id: "order-automations",
        question: "Welke order-gerelateerde taken wilt u automatiseren?",
        type: "multiselect",
        options: [
          { value: "order-confirmation", label: "Order bevestigingsmail" },
          { value: "invoice", label: "Automatische factuur genereren" },
          { value: "accounting-sync", label: "Sync naar boekhouding" },
          { value: "shipping-label", label: "Verzendlabel aanmaken" },
          { value: "tracking", label: "Track & trace email" },
          { value: "review-request", label: "Review verzoek na levering" },
          { value: "inventory-alert", label: "Voorraad alerts" },
          { value: "abandoned-cart", label: "Abandoned cart recovery" },
        ],
        required: true,
      },
      {
        id: "shipping-provider",
        question: "Welke verzendpartner(s) gebruikt u?",
        type: "multiselect",
        options: [
          { value: "postnl", label: "PostNL" },
          { value: "dhl", label: "DHL" },
          { value: "dpd", label: "DPD" },
          { value: "ups", label: "UPS" },
          { value: "sendcloud", label: "Sendcloud" },
          { value: "myparcel", label: "MyParcel" },
          { value: "pickup", label: "Afhalen" },
          { value: "other", label: "Anders" },
        ],
        required: true,
      },
      {
        id: "monthly-orders",
        question: "Hoeveel orders verwerkt u per maand?",
        type: "select",
        options: [
          { value: "1-50", label: "1-50 orders" },
          { value: "51-200", label: "51-200 orders" },
          { value: "201-500", label: "201-500 orders" },
          { value: "501-1000", label: "501-1000 orders" },
          { value: "1000+", label: "Meer dan 1000 orders" },
        ],
        required: true,
      },
    ],
  },
  {
    workflowType: "invoicing",
    title: "Facturatie & Boekhouding Details",
    description: "Informatie over uw facturatie en boekhouding wensen",
    questions: [
      {
        id: "accounting-software",
        question: "Welk boekhoudpakket gebruikt u?",
        type: "select",
        options: [
          { value: "exact-online", label: "Exact Online" },
          { value: "moneybird", label: "Moneybird" },
          { value: "e-boekhouden", label: "e-Boekhouden" },
          { value: "visma", label: "Visma" },
          { value: "twinfield", label: "Twinfield" },
          { value: "snelstart", label: "SnelStart" },
          { value: "accountant", label: "Mijn accountant doet dit" },
          { value: "none", label: "Nog niets" },
        ],
        required: true,
      },
      {
        id: "invoice-triggers",
        question: "Wanneer moeten facturen aangemaakt worden?",
        type: "multiselect",
        options: [
          { value: "order-paid", label: "Na betaling van order" },
          { value: "project-complete", label: "Na projectoplevering" },
          { value: "monthly", label: "Maandelijkse facturatie" },
          { value: "subscription", label: "Bij subscription renewal" },
          { value: "manual", label: "Handmatig triggeren" },
        ],
        required: true,
      },
      {
        id: "invoice-features",
        question: "Welke facturatie features heeft u nodig?",
        type: "multiselect",
        options: [
          { value: "auto-numbering", label: "Automatische nummering" },
          { value: "btw-calculation", label: "BTW berekening" },
          { value: "payment-link", label: "Betaallink in factuur" },
          { value: "reminder", label: "Automatische herinneringen" },
          { value: "credit-invoice", label: "Creditfacturen" },
          { value: "multi-currency", label: "Meerdere valuta's" },
        ],
        required: true,
      },
    ],
  },
  {
    workflowType: "customer-service",
    title: "Klantenservice Details",
    description: "Informatie over uw klantenservice automatisering",
    questions: [
      {
        id: "support-channels",
        question: "Via welke kanalen komen support vragen binnen?",
        type: "multiselect",
        options: [
          { value: "email", label: "Email" },
          { value: "website-form", label: "Website formulier" },
          { value: "live-chat", label: "Live chat" },
          { value: "whatsapp", label: "WhatsApp" },
          { value: "phone", label: "Telefoon" },
          { value: "social-media", label: "Social media DM's" },
        ],
        required: true,
      },
      {
        id: "support-tool",
        question: "Gebruikt u een ticketing systeem?",
        type: "select",
        options: [
          { value: "zendesk", label: "Zendesk" },
          { value: "freshdesk", label: "Freshdesk" },
          { value: "intercom", label: "Intercom" },
          { value: "crisp", label: "Crisp" },
          { value: "helpscout", label: "Help Scout" },
          { value: "email-only", label: "Alleen email" },
          { value: "none", label: "Nog niets" },
        ],
        required: true,
      },
      {
        id: "support-automations",
        question: "Welke support taken wilt u automatiseren?",
        type: "multiselect",
        options: [
          { value: "auto-reply", label: "Automatische ontvangstbevestiging" },
          { value: "categorize", label: "Automatisch categoriseren" },
          { value: "route", label: "Naar juiste persoon routeren" },
          { value: "faq-bot", label: "FAQ chatbot" },
          { value: "ai-suggestions", label: "AI antwoord suggesties" },
          { value: "escalation", label: "Automatische escalatie" },
          { value: "satisfaction", label: "Tevredenheidsonderzoek na afhandeling" },
        ],
        required: true,
      },
      {
        id: "response-time-goal",
        question: "Wat is uw gewenste responstijd?",
        type: "select",
        options: [
          { value: "instant", label: "Direct (chatbot)" },
          { value: "1-hour", label: "Binnen 1 uur" },
          { value: "4-hours", label: "Binnen 4 uur" },
          { value: "same-day", label: "Zelfde dag" },
          { value: "next-day", label: "Volgende werkdag" },
        ],
        required: true,
      },
    ],
  },
  {
    workflowType: "email-marketing",
    title: "Email Marketing Details",
    description: "Informatie over uw email marketing automatisering",
    questions: [
      {
        id: "email-platform",
        question: "Welk email marketing platform gebruikt u?",
        type: "select",
        options: [
          { value: "mailchimp", label: "Mailchimp" },
          { value: "activecampaign", label: "ActiveCampaign" },
          { value: "mailerlite", label: "MailerLite" },
          { value: "klaviyo", label: "Klaviyo" },
          { value: "brevo", label: "Brevo (Sendinblue)" },
          { value: "convertkit", label: "ConvertKit" },
          { value: "hubspot", label: "HubSpot" },
          { value: "none", label: "Nog geen platform" },
        ],
        required: true,
      },
      {
        id: "email-automations",
        question: "Welke email automations wilt u opzetten?",
        type: "multiselect",
        options: [
          { value: "welcome", label: "Welkomstsequence" },
          { value: "nurture", label: "Lead nurturing" },
          { value: "abandoned-cart", label: "Abandoned cart" },
          { value: "post-purchase", label: "Na aankoop" },
          { value: "re-engagement", label: "Re-engagement" },
          { value: "birthday", label: "Verjaardag/jubileum" },
          { value: "newsletter", label: "Automatische newsletter" },
        ],
        required: true,
      },
      {
        id: "list-size",
        question: "Hoe groot is uw email lijst?",
        type: "select",
        options: [
          { value: "0-500", label: "0-500 contacten" },
          { value: "501-2000", label: "501-2000 contacten" },
          { value: "2001-10000", label: "2001-10.000 contacten" },
          { value: "10001-50000", label: "10.001-50.000 contacten" },
          { value: "50000+", label: "Meer dan 50.000 contacten" },
        ],
        required: true,
      },
    ],
  },
  {
    workflowType: "notifications",
    title: "Notificaties & Alerts Details",
    description: "Informatie over uw notificatie wensen",
    questions: [
      {
        id: "notification-channels",
        question: "Via welke kanalen wilt u notificaties ontvangen?",
        type: "multiselect",
        options: [
          { value: "slack", label: "Slack" },
          { value: "teams", label: "Microsoft Teams" },
          { value: "email", label: "Email" },
          { value: "sms", label: "SMS" },
          { value: "whatsapp", label: "WhatsApp" },
          { value: "discord", label: "Discord" },
          { value: "telegram", label: "Telegram" },
        ],
        required: true,
      },
      {
        id: "notification-triggers",
        question: "Bij welke events wilt u notificaties?",
        type: "multiselect",
        options: [
          { value: "new-lead", label: "Nieuwe lead" },
          { value: "new-order", label: "Nieuwe order" },
          { value: "payment", label: "Betaling ontvangen" },
          { value: "support-ticket", label: "Nieuw support ticket" },
          { value: "website-form", label: "Formulier ingevuld" },
          { value: "calendar", label: "Afspraak gepland" },
          { value: "review", label: "Nieuwe review" },
          { value: "error", label: "Systeem errors" },
          { value: "custom", label: "Custom triggers" },
        ],
        required: true,
      },
      {
        id: "notification-urgency",
        question: "Moet er onderscheid zijn in urgentie?",
        type: "radio",
        options: [
          { value: "yes", label: "Ja, urgente items via SMS/call, rest via Slack/email" },
          { value: "no", label: "Nee, alles via hetzelfde kanaal" },
        ],
        required: true,
      },
    ],
  },
  {
    workflowType: "data-sync",
    title: "Data Synchronisatie Details",
    description: "Informatie over uw systeem integraties",
    questions: [
      {
        id: "sync-systems",
        question: "Welke systemen wilt u met elkaar synchroniseren?",
        type: "textarea",
        required: true,
        placeholder: "Bijv: Shopify orders naar Exact Online, website leads naar HubSpot",
        helpText: "Beschrijf welke systemen gekoppeld moeten worden en welke data gesynchroniseerd moet worden.",
      },
      {
        id: "sync-frequency",
        question: "Hoe snel moet de synchronisatie zijn?",
        type: "select",
        options: [
          { value: "realtime", label: "Realtime (direct)" },
          { value: "every-minute", label: "Elke minuut" },
          { value: "every-5-min", label: "Elke 5 minuten" },
          { value: "hourly", label: "Elk uur" },
          { value: "daily", label: "Dagelijks" },
        ],
        required: true,
      },
      {
        id: "sync-direction",
        question: "In welke richting moet data stromen?",
        type: "radio",
        options: [
          { value: "one-way", label: "Eénrichting (A → B)" },
          { value: "two-way", label: "Tweerichting (A ↔ B)" },
        ],
        required: true,
      },
    ],
  },
  {
    workflowType: "reporting",
    title: "Rapportages Details",
    description: "Informatie over uw rapportage wensen",
    questions: [
      {
        id: "report-types",
        question: "Welke rapporten wilt u automatiseren?",
        type: "multiselect",
        options: [
          { value: "sales", label: "Sales rapportage" },
          { value: "marketing", label: "Marketing metrics" },
          { value: "website", label: "Website analytics" },
          { value: "inventory", label: "Voorraad overzicht" },
          { value: "customer", label: "Klant overzicht" },
          { value: "financial", label: "Financieel overzicht" },
          { value: "custom", label: "Custom rapportage" },
        ],
        required: true,
      },
      {
        id: "report-frequency",
        question: "Hoe vaak wilt u rapporten ontvangen?",
        type: "select",
        options: [
          { value: "daily", label: "Dagelijks" },
          { value: "weekly", label: "Wekelijks" },
          { value: "monthly", label: "Maandelijks" },
          { value: "on-demand", label: "Op aanvraag" },
        ],
        required: true,
      },
      {
        id: "report-format",
        question: "In welk formaat wilt u rapporten ontvangen?",
        type: "multiselect",
        options: [
          { value: "email-summary", label: "Email samenvatting" },
          { value: "pdf", label: "PDF bijlage" },
          { value: "spreadsheet", label: "Excel/Google Sheets" },
          { value: "dashboard", label: "Live dashboard" },
          { value: "slack", label: "Slack bericht" },
        ],
        required: true,
      },
      {
        id: "data-sources",
        question: "Uit welke bronnen moet data gehaald worden?",
        type: "textarea",
        required: true,
        placeholder: "Bijv: Shopify sales, Google Analytics, Mailchimp opens",
      },
    ],
  },
  {
    workflowType: "custom",
    title: "Maatwerk Automatisering",
    description: "Vertel ons over uw specifieke wensen",
    questions: [
      {
        id: "custom-description",
        question: "Beschrijf wat u wilt automatiseren",
        type: "textarea",
        required: true,
        placeholder: "Beschrijf zo gedetailleerd mogelijk welk proces u wilt automatiseren...",
        helpText: "Hoe meer detail, hoe beter wij kunnen inschatten wat er mogelijk is.",
      },
      {
        id: "current-process",
        question: "Hoe verloopt dit proces nu?",
        type: "textarea",
        required: true,
        placeholder: "Beschrijf de huidige handmatige stappen...",
      },
      {
        id: "time-spent",
        question: "Hoeveel tijd kost dit proces nu per week?",
        type: "select",
        options: [
          { value: "less-1h", label: "Minder dan 1 uur" },
          { value: "1-3h", label: "1-3 uur" },
          { value: "3-5h", label: "3-5 uur" },
          { value: "5-10h", label: "5-10 uur" },
          { value: "10h+", label: "Meer dan 10 uur" },
        ],
        required: true,
      },
      {
        id: "systems-involved",
        question: "Welke systemen zijn betrokken?",
        type: "textarea",
        required: true,
        placeholder: "Noem alle software/systemen die betrokken zijn bij dit proces...",
      },
    ],
  },
];

// General intake questions (asked for all plans)
export const generalIntakeQuestions: IntakeQuestion[] = [
  {
    id: "team-size",
    question: "Hoe groot is uw team?",
    type: "select",
    options: [
      { value: "1", label: "Alleen ik (ZZP)" },
      { value: "2-5", label: "2-5 medewerkers" },
      { value: "6-10", label: "6-10 medewerkers" },
      { value: "11-25", label: "11-25 medewerkers" },
      { value: "26-50", label: "26-50 medewerkers" },
      { value: "50+", label: "Meer dan 50 medewerkers" },
    ],
    required: true,
  },
  {
    id: "preferred-contact-time",
    question: "Wanneer kunnen wij u het beste bereiken?",
    type: "select",
    options: [
      { value: "morning", label: "Ochtend (9:00-12:00)" },
      { value: "afternoon", label: "Middag (12:00-17:00)" },
      { value: "evening", label: "Avond (17:00-20:00)" },
      { value: "anytime", label: "Maakt niet uit" },
    ],
    required: true,
  },
  {
    id: "kickoff-urgency",
    question: "Wanneer wilt u starten?",
    type: "select",
    options: [
      { value: "asap", label: "Zo snel mogelijk" },
      { value: "this-week", label: "Deze week" },
      { value: "next-week", label: "Volgende week" },
      { value: "this-month", label: "Deze maand" },
      { value: "flexible", label: "Flexibel" },
    ],
    required: true,
  },
  {
    id: "additional-notes",
    question: "Overige opmerkingen of vragen",
    type: "textarea",
    required: false,
    placeholder: "Is er nog iets dat wij moeten weten?",
  },
];

// Helper function to get questions for selected workflow types
export function getQuestionsForWorkflows(selectedTypes: string[]): WorkflowQuestions[] {
  return workflowSpecificQuestions.filter((wq) =>
    selectedTypes.includes(wq.workflowType)
  );
}

// Helper function to get systems by category
export function getSystemsByCategory(): Record<string, typeof commonSystems> {
  return commonSystems.reduce((acc, system) => {
    if (!acc[system.category]) {
      acc[system.category] = [];
    }
    acc[system.category].push(system);
    return acc;
  }, {} as Record<string, typeof commonSystems>);
}
