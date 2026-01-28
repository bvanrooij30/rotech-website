/**
 * RoTech AI Agents - Agent Index
 * Central export point for all specialized agents
 * 
 * Agents zijn georganiseerd in twee categorieën:
 * 1. System Agents - Beheren het autonome systeem
 * 2. Service Agents - Leveren diensten aan klanten
 */

// ============================================
// SYSTEM AGENTS (Autonomous Operation)
// ============================================
export {
  // Master Agent - CEO
  MasterAgent,
  createMasterAgent,
  masterAgent,
  // Orchestrator - Quality Control
  OrchestratorAgent,
  createOrchestratorAgent,
  orchestratorAgent,
  // Optimizer - Continuous Improvement
  OptimizerAgent,
  createOptimizerAgent,
  optimizerAgent,
  // Marketing - Lead Generation
  MarketingAgent,
  createMarketingAgent,
  marketingAgent,
  // Scheduler - Task Planning
  SchedulerAgent,
  createSchedulerAgent,
  schedulerAgent,
  // Initialization
  initializeSystemAgents,
  startAutonomousSystem,
} from './system';

// ============================================
// SERVICE AGENTS (Customer Facing)
// ============================================

// Intake & Analysis
export { IntakeAgent, createIntakeAgent, intakeAgent } from './00-intake/intake-agent';

// Website Projects (templates - nog te implementeren)
export { StarterWebsiteAgent, createStarterWebsiteAgent } from './01-starter-website/starter-website-agent';
export { BusinessWebsiteAgent, createBusinessWebsiteAgent } from './02-business-website/business-website-agent';
export { WebshopAgent, createWebshopAgent } from './03-webshop/webshop-agent';
export { MaatwerkAgent, createMaatwerkAgent } from './04-maatwerk/maatwerk-agent';

// Automation & Integration (templates)
export { AutomatiseringAgent, createAutomatiseringAgent } from './05-automatisering/automatisering-agent';
export { PWAAgent, createPWAAgent } from './06-pwa/pwa-agent';
export { APIIntegratieAgent, createAPIIntegratieAgent } from './07-api-integratie/api-integratie-agent';

// Support & Maintenance
export { SEOAgent, createSEOAgent, seoAgent } from './08-seo/seo-agent';
export { OnderhoudAgent, createOnderhoudAgent, onderhoudAgent } from './09-onderhoud/onderhoud-agent';
export { ChatbotAgent, createChatbotAgent } from './10-chatbot/chatbot-agent';

// ============================================
// AGENT REGISTRY
// ============================================

export const AGENT_MAP = {
  // System Agents
  'master': () => import('./system/master-agent'),
  'orchestrator': () => import('./system/orchestrator-agent'),
  'optimizer': () => import('./system/optimizer-agent'),
  'marketing': () => import('./system/marketing-agent'),
  'scheduler': () => import('./system/scheduler-agent'),
  
  // Service Agents
  'intake': () => import('./00-intake/intake-agent'),
  'starter-website': () => import('./01-starter-website/starter-website-agent'),
  'business-website': () => import('./02-business-website/business-website-agent'),
  'webshop': () => import('./03-webshop/webshop-agent'),
  'maatwerk': () => import('./04-maatwerk/maatwerk-agent'),
  'automatisering': () => import('./05-automatisering/automatisering-agent'),
  'pwa': () => import('./06-pwa/pwa-agent'),
  'api-integratie': () => import('./07-api-integratie/api-integratie-agent'),
  'seo': () => import('./08-seo/seo-agent'),
  'onderhoud': () => import('./09-onderhoud/onderhoud-agent'),
  'chatbot': () => import('./10-chatbot/chatbot-agent'),
} as const;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize all available agents
 * Use this for a complete system startup
 */
export async function initializeAllAgents(): Promise<void> {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         RO-TECH AI AGENTS - AUTONOMOUS SYSTEM                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Phase 1: System Agents
  console.log('📦 Phase 1: Initializing System Agents...');
  const { initializeSystemAgents } = await import('./system');
  await initializeSystemAgents();
  
  // Phase 2: Service Agents
  console.log('');
  console.log('📦 Phase 2: Initializing Service Agents...');
  await Promise.all([
    import('./00-intake/intake-agent'),
    import('./08-seo/seo-agent'),
    import('./09-onderhoud/onderhoud-agent'),
  ]);
  
  console.log('');
  console.log('✅ Service Agents Online:');
  console.log('  📋 Intake Agent    - Client intake & project analysis');
  console.log('  🔍 SEO Agent       - Search engine optimization');
  console.log('  🔧 Onderhoud Agent - Website maintenance');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  All agents initialized. System ready for autonomous operation.');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
}

/**
 * Quick start voor development
 * Start alleen de essentiële agents
 */
export async function quickStart(): Promise<void> {
  console.log('Quick starting essential agents...');
  
  await Promise.all([
    import('./system/orchestrator-agent'),
    import('./system/scheduler-agent'),
    import('./00-intake/intake-agent'),
  ]);
  
  console.log('Essential agents ready.');
}
