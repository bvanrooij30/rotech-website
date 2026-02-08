-- ============================================
-- RO-TECH PRODUCTION DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- USER & AUTHENTICATION
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "companyName" TEXT,
    "kvkNumber" TEXT,
    "vatNumber" TEXT,
    "street" TEXT,
    "houseNumber" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Nederland',
    "emailVerified" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "role" TEXT NOT NULL DEFAULT 'customer',
    "permissions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");

CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "monthlyPrice" DOUBLE PRECISION NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "stripePriceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "hoursIncluded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hoursUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "productId" TEXT,
    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");

CREATE TABLE IF NOT EXISTS "UsageLog" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsageLog_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UsageLog_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "UsageLog_subscriptionId_idx" ON "UsageLog"("subscriptionId");

-- PRODUCTS
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "domain" TEXT,
    "hostingProvider" TEXT,
    "techStack" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "launchDate" TIMESTAMP(3),
    "originalQuoteId" TEXT,
    "projectValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Product_userId_idx" ON "Product"("userId");
CREATE INDEX IF NOT EXISTS "Product_status_idx" ON "Product"("status");

-- Add foreign key for Subscription.productId
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "StatusUpdate" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "StatusUpdate_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "StatusUpdate_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "StatusUpdate_productId_idx" ON "StatusUpdate"("productId");

-- SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS "SupportTicket" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "adminPortalId" TEXT,
    "syncedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SupportTicket_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "SupportTicket_ticketNumber_key" ON "SupportTicket"("ticketNumber");
CREATE INDEX IF NOT EXISTS "SupportTicket_userId_idx" ON "SupportTicket"("userId");
CREATE INDEX IF NOT EXISTS "SupportTicket_status_idx" ON "SupportTicket"("status");
CREATE INDEX IF NOT EXISTS "SupportTicket_ticketNumber_idx" ON "SupportTicket"("ticketNumber");

CREATE TABLE IF NOT EXISTS "TicketMessage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderId" TEXT,
    "message" TEXT NOT NULL,
    "attachments" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketMessage_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "TicketMessage_ticketId_idx" ON "TicketMessage"("ticketId");

-- INVOICES
CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_stripeInvoiceId_key" ON "Invoice"("stripeInvoiceId");
CREATE INDEX IF NOT EXISTS "Invoice_userId_idx" ON "Invoice"("userId");
CREATE INDEX IF NOT EXISTS "Invoice_status_idx" ON "Invoice"("status");

-- ADMIN AUDIT LOG
CREATE TABLE IF NOT EXISTS "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "before" TEXT,
    "after" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AdminAuditLog_adminId_idx" ON "AdminAuditLog"("adminId");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_targetType_idx" ON "AdminAuditLog"("targetType");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SystemSetting_key_key" ON "SystemSetting"("key");

-- AI AGENTS
CREATE TABLE IF NOT EXISTS "AgentLog" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AgentLog_agentId_idx" ON "AgentLog"("agentId");
CREATE INDEX IF NOT EXISTS "AgentLog_level_idx" ON "AgentLog"("level");
CREATE INDEX IF NOT EXISTS "AgentLog_createdAt_idx" ON "AgentLog"("createdAt");

CREATE TABLE IF NOT EXISTS "AILead" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "source" TEXT NOT NULL,
    "interest" TEXT NOT NULL,
    "message" TEXT,
    "budget" TEXT,
    "timeline" TEXT,
    "score" INTEGER NOT NULL DEFAULT 50,
    "recommendation" TEXT NOT NULL DEFAULT 'warm',
    "reasoning" TEXT,
    "suggestedPackage" TEXT,
    "estimatedValue" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'new',
    "assignedTo" TEXT,
    "notes" TEXT,
    "nextFollowUp" TIMESTAMP(3),
    "lastContact" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AILead_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AILead_status_idx" ON "AILead"("status");
CREATE INDEX IF NOT EXISTS "AILead_score_idx" ON "AILead"("score");
CREATE INDEX IF NOT EXISTS "AILead_source_idx" ON "AILead"("source");
CREATE INDEX IF NOT EXISTS "AILead_createdAt_idx" ON "AILead"("createdAt");

CREATE TABLE IF NOT EXISTS "LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "agentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "AILead"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "LeadActivity_leadId_idx" ON "LeadActivity"("leadId");
CREATE INDEX IF NOT EXISTS "LeadActivity_agentId_idx" ON "LeadActivity"("agentId");

