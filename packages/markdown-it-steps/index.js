const STEPS_OPEN_RE = /^:::\s*steps(?:\s+(.*))?$/;
const CONTAINER_OPEN_RE = /^:::\s*\S+/;
const CONTAINER_CLOSE_RE = /^:::\s*$/;
const FENCE_OPEN_RE = /^([`~]{3,})/;

function getLineText(state, line) {
  const startPos = state.bMarks[line] + state.tShift[line];
  const maxPos = state.eMarks[line];
  return state.src.slice(startPos, maxPos).trimEnd();
}

export default function markdownSteps(md) {
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
    token.attrs = [['class', 'steps']];

    if (hasTitle) {
      token = state.push('paragraph_open', 'p', 1);
      token.attrs = [['class', 'custom-title']];
      token = state.push('text', '', 0);
      token.content = title;
      token = state.push('paragraph_close', 'p', -1);
    }

    state.md.block.tokenize(state, startLine + 1, nextLine);

    token = state.push('steps_close', 'div', -1);
    token.block = true;

    state.line = nextLine + 1;

    return true;
  });

  md.renderer.rules.steps_open = () => '<div class="steps">\n';
  md.renderer.rules.steps_close = () => '</div>\n';
}
