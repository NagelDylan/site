// Packs PNGs into a multi-size .ico. The ICO container permits PNG-encoded
// entries (Vista+), which every browser that still asks for favicon.ico
// supports — so no image library is needed, just the 22-byte-per-entry header.
//
// Usage: node scripts/make-ico.mjs out.ico in16.png in32.png in48.png
import { readFileSync, writeFileSync } from 'node:fs';

const [out, ...inputs] = process.argv.slice(2);
if (!out || inputs.length === 0) {
  console.error('usage: node make-ico.mjs <out.ico> <png...>');
  process.exit(1);
}

const images = inputs.map((path) => {
  const data = readFileSync(path);
  if (data.readUInt32BE(0) !== 0x89504e47) throw new Error(`${path} is not a PNG`);
  // IHDR width/height live at byte 16 and 20.
  return { data, width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
});

const HEADER = 6;
const ENTRY = 16;
const header = Buffer.alloc(HEADER);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // 1 = icon
header.writeUInt16LE(images.length, 4);

let offset = HEADER + ENTRY * images.length;
const entries = images.map(({ data, width, height }) => {
  const e = Buffer.alloc(ENTRY);
  e.writeUInt8(width >= 256 ? 0 : width, 0); // 0 encodes 256
  e.writeUInt8(height >= 256 ? 0 : height, 1);
  e.writeUInt8(0, 2); // palette size — 0 for truecolor
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // colour planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(data.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += data.length;
  return e;
});

writeFileSync(out, Buffer.concat([header, ...entries, ...images.map((i) => i.data)]));
console.log(`wrote ${out} (${images.map((i) => i.width).join('/')}px)`);
