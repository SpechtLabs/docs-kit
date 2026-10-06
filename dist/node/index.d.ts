import type { Plugin } from "vuepress/core";
import { type GitHubOptions } from "./github.js";
export type * from "../shared/types.js";
export type { GitHubOptions } from "./github.js";
export interface DocsKitOptions {
    github?: GitHubOptions;
}
export declare const docsKitPlugin: (options?: DocsKitOptions) => Plugin;
