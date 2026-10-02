# Standalone example

Renders `input.md` with plain [markdown-it](https://github.com/markdown-it/markdown-it) plus `markdown-it-steps` — no VitePress involved — into a static `index.html`.

## Run

From the repository root:

```sh
pnpm install
pnpm --filter markdown-it-steps build
pnpm --filter markdown-it-steps-example render
```

Then open `example/index.html` in a browser — no server needed. `index.html` is generated output: re-run the render after changing `input.md`.

## Theming

The page manages no theme of its own, so the plugin's `color-scheme: light dark` default applies: the page canvas and the step bullets follow the OS setting. Switch your system theme, or emulate `prefers-color-scheme` in the browser devtools (Rendering → Emulate CSS media feature), to see both variants.
