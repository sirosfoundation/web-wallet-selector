#!/usr/bin/env node

/**
 * Generate PNG icons from SVG logo
 * Converts the SVG logo to various PNG sizes needed for browser extensions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SIZES = [16, 32, 48, 128];
const SRC_LOGO = path.join(__dirname, '..', 'src', 'icons', 'logo-light.svg');
const OUTPUT_DIRS = [
  path.join(__dirname, '..', 'src', 'icons'),
  path.join(__dirname, '..', 'chrome', 'icons'),
  path.join(__dirname, '..', 'firefox', 'icons'),
  path.join(__dirname, '..', 'safari', 'icons')
];

console.log('🎨 Generating icons from SVG logo...\n');

// Check if ImageMagick is available
try {
  execSync('which convert', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Error: ImageMagick not found. Please install it:');
  console.error('   Ubuntu/Debian: sudo apt-get install imagemagick');
  console.error('   macOS: brew install imagemagick');
  process.exit(1);
}

// Check if source SVG exists
if (!fs.existsSync(SRC_LOGO)) {
  console.error(`❌ Error: Source logo not found at ${SRC_LOGO}`);
  process.exit(1);
}

// Ensure output directories exist
OUTPUT_DIRS.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Generate icons for each size
SIZES.forEach(size => {
  const iconName = `icon${size}.png`;
  
  OUTPUT_DIRS.forEach(dir => {
    const outputPath = path.join(dir, iconName);
    
    try {
      // Convert SVG to PNG with ImageMagick
      // Using -background none for transparency
      // Using -density for high quality rendering
      execSync(
        `convert -background none -density 300 -resize ${size}x${size} "${SRC_LOGO}" "${outputPath}"`,
        { stdio: 'ignore' }
      );
      
      console.log(`✓ Generated ${size}x${size} → ${path.relative(process.cwd(), outputPath)}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${outputPath}`);
      console.error(error.message);
    }
  });
});

console.log('\n✨ Icon generation complete!');
