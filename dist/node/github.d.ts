import type { GitHubData } from "../shared/types.js";
export interface GitHubOptions {
    repos?: string[];
    orgs?: string[];
}
export declare function fetchGitHubData({ repos, orgs, }: GitHubOptions): Promise<GitHubData>;
