// @types/markdown-it-container is written against a different
// @types/markdown-it than the one VuePress's Markdown type comes from, and
// the two don't line up. The plugin needs no more than this.
declare module "markdown-it-container" {
  import type { PluginWithParams } from "markdown-it";

  const container: PluginWithParams;
  export default container;
}
