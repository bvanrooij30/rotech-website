# Ro-Tech Website API Documentation

## Overview

The Ro-Tech Website provides a secure API for integration with the Ro-Tech Admin Portal. This API enables:

- **Data Synchronization**: Pull customers, tickets, subscriptions, and products
- **Real-time Webhooks**: Receive notifications when events occur
- **Remote Management**: Update tickets, subscriptions, and products from the portal

## Authentication

All API requests (except `/api/v1/status`) require a Bearer token:

```bash
curl -X GET "https://ro-techdevelopment.dev/api/v1/sync/customers" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Environment Variables

Set these in your `.env.local`:

```env
# API Authentication
ROTECH_API_KEY=your-secure-api-key-here
ROTECH_API_SECRET=your-api-secret-for-hmac

# Webhook Configuration  
ROTECH_PORTAL_WEBHOOK_URL=https://your-local-portal/api/webhook
ROTECH_WEBHOOK_SECRET=shared-webhook-secret

# Optional: IP Whitelist (comma-separated)
API_IP_WHITELIST=127.0.0.1,192.168.1.100
```

---

## Endpoints

### Status Check

```
GET /api/v1/status
```

**Public**: Returns basic health status.
**Authenticated**: Returns detailed stats including customer count, open tickets, etc.

#### Response (Authenticated)
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "stats": {
      "customers": 45,
      "activeSubscriptions": 12,
      "openTickets": 3,
      "products": 28
    },
    "recentOpenTickets": [...],
    "endpoints": {...}
  }
}
```

---

### Sync Endpoints

#### Customers

```
GET /api/v1/sync/customers
```

Query Parameters:
- `since` (ISO date) - Only return customers updated after this date
- `page` (int) - Page number (default: 1)
- `limit` (int) - Items per page (default: 50, max: 100)

#### Example
```bash
# Get all customers
curl -X GET "https://ro-techdevelopment.dev/api/v1/sync/customers" \
  -H "Authorization: Bearer $API_KEY"

# Get customers updated in last 24 hours
curl -X GET "https://ro-techdevelopment.dev/api/v1/sync/customers?since=2026-01-19T00:00:00Z" \
  -H "Authorization: Bearer $API_KEY"
```

---

#### Support Tickets

```
GET /api/v1/sync/tickets
PATCH /api/v1/sync/tickets
```

Query Parameters (GET):
- `since` (ISO date) - Tickets updated after this date
- `status` (string) - Filter: open, in_progress, waiting_customer, resolved, closed
- `page`, `limit` - Pagination

Update Ticket (PATCH):
```json
{
  "ticketId": "ticket-id",
  "status": "in_progress",
  "message": "We're looking into this",
  "adminPortalId": "portal-ticket-id"
}
```

---

#### Subscriptions

```
GET /api/v1/sync/subscriptions
POST /api/v1/sync/subscriptions
PATCH /api/v1/sync/subscriptions
```

Create Subscription (POST):
```json
{
  "userId": "customer-id",
  "planType": "business",
  "planName": "Business Onderhoudsabonnement",
  "monthlyPrice": 199,
  "hoursIncluded": 2,
  "productId": "optional-product-id"
}
```

Update Subscription (PATCH):
```json
{
  "subscriptionId": "sub-id",
  "status": "active",
  "addUsageLog": {
    "description": "Security update installed",
    "hours": 0.5,
    "category": "update"
  }
}
```

---

#### Products

```
GET /api/v1/sync/products
POST /api/v1/sync/products
PATCH /api/v1/sync/products
```

Create Product (POST):
```json
{
  "userId": "customer-id",
  "name": "Bedrijfswebsite",
  "type": "website",
  "domain": "klant.nl",
  "hostingProvider": "Vercel",
  "techStack": "Next.js, Tailwind CSS",
  "status": "active",
  "launchDate": "2026-01-15",
  "projectValue": 3500
}
```

---

#### Invoices

```
GET /api/v1/sync/invoices
POST /api/v1/sync/invoices
PATCH /api/v1/sync/invoices
```

Create Invoice (POST):
```json
{
  "userId": "customer-id",
  "invoiceNumber": "RT-INV-2026-001",
  "amount": 2420,
  "tax": 420,
  "description": "Website Development",
  "dueDate": "2026-02-15",
  "pdfUrl": "https://..."
}
```

---

## Webhooks

### Sending Webhooks (Website → Portal)

The website sends webhooks to your portal when events occur. Configure the URL:

```env
ROTECH_PORTAL_WEBHOOK_URL=https://your-portal.local/api/webhook
ROTECH_WEBHOOK_SECRET=shared-secret
```

