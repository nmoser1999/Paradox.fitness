import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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
const headers = await readFile(path.join(root, '_headers'), 'utf8');
const globalHeaders = headers.split('\n/_astro/*')[0];
const csp = globalHeaders.match(/^\s+Content-Security-Policy: (.+)$/m)?.[1];
assert(csp, 'Global Content Security Policy is missing');
const directives = new Map(
  csp.split(';').map((directive) => {
    const [name, ...sources] = directive.trim().split(/\s+/);
    return [name, new Set(sources)];
  }),
);
for (const name of ['script-src', 'style-src']) {
  const sources = directives.get(name);
  assert(
    sources?.has("'self'") && !sources.has("'unsafe-inline'"),
    `${name} must allow first-party assets without blanket inline permission`,
  );
}
assert.equal(
  globalHeaders.match(/^\s+Permissions-Policy: (.+)$/m)?.[1],
  'camera=(), microphone=(), geolocation=()',
  'Keep the minimal browser feature policy; review new features for compatibility',
);
for (const file of all.filter((file) => file.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  for (const [, tag, attributes, content] of html.matchAll(
    /<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi,
  )) {
    if (
      !content.trim() ||
      (tag.toLowerCase() === 'script' && /\bsrc\s*=/i.test(attributes))
    )
      continue;
    const hash = `'sha256-${createHash('sha256').update(content).digest('base64')}'`;
    assert(
      directives.get(`${tag.toLowerCase()}-src`)?.has(hash),
      `Inline ${tag} is missing its CSP hash: ${file}`,
    );
  }
  assert(
    !/<[a-z][^>]*\s(?:style|on[a-z]+)\s*=/i.test(html),
    `Inline style/event attributes need external CSS or event listeners: ${file}`,
  );
}
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
  `${pages.length} pages: metadata, local links, Netlify form, confirmation indexing, CSP hash coverage, browser feature policy, and asset budgets passed.`,
);
console.log(
  `All first-party bundles combined: JS ${(scriptBytes / 1024).toFixed(1)} KB gzip, CSS ${(styleBytes / 1024).toFixed(1)} KB gzip.`,
);
