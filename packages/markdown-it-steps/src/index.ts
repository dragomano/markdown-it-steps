import type MarkdownIt from 'markdown-it';

const STEPS_OPEN_RE = /^:::\s*steps(?:\s+(.*))?$/;
const CONTAINER_OPEN_RE = /^:::\s*\S+/;
const CONTAINER_CLOSE_RE = /^:::\s*$/;
const FENCE_OPEN_RE = /^([`~]{3,})/;

export type TitleTag = 'p' | 'div' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface MarkdownStepsOptions {
  containerClass?: string;
  titleTag?: TitleTag;
  titleClass?: string;
}

interface FenceState {
  char: string;
  length: number;
}

type StateBlock = Parameters<MarkdownIt['block']['tokenize']>[0];
type Token = ReturnType<StateBlock['push']>;
type RenderTokens = Parameters<MarkdownIt['renderer']['renderToken']>[0];
type RenderOptions = Parameters<MarkdownIt['renderer']['renderToken']>[2];
type RendererInstance = MarkdownIt['renderer'];

const ALLOWED_TITLE_TAGS = new Set<TitleTag>(['p', 'div', 'h2', 'h3', 'h4', 'h5', 'h6']);

function getLineText(state: StateBlock, line: number): string {
  const startPos = state.bMarks[line] + state.tShift[line];
  const maxPos = state.eMarks[line];

  return state.src.slice(startPos, maxPos).trimEnd();
}

function isTitleTag(value: unknown): value is TitleTag {
  return typeof value === 'string' && ALLOWED_TITLE_TAGS.has(value as TitleTag);
}

export default function markdownSteps(md: MarkdownIt, options: MarkdownStepsOptions = {}): void {
  const customContainerClass =
    typeof options.containerClass === 'string' && options.containerClass.trim().length > 0
      ? options.containerClass.trim()
      : '';
  const containerClass = customContainerClass
    ? Array.from(new Set(['steps', ...customContainerClass.split(/\s+/)])).join(' ')
    : 'steps';
  const titleClass =
    typeof options.titleClass === 'string' && options.titleClass.trim().length > 0
      ? options.titleClass.trim()
      : 'custom-title';
  const titleTag: TitleTag = isTitleTag(options.titleTag) ? options.titleTag : 'p';

  md.block.ruler.before('paragraph', 'steps', (state, startLine, endLine, silent) => {
    const lineText = getLineText(state, startLine);
    const stepsMatch = lineText.match(STEPS_OPEN_RE);

    if (!stepsMatch) return false;

    const title = stepsMatch[1]?.trim() ?? '';
    const hasTitle = title.length > 0;

    if (silent) return true;

    let nextLine = startLine + 1;
    let openBlocks = 1;
    let activeFence: FenceState | null = null;
    let token: Token;

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

  const renderToken = (
    tokens: RenderTokens,
    idx: number,
    renderOptions: RenderOptions,
    _env: unknown,
    self: RendererInstance,
  ): string => self.renderToken(tokens, idx, renderOptions);

  md.renderer.rules.steps_open = renderToken;
  md.renderer.rules.steps_close = renderToken;
  md.renderer.rules.steps_title_open = renderToken;
  md.renderer.rules.steps_title_close = renderToken;
}
