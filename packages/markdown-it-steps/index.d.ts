declare module "markdown-it-steps" {
  // @ts-ignore
  import type MarkdownIt from "markdown-it";

  /**
   * markdown-it plugin for processing :::steps ... ::: blocks
   * @param md - Instance of markdown-it
   */
  export default function markdownSteps(md: MarkdownIt): void;
}
