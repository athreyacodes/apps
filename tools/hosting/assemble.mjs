import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const out = join(root, 'dist/hosting');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const apps = [
  { name: 'shell', dest: '.' },
  { name: 'weather', dest: 'weather' },
  { name: 'markets', dest: 'markets' },
  { name: 'dashboard', dest: 'dashboard' },
];

for (const app of apps) {
  const src = join(root, 'dist/apps', app.name, 'browser');
  if (!existsSync(src)) {
    throw new Error(`Missing ${src}. Build ${app.name} before assembling hosting.`);
  }
  const dest = join(out, app.dest);
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
}

console.log(`Assembled ${out}`);
