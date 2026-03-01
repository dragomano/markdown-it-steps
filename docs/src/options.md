# Options

Here you will find everything you need to know about the plugin's options.

Examples for `containerClass` and `titleClass` below use custom CSS from the docs theme.

```js
import { defineConfig } from 'vitepress'
import markdownSteps from 'markdown-it-steps'

export default defineConfig({
  markdown: {
    config: (md) => {
      md.use(markdownSteps, {
        containerClass: 'guide-steps',
        titleTag: 'h3',
        titleClass: 'guide-steps-title',
      })
    },
  },
})
```

## `containerClass`

Sets the class on the outer container element.  
Default: `'steps'`

### Code

```js
md.use(markdownSteps, { containerClass: 'guide-steps' })
```

```css
.guide-steps {
    border: 1px solid var(--vp-c-divider);
    border-radius: 14px;
    padding: 12px 16px 10px;
    background:
            radial-gradient(160% 70% at 0% 0%, color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent), transparent),
            linear-gradient(180deg, var(--vp-c-bg-soft), transparent 70%);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--vp-c-default-1) 14%, transparent);
}
```

### Example

<div class="steps guide-steps" style="--steps-start: 0">
  <p class="custom-title">Custom container class</p>
  <ol>
    <li>This block is rendered with a custom container class.</li>
    <li>Add your own CSS to style it differently.</li>
  </ol>
</div>

## `titleTag`

Sets the HTML tag used for the optional inline title in the opening marker.  
Default: `'p'`  
Allowed: `'p' | 'div' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'`

### Code

```js
md.use(markdownSteps, { titleTag: 'h3' })
```

```md
:::steps Installation
1. Install dependencies.
2. Run setup.
:::
```

### Example

<div class="steps" style="--steps-start: 0">
  <h3 class="custom-title">Installation</h3>
  <ol>
    <li>Install dependencies.</li>
    <li>Run setup.</li>
  </ol>
</div>

## `titleClass`

Sets the class on the title element rendered from the opening marker.  
Default: `'custom-title'`

### Code

```js
md.use(markdownSteps, { titleClass: 'guide-steps-title' })
```

```css
.guide-steps-title {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--vp-c-brand-1);
    background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 28%, transparent);
    border-radius: 999px;
    padding: 0.2rem 0.55rem;
    margin-bottom: 0.45rem;
}
```

### Example

<div class="steps guide-steps" style="--steps-start: 0">
  <p class="guide-steps-title">Styled title</p>
  <ol>
    <li>This title can be styled separately via <code>titleClass</code>.</li>
    <li>Keep content styles untouched.</li>
  </ol>
</div>
