/**
 * Build script for browser extensions
 * Copies shared source files to browser-specific directories
 */

const fs = require('fs');
const path = require('path');

const browser = process.argv[2];

if (!browser || !['chrome', 'firefox', 'safari'].includes(browser)) {
  console.error('Usage: node build.js <chrome|firefox|safari>');
  process.exit(1);
}

const srcDir = path.join(__dirname, '..', 'src');
const targetDir = path.join(__dirname, '..', browser);

// Files to copy
const filesToCopy = [
  'background.js',
  'content.js',
  'inject.js',
  'protocols.js',
  'modal.js',
  'popup.html',
  'popup.js',
  'options.html',
  'options.js'
];

console.log(`Building ${browser} extension...`);

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy files
filesToCopy.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const targetPath = path.join(targetDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, targetPath);
    console.log(`✓ Copied ${file}`);
  } else {
    console.warn(`⚠ Warning: ${file} not found in src/`);
  }
});

// Copy SVG logos to icons directory
const iconsDir = path.join(targetDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const logos = ['logo-light.svg', 'logo-dark.svg'];
logos.forEach(logo => {
  const srcPath = path.join(srcDir, 'icons', logo);
  const targetPath = path.join(iconsDir, logo);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, targetPath);
    console.log(`✓ Copied ${logo}`);
  }
});

// Browser-specific modifications
if (browser === 'chrome') {
  // Chrome uses chrome.* API, but our code handles both
  console.log('✓ Chrome-specific configuration ready');
}

if (browser === 'firefox') {
  // Firefox prefers browser.* API, which our code uses by default
  console.log('✓ Firefox-specific configuration ready');
}

if (browser === 'safari') {
  // Safari uses browser.* API as well
  console.log('✓ Safari-specific configuration ready');
}

console.log(`\n✅ ${browser} extension built successfully!`);
console.log(`📁 Output directory: ${targetDir}`);