CREATE TABLE IF NOT EXISTS "AICampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "targetAudience" TEXT,
    "targetSegment" TEXT,
    "targetSize" INTEGER,
    "budgetAllocated" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "budgetSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT,
    CONSTRAINT "AICampaign_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AICampaign_status_idx" ON "AICampaign"("status");
CREATE INDEX IF NOT EXISTS "AICampaign_type_idx" ON "AICampaign"("type");

CREATE TABLE IF NOT EXISTS "AIScheduledTask" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "data" TEXT,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "result" TEXT,
    "errorMessage" TEXT,
    "estimatedMinutes" INTEGER,
    "actualMinutes" INTEGER,
    "dependencies" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "cronSchedule" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AIScheduledTask_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AIScheduledTask_agentId_idx" ON "AIScheduledTask"("agentId");
CREATE INDEX IF NOT EXISTS "AIScheduledTask_status_idx" ON "AIScheduledTask"("status");
CREATE INDEX IF NOT EXISTS "AIScheduledTask_scheduledFor_idx" ON "AIScheduledTask"("scheduledFor");
CREATE INDEX IF NOT EXISTS "AIScheduledTask_priority_idx" ON "AIScheduledTask"("priority");

CREATE TABLE IF NOT EXISTS "AIDecision" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "reversible" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "wasSuccessful" BOOLEAN,
    "feedback" TEXT,
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIDecision_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AIDecision_agentId_idx" ON "AIDecision"("agentId");
CREATE INDEX IF NOT EXISTS "AIDecision_type_idx" ON "AIDecision"("type");
CREATE INDEX IF NOT EXISTS "AIDecision_status_idx" ON "AIDecision"("status");

CREATE TABLE IF NOT EXISTS "AIAlert" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIAlert_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AIAlert_level_idx" ON "AIAlert"("level");
CREATE INDEX IF NOT EXISTS "AIAlert_resolved_idx" ON "AIAlert"("resolved");
CREATE INDEX IF NOT EXISTS "AIAlert_createdAt_idx" ON "AIAlert"("createdAt");

CREATE TABLE IF NOT EXISTS "AIDailyBriefing" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "healthStatus" TEXT NOT NULL,
    "highlights" TEXT NOT NULL,
    "concerns" TEXT NOT NULL,
    "metrics" TEXT NOT NULL,
    "tasksCompleted" INTEGER NOT NULL,
    "tasksScheduled" INTEGER NOT NULL,
    "tasksOverdue" INTEGER NOT NULL,
    "projectsActive" INTEGER NOT NULL,
    "projectsAtRisk" INTEGER NOT NULL,
    "newLeads" INTEGER NOT NULL,
    "activeCampaigns" INTEGER NOT NULL,
    "recommendations" TEXT NOT NULL,
    "actionItems" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIDailyBriefing_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AIDailyBriefing_date_key" ON "AIDailyBriefing"("date");
CREATE INDEX IF NOT EXISTS "AIDailyBriefing_date_idx" ON "AIDailyBriefing"("date");

CREATE TABLE IF NOT EXISTS "AIAgentMetrics" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTimeMs" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "promptsGenerated" INTEGER NOT NULL DEFAULT 0,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "aiCostCents" INTEGER NOT NULL DEFAULT 0,
    "reportsGenerated" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIAgentMetrics_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AIAgentMetrics_agentId_date_key" ON "AIAgentMetrics"("agentId", "date");
CREATE INDEX IF NOT EXISTS "AIAgentMetrics_agentId_idx" ON "AIAgentMetrics"("agentId");
CREATE INDEX IF NOT EXISTS "AIAgentMetrics_date_idx" ON "AIAgentMetrics"("date");

-- AUTOMATION SERVICES
CREATE TABLE IF NOT EXISTS "AutomationSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "monthlyPrice" DOUBLE PRECISION NOT NULL,
    "billingPeriod" TEXT NOT NULL DEFAULT 'monthly',
    "maxWorkflows" INTEGER NOT NULL,
    "maxExecutions" INTEGER NOT NULL,
    "supportHoursIncl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supportHoursUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AutomationSubscription_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AutomationSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "AutomationSubscription_stripeSubscriptionId_key" ON "AutomationSubscription"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "AutomationSubscription_userId_idx" ON "AutomationSubscription"("userId");
CREATE INDEX IF NOT EXISTS "AutomationSubscription_status_idx" ON "AutomationSubscription"("status");

