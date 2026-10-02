# markdown-it-steps

Want to add pretty step-by-step guides in your VitePress site?

A markdown-it plugin for processing `:::steps ... :::` blocks in Markdown.

## Getting Started

Want to get started immediately? Check out the [quick start guide](https://dragomano.github.io/markdown-it-steps/).

## Dark mode

Steps adapt to the site's [`color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme):

- VitePress (1.x and 2.x) works out of the box in both modes.
- If the site does not manage `color-scheme` at all, the stylesheet declares `color-scheme: light dark` on `<html>` with zero specificity: steps follow the OS preference, and any `color-scheme` declared by the site wins regardless of load order. On VitePress sites the plugin stays out of `color-scheme` entirely, because VitePress declares it itself.
- Sites that toggle a class on `<html>` instead are supported via `html.dark` and `html.light`.
- Browsers without `light-dark()` support (Chrome < 123, Firefox < 120, Safari < 17.5) render the light palette unless `html.dark` is set.

## Note

The package is ESM-only: it ships no CommonJS build. `require()` works in Node.js 20.19+; older CJS environments need a bundler or a dynamic `import()`.

markdown-it is declared as an optional peer dependency and won't be installed automatically: VitePress bundles its own copy, so nothing extra is needed there. When using the plugin with a standalone markdown-it installation, install markdown-it yourself (`npm install markdown-it`).
