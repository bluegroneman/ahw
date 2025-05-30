// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import netlify from '@astrojs/netlify';

import svelte from '@astrojs/svelte';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://almosthomewyoming.org',
  integrations: [mdx(), sitemap(), svelte(), react()],
  adapter: netlify(),
  image:{
    domains: ["pub-14b6e6c1e28d49cbb9491101304b9098.r2.dev", "*.r2.dev", "cloudflarestorage.com"]
  },
  vite: {
    plugins: [tailwindcss()]
  }
});