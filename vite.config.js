import { defineConfig } from 'vite';
import { blocks } from './src/page.js';

// Expands <!-- @name --> placeholders in index.html with markup from src/page.js,
// so the deployed page stays fully static.
const page = {
  name: 'page-blocks',
  transformIndexHtml: (html) => html.replace(/<!-- @(\w+) -->/g, (m, k) => (blocks[k] ? blocks[k]() : m)),
};

export default defineConfig({
  base: '/undertale-concert-preparation/',
  plugins: [page],
});
