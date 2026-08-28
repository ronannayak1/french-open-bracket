import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

const path = process.argv[2] || '/Users/torinnayak/Downloads/2026_MS_draw (1).pdf';
const data = new Uint8Array(fs.readFileSync(path));
const pdf = await getDocument({ data, useSystemFonts: true }).promise;
console.log('pages:', pdf.numPages);

for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const content = await page.getTextContent();
  const items = content.items
    .filter((it) => 'str' in it && it.str.trim())
    .map((it) => ({
      x: Math.round(it.transform[4]),
      y: Math.round(it.transform[5]),
      t: it.str.trim(),
    }));
  console.log('\n=== PAGE', i, '===');
  for (const it of items) {
    console.log(`${it.x}\t${it.y}\t${it.t}`);
  }
}
