import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const url = process.env.TAX_API_URL;
const token = process.env.TAX_API_TOKEN || '';
const outputPath = new URL('../src/assets/data/tax-config.json', import.meta.url).pathname;

if (!url) {
  console.error('Missing TAX_API_URL environment variable.');
  process.exit(1);
}

const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

const response = await fetch(url, { headers });
if (!response.ok) {
  console.error(`Failed to fetch tax data: ${response.status} ${response.statusText}`);
  process.exit(1);
}

const data = await response.json();
if (!data.lastUpdated) {
  const isoDate = new Date().toISOString().slice(0, 10);
  data.lastUpdated = isoDate;
}

const nextContent = `${JSON.stringify(data, null, 2)}\n`;

let prevContent = '';
try {
  prevContent = await readFile(outputPath, 'utf8');
} catch {
  prevContent = '';
}

const hash = createHash('sha256').update(nextContent).digest('hex');
const prevHash = createHash('sha256').update(prevContent).digest('hex');

const changed = hash !== prevHash;
if (changed) {
  await writeFile(outputPath, nextContent, 'utf8');
  console.log('Tax config updated.');
} else {
  console.log('Tax config unchanged.');
}

if (process.env.GITHUB_OUTPUT) {
  await writeFile(process.env.GITHUB_OUTPUT, `changed=${changed}\n`, { flag: 'a' });
}
