import { getDirname, path } from "vuepress/utils";
import { castContainer, terminalContainer } from "./containers.js";
import { fetchGitHubData } from "./github.js";
const __dirname = getDirname(import.meta.url);
export const docsKitPlugin = (options = {}) => ({
    name: "@spechtlabs/docs-kit",
    clientConfigFile: path.resolve(__dirname, "../client/config.js"),
    extendsMarkdown: (md) => {
        terminalContainer(md);
        castContainer(md);
    },
    onPrepared: async (app) => {
        let data = { repos: {}, orgs: {} };
        try {
            data = await fetchGitHubData(options.github ?? {});
        }
        catch (err) {
            // Don't ship a site with empty sections from CI; locally, keep going
            if (process.env.CI)
                throw err;
            console.warn(`[docs-kit] ${err.message}. Set GITHUB_TOKEN to avoid rate limits.`);
            data.error = err.message;
        }
        await app.writeTemp("docs-kit/github.js", `export default ${JSON.stringify(data)}\n`);
    },
});
