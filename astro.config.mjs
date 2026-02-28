import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://mattwren88.github.io/tinybutmightykittenrescue',
  base: '/tinybutmightykittenrescue/',
  integrations: [mdx()],
  build: {
    format: 'directory',
  },
});