CREATE TABLE IF NOT EXISTS "AutomationWorkflow" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "n8nWorkflowId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL,
    "complexity" TEXT NOT NULL,
    "totalExecutions" INTEGER NOT NULL DEFAULT 0,
    "successfulExecutions" INTEGER NOT NULL DEFAULT 0,
    "failedExecutions" INTEGER NOT NULL DEFAULT 0,
    "lastExecutionAt" TIMESTAMP(3),
    "lastErrorAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AutomationWorkflow_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AutomationWorkflow_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "AutomationSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "AutomationWorkflow_n8nWorkflowId_key" ON "AutomationWorkflow"("n8nWorkflowId");
CREATE INDEX IF NOT EXISTS "AutomationWorkflow_subscriptionId_idx" ON "AutomationWorkflow"("subscriptionId");
CREATE INDEX IF NOT EXISTS "AutomationWorkflow_n8nWorkflowId_idx" ON "AutomationWorkflow"("n8nWorkflowId");

CREATE TABLE IF NOT EXISTS "AutomationExecutionLog" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "workflowId" TEXT,
    "n8nExecutionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AutomationExecutionLog_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AutomationExecutionLog_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "AutomationSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "AutomationExecutionLog_subscriptionId_idx" ON "AutomationExecutionLog"("subscriptionId");
CREATE INDEX IF NOT EXISTS "AutomationExecutionLog_workflowId_idx" ON "AutomationExecutionLog"("workflowId");
CREATE INDEX IF NOT EXISTS "AutomationExecutionLog_status_idx" ON "AutomationExecutionLog"("status");

CREATE TABLE IF NOT EXISTS "AutomationSupportRequest" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedHours" DOUBLE PRECISION,
    "actualHours" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AutomationSupportRequest_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AutomationSupportRequest_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "AutomationSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "AutomationSupportRequest_subscriptionId_idx" ON "AutomationSupportRequest"("subscriptionId");
CREATE INDEX IF NOT EXISTS "AutomationSupportRequest_status_idx" ON "AutomationSupportRequest"("status");

CREATE TABLE IF NOT EXISTS "AutomationScanRequest" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bedrijf" TEXT NOT NULL,
    "processen" TEXT NOT NULL,
    "tijdPerWeek" TEXT NOT NULL,
    "systemen" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AutomationScanRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AutomationScanRequest_email_idx" ON "AutomationScanRequest"("email");
CREATE INDEX IF NOT EXISTS "AutomationScanRequest_status_idx" ON "AutomationScanRequest"("status");

CREATE TABLE IF NOT EXISTS "AutomationIntake" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "companyName" TEXT NOT NULL,
    "website" TEXT,
    "planType" TEXT NOT NULL,
    "billingPeriod" TEXT NOT NULL,
    "workflowTypes" TEXT NOT NULL,
    "priorityWorkflow" TEXT,
    "currentSystems" TEXT NOT NULL,
    "systemCredentials" TEXT,
    "teamSize" TEXT,
    "monthlyVolume" TEXT,
    "leadCaptureDetails" TEXT,
    "contentDetails" TEXT,
    "ecommerceDetails" TEXT,
    "invoicingDetails" TEXT,
    "customerServiceDetails" TEXT,
    "customRequirements" TEXT,
    "preferredContactTime" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Amsterdam',
    "kickoffDate" TIMESTAMP(3),
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "dataProcessingAccepted" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "stripeSessionId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AutomationIntake_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AutomationIntake_subscriptionId_key" ON "AutomationIntake"("subscriptionId");
CREATE UNIQUE INDEX IF NOT EXISTS "AutomationIntake_stripeSessionId_key" ON "AutomationIntake"("stripeSessionId");
CREATE INDEX IF NOT EXISTS "AutomationIntake_email_idx" ON "AutomationIntake"("email");
CREATE INDEX IF NOT EXISTS "AutomationIntake_status_idx" ON "AutomationIntake"("status");
CREATE INDEX IF NOT EXISTS "AutomationIntake_planType_idx" ON "AutomationIntake"("planType");

-- ============================================
-- CREATE ADMIN USER
-- Password: RoTech2026! (bcrypt hashed)
-- ============================================
INSERT INTO "User" ("id", "email", "password", "name", "role", "isActive", "emailVerified", "createdAt", "updatedAt")
VALUES (
    'admin-001',
    'bart@rotech.dev',
    '$2b$12$SX4OZsLj6CQrRjLSd7pCGe0Ar7dRNurxkgRwAPBFd46UUut4x8IKW',
    'Bart van Rooij',
    'super_admin',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO UPDATE SET
    "role" = 'super_admin',
    "isActive" = true,
    "emailVerified" = CURRENT_TIMESTAMP,
    "updatedAt" = CURRENT_TIMESTAMP;
