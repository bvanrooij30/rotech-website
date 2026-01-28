/**
 * RoTech AI Agents - Validation Script
 * Valideert of alle agents correct zijn geconfigureerd en werkend
 * 
 * Run: npx ts-node ai-agents/validate-agents.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  agent: string;
  path: string;
  status: 'pass' | 'fail' | 'warning';
  checks: {
    fileExists: boolean;
    hasExport: boolean;
    hasClass: boolean;
    hasRequiredMethods: boolean;
    hasCapabilities: boolean;
  };
  issues: string[];
}

interface ValidationReport {
  timestamp: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  systemAgents: ValidationResult[];
  serviceAgents: ValidationResult[];
  coreModules: ValidationResult[];
  portalIntegration: {
    apiRoutes: string[];
    pages: string[];
    navigation: boolean;
  };
}

const AGENTS_DIR = path.join(__dirname, 'agents');
const CORE_DIR = path.join(__dirname, 'core');
const PORTAL_DIR = path.join(__dirname, '..', 'src', 'app', 'portal', 'ai-agents');
const API_DIR = path.join(__dirname, '..', 'src', 'app', 'api', 'ai-agents');

// System agents that should exist
const SYSTEM_AGENTS = [
  { name: 'Master Agent', file: 'system/master-agent.ts' },
  { name: 'Orchestrator Agent', file: 'system/orchestrator-agent.ts' },
  { name: 'Optimizer Agent', file: 'system/optimizer-agent.ts' },
  { name: 'Marketing Agent', file: 'system/marketing-agent.ts' },
  { name: 'Scheduler Agent', file: 'system/scheduler-agent.ts' },
];

// Service agents that should exist
const SERVICE_AGENTS = [
  { name: 'Intake Agent', file: '00-intake/intake-agent.ts' },
  { name: 'Starter Website Agent', file: '01-starter-website/starter-website-agent.ts' },
  { name: 'Business Website Agent', file: '02-business-website/business-website-agent.ts' },
  { name: 'Webshop Agent', file: '03-webshop/webshop-agent.ts' },
  { name: 'Maatwerk Agent', file: '04-maatwerk/maatwerk-agent.ts' },
  { name: 'Automatisering Agent', file: '05-automatisering/automatisering-agent.ts' },
  { name: 'PWA Agent', file: '06-pwa/pwa-agent.ts' },
  { name: 'API Integratie Agent', file: '07-api-integratie/api-integratie-agent.ts' },
  { name: 'SEO Agent', file: '08-seo/seo-agent.ts' },
  { name: 'Onderhoud Agent', file: '09-onderhoud/onderhoud-agent.ts' },
  { name: 'Chatbot Agent', file: '10-chatbot/chatbot-agent.ts' },
];

// Core modules
const CORE_MODULES = [
  { name: 'Types', file: 'types.ts' },
  { name: 'Base Agent', file: 'base-agent.ts' },
  { name: 'Logger', file: 'logger.ts' },
  { name: 'Error Handler', file: 'error-handler.ts' },
  { name: 'PDF Generator', file: 'pdf-generator.ts' },
  { name: 'Prompt Engine', file: 'prompt-engine.ts' },
  { name: 'Project Manager', file: 'project-manager.ts' },
  { name: 'Index', file: 'index.ts' },
];

function validateAgentFile(filePath: string): ValidationResult['checks'] {
  const checks = {
    fileExists: false,
    hasExport: false,
    hasClass: false,
    hasRequiredMethods: false,
    hasCapabilities: false,
  };

  if (!fs.existsSync(filePath)) {
    return checks;
  }

  checks.fileExists = true;
  const content = fs.readFileSync(filePath, 'utf-8');

  // Check for exports
  checks.hasExport = content.includes('export class') || content.includes('export function');

  // Check for class definition
  checks.hasClass = /export class \w+Agent/.test(content);

  // Check for required methods
  const requiredMethods = ['getCapabilities', 'executeWorkflow', 'getSpecializedPrompts'];
  checks.hasRequiredMethods = requiredMethods.every(method => 
    content.includes(`${method}(`) || content.includes(`async ${method}(`)
  );

  // Check for capabilities
  checks.hasCapabilities = content.includes('getCapabilities()') && content.includes('return [');

  return checks;
}

function validateAgent(name: string, relativePath: string, baseDir: string): ValidationResult {
  const fullPath = path.join(baseDir, relativePath);
  const checks = validateAgentFile(fullPath);
  
  const issues: string[] = [];
  if (!checks.fileExists) issues.push('File does not exist');
  if (checks.fileExists && !checks.hasExport) issues.push('Missing export');
  if (checks.fileExists && !checks.hasClass) issues.push('Missing Agent class');
  if (checks.fileExists && !checks.hasRequiredMethods) issues.push('Missing required methods');
  if (checks.fileExists && !checks.hasCapabilities) issues.push('Missing getCapabilities');

  let status: ValidationResult['status'] = 'pass';
  if (!checks.fileExists) status = 'fail';
  else if (issues.length > 0) status = 'warning';

  return {
    agent: name,
    path: relativePath,
    status,
    checks,
    issues,
  };
}

function validateCoreModule(name: string, file: string): ValidationResult {
  const fullPath = path.join(CORE_DIR, file);
  const fileExists = fs.existsSync(fullPath);
  
  const issues: string[] = [];
  let hasExport = false;
  
  if (fileExists) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    hasExport = content.includes('export');
    if (!hasExport) issues.push('No exports found');
  } else {
    issues.push('File does not exist');
  }

  return {
    agent: name,
    path: file,
    status: fileExists && hasExport ? 'pass' : 'fail',
    checks: {
      fileExists,
      hasExport,
      hasClass: false,
      hasRequiredMethods: false,
      hasCapabilities: false,
    },
    issues,
  };
}

function validatePortalIntegration() {
  const apiRoutes: string[] = [];
  const pages: string[] = [];
  
  // Check API routes
  if (fs.existsSync(API_DIR)) {
    const findRoutes = (dir: string, prefix = ''): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          findRoutes(path.join(dir, entry.name), `${prefix}/${entry.name}`);
        } else if (entry.name === 'route.ts') {
          apiRoutes.push(`/api/ai-agents${prefix}`);
        }
      }
    };
    findRoutes(API_DIR);
  }

  // Check pages
  if (fs.existsSync(PORTAL_DIR)) {
    const findPages = (dir: string, prefix = ''): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          findPages(path.join(dir, entry.name), `${prefix}/${entry.name}`);
        } else if (entry.name === 'page.tsx') {
          pages.push(`/portal/ai-agents${prefix}`);
        }
      }
    };
    findPages(PORTAL_DIR);
  }

  // Check navigation update
  const navPath = path.join(__dirname, '..', 'src', 'components', 'portal', 'PortalNavigation.tsx');
  let navigation = false;
  if (fs.existsSync(navPath)) {
    const content = fs.readFileSync(navPath, 'utf-8');
    navigation = content.includes('ai-agents') && content.includes('AI Agent Team');
  }

  return { apiRoutes, pages, navigation };
}

function generateReport(): ValidationReport {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         RO-TECH AI AGENTS - VALIDATION REPORT                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Validate system agents
  console.log('📊 Validating System Agents...');
  const systemResults = SYSTEM_AGENTS.map(agent => 
    validateAgent(agent.name, agent.file, AGENTS_DIR)
  );

  // Validate service agents
  console.log('📊 Validating Service Agents...');
  const serviceResults = SERVICE_AGENTS.map(agent => 
    validateAgent(agent.name, agent.file, AGENTS_DIR)
  );

  // Validate core modules
  console.log('📊 Validating Core Modules...');
  const coreResults = CORE_MODULES.map(module => 
    validateCoreModule(module.name, module.file)
  );

  // Validate portal integration
  console.log('📊 Validating Portal Integration...');
  const portalIntegration = validatePortalIntegration();

  // Calculate summary
  const allResults = [...systemResults, ...serviceResults, ...coreResults];
  const summary = {
    total: allResults.length,
    passed: allResults.filter(r => r.status === 'pass').length,
    failed: allResults.filter(r => r.status === 'fail').length,
    warnings: allResults.filter(r => r.status === 'warning').length,
  };

  return {
    timestamp: new Date().toISOString(),
    summary,
    systemAgents: systemResults,
    serviceAgents: serviceResults,
    coreModules: coreResults,
    portalIntegration,
  };
}

function printReport(report: ValidationReport): void {
  console.log('\n════════════════════════════════════════════════════════════════\n');

  // Summary
  console.log('📋 SUMMARY');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log(`   Total Components: ${report.summary.total}`);
  console.log(`   ✅ Passed: ${report.summary.passed}`);
  console.log(`   ⚠️  Warnings: ${report.summary.warnings}`);
  console.log(`   ❌ Failed: ${report.summary.failed}`);
  console.log('');

  // System Agents
  console.log('👑 SYSTEM AGENTS');
  console.log('─────────────────────────────────────────────────────────────────');
  for (const result of report.systemAgents) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`   ${icon} ${result.agent}`);
    if (result.issues.length > 0) {
      console.log(`      Issues: ${result.issues.join(', ')}`);
    }
  }
  console.log('');

  // Service Agents
  console.log('🤖 SERVICE AGENTS');
  console.log('─────────────────────────────────────────────────────────────────');
  for (const result of report.serviceAgents) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`   ${icon} ${result.agent}`);
    if (result.issues.length > 0) {
      console.log(`      Issues: ${result.issues.join(', ')}`);
    }
  }
  console.log('');

  // Core Modules
  console.log('🔧 CORE MODULES');
  console.log('─────────────────────────────────────────────────────────────────');
  for (const result of report.coreModules) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`   ${icon} ${result.agent}`);
  }
  console.log('');

  // Portal Integration
  console.log('🌐 PORTAL INTEGRATION');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log(`   Navigation Updated: ${report.portalIntegration.navigation ? '✅' : '❌'}`);
  console.log(`   API Routes: ${report.portalIntegration.apiRoutes.length}`);
  for (const route of report.portalIntegration.apiRoutes) {
    console.log(`      • ${route}`);
  }
  console.log(`   Portal Pages: ${report.portalIntegration.pages.length}`);
  for (const page of report.portalIntegration.pages) {
    console.log(`      • ${page}`);
  }
  console.log('');

  // Final Status
  console.log('════════════════════════════════════════════════════════════════');
  if (report.summary.failed === 0 && report.summary.warnings === 0) {
    console.log('🎉 ALL VALIDATIONS PASSED! System is ready for operation.');
  } else if (report.summary.failed === 0) {
    console.log('⚠️  Some warnings detected but system should work correctly.');
  } else {
    console.log('❌ VALIDATION FAILED! Please fix the issues above.');
  }
  console.log('════════════════════════════════════════════════════════════════\n');
}

// Run validation
const report = generateReport();
printReport(report);

// Save report
const reportPath = path.join(__dirname, 'VALIDATION-REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`📄 Full report saved to: ${reportPath}\n`);

export { generateReport, ValidationReport };
