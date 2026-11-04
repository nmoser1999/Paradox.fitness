import { spawnSync } from 'node:child_process';

const npm = process.env.npm_execpath;
if (!npm) throw new Error('Run this through npm run build:audit.');

// Build the real public indexing policy for local Lighthouse verification.
// This does not modify .env, netlify.toml, or any deployed environment.
const env = {
  ...process.env,
  SITE_INDEXABLE: 'true',
  ENABLE_DESIGN_REVIEW: 'false',
  ASTRO_TELEMETRY_DISABLED: '1',
};
for (const script of ['build', 'check:site']) {
  const result = spawnSync(process.execPath, [npm, 'run', script], {
    env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(
  'Local audit build ready: public pages are indexable; confirmation and error pages remain noindex.',
);
