#!/usr/bin/env node

/**
 * Pre-Deployment Checker
 * Verifies that the application is ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 College Talent Hub - Deployment Readiness Check\n');
console.log('=' .repeat(60));

let errors = [];
let warnings = [];
let passed = 0;

// Check 1: Node.js version
console.log('\n📦 Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion >= 14) {
  console.log(`✅ Node.js version ${nodeVersion} (OK)`);
  passed++;
} else {
  errors.push(`Node.js version ${nodeVersion} is too old. Required: 14 or higher`);
  console.log(`❌ Node.js version ${nodeVersion} (OUTDATED)`);
}

// Check 2: Backend package.json
console.log('\n📦 Checking backend configuration...');
const backendPackagePath = path.join(__dirname, 'backend', 'package.json');
if (fs.existsSync(backendPackagePath)) {
  const backendPackage = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
  
  // Check start script
  if (backendPackage.scripts && backendPackage.scripts.start) {
    console.log('✅ Backend start script found');
    passed++;
  } else {
    errors.push('Backend package.json missing "start" script');
    console.log('❌ Backend start script missing');
  }
  
  // Check essential dependencies
  const requiredDeps = ['express', 'mongoose', 'dotenv', 'jsonwebtoken', 'bcryptjs', 'cors'];
  const missingDeps = requiredDeps.filter(dep => !backendPackage.dependencies[dep]);
  
  if (missingDeps.length === 0) {
    console.log('✅ All essential backend dependencies found');
    passed++;
  } else {
    errors.push(`Missing backend dependencies: ${missingDeps.join(', ')}`);
    console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
  }
} else {
  errors.push('Backend package.json not found');
  console.log('❌ Backend package.json not found');
}

// Check 3: Frontend package.json
console.log('\n📦 Checking frontend configuration...');
const frontendPackagePath = path.join(__dirname, 'frontend', 'package.json');
if (fs.existsSync(frontendPackagePath)) {
  const frontendPackage = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
  
  // Check build script
  if (frontendPackage.scripts && frontendPackage.scripts.build) {
    console.log('✅ Frontend build script found');
    passed++;
  } else {
    errors.push('Frontend package.json missing "build" script');
    console.log('❌ Frontend build script missing');
  }
  
  // Check React
  if (frontendPackage.dependencies && frontendPackage.dependencies.react) {
    console.log('✅ React dependency found');
    passed++;
  } else {
    errors.push('React dependency not found');
    console.log('❌ React dependency missing');
  }
} else {
  errors.push('Frontend package.json not found');
  console.log('❌ Frontend package.json not found');
}

// Check 4: Environment files
console.log('\n🔐 Checking environment configuration...');
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const backendEnvProdPath = path.join(__dirname, 'backend', '.env.production');

if (fs.existsSync(backendEnvPath)) {
  console.log('✅ Backend .env file exists');
  passed++;
  
  // Check for sensitive data
  const envContent = fs.readFileSync(backendEnvPath, 'utf8');
  if (envContent.includes('localhost') || envContent.includes('127.0.0.1')) {
    warnings.push('Backend .env contains localhost references - update for production');
    console.log('⚠️  .env contains localhost - remember to update for production');
  }
  
  // Check for required variables
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
  const missingVars = requiredEnvVars.filter(varName => !envContent.includes(varName));
  
  if (missingVars.length === 0) {
    console.log('✅ Required environment variables present');
    passed++;
  } else {
    errors.push(`Missing environment variables: ${missingVars.join(', ')}`);
    console.log(`❌ Missing variables: ${missingVars.join(', ')}`);
  }
} else {
  warnings.push('Backend .env file not found - you will need to configure environment variables in your deployment platform');
  console.log('⚠️  Backend .env not found (OK if using platform env vars)');
}

if (fs.existsSync(backendEnvProdPath)) {
  console.log('✅ Production environment template exists (.env.production)');
  passed++;
} else {
  console.log('ℹ️  No .env.production template');
}

// Check 5: .gitignore
console.log('\n📁 Checking .gitignore...');
const gitignorePath = path.join(__dirname, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  
  const shouldIgnore = ['node_modules', '.env', 'build'];
  const allIgnored = shouldIgnore.every(item => gitignoreContent.includes(item));
  
  if (allIgnored) {
    console.log('✅ .gitignore properly configured');
    passed++;
  } else {
    warnings.push('.gitignore may not be properly configured');
    console.log('⚠️  .gitignore might need updating');
  }
} else {
  errors.push('.gitignore file not found');
  console.log('❌ .gitignore not found');
}

// Check 6: Server.js health endpoint
console.log('\n🏥 Checking health endpoint...');
const serverPath = path.join(__dirname, 'backend', 'server.js');
if (fs.existsSync(serverPath)) {
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  if (serverContent.includes('/api/health')) {
    console.log('✅ Health check endpoint found');
    passed++;
  } else {
    warnings.push('No health check endpoint found - consider adding one');
    console.log('⚠️  No health check endpoint');
  }
} else {
  errors.push('Backend server.js not found');
  console.log('❌ server.js not found');
}

// Check 7: README
console.log('\n📚 Checking documentation...');
const readmePath = path.join(__dirname, 'README.md');
if (fs.existsSync(readmePath)) {
  console.log('✅ README.md found');
  passed++;
} else {
  warnings.push('README.md not found');
  console.log('⚠️  README.md not found');
}

// Check 8: Deployment config files
console.log('\n⚙️  Checking deployment configuration files...');
const deployFiles = [
  { name: 'render.yaml', desc: 'Render configuration' },
  { name: 'Procfile', desc: 'Heroku configuration' },
  { name: 'DEPLOYMENT.md', desc: 'Deployment guide' }
];

deployFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file.name))) {
    console.log(`✅ ${file.desc} found (${file.name})`);
    passed++;
  } else {
    console.log(`ℹ️  ${file.desc} not found (${file.name}) - optional`);
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 SUMMARY\n');
console.log(`✅ Checks passed: ${passed}`);
console.log(`⚠️  Warnings: ${warnings.length}`);
console.log(`❌ Errors: ${errors.length}`);

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach((warning, i) => {
    console.log(`   ${i + 1}. ${warning}`);
  });
}

if (errors.length > 0) {
  console.log('\n❌ ERRORS:');
  errors.forEach((error, i) => {
    console.log(`   ${i + 1}. ${error}`);
  });
  console.log('\n❌ Please fix the errors before deploying.\n');
  process.exit(1);
} else {
  console.log('\n✅ Your application is ready for deployment!');
  console.log('\n📖 Next steps:');
  console.log('   1. Read DEPLOYMENT_CHECKLIST.md for step-by-step guide');
  console.log('   2. Set up MongoDB Atlas account');
  console.log('   3. Choose deployment platform (Render recommended)');
  console.log('   4. Configure environment variables');
  console.log('   5. Deploy backend first, then frontend');
  console.log('\n🚀 Good luck with your deployment!\n');
  process.exit(0);
}
