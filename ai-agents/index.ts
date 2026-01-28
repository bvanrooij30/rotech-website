/**
 * RoTech AI Agents - Main Entry Point
 * Complete Autonomous AI Agent Infrastructure for Ro-Tech Development
 * 
 * Dit systeem bevat:
 * - 5 System Agents voor autonome operatie
 * - 11 Service Agents voor klantprojecten
 * - Volledige monitoring, optimalisatie en marketing
 * 
 * @version 2.0.0
 * @author Ro-Tech Development
 */

// Core exports
export * from './core';

// Agent exports
export * from './agents';

// API exports
export * from './api/agent-routes';

// Dashboard component
export { AgentDashboard } from './dashboard/AgentDashboard';

// ============================================
// SYSTEM INITIALIZATION
// ============================================

import { initializeAllAgents, startAutonomousSystem, quickStart } from './agents';

/**
 * Initialize the complete AI Agents system
 * Start alle agents in de juiste volgorde
 */
export async function initializeAIAgents(): Promise<void> {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║   🤖 RO-TECH AI AGENTS - AUTONOMOUS SYSTEM v2.0              ║');
  console.log('║                                                              ║');
  console.log('║   Een volledig autonoom draaiend AI-team dat:                ║');
  console.log('║   • Kwaliteit monitort en optimaliseert                      ║');
  console.log('║   • Marketing beheert en leads genereert                     ║');
  console.log('║   • Taken plant en verdeelt                                  ║');
  console.log('║   • Klantprojecten uitvoert                                  ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  
  await initializeAllAgents();
  
  console.log('');
  console.log('🎉 AI Agents system fully initialized!');
  console.log('');
}

/**
 * Start het autonome systeem
 * Na initialisatie begint het systeem zelfstandig te draaien
 */
export async function startAutonomousAISystem(): Promise<void> {
  await initializeAIAgents();
  await startAutonomousSystem();
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🚀 AUTONOMOUS SYSTEM IS NOW RUNNING');
  console.log('');
  console.log('  The Master Agent is coordinating all activities.');
  console.log('  Daily briefings will be generated automatically.');
  console.log('  Critical alerts will be escalated when needed.');
  console.log('');
  console.log('  To stop: call masterAgent.stop()');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
}

/**
 * Quick start voor development
 * Laadt alleen essentiële agents
 */
export { quickStart };

// ============================================
// CONVENIENCE EXPORTS
// ============================================

// Direct access to key agents
export { masterAgent } from './agents/system/master-agent';
export { orchestratorAgent } from './agents/system/orchestrator-agent';
export { optimizerAgent } from './agents/system/optimizer-agent';
export { marketingAgent } from './agents/system/marketing-agent';
export { schedulerAgent } from './agents/system/scheduler-agent';
export { intakeAgent } from './agents/00-intake/intake-agent';
export { seoAgent } from './agents/08-seo/seo-agent';
export { onderhoudAgent } from './agents/09-onderhoud/onderhoud-agent';

// ============================================
// USAGE EXAMPLES
// ============================================

/**
 * Quick start example - Autonomous Operation:
 * 
 * ```typescript
 * import { startAutonomousAISystem, masterAgent } from '@/ai-agents';
 * 
 * // Start the autonomous system
 * await startAutonomousAISystem();
 * 
 * // Get system status
 * const status = await masterAgent.getSystemStatus();
 * console.log(`System health: ${status.health}`);
 * console.log(`Active leads: ${status.metrics.activeLeads}`);
 * 
 * // Get daily briefing
 * const briefing = await masterAgent.generateDailyBriefing();
 * console.log(briefing.summary);
 * console.log(briefing.recommendations);
 * ```
 * 
 * Example - Process a Lead:
 * 
 * ```typescript
 * import { intakeAgent, marketingAgent } from '@/ai-agents';
 * 
 * // Process incoming lead
 * const analysis = await intakeAgent.processIntake({
 *   id: 'lead_123',
 *   companyName: 'Acme BV',
 *   contactName: 'Jan Jansen',
 *   email: 'jan@acme.nl',
 *   source: 'website',
 *   interest: 'Webshop laten maken',
 *   createdAt: new Date(),
 * });
 * 
 * // The marketing agent will automatically nurture the lead
 * console.log(`Recommended package: ${analysis.recommendedPackage}`);
 * console.log(`Estimated budget: €${analysis.estimatedBudget}`);
 * ```
 * 
 * Example - Monitor Performance:
 * 
 * ```typescript
 * import { orchestratorAgent, optimizerAgent } from '@/ai-agents';
 * 
 * // Get system health report
 * const health = await orchestratorAgent.performHealthCheck();
 * console.log(`Overall score: ${health.overallScore}/100`);
 * 
 * // Discover optimizations
 * const optimizations = await optimizerAgent.discoverOptimizations();
 * optimizations.forEach(opt => {
 *   console.log(`${opt.title}: ${opt.expectedImprovement}% improvement expected`);
 * });
 * ```
 */
