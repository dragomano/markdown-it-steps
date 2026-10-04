import type { MarkdownIt, StateBlock, Token } from 'markdown-it';

const STEPS_OPEN_RE = /^:::\s*steps(?:\s*(?:\{start=(-?\d+)\})?(?:\s+(.*))?)?$/;
const CONTAINER_MARKER_RE = /^(:{3,})(.*)$/;
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

interface ContainerMarker {
  length: number;
  closes: boolean;
}

const ALLOWED_TITLE_TAGS = new Set<TitleTag>([
  'p',
  'div',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
]);

function getLineText(state: StateBlock, line: number): string {
  const startPos = state.bMarks[line] + state.tShift[line];
  const maxPos = state.eMarks[line];

  return state.src.slice(startPos, maxPos).trimEnd();
}

function matchContainerMarker(text: string): ContainerMarker | null {
  const match = text.match(CONTAINER_MARKER_RE);

  if (!match) return null;

  const tail = match[2].trim();

  if (tail.startsWith(':')) return null;

  return { length: match[1].length, closes: tail === '' };
}

function isTitleTag(value: unknown): value is TitleTag {
  return typeof value === 'string' && ALLOWED_TITLE_TAGS.has(value as TitleTag);
}

export default function markdownSteps(
  md: MarkdownIt,
  options: MarkdownStepsOptions = {},
): void {
  const customContainerClass =
    typeof options.containerClass === 'string' &&
    options.containerClass.trim().length > 0
      ? options.containerClass.trim()
      : '';
  const containerClass = customContainerClass
    ? Array.from(new Set(['steps', ...customContainerClass.split(/\s+/)])).join(
        ' ',
      )
    : 'steps';
  const titleClass =
    typeof options.titleClass === 'string' &&
    options.titleClass.trim().length > 0
      ? options.titleClass.trim()
      : 'custom-title';
  let titleTag: TitleTag = 'p';

  if (options.titleTag !== undefined) {
    if (isTitleTag(options.titleTag)) {
      titleTag = options.titleTag;
    } else {
      // The warning fires once per .use() call, not per container, so a broken
      // option cannot flood the build output.
      console.warn(
        `[markdown-it-steps] Invalid titleTag ${JSON.stringify(options.titleTag)}, falling back to "p". Allowed: ${Array.from(ALLOWED_TITLE_TAGS).join(', ')}.`,
      );
    }
  }

  const stepsRule = (
    state: StateBlock,
    startLine: number,
    endLine: number,
    silent: boolean,
  ): boolean => {
    const lineText = getLineText(state, startLine);
    const stepsMatch = lineText.match(STEPS_OPEN_RE);

    if (!stepsMatch) return false;

    const title = stepsMatch[2]?.trim() ?? '';
    const hasTitle = title.length > 0;
    // The variable holds the number of the first item, so the directive value
    // goes into the style as is.
    const start =
      stepsMatch[1] !== undefined
        ? Number.parseInt(stepsMatch[1], 10)
        : undefined;

    if (silent) return true;

    let nextLine = startLine + 1;
    const openMarkers = [3];
    let activeFence: FenceState | null = null;
    let token: Token;

    while (nextLine < endLine) {
      const nextLineText = getLineText(state, nextLine);
      // The code rule runs before fence and container rules in markdown-it, so a
      // line indented 4+ relative to the block start is indented code content and
      // can be neither a fence nor a container marker.
      const isCodeIndent = state.sCount[nextLine] - state.blkIndent >= 4;
      const fenceMatch = isCodeIndent
        ? null
        : nextLineText.match(FENCE_OPEN_RE);

      if (activeFence) {
        if (
          fenceMatch &&
          fenceMatch[1][0] === activeFence.char &&
          fenceMatch[1].length >= activeFence.length
        ) {
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

      const marker = isCodeIndent ? null : matchContainerMarker(nextLineText);

      if (marker) {
        if (marker.closes) {
          if (marker.length === openMarkers[openMarkers.length - 1]) {
            openMarkers.pop();
            if (openMarkers.length === 0) break;
          }
        } else {
          openMarkers.push(marker.length);
        }
      }

      nextLine++;
    }

    if (openMarkers.length !== 0) return false;

    token = state.push('steps_open', 'div', 1);
    token.block = true;
    // Without the directive no style is emitted, so the value stays overridable
    // from CSS via --steps-start (the inline style would win the cascade).
    token.attrs = [['class', containerClass]];
    if (start !== undefined)
      token.attrs.push(['style', `--steps-start: ${start}`]);
    token.markup = ':::';
    token.info = title;
    token.map = [startLine, nextLine];

    if (hasTitle) {
      token = state.push('steps_title_open', titleTag, 1);
      token.block = true;
      token.attrs = [['class', titleClass]];
      // The core inline rule parses `content` into `children` after block
      // parsing, so the title must not be parsed here: doing both would
      // duplicate the resulting tokens.
      token = state.push('inline', '', 0);
      token.content = title;
      token.children = [];
      token.map = [startLine, startLine + 1];
      token = state.push('steps_title_close', titleTag, -1);
      token.block = true;
    }

    state.md.block.tokenize(state, startLine + 1, nextLine);

    token = state.push('steps_close', 'div', -1);
    token.block = true;
    // The closing marker must equal the bottom of the marker stack, which is
    // always 3 colons, so the markup is a constant.
    token.markup = ':::';

    state.line = nextLine + 1;

    return true;
  };

  md.block.ruler.before('paragraph', 'steps', stepsRule, {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  });
}
