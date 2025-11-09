#!/usr/bin/env node

/**
 * Generate Secure JWT Secret
 * Creates a cryptographically secure random string for JWT_SECRET
 */

const crypto = require('crypto');

console.log('\n🔐 Secure JWT Secret Generator\n');
console.log('='.repeat(60));

// Generate 32 bytes (256 bits) of random data
const secret = crypto.randomBytes(32).toString('hex');

console.log('\n✅ Generated JWT Secret:\n');
console.log(`   ${secret}`);
console.log('\n📋 Copy this to your environment variables as JWT_SECRET');
console.log('\n💡 Usage:');
console.log('   JWT_SECRET=' + secret);
console.log('\n⚠️  Keep this secret safe and never commit it to version control!');
console.log('\n' + '='.repeat(60) + '\n');
