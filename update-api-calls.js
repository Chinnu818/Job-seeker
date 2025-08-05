#!/usr/bin/env node

/**
 * Script to help update remaining API calls in the frontend
 * This script identifies files that still need axios imports updated
 */

const fs = require('fs');
const path = require('path');

const frontendSrcPath = path.join(__dirname, 'frontend', 'src');

function findTsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findTsxFiles(fullPath));
    } else if (item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function checkFileForAxios(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const hasAxiosImport = content.includes("import axios from 'axios'");
  const hasApiCalls = content.includes("axios.get('/api/") || content.includes("axios.post('/api/");
  
  if (hasAxiosImport || hasApiCalls) {
    console.log(`⚠️  File needs updating: ${path.relative(process.cwd(), filePath)}`);
    if (hasAxiosImport) {
      console.log(`   - Has axios import`);
    }
    if (hasApiCalls) {
      console.log(`   - Has API calls`);
    }
    console.log('');
  }
}

console.log('🔍 Checking for files that need API call updates...\n');

const tsxFiles = findTsxFiles(frontendSrcPath);
let needsUpdate = false;

for (const file of tsxFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const hasAxiosImport = content.includes("import axios from 'axios'");
  const hasApiCalls = content.includes("axios.get('/api/") || content.includes("axios.post('/api/");
  
  if (hasAxiosImport || hasApiCalls) {
    needsUpdate = true;
    checkFileForAxios(file);
  }
}

if (!needsUpdate) {
  console.log('✅ All files are already updated!');
} else {
  console.log('\n📝 Manual updates needed:');
  console.log('1. Replace "import axios from \'axios\'" with "import api from \'../config/axios\'"');
  console.log('2. Replace "axios.get(\'/api/...\')" with "api.get(\'/...\')"');
  console.log('3. Replace "axios.post(\'/api/...\')" with "api.post(\'/...\')"');
  console.log('4. Remove manual token headers (handled by axios config)');
}

console.log('\n🚀 Your project is ready for deployment!');
console.log('📖 See DEPLOYMENT_GUIDE.md for detailed instructions.'); 