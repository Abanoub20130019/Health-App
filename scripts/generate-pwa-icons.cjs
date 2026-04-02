const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Source SVG
const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/icon.svg'));

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  for (const size of sizes) {
    const outputPath = path.join(__dirname, `../public/icon-${size}x${size}.png`);
    
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`✗ Failed to generate icon-${size}x${size}.png:`, error.message);
    }
  }
  
  console.log('\nPWA icons generated successfully!');
}

// Generate maskable icons (with padding for safe area)
async function generateMaskableIcons() {
  console.log('\nGenerating maskable icons...');
  
  const maskableSizes = [192, 512];
  
  for (const size of maskableSizes) {
    const outputPath = path.join(__dirname, `../public/maskable-icon-${size}x${size}.png`);
    
    // Create maskable version with padding (10% padding for safe zone)
    const padding = Math.round(size * 0.1);
    const iconSize = size - (padding * 2);
    
    try {
      const resizedIcon = await sharp(svgBuffer)
        .resize(iconSize, iconSize)
        .png()
        .toBuffer();
      
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 1, g: 45, b: 29, alpha: 1 } // #012d1d
        }
      })
        .composite([{
          input: resizedIcon,
          gravity: 'center'
        }])
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated maskable-icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`✗ Failed to generate maskable-icon-${size}x${size}.png:`, error.message);
    }
  }
}

// Generate Apple touch icon
async function generateAppleTouchIcon() {
  console.log('\nGenerating Apple touch icon...');
  
  try {
    // Apple touch icon needs padding
    const size = 180;
    const padding = 20;
    const iconSize = size - (padding * 2);
    
    const resizedIcon = await sharp(svgBuffer)
      .resize(iconSize, iconSize)
      .png()
      .toBuffer();
    
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 1, g: 45, b: 29, alpha: 1 } // #012d1d
      }
    })
      .composite([{
        input: resizedIcon,
        gravity: 'center'
      }])
      .png()
      .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
    
    console.log('✓ Generated apple-touch-icon.png');
  } catch (error) {
    console.error('✗ Failed to generate Apple touch icon:', error.message);
  }
}

// Run all generators
async function main() {
  console.log('========================================');
  console.log('  VITALITY PWA ICON GENERATOR');
  console.log('========================================\n');
  
  await generateIcons();
  await generateMaskableIcons();
  await generateAppleTouchIcon();
  
  console.log('\n========================================');
  console.log('  ALL ICONS GENERATED!');
  console.log('========================================');
}

main().catch(console.error);
