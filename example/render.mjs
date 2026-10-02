import { existsSync } from 'node:fs';
import { readFileSync, writeFileSync } from 'node:fs';

const pluginDist = new URL('../packages/markdown-it-steps/dist/index.js', import.meta.url);
if (!existsSync(pluginDist)) {
  console.error('The plugin is not built yet. Run: pnpm --filter markdown-it-steps build');
  process.exit(1);
}

const { default: MarkdownIt } = await import('markdown-it');
const { default: markdownSteps } = await import('markdown-it-steps');

const markdown = readFileSync(new URL('./input.md', import.meta.url), 'utf8');
const html = new MarkdownIt({ html: true }).use(markdownSteps).render(markdown);

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>markdown-it-steps — standalone example</title>
<link rel="stylesheet" href="../packages/markdown-it-steps/dist/style.css">
<style>
  /* The page manages no theme of its own: the UA canvas and the plugin's
     color-scheme default follow the OS preference in both light and dark. */
  :root { color-scheme: light dark; }
  body {
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    line-height: 1.6;
    max-width: 42rem;
    margin: 0 auto;
    padding: 2rem 1.25rem 4rem;
  }
</style>
</head>
<body>
${html}
</body>
</html>
`;

writeFileSync(new URL('./index.html', import.meta.url), page);
console.log('Rendered example/index.html');
