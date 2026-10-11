import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
const icon=fileURLToPath(new URL('../public/icon.svg',import.meta.url));
for(const size of [192,512])await sharp(icon).resize(size,size).png().toFile(fileURLToPath(new URL('../public/icon-'+size+'.png',import.meta.url)));
await sharp(icon).resize(180,180).png().toFile(fileURLToPath(new URL('../public/apple-touch-icon.png',import.meta.url)));
const center=await sharp(icon).resize(320,320).png().toBuffer();
await sharp({create:{width:512,height:512,channels:4,background:'#16866e'}}).composite([{input:center,left:96,top:96}]).png().toFile(fileURLToPath(new URL('../public/icon-maskable.png',import.meta.url)));
console.log('Generated installation icons');