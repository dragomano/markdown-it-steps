export default function markdownSteps(md) {
  md.block.ruler.before('paragraph', 'steps', (state, startLine, endLine, silent) => {
    const startPos = state.bMarks[startLine] + state.tShift[startLine];
    const maxPos = state.eMarks[startLine];
    const lineText = state.src.slice(startPos, maxPos);

    if (!lineText.startsWith(':::steps')) return false;
    if (silent) return true;

    let nextLine = startLine + 1;
    let openBlocks = 1;
    let token;

    token = state.push('steps_open', 'div', 1);
    token.block = true;
    token.attrs = [['class', 'steps']];

    while (nextLine < endLine) {
      const nextStartPos = state.bMarks[nextLine] + state.tShift[nextLine];
      const nextMaxPos = state.eMarks[nextLine];
      const nextLineText = state.src.slice(nextStartPos, nextMaxPos);

      if (nextLineText.startsWith(':::')) {
        if (nextLineText === ':::') {
          openBlocks--;
          if (openBlocks === 0) break;
        } else {
          openBlocks++;
        }
      }

      nextLine++;
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