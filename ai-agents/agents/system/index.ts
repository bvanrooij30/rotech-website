/**
 * RoTech AI Agents - System Agents Index
 * Central export for all system-level agents
 * 
 * Deze agents vormen de kern van het autonome systeem
 */

// Master Agent - The CEO
export { MasterAgent, createMasterAgent, masterAgent } from './master-agent';

// Orchestrator - Quality Control & Monitoring
export { OrchestratorAgent, createOrchestratorAgent, orchestratorAgent } from './orchestrator-agent';

// Optimizer - Continuous Improvement
export { OptimizerAgent, createOptimizerAgent, optimizerAgent } from './optimizer-agent';

// Marketing - Growth & Lead Generation
export { MarketingAgent, createMarketingAgent, marketingAgent } from './marketing-agent';

// Scheduler - Task Planning & Load Balancing
export { SchedulerAgent, createSchedulerAgent, schedulerAgent } from './scheduler-agent';

/**
 * Initialize all system agents in correct order
 * Master depends on other system agents, so initialize those first
 */
export async function initializeSystemAgents(): Promise<void> {
  console.log('🚀 Initializing autonomous system agents...');
  
  // Phase 1: Core system agents
  await Promise.all([
    import('./orchestrator-agent'),
    import('./optimizer-agent'),
    import('./marketing-agent'),
    import('./scheduler-agent'),
  ]);
  
  // Phase 2: Master agent (depends on others)
  await import('./master-agent');
  
  console.log('');
  console.log('✅ Autonomous System Online:');
  console.log('');
  console.log('  👑 Master Agent        - CEO & System Coordinator');
  console.log('  📊 Orchestrator Agent  - Quality Control & Monitoring');
  console.log('  ⚡ Optimizer Agent     - Continuous Improvement');
  console.log('  📈 Marketing Agent     - Lead Generation & Campaigns');
  console.log('  📅 Scheduler Agent     - Task Planning & Load Balancing');
  console.log('');
  console.log('System is ready for autonomous operation.');
}

/**
 * Start het volledige autonome systeem
 */
export async function startAutonomousSystem(): Promise<void> {
  await initializeSystemAgents();
  
  // Get the master agent and start it
  const { masterAgent } = await import('./master-agent');
  await masterAgent.start();
  
  console.log('🤖 Autonomous system is now running!');
}
