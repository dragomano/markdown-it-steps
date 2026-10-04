# markdown-it-steps

Want to add pretty step-by-step guides in your VitePress site?

A markdown-it plugin for processing `:::steps ... :::` blocks in Markdown.

## Getting Started

Want to get started immediately? Check out the [quick start guide](https://dragomano.github.io/markdown-it-steps/).

## Usage

```md
:::steps
1. Do this.
2. Do that.
:::
```

Steps can start at any number with the `{start=N}` directive (combinable with an inline title):

```md
:::steps{start=5} Continue
1. Shows number 5.
:::
```

Numbering is rendered by CSS counters on the container, so the start value is exposed as the `--steps-start` custom property — the number of the first item, default `1`. The plugin emits that inline style only when the directive is present, which keeps the variable overridable from your own stylesheets.

## Known limitations

- A `:::` line on its own inside a raw HTML block (for example, between `<div>` and `</div>`) is still treated as the container's closing marker and truncates the block. markdown-it-container behaves the same way. Keep container markers out of raw HTML inside steps, or wrap them in fenced code blocks.

## Dark mode

Steps adapt to the site's [`color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme):

- VitePress (1.x and 2.x) works out of the box in both modes.
- If the site does not manage `color-scheme` at all, the stylesheet declares `color-scheme: light dark` on `<html>` with zero specificity: steps follow the OS preference, and any `color-scheme` declared by the site wins regardless of load order. On VitePress sites the plugin stays out of `color-scheme` entirely, because VitePress declares it itself.
- Sites that toggle a class on `<html>` instead are supported via `html.dark` and `html.light`.
- Browsers without `light-dark()` support (Chrome < 123, Firefox < 120, Safari < 17.5) render the light palette unless `html.dark` is set.

## Note

The package is ESM-only: it ships no CommonJS build. `require()` works in Node.js 20.19+; older CJS environments need a bundler or a dynamic `import()`.

markdown-it is declared as an optional peer dependency and won't be installed automatically: VitePress bundles its own copy, so nothing extra is needed there. When using the plugin with a standalone markdown-it installation, install markdown-it yourself (`npm install markdown-it`).
