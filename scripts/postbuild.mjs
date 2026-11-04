import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
if (
  process.env.PUBLIC_GA_MEASUREMENT_ID &&
  !/^G-[A-Z0-9]+$/.test(process.env.PUBLIC_GA_MEASUREMENT_ID)
)
  throw new Error(
    'PUBLIC_GA_MEASUREMENT_ID must be a valid G- measurement ID or empty.',
  );
if (
  process.env.PUBLIC_CLARITY_PROJECT_ID &&
  !/^[a-z0-9]{5,20}$/.test(process.env.PUBLIC_CLARITY_PROJECT_ID)
)
  throw new Error(
    'PUBLIC_CLARITY_PROJECT_ID must be a valid Clarity project ID or empty.',
  );
if (process.env.ENABLE_DESIGN_REVIEW === 'true') {
  await mkdir(path.join(root, 'design', 'assets'), { recursive: true });
  for (const file of [
    'design-explorer.css',
    'design-explorer.js',
    'REBUILD_PROPOSAL.md',
  ])
    await cp(file, path.join(root, 'design', file));
  await cp('design-directions.html', path.join(root, 'design', 'index.html'));
  await cp(
    'assets/unnamed.jpg',
    path.join(root, 'design', 'assets', 'unnamed.jpg'),
  );
}

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? files(path.join(dir, entry.name))
        : [path.join(dir, entry.name)],
    ),
  );
  return nested.flat();
}
const scriptHashes = new Set();
const styleHashes = new Set();
for (const file of await files(root)) {
  if (!file.endsWith('.html')) continue;
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(
    /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g,
  ))
    if (match[1].trim())
      scriptHashes.add(
        `'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`,
      );
  for (const match of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g))
    if (match[1].trim())
      styleHashes.add(
        `'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`,
      );
}
const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...scriptHashes].join(' ')} https://www.googletagmanager.com https://www.google-analytics.com https://*.clarity.ms`,
  `style-src 'self' ${[...styleHashes].join(' ')}`,
  "img-src 'self' data: https://*.google-analytics.com https://*.clarity.ms https://c.bing.com",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.clarity.ms https://c.bing.com",
  "font-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');
const staging = process.env.SITE_INDEXABLE !== 'true';
await writeFile(
  path.join(root, '_headers'),
  `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Strict-Transport-Security: max-age=31536000\n  Content-Security-Policy: ${csp}\n${staging ? '  X-Robots-Tag: noindex, nofollow\n' : ''}\n/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/design/*\n  X-Robots-Tag: noindex, nofollow\n`,
);
console.log(
  `Generated security headers; indexing ${staging ? 'disabled' : 'enabled'}; design review ${process.env.ENABLE_DESIGN_REVIEW === 'true' ? 'included' : 'excluded'}.`,
);
