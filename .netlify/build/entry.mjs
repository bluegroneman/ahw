import { r as renderers } from './chunks/_@astro-renderers_CCn0VMqZ.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_DcSoaX_9.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/about.astro.mjs');
const _page1 = () => import('./pages/contact.astro.mjs');
const _page2 = () => import('./pages/donate.astro.mjs');
const _page3 = () => import('./pages/rss.xml.astro.mjs');
const _page4 = () => import('./pages/stories.astro.mjs');
const _page5 = () => import('./pages/stories/_---slug_.astro.mjs');
const _page6 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["src/pages/about.astro", _page0],
    ["src/pages/contact.astro", _page1],
    ["src/pages/donate.astro", _page2],
    ["src/pages/rss.xml.js", _page3],
    ["src/pages/stories/index.astro", _page4],
    ["src/pages/stories/[...slug].astro", _page5],
    ["src/pages/index.astro", _page6]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "e7f538cc-a1f6-4597-a68d-5a009369b6e4"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
