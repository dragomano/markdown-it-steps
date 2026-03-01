// @ts-ignore
import type MarkdownIt from 'markdown-it';

export type TitleTag = 'p' | 'div' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface MarkdownStepsOptions {
  containerClass?: string;
  titleTag?: TitleTag;
  titleClass?: string;
}

export default function markdownSteps(md: MarkdownIt, options?: MarkdownStepsOptions): void;
