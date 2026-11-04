import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://www.pdoxfitness.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (url) => !/\/(thanks|404)\/?$/.test(url) })],
  vite: { plugins: [tailwindcss()] },
  image: { layout: 'constrained' },
  devToolbar: { enabled: false },
});
