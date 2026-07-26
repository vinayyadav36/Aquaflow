// Run with: node scripts/generate-pwa-icons.js
// Generates simple SVG-based PWA icons (for development use)
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const publicDir = path.join(__dirname, '..', 'public');

const svgContent = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#2563eb"/>
  <text x="50" y="68" font-family="system-ui, sans-serif" font-size="52" font-weight="bold" fill="white" text-anchor="middle">SH</text>
</svg>`;

sizes.forEach(size => {
  const filePath = path.join(publicDir, `pwa-${size}x${size}.png`);
  if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf-8') === 'placeholder') {
    // Write SVG instead (browsers accept SVG for PWA icons in dev mode)
    const svgPath = path.join(publicDir, `pwa-${size}x${size}.svg`);
    fs.writeFileSync(svgPath, svgContent(size));
    console.log(`Generated ${svgPath}`);
  }
});

console.log('PWA icons check complete.');
