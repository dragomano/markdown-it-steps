import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

// These tests pin the cascade invariants established for the theme switching
// in TODO #10. Full color-scheme/light-dark() behavior needs a real browser;
// here we make sure the stylesheet keeps the structure that makes it work.

const PALETTE = [
  '--steps-color-white',
  '--steps-color-gray-one',
  '--steps-color-gray-two',
  '--steps-color-hairline-light',
];

const css = postcss.parse(
  readFileSync(new URL('../src/style.css', import.meta.url), 'utf8'),
);

function collect(node, contexts = [], out = []) {
  for (const child of node.nodes ?? []) {
    if (child.type === 'rule') {
      const decls = {};
      for (const decl of child.nodes ?? []) {
        if (decl.type === 'decl') {
          decls[decl.prop] = decl.value.replace(/\s+/g, ' ').trim();
        }
      }
      // Whitespace is normalized so the assertions pin structure, not the
      // formatting Biome happens to print.
      out.push({
        selector: child.selector.replace(/\s+/g, ' ').trim(),
        decls,
        contexts: [...contexts],
      });
    } else if (child.type === 'atrule') {
      collect(
        child,
        [
          ...contexts,
          `@${child.name} ${child.params}`.replace(/\s+/g, ' ').trim(),
        ],
        out,
      );
    }
  }
  return out;
}

const rules = collect(css);
const first = (selector) =>
  rules.filter((rule) => rule.selector === selector)[0];
const inSupports = (rule) =>
  rule.contexts.some((context) => context.startsWith('@supports'));

const root = first(':root');
const dark = first('html.dark');
const light = first('html.light');
const adaptiveRoot = rules
  .filter((rule) => rule.selector === ':root' && inSupports(rule))
  .at(-1);

// light-dark(A, B) -> [A, B], comma-aware for values like hsl(224, 10%, 10%)
function splitLightDark(value) {
  const start = value.indexOf('light-dark(') + 'light-dark('.length;
  const args = [];
  let depth = 1;
  let current = '';
  for (let i = start; i < value.length; i++) {
    const ch = value[i];
    if (ch === '(') depth++;
    if (ch === ')') {
      depth--;
      if (depth === 0) {
        args.push(current.trim());
        break;
      }
    }
    if (ch === ',' && depth === 1) {
      args.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  return args;
}

function resolveVar(decls, value) {
  const match = /^var\((--[\w-]+)\)$/.exec(value.trim());
  return match ? resolveVar(decls, decls[match[1]]) : value.trim();
}

describe('style.css theming', () => {
  it('keeps the plain palettes in sync with the light-dark() pairs', () => {
    for (const prop of PALETTE) {
      const [lightValue, darkValue] = splitLightDark(adaptiveRoot.decls[prop]);
      expect(resolveVar(root.decls, root.decls[prop]), `:root ${prop}`).toBe(
        lightValue,
      );
      expect(
        resolveVar(dark.decls, dark.decls[prop]),
        `html.dark ${prop}`,
      ).toBe(darkValue);
    }
  });

  it('gates every light-dark() declaration behind @supports', () => {
    // Inside var() an unsupported light-dark() would invalidate the whole
    // declaration, so the adaptive values must never leak outside the gate.
    const declarations = rules.flatMap((rule) =>
      Object.entries(rule.decls).map(([prop, value]) => ({
        selector: rule.selector,
        contexts: rule.contexts,
        prop,
        value,
      })),
    );
    const adaptive = declarations.filter((d) =>
      d.value.includes('light-dark('),
    );
    expect(adaptive.length).toBeGreaterThan(0);
    for (const d of adaptive) {
      expect(
        d.contexts.some((c) => c.startsWith('@supports')),
        `${d.prop} in ${d.selector}`,
      ).toBe(true);
    }
  });

  it('defaults to the OS preference only for pages without theme management', () => {
    const rule = rules.find((r) =>
      r.selector.startsWith(':where( html:not( :has('),
    );
    expect(rule.decls['color-scheme']).toBe('light dark');
    // The whole selector is wrapped in :where(), so the default has zero
    // specificity and any color-scheme the site declares wins.
    expect(
      rule.selector.startsWith(':where(') && rule.selector.endsWith(')'),
    ).toBe(true);
    // VitePress marks its pages differently in dev (client script URL) and
    // build (generator meta); both markers must stay in the exclusion.
    expect(rule.selector).toContain(
      'meta[name="generator"][content^="VitePress"]',
    );
    expect(rule.selector).toContain('script[src*="vitepress"]');
  });

  it('supports explicit light and dark classes', () => {
    expect(light.decls['color-scheme']).toBe('light');
    expect(dark.decls['color-scheme']).toBe('dark');
    // The dark block carries plain values for browsers without light-dark().
    for (const prop of PALETTE) {
      expect(dark.decls[prop], `html.dark ${prop}`).toBeDefined();
    }
  });

  it('defines every palette variable used by the component in both themes', () => {
    const used = new Set();
    for (const rule of rules.filter((r) => r.selector.startsWith('.steps'))) {
      for (const value of Object.values(rule.decls)) {
        for (const match of value.matchAll(/var\((--steps-color-[\w-]+)\)/g))
          used.add(match[1]);
      }
    }
    expect(used.size).toBeGreaterThan(0);
    for (const prop of used) {
      expect(root.decls[prop], `:root ${prop}`).toBeDefined();
      expect(adaptiveRoot.decls[prop], `light-dark ${prop}`).toBeDefined();
      expect(dark.decls[prop], `html.dark ${prop}`).toBeDefined();
    }
  });

  it('treats --steps-start as the number of the first item', () => {
    expect(root.decls['--steps-start']).toBe('1');
    expect(first('.steps ol').decls['counter-reset']).toBe(
      'steps-counter var(--steps-start)',
    );
    expect(first('.steps ol > li').decls['counter-increment']).toBe(
      'steps-counter',
    );
    // The first item must render the reset value as is, otherwise the first
    // bullet would show --steps-start + 1.
    expect(first('.steps ol > li:first-child').decls['counter-increment']).toBe(
      'none',
    );
  });

  it('does not set the palette inside prefers-color-scheme media queries', () => {
    // Media queries cannot tell VitePress light mode from a theme-less page,
    // which is why the fallback goes through color-scheme instead (TODO #10).
    const offenders = rules
      .filter((rule) =>
        rule.contexts.some((c) => c.includes('prefers-color-scheme')),
      )
      .flatMap((rule) =>
        Object.keys(rule.decls).filter((prop) =>
          prop.startsWith('--steps-color'),
        ),
      );
    expect(offenders).toEqual([]);
  });
});
