import MarkdownIt from 'markdown-it';
import { describe, expect, it } from 'vitest';
import markdownSteps from '../src/index.ts';

function render(source, options) {
  return new MarkdownIt().use(markdownSteps, options).render(source);
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
      '<div class="steps">\n<p class="custom-title">Getting started</p>\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
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

  it('supports custom containerClass', () => {
    const source = ':::steps\n1. First\n:::\n';

    expect(render(source, { containerClass: 'guide-steps' })).toBe(
      '<div class="steps guide-steps">\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
    );
  });

  it('supports custom titleTag and titleClass', () => {
    const source = ':::steps Getting started\n1. First\n:::\n';

    expect(render(source, { titleTag: 'h3', titleClass: 'steps-heading' })).toBe(
      '<div class="steps">\n<h3 class="steps-heading">Getting started</h3>\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
    );
  });

  it('opens the container when :::steps immediately follows a paragraph line', () => {
    const source = 'para\n:::steps\n1. First\n:::\n';

    expect(render(source)).toBe(
      '<p>para</p>\n<div class="steps">\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
    );
  });

  it('opens the container when :::steps immediately follows a list item', () => {
    const source = '1. Step one\n:::steps\n2. A\n3. B\n:::\n';

    expect(render(source)).toBe(
      '<ol>\n<li>Step one</li>\n</ol>\n<div class="steps">\n<ol start="2">\n<li>A</li>\n<li>B</li>\n</ol>\n</div>\n',
    );
  });

  it('opens a nested container immediately after a list item inside steps', () => {
    const source = ':::steps\n1. Outer\n:::steps\n2. Inner\n:::\n3. After\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<ol>\n<li>Outer</li>\n</ol>\n<div class="steps">\n<ol start="2">\n<li>Inner</li>\n</ol>\n</div>\n<ol start="3">\n<li>After</li>\n</ol>\n</div>\n',
    );
  });
});

describe('title inline markup', () => {
  it('parses inline markup in the title', () => {
    const source = ':::steps **Install** `npm`\n1. First\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<p class="custom-title"><strong>Install</strong> <code>npm</code></p>\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
    );
  });

  it('renders links in the title', () => {
    const source = ':::steps [Docs](https://example.com)\n1. First\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<p class="custom-title"><a href="https://example.com">Docs</a></p>\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
    );
  });

  it('resolves reference links defined after the container', () => {
    const source = ':::steps [docs]\n1. First\n:::\n\n[docs]: https://example.com\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<p class="custom-title"><a href="https://example.com">docs</a></p>\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
    );
  });

  it('escapes HTML in the title like regular paragraphs', () => {
    const source = ':::steps <b>bold</b>\n1. First\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<p class="custom-title">&lt;b&gt;bold&lt;/b&gt;</p>\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
    );
  });

  it('keeps escaped emphasis literal in the title', () => {
    const source = ':::steps \\*not bold\\*\n1. First\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<p class="custom-title">*not bold*</p>\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
    );
  });
});

describe('marker line classification', () => {
  it('keeps a bare longer marker line from breaking the container', () => {
    const source = ':::steps\n1. First\n::::\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<ol>\n<li>First\n::::</li>\n</ol>\n</div>\n',
    );
  });

  it('supports VitePress-style nested containers with longer markers inside steps', () => {
    const source = ':::steps\n:::: info\n::: warning\nbe careful\n:::\n::::\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<p>:::: info\n::: warning\nbe careful\n:::\n::::</p>\n</div>\n',
    );
  });

  it('supports nested steps inside VitePress-style longer markers', () => {
    const source = ':::steps\n:::: tip\n:::steps\n2. Inner\n:::\n::::\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<p>:::: tip</p>\n<div class="steps">\n<ol start="2">\n<li>Inner</li>\n</ol>\n</div>\n<p>::::</p>\n</div>\n',
    );
  });

  it('treats a ::: line whose tail starts with a colon as regular content', () => {
    const source = ':::steps\n::: :::\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<p>::: :::</p>\n</div>\n',
    );
  });

  it('does not close a container whose opening marker is longer than the closing one', () => {
    const source = ':::steps\n:::: tip\ntext\n:::\n:::\n';

    expect(render(source)).toBe(
      '<p>:::steps\n:::: tip\ntext\n:::\n:::</p>\n',
    );
  });
});

