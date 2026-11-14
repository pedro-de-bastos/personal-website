// @ts-check
import { defineConfig } from 'astro/config';
import process from 'node:process';
const requestedBase = process.env.BASE_PATH?.trim() || '/';
const segments = requestedBase.split('/').filter(Boolean);
if (!requestedBase.startsWith('/') || requestedBase.startsWith('//') || /[?#\\]/.test(requestedBase) || segments.some(s => s === '.' || s === '..')) {
  throw new Error('BASE_PATH must be an absolute URL path.');
}
export default defineConfig({
  site: process.env.SITE_URL || 'https://pedro-de-bastos.github.io',
  base: segments.length ? `/${segments.join('/')}` : '/',
  output: 'static', trailingSlash: 'always',
});
