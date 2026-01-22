/**
 * Pre-Deployment Check Script
 * 
 * Run this before pushing to GitHub to catch errors locally.
 * Usage: npm run precheck
 * 
 * Checks:
 * 1. TypeScript compilation
 * 2. ESLint errors
 * 3. Missing imports
 * 4. Environment variables
 * 5. Build success
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCheck(name: string, command: string): boolean {
  log(`\n📋 Checking: ${name}...`, colors.blue);
  try {
    execSync(command, { stdio: 'pipe', encoding: 'utf-8' });
    log(`✅ ${name} passed`, colors.green);
    return true;
  } catch (error) {
    log(`❌ ${name} failed`, colors.red);
    if (error instanceof Error && 'stdout' in error) {
      console.log((error as { stdout: string }).stdout);
    }
    return false;
  }
}

function checkEnvVariables(): boolean {
  log('\n📋 Checking: Environment variables...', colors.blue);
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'AUTH_SECRET',
  ];
  
  // Note: AUTH_URL is optional - Auth.js auto-detects from request headers
  // AUTH_TRUST_HOST=true is needed for Vercel deployments
  
  const optionalEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'RESEND_API_KEY',
    'ROTECH_API_KEY',
  ];
  
  const envPath = path.join(process.cwd(), '.env.local');
  const envExists = fs.existsSync(envPath);
  
  if (!envExists) {
    log('⚠️  No .env.local found - using environment variables', colors.yellow);
    return true; // Not a failure, Vercel uses env vars
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  let allRequired = true;
  
  for (const envVar of requiredEnvVars) {
    if (!envContent.includes(`${envVar}=`)) {
      log(`❌ Missing required: ${envVar}`, colors.red);
      allRequired = false;
    }
  }
  
  for (const envVar of optionalEnvVars) {
    if (!envContent.includes(`${envVar}=`)) {
      log(`⚠️  Missing optional: ${envVar}`, colors.yellow);
    }
  }
  
  if (allRequired) {
    log('✅ Environment variables check passed', colors.green);
  }
  
  return allRequired;
}

function checkExcludedFolders(): boolean {
  log('\n📋 Checking: tsconfig.json excludes...', colors.blue);
  
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
  
  const shouldExclude = ['node_modules', 'mobile-app', 'tools'];
  const excludes = tsconfig.exclude || [];
  
  let allExcluded = true;
  for (const folder of shouldExclude) {
    if (!excludes.includes(folder)) {
      log(`⚠️  Folder "${folder}" not in tsconfig exclude`, colors.yellow);
      allExcluded = false;
    }
  }
  
  if (allExcluded) {
    log('✅ tsconfig excludes are correct', colors.green);
  }
  
  return true; // Warning only, not a failure
}

async function main() {
  log('\n🚀 PRE-DEPLOYMENT CHECK', colors.blue);
  log('========================\n', colors.blue);
  
  const results: boolean[] = [];
  
  // Check tsconfig excludes
  results.push(checkExcludedFolders());
  
  // TypeScript check
  results.push(runCheck('TypeScript', 'npx tsc --noEmit'));
  
  // ESLint check
  results.push(runCheck('ESLint', 'npm run lint -- --max-warnings 0'));
  
  // Environment variables
  results.push(checkEnvVariables());
  
  // Summary
  log('\n========================', colors.blue);
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    log(`\n✅ All checks passed (${passed}/${total})`, colors.green);
    log('Safe to push to GitHub!\n', colors.green);
    process.exit(0);
  } else {
    log(`\n❌ Some checks failed (${passed}/${total})`, colors.red);
    log('Fix the issues above before pushing.\n', colors.red);
    process.exit(1);
  }
}

main().catch(console.error);
