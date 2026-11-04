import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const root = path.resolve('dist');
const base = process.env.PUBLIC_SITE_URL || 'https://www.pdoxfitness.com';
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? files(path.join(dir, entry.name))
          : [path.join(dir, entry.name)],
      ),
    )
  ).flat();
}
const all = await files(root);
const pages = all.filter(
  (file) =>
    file.endsWith('.html') && !file.includes(`${path.sep}design${path.sep}`),
);
const titles = new Set();
const indexable = process.env.SITE_INDEXABLE === 'true';
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const utility = ['thanks/index.html', '404.html'].includes(
    path.relative(root, file).split(path.sep).join('/'),
  );
  assert(
    html.includes(
      `name="robots" content="${indexable && !utility ? 'index,follow' : 'noindex,nofollow'}"`,
    ),
    `Incorrect indexing policy: ${file}`,
  );
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  assert(title && !titles.has(title), `Missing or duplicate title: ${file}`);
  titles.add(title);
  assert.equal(
    (html.match(/<h1[\s>]/g) || []).length,
    1,
    `Expected one H1: ${file}`,
  );
  assert(
    /name="description"/.test(html) && /rel="canonical"/.test(html),
    `Missing SEO metadata: ${file}`,
  );
  assert(!/href="(?:#|)"/.test(html), `Placeholder link: ${file}`);
  for (const match of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
    const raw = match[1].replace(/&amp;/g, '&');
    if (/^(mailto:|tel:|data:|https?:\/\/)/.test(raw)) continue;
    const relative = '/' + path.relative(root, file).split(path.sep).join('/');
    const url = new URL(raw, new URL(relative, base));
    const requested = path.join(root, decodeURIComponent(url.pathname));
    const target = url.pathname.endsWith('/')
      ? path.join(requested, 'index.html')
      : requested;
    assert(existsSync(target), `Broken local asset/link ${raw} in ${file}`);
  }
}
const contact = await readFile(
  path.join(root, 'contact-us-1', 'index.html'),
  'utf8',
);
assert(
  contact.includes('data-netlify="true"') &&
    contact.includes('name="form-name"') &&
    contact.includes('value="training-inquiry"'),
  'Netlify form is missing from generated HTML',
);
const thanks = await readFile(path.join(root, 'thanks', 'index.html'), 'utf8');
assert(thanks.includes('noindex'), 'Confirmation must remain noindex');
const homepage = await readFile(path.join(root, 'index.html'), 'utf8');
for (const id of ['palette-select', 'layout-select']) {
  const options = homepage.match(
    new RegExp(`<select[^>]*id="${id}"[^>]*>([\\s\\S]*?)<\\/select>`),
  )?.[1];
  assert.equal(
    (options?.match(/<option\b/g) || []).length,
    8,
    `Expected eight live design choices in ${id}`,
  );
}
const clientSource = (
  await Promise.all(
    all
      .filter(
        (file) =>
          file.endsWith('.js') && file.includes(`${path.sep}_astro${path.sep}`),
      )
      .map((file) => readFile(file, 'utf8')),
  )
).join('\n');
assert(
  clientSource.includes('palette-select') &&
    clientSource.includes('layout-select'),
  'Live design controller was not bundled',
);
const headers = await readFile(path.join(root, '_headers'), 'utf8');
const robots = await readFile(path.join(root, 'robots.txt'), 'utf8');
assert(
  homepage.includes(
    `content="${indexable ? 'index,follow' : 'noindex,nofollow'}"`,
  ),
  'Public indexing does not match the build context',
);
assert(
  indexable ? robots.includes('Allow: /') : robots.includes('Disallow: /\n'),
  'Robots policy does not match the build context',
);
const globalHeaders = headers.split('\n/_astro/*')[0];
assert.equal(
  globalHeaders.includes('X-Robots-Tag: noindex'),
  !indexable,
  'Global response header does not match the indexing policy',
);
assert.equal(
  existsSync(path.join(root, 'design', 'index.html')),
  process.env.ENABLE_DESIGN_REVIEW === 'true',
  'Design explorer leaked into an ordinary build, or is missing from a review build',
);
assert(
  headers.includes('Content-Security-Policy:') &&
    !headers.includes("'unsafe-inline'"),
  'Security header policy is missing or overly permissive',
);
let scriptBytes = 0;
let styleBytes = 0;
for (const file of all.filter((file) =>
  file.includes(`${path.sep}_astro${path.sep}`),
)) {
  if (file.endsWith('.js'))
    scriptBytes += gzipSync(await readFile(file)).byteLength;
  if (file.endsWith('.css'))
    styleBytes += gzipSync(await readFile(file)).byteLength;
}
assert(
  scriptBytes <= 20 * 1024,
  `First-party scripts exceed 20 KB gzip: ${scriptBytes}`,
);
assert(styleBytes <= 30 * 1024, `Styles exceed 30 KB gzip: ${styleBytes}`);
console.log(
  `${pages.length} pages: metadata, local links, Netlify form, confirmation indexing, and asset budgets passed.`,
);
console.log(
  `All first-party bundles combined: JS ${(scriptBytes / 1024).toFixed(1)} KB gzip, CSS ${(styleBytes / 1024).toFixed(1)} KB gzip.`,
);
