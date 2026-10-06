import container from "markdown-it-container";
import type { Markdown } from "vuepress/markdown";

// The parts of a markdown-it token the containers read
interface ContainerToken {
  nesting: number;
  info: string;
}

// Parses `key=value`, `key="quoted value"` and `key='quoted value'` pairs from
// a container's info string, returning them along with any leftover text.
function parseAttrs(rest: string): {
  attrs: Record<string, string>;
  positional: string;
} {
  const attrs: Record<string, string> = {};
  const attrRegex = /(\w+)=((?:"[^"]*")|(?:'[^']*')|(?:[^\s]+))/g;
  let positional = rest;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(rest)) !== null) {
    let val = m[2];
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    attrs[m[1]] = val;
    positional = positional.replace(m[0], "");
  }
  return { attrs, positional: positional.trim() };
}

// ::: terminal [title] / ::: terminal title="..."
//
// Renders the fenced code block inside as a terminal window (Terminal.vue).
export function terminalContainer(md: Markdown): void {
  md.use(container, "terminal", {
    validate: (params: string) => /^terminal(?:\s+.*)?$/.test(params.trim()),
    render: (tokens: ContainerToken[], idx: number) => {
      const token = tokens[idx];
      if (token.nesting !== 1) return "\n</Terminal>\n";

      const rest = token.info.trim().replace(/^terminal\s*/, "");
      const { attrs, positional } = parseAttrs(rest);
      const title = attrs.title ?? positional;
      const titleAttr = title
        ? ` title="${md.utils.escapeHtml(title)}"`
        : "";
      return `\n<Terminal${titleAttr}>\n`;
    },
  });
}

// ::: cast src=/casts/demo.cast title="..." rows=16
// :::
//
// Embeds an asciinema recording (AsciinemaCast.vue).
export function castContainer(md: Markdown): void {
  md.use(container, "cast", {
    validate: (params: string) => /^cast(?:\s+.*)?$/.test(params.trim()),
    render: (tokens: ContainerToken[], idx: number) => {
      const token = tokens[idx];
      if (token.nesting !== 1) return "\n";

      const rest = token.info.trim().replace(/^cast\s*/, "");
      const { attrs } = parseAttrs(rest);
      const src = md.utils.escapeHtml(attrs.src ?? "");
      const titleAttr = attrs.title
        ? ` title="${md.utils.escapeHtml(attrs.title)}"`
        : "";
      const rows = Number.parseInt(attrs.rows ?? "16", 10);
      const rowsAttr = Number.isFinite(rows) ? ` :rows="${rows}"` : "";
      return `\n<AsciinemaCast src="${src}"${titleAttr}${rowsAttr} />\n`;
    },
  });
}
