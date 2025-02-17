import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import markdownSteps from 'markdown-it-steps/index.js'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Markdown It Steps",
  description: "A VitePress Plugin",
  base: '/markdown-it-steps/',
  srcDir: './src',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [
      { icon: 'github', link: 'https://github.com/dragomano/markdown-it-steps' }
    ]
  },
  markdown: {
    config: (md) => {
      md.use(groupIconMdPlugin);
      md.use(markdownSteps);
    }
  },
  vite: {
    plugins: [
      groupIconVitePlugin()
    ],
  }
})