#### Events Sent:

| Event | Description |
|-------|-------------|
| `customer.created` | New customer registration |
| `ticket.created` | New support ticket |
| `ticket.message` | New message on ticket |
| `quote.requested` | New quote request |
| `payment.completed` | Payment successful |
| `contact.submitted` | Contact form submission |
| `lead.created` | New lead captured |

#### Webhook Payload Format:
```json
{
  "event": "ticket.created",
  "timestamp": "2026-01-20T12:00:00.000Z",
  "data": {
    "id": "ticket-id",
    "ticketNumber": "RT-2026-001",
    "subject": "Website issue",
    "customerEmail": "klant@email.nl",
    ...
  }
}
```

#### Webhook Signature Verification:
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}

// In your webhook handler:
app.post('/api/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const isValid = verifyWebhook(
    JSON.stringify(req.body),
    signature,
    process.env.WEBHOOK_SECRET
  );
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook...
});
```

---

### Receiving Webhooks (Portal → Website)

Your portal can send webhooks to update data on the website:

```
POST /api/v1/webhook/receive
```

Headers:
- `X-Webhook-Signature`: HMAC-SHA256 signature
- `X-Webhook-Event`: Event type

#### Supported Events:

| Event | Description |
|-------|-------------|
| `ticket.status_updated` | Update ticket status |
| `ticket.message_added` | Add message to ticket |
| `subscription.updated` | Update subscription |
| `customer.updated` | Update customer data |
| `product.status_updated` | Update product status |
| `invoice.created` | Create new invoice |

#### Example: Update Ticket Status
```bash
PAYLOAD='{"event":"ticket.status_updated","timestamp":"2026-01-20T12:00:00Z","data":{"ticketId":"abc123","status":"resolved","resolution":"Issue fixed"}}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | awk '{print $2}')

curl -X POST "https://ro-techdevelopment.dev/api/v1/webhook/receive" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: $SIGNATURE" \
  -H "X-Webhook-Event: ticket.status_updated" \
  -d "$PAYLOAD"
```

---

## Connecting Your Local Portal

### Option 1: Polling (Recommended)

Your local portal periodically fetches data from the website:

```javascript
// In your local portal
async function syncFromWebsite() {
  const lastSync = await getLastSyncTimestamp();
  
  const [customers, tickets] = await Promise.all([
    fetch(`${WEBSITE_URL}/api/v1/sync/customers?since=${lastSync}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    }).then(r => r.json()),
    
    fetch(`${WEBSITE_URL}/api/v1/sync/tickets?since=${lastSync}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    }).then(r => r.json()),
  ]);
  
  // Process and store locally
  await processCustomers(customers.data);
  await processTickets(tickets.data);
  
  await setLastSyncTimestamp(new Date().toISOString());
}

// Run every 5 minutes
setInterval(syncFromWebsite, 5 * 60 * 1000);
```

### Option 2: Webhooks via Tunnel

For real-time updates, expose your local portal using a tunnel:

1. **Cloudflare Tunnel** (recommended):
```bash
cloudflared tunnel --url http://localhost:3001
```

2. **ngrok**:
```bash
ngrok http 3001
```

3. Set the tunnel URL in `.env.local`:
```env
ROTECH_PORTAL_WEBHOOK_URL=https://your-tunnel-url.trycloudflare.com/api/webhook
```

---

## Rate Limiting

- **100 requests per minute** per API key
- Rate limit headers included in responses:
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
  - `Retry-After` (when limited)

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  },
  "meta": {
    "timestamp": "2026-01-20T12:00:00.000Z"
  }
}
```

### Error Codes:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing API key |
| `IP_NOT_ALLOWED` | 403 | IP not in whitelist |
| `RATE_LIMITED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `NOT_FOUND` | 404 | Resource not found |
| `SYNC_ERROR` | 500 | Database/sync error |

---

## Security Best Practices

1. **Store API keys securely** - Never commit to git
2. **Use IP whitelist** - Restrict to known IPs
3. **Rotate keys regularly** - Update keys periodically
4. **Verify webhook signatures** - Always validate HMAC
5. **Use HTTPS only** - Never use HTTP
6. **Log API access** - Monitor for anomalies

---

## Quick Start

1. Generate secure API keys:
```bash
openssl rand -hex 32  # API Key
openssl rand -hex 32  # Webhook Secret
```

2. Add to `.env.local`:
```env
ROTECH_API_KEY=<generated-key>
ROTECH_WEBHOOK_SECRET=<generated-secret>
```

3. Test connection:
```bash
curl -X GET "https://ro-techdevelopment.dev/api/v1/status" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

4. Start syncing!
