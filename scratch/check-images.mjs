import fs from 'fs';
import path from 'path';

const publicDir = 'd:\\CYCLE\\public';
const files = fs.readdirSync(publicDir);

for (const file of files) {
  const fullPath = path.join(publicDir, file);
  const stats = fs.statSync(fullPath);
  if (!stats.isFile()) continue;

  const fd = fs.openSync(fullPath, 'r');
  const buffer = Buffer.alloc(4096);
  fs.readSync(fd, buffer, 0, 4096, 0);
  fs.closeSync(fd);

  // Check header
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
  const isHeic = buffer.slice(4, 12).toString('ascii').includes('ftyp');
  const isWebp = buffer.slice(8, 12).toString('ascii') === 'WEBP';

  console.log(`${file}: size=${stats.size} bytes, type=${isJpeg ? 'JPEG' : isHeic ? 'HEIC' : isWebp ? 'WEBP' : 'OTHER'}`);
}
