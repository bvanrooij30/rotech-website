/**
 * Snelstart B2B API Type Definitions
 * 
 * These types represent the data structures used by the Snelstart B2B API.
 * Reference: https://b2bapi-developer.snelstart.nl/
 */

// =============================================================================
// Common Types
// =============================================================================

export interface SnelstartId {
  id: string;
}

export interface SnelstartModifiedOn {
  modifiedOn: string; // ISO 8601 datetime
}

// =============================================================================
// Address Types
// =============================================================================

export interface SnelstartAdres {
  contactpersoon?: string;
  straat?: string;
  postcode?: string;
  plaats?: string;
  land?: SnelstartId;
}

// =============================================================================
// Relatie (Customer/Supplier)
// =============================================================================

export interface SnelstartRelatie extends SnelstartId, SnelstartModifiedOn {
  relatiecode: string;
  naam: string;
  vestigingsAdres?: SnelstartAdres;
  correspondentieAdres?: SnelstartAdres;
  telefoon?: string;
  mobieleTelefoon?: string;
  email?: string;
  btwnummer?: string;
  kvkNummer?: string;
  website?: string;
  factuurkorting?: number; // Percentage
  krediettermijn?: number; // Days
  bankrekeningen?: SnelstartBankrekening[];
  nonactiefIndicator?: boolean;
  memo?: string;
}

export interface SnelstartRelatieCreate {
  relatiecode: string;
  naam: string;
  vestigingsAdres?: SnelstartAdres;
  correspondentieAdres?: SnelstartAdres;
  telefoon?: string;
  mobieleTelefoon?: string;
  email?: string;
  btwnummer?: string;
  kvkNummer?: string;
  factuurkorting?: number;
  krediettermijn?: number;
  memo?: string;
}

export interface SnelstartBankrekening {
  rekeningnummer?: string;
  biccode?: string;
}

// =============================================================================
// Grootboek (General Ledger)
// =============================================================================

export interface SnelstartGrootboek extends SnelstartId, SnelstartModifiedOn {
  nummer: number;
  omschrijving: string;
  grootboekfunctie?: string;
  rgsCode?: string;
  nonactiefIndicator?: boolean;
}

// =============================================================================
// BTW (VAT)
// =============================================================================

export type SnelstartBtwSoort = 
  | "Geen"
  | "Hoog"
  | "Laag"
  | "Overig"
  | "Verlegd";

export interface SnelstartBtw {
  btwSoort: SnelstartBtwSoort;
  btwPercentage?: number;
}

export interface SnelstartBtwTarief extends SnelstartId {
  btwSoort: SnelstartBtwSoort;
  btwPercentage: number;
}

// =============================================================================
// Verkoopboeking (Sales Invoice/Booking)
// =============================================================================

export interface SnelstartVerkoopboekingRegel {
  omschrijving: string;
  grootboek: SnelstartId;
  bedrag: number;
  btw?: SnelstartBtw;
  kostenplaats?: SnelstartId;
}

export interface SnelstartVerkoopboeking extends SnelstartId, SnelstartModifiedOn {
  relatie: SnelstartId;
  factuurdatum: string; // YYYY-MM-DD
  factuurnummer?: string;
  boekstuk?: string;
  omschrijving?: string;
  betalingstermijn?: number; // Days
  regels: SnelstartVerkoopboekingRegel[];
  factuurBedrag?: number;
  openstaandSaldo?: number;
  verpistaand?: boolean;
}

export interface SnelstartVerkoopboekingCreate {
  relatie: SnelstartId;
  factuurdatum: string; // YYYY-MM-DD
  boekstuk?: string;
  omschrijving?: string;
  betalingstermijn?: number;
  regels: SnelstartVerkoopboekingRegel[];
}

// =============================================================================
// Inkoopboeking (Purchase Invoice/Booking)
// =============================================================================

export interface SnelstartInkoopboekingRegel {
  omschrijving: string;
  grootboek: SnelstartId;
  bedrag: number;
  btw?: SnelstartBtw;
  kostenplaats?: SnelstartId;
}

export interface SnelstartInkoopboeking extends SnelstartId, SnelstartModifiedOn {
  leverancier: SnelstartId;
  factuurdatum: string;
  factuurnummer?: string;
  boekstuk?: string;
  omschrijving?: string;
  regels: SnelstartInkoopboekingRegel[];
  factuurBedrag?: number;
  openstaandSaldo?: number;
}

export interface SnelstartInkoopboekingCreate {
  leverancier: SnelstartId;
  factuurdatum: string;
  factuurnummer?: string;
  boekstuk?: string;
  omschrijving?: string;
  regels: SnelstartInkoopboekingRegel[];
}

// =============================================================================
// Kostenplaats (Cost Center)
// =============================================================================

export interface SnelstartKostenplaats extends SnelstartId, SnelstartModifiedOn {
  nummer: number;
  omschrijving: string;
  nonactiefIndicator?: boolean;
}

// =============================================================================
// Land (Country)
// =============================================================================

export interface SnelstartLand extends SnelstartId {
  naam: string;
  landcodeISO: string; // ISO 3166-1 alpha-2
}

// =============================================================================
// Webhook Events
// =============================================================================

export type SnelstartWebhookEventType =
  | "relatie.created"
  | "relatie.updated"
  | "relatie.deleted"
  | "verkoopboeking.created"
  | "verkoopboeking.updated"
  | "verkoopboeking.deleted"
  | "inkoopboeking.created"
  | "inkoopboeking.updated"
  | "betaling.ontvangen"
  | "test";

export interface SnelstartWebhookEvent<T = unknown> {
  type: SnelstartWebhookEventType;
  timestamp: string;
  subscriptionKey?: string;
  data: T & { id: string };
}

export interface SnelstartRelatieWebhookData {
  id: string;
  relatiecode: string;
  naam: string;
  email?: string;
}

export interface SnelstartBoekingWebhookData {
  id: string;
  boekstuk?: string;
  relatie?: SnelstartId;
  factuurdatum?: string;
  bedrag?: number;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface SnelstartApiError {
  errorCode: string;
  message: string;
  details?: string;
}

export interface SnelstartPaginatedResponse<T> {
  items: T[];
  skip: number;
  top: number;
  totalCount?: number;
}

// =============================================================================
// OAuth Types
// =============================================================================

export interface SnelstartTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface SnelstartAuthError {
  error: string;
  error_description?: string;
}

// =============================================================================
// Sync Status Types
// =============================================================================

export type SnelstartSyncStatus = 
  | "pending"
  | "synced"
  | "error";

export interface SnelstartSyncResult {
  success: boolean;
  snelstartId?: string;
  error?: string;
  syncedAt?: string;
}
