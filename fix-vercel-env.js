// This script will help you fix the Vercel environment variables
// Run this in your terminal after logging into Vercel CLI

const fs = require('fs');

// Read the private key from our local .env file
const envContent = fs.readFileSync('.env', 'utf8');
const privateKeyMatch = envContent.match(/GOOGLE_PRIVATE_KEY="([^"]+)"/);

if (privateKeyMatch) {
  const privateKey = privateKeyMatch[1];
  
  console.log('🔧 VERCEL ENVIRONMENT VARIABLE COMMANDS');
  console.log('Run these commands in your terminal:\n');
  
  console.log('1. Login to Vercel CLI:');
  console.log('vercel login\n');
  
  console.log('2. Link your project:');
  console.log('vercel link\n');
  
  console.log('3. Set the correct NEXTAUTH_URL:');
  console.log('vercel env add NEXTAUTH_URL');
  console.log('   Enter: https://alumni-lms-sigma.vercel.app\n');
  
  console.log('4. Remove the broken GOOGLE_PRIVATE_KEY:');
  console.log('vercel env rm GOOGLE_PRIVATE_KEY\n');
  
  console.log('5. Add the correct GOOGLE_PRIVATE_KEY:');
  console.log('vercel env add GOOGLE_PRIVATE_KEY');
  console.log('   Then paste this key (including quotes):');
  console.log(`   "${privateKey}"\n`);
  
  console.log('6. Trigger a new deployment:');
  console.log('vercel --prod\n');
  
  console.log('✅ After running these commands, your app should work!');
  
} else {
  console.log('❌ Could not find GOOGLE_PRIVATE_KEY in .env file');
}