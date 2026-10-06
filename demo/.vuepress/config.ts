import { viteBundler } from "@vuepress/bundler-vite";
import { defineUserConfig } from "vuepress";
import { plumeTheme } from "vuepress-theme-plume";
// The built plugin, exactly what a site gets from the package's exports
import { docsKitPlugin } from "../../dist/node/index.js";

export default defineUserConfig({
  base: "/",
  lang: "en-US",
  title: "docs-kit demo",
  description: "Every docs-kit component and container on one site",

  bundler: viteBundler(),
  shouldPrefetch: false,

  plugins: [
    docsKitPlugin({
      github: {
        repos: ["SpechtLabs/sigil", "SpechtLabs/telegram-tui", "SpechtLabs/StaticPages"],
        orgs: ["SpechtLabs"],
      },
    }),
  ],

  theme: plumeTheme({
    editLink: false,
    lastUpdated: false,
    contributors: false,
    search: false,
  }),
});
