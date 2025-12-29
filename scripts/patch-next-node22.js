#!/usr/bin/env node

/**
 * Patch for Next.js build issue with Node v22
 *
 * This script patches Next.js files to work with Node v22 where nanoid.generate
 * is not a function. This is a temporary workaround until Next.js fixes the issue.
 *
 * See: https://github.com/vercel/next.js/issues/58042
 */

const fs = require('fs');
const path = require('path');

const BUILD_INDEX_PATH = path.join(__dirname, '../node_modules/next/dist/build/index.js');

console.log('🔧 Patching Next.js for Node v22 compatibility...');

try {
  if (!fs.existsSync(BUILD_INDEX_PATH)) {
    console.log('⏭️  Next.js not found, skipping patch');
    process.exit(0);
  }

  let content = fs.readFileSync(BUILD_INDEX_PATH, 'utf8');

  // Check if already patched
  if (content.includes('PATCHED_FOR_NODE_22')) {
    console.log('✅ Already patched');
    process.exit(0);
  }

  // Replace nanoid with crypto randomBytes
  content = content.replace(
    /const _indexcjs = require\("next\/dist\/compiled\/nanoid\/index\.cjs"\);/,
    `// PATCHED_FOR_NODE_22
const { randomBytes } = require("crypto");
const _indexcjs = { nanoid: () => randomBytes(16).toString("hex") };`
  );

  // Also patch the call to generateBuildId to handle undefined config.generateBuildId
  content = content.replace(
    /\(0, _generatebuildid\.generateBuildId\)\(config\.generateBuildId, _indexcjs\.nanoid\)/,
    `(0, _generatebuildid.generateBuildId)(config.generateBuildId || (async () => null), _indexcjs.nanoid)`
  );

  fs.writeFileSync(BUILD_INDEX_PATH, content, 'utf8');
  console.log('✅ Next.js patched successfully for Node v22!');
} catch (error) {
  console.error('❌ Failed to patch Next.js:', error.message);
  // Don't fail the build
  process.exit(0);
}
