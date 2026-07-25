// Generates PWA icons into public/ from an inline SVG (no external font needed).
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pub = join(here, '..', 'public');
mkdirSync(pub, { recursive: true });

const logoPath = join(pub, 'logo.png');

const targets = [
  { name: 'pwa-192x192.png', size: 192, pad: 0 },
  { name: 'pwa-512x512.png', size: 512, pad: 0 },
  { name: 'maskable-512x512.png', size: 512, pad: 50 },
  { name: 'apple-touch-icon.png', size: 180, pad: 0 },
  { name: 'favicon-32x32.png', size: 32, pad: 0 },
];

for (const t of targets) {
  let pipeline = sharp(logoPath);
  
  if (t.pad > 0) {
    const innerSize = t.size - (t.pad * 2);
    pipeline = pipeline.resize(innerSize, innerSize, { fit: 'contain' })
      .extend({
        top: t.pad, bottom: t.pad, left: t.pad, right: t.pad,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      });
  } else {
    pipeline = pipeline.resize(t.size, t.size, { fit: 'contain' });
  }
  
  await pipeline.png().toFile(join(pub, t.name));
  console.log('  ✓', t.name);
}
console.log('Icons generated.');
