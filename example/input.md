# Using markdown-it-steps outside VitePress

This page is rendered with plain [markdown-it](https://github.com/markdown-it/markdown-it) — no VitePress involved. The page does not manage a color scheme of its own, so the plugin's default `color-scheme: light dark` kicks in: switch your system between light and dark mode (or emulate `prefers-color-scheme` in the browser devtools) and the page along with the step bullets below will follow it.

:::steps **Wire up the plugin**
1. Install the packages:

    ```sh
    npm install markdown-it markdown-it-steps
    ```

2. Register the plugin and render some Markdown:

    ```js
    import MarkdownIt from 'markdown-it';
    import markdownSteps from 'markdown-it-steps';

    const md = new MarkdownIt().use(markdownSteps);
    const html = md.render(':::steps\n1. First step\n:::\n');
    ```

3. Load the stylesheet next to your own styles:

    ```html
    <link rel="stylesheet" href="markdown-it-steps/style.css">
    ```
:::
