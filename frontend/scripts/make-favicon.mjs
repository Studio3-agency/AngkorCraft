import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const logo = join(pub, 'logo.png');
const sizes = [16, 32, 48];
const pngs = [];
for (const s of sizes) {
  pngs.push({ size: s, buf: await sharp(logo).resize(s, s, { fit: 'contain', background:{r:0,g:0,b:0,alpha:0} }).png().toBuffer() });
}
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);          // reserved
header.writeUInt16LE(1, 2);          // type = icon
header.writeUInt16LE(pngs.length, 4);// count
const entries = [];
let offset = 6 + pngs.length * 16;
for (const { size, buf } of pngs) {
  const e = Buffer.alloc(16);
  e.writeUInt8(size >= 256 ? 0 : size, 0); // width
  e.writeUInt8(size >= 256 ? 0 : size, 1); // height
  e.writeUInt8(0, 2);   // color palette
  e.writeUInt8(0, 3);   // reserved
  e.writeUInt16LE(1, 4);   // planes
  e.writeUInt16LE(32, 6);  // bpp
  e.writeUInt32LE(buf.length, 8);  // size of image data
  e.writeUInt32LE(offset, 12);     // offset
  offset += buf.length;
  entries.push(e);
}
const ico = Buffer.concat([header, ...entries, ...pngs.map(p => p.buf)]);
writeFileSync(join(pub, 'favicon.ico'), ico);
console.log('favicon.ico written:', ico.length, 'bytes,', sizes.join('/'), 'px');
