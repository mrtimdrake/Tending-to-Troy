/**
 * Generates PNG icons for the PWA manifest from the SVG source.
 *
 * Requires: npm install --save-dev sharp
 *
 * Usage: node scripts/generate-icons.mjs
 *
 * Outputs to public/icons/:
 *   icon-192.png          — standard 192x192
 *   icon-512.png          — standard 512x512
 *   icon-maskable-192.png — maskable 192x192 (safe area padded)
 *   icon-maskable-512.png — maskable 512x512 (safe area padded)
 *   apple-touch-icon.png  — 180x180 for iOS
 */

import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const iconsDir = join(root, 'public', 'icons')
const svgSource = readFileSync(join(iconsDir, 'icon.svg'))

// Standard icon — fill frame edge to edge
const standardSizes = [192, 512]
for (const size of standardSizes) {
  await sharp(svgSource)
    .resize(size, size)
    .png()
    .toFile(join(iconsDir, `icon-${size}.png`))
  console.log(`✓ icon-${size}.png`)
}

// Maskable icon — Android adaptive icons require 10% safe-area padding on each side.
// We resize the artwork to 80% and place it on the paper-yellow background.
const maskableSizes = [192, 512]
for (const size of maskableSizes) {
  const artworkSize = Math.round(size * 0.8)
  const padding = Math.round((size - artworkSize) / 2)

  await sharp(svgSource)
    .resize(artworkSize, artworkSize)
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 245, g: 232, b: 168, alpha: 1 }, // #F5E8A8 paper yellow
    })
    .png()
    .toFile(join(iconsDir, `icon-maskable-${size}.png`))
  console.log(`✓ icon-maskable-${size}.png`)
}

// Apple touch icon — 180x180, no rounded corners (iOS applies them)
await sharp(svgSource)
  .resize(180, 180)
  .png()
  .toFile(join(iconsDir, 'apple-touch-icon.png'))
console.log('✓ apple-touch-icon.png')

console.log('\nAll icons generated. Commit public/icons/*.png before deploying.')
