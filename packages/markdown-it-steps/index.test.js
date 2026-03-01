import MarkdownIt from 'markdown-it';
import { describe, expect, it } from 'vitest';
import markdownSteps from './index.js';

function render(source) {
  return new MarkdownIt().use(markdownSteps).render(source);
}

describe('markdown-it-steps', () => {
  it('renders a basic steps container', () => {
    const source = ':::steps\n1. First\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
    );
  });

  it('renders a title when provided on the opening line', () => {
    const source = ':::steps Getting started\n1. First\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<p class="custom-title">\nGetting started</p>\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
    );
  });

  it('accepts space-separated opening marker', () => {
    const source = ':::   steps\n1. First\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
    );
  });

  it('falls back to regular markdown when block is not closed', () => {
    const source = ':::steps\n1. First\n\ntext\n';

    expect(render(source)).toBe(
      '<p>:::steps</p>\n<ol>\n<li>First</li>\n</ol>\n<p>text</p>\n',
    );
  });

  it('does not break fenced code with ::: markers', () => {
    const source = ':::steps\n```md\n:::tip\nhello\n:::\n```\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<pre><code class="language-md">:::tip\nhello\n:::\n</code></pre>\n</div>\n',
    );
  });

  it('ignores ::: markers inside fenced code when searching for container close', () => {
    const source = ':::steps\n```md\n:::tip\nhello\n```\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<pre><code class="language-md">:::tip\nhello\n</code></pre>\n</div>\n',
    );
  });

  it('supports balanced nested :::container markers inside steps content', () => {
    const source = ':::steps\n:::note\ninner\n:::\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<p>:::note\ninner\n:::</p>\n</div>\n',
    );
  });

  it('keeps nested :::container markers inside fences from affecting close detection', () => {
    const source = ':::steps\n```md\n:::note\ninner\n:::\n```\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<pre><code class="language-md">:::note\ninner\n:::\n</code></pre>\n</div>\n',
    );
  });
});
