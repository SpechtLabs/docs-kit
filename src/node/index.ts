import type { Plugin } from "vuepress/core";
import { getDirname, path } from "vuepress/utils";
import type { GitHubData } from "../shared/types.js";
import { castContainer, terminalContainer } from "./containers.js";
import { fetchGitHubData, type GitHubOptions } from "./github.js";

export type * from "../shared/types.js";
export type { GitHubOptions } from "./github.js";

const __dirname = getDirname(import.meta.url);

export interface DocsKitOptions {
  // What to fetch from the GitHub API at build time
  github?: GitHubOptions;
}

export const docsKitPlugin = (options: DocsKitOptions = {}): Plugin => ({
  name: "@spechtlabs/docs-kit",

  clientConfigFile: path.resolve(__dirname, "../client/config.js"),

  extendsMarkdown: (md) => {
    terminalContainer(md);
    castContainer(md);
  },

  onPrepared: async (app) => {
    let data: GitHubData = { repos: {}, orgs: {} };
    try {
      data = await fetchGitHubData(options.github ?? {});
    } catch (err: any) {
      // Don't ship a site with empty sections from CI; locally, keep going
      if (process.env.CI) throw err;
      console.warn(
        `[docs-kit] ${err.message}. Set GITHUB_TOKEN to avoid rate limits.`,
      );
      data.error = err.message;
    }

    await app.writeTemp(
      "docs-kit/github.js",
      `export default ${JSON.stringify(data)}\n`,
    );
  },
});