describe('indented code blocks inside steps', () => {
  it('preserves ::: inside an indented code block', () => {
    const source = ':::steps\ntext\n\n    :::\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<p>text</p>\n<pre><code>:::\n</code></pre>\n</div>\n',
    );
  });

  it('preserves ::: after a list inside steps instead of closing the container', () => {
    const source = ':::steps\n1. First\n\n    :::\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<ol>\n<li>\n<p>First</p>\n<p>:::</p>\n</li>\n</ol>\n</div>\n',
    );
  });

  it('treats an indented fence inside steps as indented code, not as a fence', () => {
    const source = ':::steps\n    ```\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<pre><code>```\n</code></pre>\n</div>\n',
    );
  });

  it('preserves fences and ::: markers inside indented code', () => {
    const source = ':::steps\ntext\n\n    ```\n    :::\n    ```\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<p>text</p>\n<pre><code>```\n:::\n```\n</code></pre>\n</div>\n',
    );
  });

  it('searches for markers relative to the list indentation inside steps', () => {
    const source = '1. Step\n   :::steps\n   text\n\n       :::\n   :::\n';

    expect(render(source)).toBe(
      '<ol>\n<li>Step\n<div class="steps">\n<p>text</p>\n<pre><code>:::\n</code></pre>\n</div>\n</li>\n</ol>\n',
    );
  });
});

describe('start directive', () => {
  it('emits --steps-start from the {start=N} directive', () => {
    const source = ':::steps{start=5}\n1. First\n2. Second\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps" style="--steps-start: 5">\n<ol>\n<li>First</li>\n<li>Second</li>\n</ol>\n</div>\n',
    );
  });

  it('combines the directive with a title and accepts whitespace before it', () => {
    const source = ':::steps {start=5} Continue\n1. First\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps" style="--steps-start: 5">\n<p class="custom-title">Continue</p>\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
    );
  });

  it('supports zero and negative starts', () => {
    expect(render(':::steps{start=0}\n1. First\n:::\n')).toBe(
      '<div class="steps" style="--steps-start: 0">\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
    );
    expect(render(':::steps{start=-2}\n1. First\n:::\n')).toBe(
      '<div class="steps" style="--steps-start: -2">\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
    );
  });

  it('keeps the directive out of the title and token info', () => {
    const tokens = new MarkdownIt()
      .use(markdownSteps)
      .parse(':::steps{start=5} Continue\n1. First\n:::\n', {});

    expect(tokens[0].attrs).toEqual([['class', 'steps'], ['style', '--steps-start: 5']]);
    expect(tokens[0].info).toBe('Continue');
  });

  it('does not open a container when the directive is malformed', () => {
    const source = ':::steps{start=abc}\n1. First\n:::\n';

    expect(render(source)).toBe(
      '<p>:::steps{start=abc}</p>\n<ol>\n<li>First\n:::</li>\n</ol>\n',
    );
  });

  it('keeps brace tails that are not start directives as the title', () => {
    expect(render(':::steps {start}\n1. First\n:::\n')).toBe(
      '<div class="steps">\n<p class="custom-title">{start}</p>\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
    );
    expect(render(':::steps Note {start=5}\n1. First\n:::\n')).toBe(
      '<div class="steps">\n<p class="custom-title">Note {start=5}</p>\n<ol>\n<li>First</li>\n</ol>\n</div>\n',
    );
  });

  it('opens the container when the directive follows a list item', () => {
    const source = '1. Step one\n:::steps{start=5}\n2. A\n3. B\n:::\n';

    expect(render(source)).toBe(
      '<ol>\n<li>Step one</li>\n</ol>\n<div class="steps" style="--steps-start: 5">\n<ol start="2">\n<li>A</li>\n<li>B</li>\n</ol>\n</div>\n',
    );
  });

  it('supports the directive on a nested container', () => {
    const source = ':::steps\n1. Outer\n\n:::steps{start=4}\n1. Inner\n:::\n:::\n';

    expect(render(source)).toBe(
      '<div class="steps">\n<ol>\n<li>Outer</li>\n</ol>\n<div class="steps" style="--steps-start: 4">\n<ol>\n<li>Inner</li>\n</ol>\n</div>\n</div>\n',
    );
  });
});

describe('token metadata', () => {
  it('fills map, info and markup on the container tokens', () => {
    const tokens = new MarkdownIt()
      .use(markdownSteps)
      .parse(':::steps Getting started\n1. First\n:::\n', {});

    expect(tokens[0].type).toBe('steps_open');
    expect(tokens[0].markup).toBe(':::');
    expect(tokens[0].info).toBe('Getting started');
    expect(tokens[0].map).toEqual([0, 2]);

    const close = tokens.find((token) => token.type === 'steps_close');

    expect(close.markup).toBe(':::');
  });

  it('leaves info empty when the container has no title', () => {
    const tokens = new MarkdownIt()
      .use(markdownSteps)
      .parse(':::steps\n1. First\n:::\n', {});

    expect(tokens[0].type).toBe('steps_open');
    expect(tokens[0].info).toBe('');
    expect(tokens[0].map).toEqual([0, 2]);
  });
});
