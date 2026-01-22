#!/usr/bin/env ts-node
/**
 * Generate Environment Variables Script
 * 
 * Generates secure API keys and secrets for your .env.local file.
 * 
 * Usage:
 *   npx ts-node scripts/generate-env.ts
 */

import { randomBytes } from "crypto";

function generateKey(length: number = 32): string {
  return randomBytes(length).toString("hex");
}

function generateSecret(length: number = 64): string {
  return randomBytes(length).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, length);
}

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 Generated Environment Variables for Ro-Tech Website
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Copy these to your .env.local file:

# ═══════════════════════════════════════════════════════════════════════════════
# Auth.js (NextAuth v5) Configuration
# ═══════════════════════════════════════════════════════════════════════════════
AUTH_SECRET="${generateSecret(32)}"
AUTH_URL="http://localhost:3000"

# For production (Vercel):
# AUTH_URL="https://ro-techdevelopment.dev"
# AUTH_TRUST_HOST=true

# ═══════════════════════════════════════════════════════════════════════════════
# Database Configuration
# ═══════════════════════════════════════════════════════════════════════════════
DATABASE_URL="file:./dev.db"

# For PostgreSQL production:
# DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# ═══════════════════════════════════════════════════════════════════════════════
# Internal API Configuration (for Ro-Tech Portal connection)
# ═══════════════════════════════════════════════════════════════════════════════
ROTECH_API_KEY="${generateKey(32)}"
ROTECH_API_SECRET="${generateKey(32)}"
ROTECH_WEBHOOK_SECRET="${generateKey(32)}"

# URL of your local Ro-Tech Portal (for receiving webhooks)
# ROTECH_PORTAL_WEBHOOK_URL="http://localhost:3001/api/webhook"

# Optional: IP whitelist for API access (comma-separated)
# API_IP_WHITELIST="127.0.0.1,::1"

# ═══════════════════════════════════════════════════════════════════════════════
# Email Configuration (Resend)
# ═══════════════════════════════════════════════════════════════════════════════
# RESEND_API_KEY="re_your_api_key_here"
# FROM_EMAIL="noreply@ro-techdevelopment.dev"
# CONTACT_EMAIL="contact@ro-techdevelopment.dev"

# ═══════════════════════════════════════════════════════════════════════════════
# Stripe Configuration
# ═══════════════════════════════════════════════════════════════════════════════
# STRIPE_SECRET_KEY="sk_test_..."
# STRIPE_WEBHOOK_SECRET="whsec_..."
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# ═══════════════════════════════════════════════════════════════════════════════
# Super Admin Configuration (for database seed)
# ═══════════════════════════════════════════════════════════════════════════════
SUPER_ADMIN_EMAIL="your-email@example.com"
SUPER_ADMIN_NAME="Your Name"
# SUPER_ADMIN_PASSWORD="" # Leave empty to auto-generate

# ═══════════════════════════════════════════════════════════════════════════════
# Optional: Analytics & Monitoring
# ═══════════════════════════════════════════════════════════════════════════════
# NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
# SENTRY_DSN="https://..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Quick Start:

1. Copy the variables above to .env.local
2. Update SUPER_ADMIN_EMAIL with your email
3. Run: npx prisma db push
4. Run: npx prisma db seed
5. Start: npm run dev
6. Login at: http://localhost:3000/portal/login
7. Access admin: http://localhost:3000/admin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
