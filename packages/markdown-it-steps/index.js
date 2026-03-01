const STEPS_OPEN_RE = /^:::\s*steps(?:\s+(.*))?$/;
const CONTAINER_OPEN_RE = /^:::\s*\S+/;
const CONTAINER_CLOSE_RE = /^:::\s*$/;
const FENCE_OPEN_RE = /^([`~]{3,})/;
const ALLOWED_TITLE_TAGS = new Set(['p', 'div', 'h2', 'h3', 'h4', 'h5', 'h6']);

/**
 * @typedef {'p' | 'div' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'} TitleTag
 *
 * @typedef {Object} MarkdownStepsOptions
 * @property {string} [containerClass='steps'] Class name for the outer steps' container.
 * @property {TitleTag} [titleTag='p'] HTML tag used for the optional title.
 * @property {string} [titleClass='custom-title'] Class name for the optional title.
 */

function getLineText(state, line) {
  const startPos = state.bMarks[line] + state.tShift[line];
  const maxPos = state.eMarks[line];
  return state.src.slice(startPos, maxPos).trimEnd();
}

/**
 * @param {import('markdown-it').default} md
 * @param {MarkdownStepsOptions} [options]
 */
export default function markdownSteps(md, options = {}) {
  const customContainerClass = typeof options.containerClass === 'string' && options.containerClass.trim().length > 0
    ? options.containerClass.trim()
    : '';
  const containerClass = customContainerClass
    ? Array.from(new Set(['steps', ...customContainerClass.split(/\s+/)])).join(' ')
    : 'steps';
  const titleClass = typeof options.titleClass === 'string' && options.titleClass.trim().length > 0
    ? options.titleClass.trim()
    : 'custom-title';
  const titleTag = typeof options.titleTag === 'string' && ALLOWED_TITLE_TAGS.has(options.titleTag)
    ? options.titleTag
    : 'p';

  md.block.ruler.before('paragraph', 'steps', (state, startLine, endLine, silent) => {
    const lineText = getLineText(state, startLine);
    const stepsMatch = lineText.match(STEPS_OPEN_RE);

    if (!stepsMatch) return false;

    const title = stepsMatch[1]?.trim() ?? '';
    const hasTitle = title.length > 0;

    if (silent) return true;

    let nextLine = startLine + 1;
    let openBlocks = 1;
    let activeFence = null;
    let token;

    while (nextLine < endLine) {
      const nextLineText = getLineText(state, nextLine);
      const fenceMatch = nextLineText.match(FENCE_OPEN_RE);

      if (activeFence) {
        if (fenceMatch && fenceMatch[1][0] === activeFence.char && fenceMatch[1].length >= activeFence.length) {
          activeFence = null;
        }
        nextLine++;
        continue;
      }

      if (fenceMatch) {
        activeFence = { char: fenceMatch[1][0], length: fenceMatch[1].length };
        nextLine++;
        continue;
      }

      if (nextLineText.startsWith(':::')) {
        if (CONTAINER_CLOSE_RE.test(nextLineText)) {
          openBlocks--;
          if (openBlocks === 0) break;
        } else if (CONTAINER_OPEN_RE.test(nextLineText)) {
          openBlocks++;
        }
      }

      nextLine++;
    }

    if (openBlocks !== 0) return false;

    token = state.push('steps_open', 'div', 1);
    token.block = true;
    token.attrs = [['class', containerClass], ['style', '--steps-start: 0']];

    if (hasTitle) {
      token = state.push('steps_title_open', titleTag, 1);
      token.block = true;
      if (titleClass) {
        token.attrs = [['class', titleClass]];
      }
      token = state.push('text', '', 0);
      token.content = title;
      token = state.push('steps_title_close', titleTag, -1);
      token.block = true;
    }

    state.md.block.tokenize(state, startLine + 1, nextLine);

    token = state.push('steps_close', 'div', -1);
    token.block = true;

    state.line = nextLine + 1;

    return true;
  });

  md.renderer.rules.steps_open = (tokens, idx, renderOptions, env, self) => self.renderToken(tokens, idx, renderOptions);
  md.renderer.rules.steps_close = (tokens, idx, renderOptions, env, self) => self.renderToken(tokens, idx, renderOptions);
  md.renderer.rules.steps_title_open = (tokens, idx, renderOptions, env, self) => self.renderToken(tokens, idx, renderOptions);
  md.renderer.rules.steps_title_close = (tokens, idx, renderOptions, env, self) => self.renderToken(tokens, idx, renderOptions);
}
