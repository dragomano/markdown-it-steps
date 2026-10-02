# markdown-it-steps

Want to add pretty step-by-step guides in your VitePress site?

A markdown-it plugin for processing `:::steps ... :::` blocks in Markdown.

## Getting Started

Want to get started immediately? Check out the [quick start guide](https://dragomano.github.io/markdown-it-steps/).

## Note

The package is ESM-only: it ships no CommonJS build. `require()` works in Node.js 20.19+; older CJS environments need a bundler or a dynamic `import()`.

markdown-it is declared as an optional peer dependency and won't be installed automatically: VitePress bundles its own copy, so nothing extra is needed there. When using the plugin with a standalone markdown-it installation, install markdown-it yourself (`npm install markdown-it`).
