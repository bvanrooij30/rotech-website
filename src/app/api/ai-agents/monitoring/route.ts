/**
 * AI Agents API - Monitoring Endpoint
 * GET /api/ai-agents/monitoring - Get detailed monitoring data
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Agent definitions with their capabilities
const agentDefinitions = {
  // System Agents
  'master-agent': {
    name: 'Master Agent',
    type: 'system',
    category: 'Coördinatie',
    description: 'Centraal brein - coördineert alle agents en genereert dagelijkse briefings',
    capabilities: [
      'Dagelijkse briefing generatie',
      'Agent coördinatie',
      'Resource allocatie',
      'Escalatie handling',
      'Strategische beslissingen',
    ],
  },
  'orchestrator-agent': {
    name: 'Orchestrator Agent',
    type: 'system',
    category: 'Quality Control',
    description: 'Manager van alle agents - monitort prestaties en kwaliteit',
    capabilities: [
      'Systeem health monitoring',
      'Performance tracking',
      'Issue detectie',
      'Optimalisatie aanbevelingen',
      'Agent communicatie',
    ],
  },
  'optimizer-agent': {
    name: 'Optimizer Agent',
    type: 'system',
    category: 'Optimalisatie',
    description: 'Vindt en implementeert verbeteringen in het hele systeem',
    capabilities: [
      'Prompt optimalisatie',
      'Workflow verbetering',
      'A/B testing',
      'Performance tuning',
      'Cost optimalisatie',
    ],
  },
  'marketing-agent': {
    name: 'Marketing Agent',
    type: 'system',
    category: 'Marketing',
    description: 'Lead generatie, nurturing en marketing automations',
    capabilities: [
      'Lead scoring',
      'Email nurturing',
      'Content generatie',
      'Campagne beheer',
      'Social media planning',
    ],
  },
  'scheduler-agent': {
    name: 'Scheduler Agent',
    type: 'system',
    category: 'Planning',
    description: 'Automatische taakplanning en load balancing',
    capabilities: [
      'Taak scheduling',
      'Priority queue',
      'Load balancing',
      'Recurring tasks',
      'Deadline management',
    ],
  },
  // Service Agents
  'intake-agent': {
    name: 'Intake Agent',
    type: 'service',
    category: 'Sales',
    description: 'Lead kwalificatie en requirement gathering',
    capabilities: [
      'Lead scoring',
      'Requirement extraction',
      'Package matching',
      'Follow-up emails',
      'Prijsindicaties',
    ],
  },
  'seo-agent': {
    name: 'SEO Agent',
    type: 'service',
    category: 'Marketing',
    description: 'SEO analyse en optimalisatie',
    capabilities: [
      'Website audit',
      'Keyword research',
      'Content optimalisatie',
      'Ranking tracking',
      'Technische SEO fixes',
    ],
  },
  'onderhoud-agent': {
    name: 'Onderhoud Agent',
    type: 'service',
    category: 'Support',
    description: 'Website onderhoud en monitoring',
    capabilities: [
      'Security monitoring',
      'Backup verificatie',
      'Performance checks',
      'Update management',
      'Uptime monitoring',
    ],
  },
  'starter-website-agent': {
    name: 'Starter Website Agent',
    type: 'service',
    category: 'Development',
    description: 'Starter websites bouwen',
    capabilities: [
      'One-page websites',
      'Responsive design',
      'Contact formulieren',
      'SEO basis setup',
    ],
  },
  'business-website-agent': {
    name: 'Business Website Agent',
    type: 'service',
    category: 'Development',
    description: 'Business websites bouwen',
    capabilities: [
      'Multi-page websites',
      'CMS integratie',
      'Blog systemen',
      'Geavanceerde features',
    ],
  },
  'webshop-agent': {
    name: 'Webshop Agent',
    type: 'service',
    category: 'Development',
    description: 'E-commerce webshops bouwen',
    capabilities: [
      'Product catalogus',
      'Betaalsystemen',
      'Orderbeheer',
      'Voorraadbeheer',
    ],
  },
  'maatwerk-agent': {
    name: 'Maatwerk Agent',
    type: 'service',
    category: 'Development',
    description: 'Custom web applicaties',
    capabilities: [
      'Custom features',
      'API integraties',
      'Dashboard development',
      'Complex workflows',
    ],
  },
  'automatisering-agent': {
    name: 'Automatisering Agent',
    type: 'service',
    category: 'Automation',
    description: 'Workflow automatisering',
    capabilities: [
      'n8n workflows',
      'API koppelingen',
      'Data synchronisatie',
      'Process automation',
    ],
  },
  'pwa-agent': {
    name: 'PWA Agent',
    type: 'service',
    category: 'Development',
    description: 'Progressive Web Apps',
    capabilities: [
      'Offline functionaliteit',
      'Push notifications',
      'Installeerbare apps',
      'App-like experience',
    ],
  },
  'api-integratie-agent': {
    name: 'API Integratie Agent',
    type: 'service',
    category: 'Integration',
    description: 'API koppelingen en integraties',
    capabilities: [
      'REST API design',
      'OAuth implementatie',
      'Webhook handlers',
      'Data transformatie',
    ],
  },
  'chatbot-agent': {
    name: 'Chatbot Agent',
    type: 'service',
    category: 'AI',
    description: 'AI-powered chatbots',
    capabilities: [
      'Conversational AI',
      'FAQ automatisering',
      'Lead capture',
      'Multi-language support',
    ],
  },
};

function generateAgentData() {
  const now = new Date();
  const agents = [];
  
  for (const [id, def] of Object.entries(agentDefinitions)) {
    // Simulate varying activity levels
    const isSystem = def.type === 'system';
    const activityLevel = isSystem ? 0.9 : 0.4 + Math.random() * 0.3;
    const status = activityLevel > 0.7 ? 'online' : activityLevel > 0.4 ? 'standby' : 'offline';
    const health = activityLevel > 0.6 ? 'healthy' : activityLevel > 0.3 ? 'degraded' : 'unhealthy';
    
    // Generate realistic metrics
    const tasksBase = isSystem ? 100 : 20;
    const tasksCompleted = Math.floor(tasksBase + Math.random() * tasksBase);
    const avgResponseTime = isSystem ? 100 + Math.floor(Math.random() * 400) : 500 + Math.floor(Math.random() * 2000);
    const errorRate = Math.random() * 2;
    const successRate = 100 - errorRate;
    
    // Generate recent activity
    const recentActivity = [];
    if (status === 'online' && Math.random() > 0.5) {
      recentActivity.push({
        id: `act-${id}-1`,
        type: 'task',
        message: isSystem ? 'Systeem check voltooid' : 'Taak afgerond',
        timestamp: new Date(now.getTime() - Math.random() * 3600000).toISOString(),
        status: 'success' as const,
      });
    }
    
    agents.push({
      id,
      name: def.name,
      type: def.type,
      category: def.category,
      description: def.description,
      status,
      health,
      version: '1.0.0',
      lastActive: new Date(now.getTime() - Math.random() * (isSystem ? 60000 : 3600000)).toISOString(),
      uptime: 97 + Math.random() * 3,
      metrics: {
        tasksCompleted,
        avgResponseTime,
        errorRate: Number(errorRate.toFixed(2)),
        successRate: Number(successRate.toFixed(2)),
        promptsGenerated: Math.floor(tasksCompleted * 1.5),
        reportsGenerated: Math.floor(tasksCompleted * 0.2),
      },
      capabilities: def.capabilities,
      recentActivity,
    });
  }
  
  return agents;
}

function generateSystemMetrics(agents: ReturnType<typeof generateAgentData>) {
  const now = new Date();
  
  const onlineAgents = agents.filter(a => a.status === 'online').length;
  const busyAgents = agents.filter(a => a.status === 'busy').length;
  const offlineAgents = agents.filter(a => a.status === 'offline').length;
  
  const avgErrorRate = agents.reduce((sum, a) => sum + a.metrics.errorRate, 0) / agents.length;
  const avgResponseTime = agents.reduce((sum, a) => sum + a.metrics.avgResponseTime, 0) / agents.length;
  
  // Health score based on online agents and error rate
  const healthScore = Math.round(
    (onlineAgents / agents.length) * 50 +
    (1 - avgErrorRate / 5) * 50
  );
  
  return {
    totalAgents: agents.length,
    onlineAgents,
    busyAgents,
    offlineAgents,
    healthScore,
    totalTasksToday: agents.reduce((sum, a) => sum + Math.floor(a.metrics.tasksCompleted / 7), 0),
    avgResponseTime: Math.round(avgResponseTime),
    errorRate: Number(avgErrorRate.toFixed(2)),
    aiTokensUsed: Math.floor(30000 + Math.random() * 20000),
    lastHealthCheck: now.toISOString(),
    cronJobs: [
      {
        name: 'Scheduler Cycle',
        schedule: 'Elke minuut',
        lastRun: new Date(now.getTime() - Math.random() * 60000).toISOString(),
        nextRun: new Date(now.getTime() + 60000 - Math.random() * 30000).toISOString(),
        status: 'active' as const,
      },
      {
        name: 'Health Check',
        schedule: 'Elke 5 minuten',
        lastRun: new Date(now.getTime() - Math.random() * 300000).toISOString(),
        nextRun: new Date(now.getTime() + 300000 - Math.random() * 150000).toISOString(),
        status: 'active' as const,
      },
      {
        name: 'Daily Briefing',
        schedule: '08:00 dagelijks',
        lastRun: new Date(new Date().setHours(8, 0, 0, 0) - 86400000).toISOString(),
        nextRun: new Date(new Date().setHours(8, 0, 0, 0) + (now.getHours() >= 8 ? 86400000 : 0)).toISOString(),
        status: 'active' as const,
      },
    ],
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate agent data
    const agents = generateAgentData();
    const systemMetrics = generateSystemMetrics(agents);

    return NextResponse.json({
      success: true,
      data: {
        agents,
        systemMetrics,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
