import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

let commit = 'local';
try {
  commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
} catch {
  // git unavailable — still stamp a unique build id
}

const version = `${commit}-${Date.now()}`;
const payload = JSON.stringify({ version }, null, 2);

writeFileSync('public/version.json', payload);
console.log(`Wrote public/version.json (${version})`);
