---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Markdown It Steps"
  text: "A VitePress Plugin"
  tagline: Define Your Steps 👣
---

:::steps
1. Install this plugin:

    ::: code-group
    ```sh [npm]
    npm install -D markdown-it-steps
    ```
    ```sh [pnpm]
    pnpm add -D markdown-it-steps
    ```
    ```sh [yarn]
    yarn add -D markdown-it-steps
    ```
    ```sh [bun]
    bun add -D markdown-it-steps
    ```
    :::
2. Update your vitepress `config.js`:

    ```js
    import { defineConfig } from 'vitepress'
    import markdownSteps from 'markdown-it-steps' // [!code ++]

    // https://vitepress.dev/reference/site-config
    export default defineConfig({
      title: "My Awesome Project",
      markdown: {
        config: (md) => {
          md.use(markdownSteps); // [!code ++]
        }
      },
    })
    ```
3. Update your `.vitepress/theme/index.js`:

    ```js
    // https://vitepress.dev/guide/custom-theme
    import DefaultTheme from 'vitepress/theme'
    import './style.css'
    import 'markdown-it-steps/style.css' // [!code ++]

    export default DefaultTheme
    ```
4. Define your steps:

    ```markdown
    :::steps
    1. Apple
        1. Banana
            1. Cherry
            2. Date
            3. Elderberry
        2. Fig
        3. Grape
    2. Honeydew
    3. Kiwi
    :::
    ```

5. See the result:

    :::steps
    1. Apple
        1. Banana
            1. Cherry
            2. Date
            3. Elderberry
        2. Fig
        3. Grape
    2. Honeydew
    3. Kiwi
    :::
:::