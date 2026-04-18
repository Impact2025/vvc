import { createWriteStream, readFileSync } from 'fs';
import { deflateSync } from 'zlib';

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const tb = Buffer.from(type);
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([tb, data])));
  return Buffer.concat([len, tb, data, crcBuf]);
}

function solidPng(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  const row = Buffer.alloc(1 + size * 3);
  row[0] = 0; // filter: None
  for (let x = 0; x < size; x++) { row[1 + x * 3] = r; row[2 + x * 3] = g; row[3 + x * 3] = b; }
  const raw = Buffer.concat(Array(size).fill(row));

  return Buffer.concat([sig, pngChunk('IHDR', ihdr), pngChunk('IDAT', deflateSync(raw)), pngChunk('IEND', Buffer.alloc(0))]);
}

import { writeFileSync } from 'fs';
// VVC oranje: #f47920 = rgb(244, 121, 32)
writeFileSync('public/icon-192.png', solidPng(192, 244, 121, 32));
writeFileSync('public/icon-512.png', solidPng(512, 244, 121, 32));
console.log('✓ icon-192.png en icon-512.png aangemaakt (192×192 en 512×512)');
