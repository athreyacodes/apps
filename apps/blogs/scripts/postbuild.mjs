import { copyFile, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspace = resolve(appRoot, '../..');
const browser = resolve(workspace, 'dist/apps/blogs/browser');
const preview = process.env.PREVIEW === '1';

/**
 * Every route is prerendered and blogs is not behind an SPA rewrite, so the
 * client-render fallback is unreachable. Dropping it avoids shipping an empty
 * page that could be indexed as a duplicate of the listing.
 */
await rm(resolve(browser, 'index.csr.html'), { force: true });
console.log('postbuild: removed index.csr.html');

const notFound = ['404.html', '404/index.html']
  .map((path) => resolve(browser, path))
  .find((path) => existsSync(path));

if (notFound && notFound !== resolve(browser, '404.html')) {
  await copyFile(notFound, resolve(browser, '404.html'));
  console.log('postbuild: copied 404.html for Firebase');
}

if (preview) {
  await writeFile(resolve(browser, 'robots.txt'), 'User-agent: *\nDisallow: /\n');

  for (const file of await htmlFiles(browser)) {
    const html = await readFile(file, 'utf8');
    const noindex = '<meta name="robots" content="noindex, nofollow">';
    const patched = html.includes('name="robots"')
      ? html.replace(/<meta name="robots" content="[^"]*">/, noindex)
      : html.replace('</head>', `  ${noindex}\n</head>`);
    await writeFile(file, patched);
  }

  console.log('postbuild: preview build is noindex');
}

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await htmlFiles(path)));
    } else if (entry.name.endsWith('.html')) {
      files.push(path);
    }
  }

  return files;
}
