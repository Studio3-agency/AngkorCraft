import sharp from 'sharp';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const src = join(pub, 'logo-original.png');
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const TR = 0xff, TG = 0x91, TB = 0x4d; // #ff914d
function rgb2hsv(r,g,b){
  r/=255; g/=255; b/=255;
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn; let h=0;
  if(d!==0){ if(mx===r) h=((g-b)/d)%6; else if(mx===g) h=(b-r)/d+2; else h=(r-g)/d+4; h*=60; if(h<0)h+=360; }
  return [h, mx===0?0:d/mx, mx];
}
let changed=0;
for(let i=0;i<data.length;i+=channels){
  const r=data[i],g=data[i+1],b=data[i+2];
  const a = channels===4 ? data[i+3] : 255;
  if(a<10) continue;
  const [h,s,v]=rgb2hsv(r,g,b);
  if(h>=14 && h<=45 && s>=0.42 && v>=0.35){ data[i]=TR; data[i+1]=TG; data[i+2]=TB; changed++; }
}
console.log('recolored', changed, 'of', width*height, 'px');
await sharp(data,{raw:{width,height,channels}}).png().toFile(join(pub,'logo-recolored.png'));
