import githubData from "@temp/docs-kit/github.js";
import type { OrgData, RepoData } from "../src/shared/types.js";

// Looks up the data the docs-kit plugin fetched at build time. Returns an
// error message instead when the site didn't ask the plugin to fetch it.

export function repoData(repo: string): RepoData | string {
  if (githubData.error) return githubData.error;
  return (
    githubData.repos[repo.toLowerCase()] ??
    `No GitHub data for ${repo}. Add it to docsKitPlugin({ github: { repos } }) in config.ts.`
  );
}

export function orgData(org: string): OrgData | string {
  if (githubData.error) return githubData.error;
  return (
    githubData.orgs[org.toLowerCase()] ??
    `No GitHub data for ${org}. Add it to docsKitPlugin({ github: { orgs } }) in config.ts.`
  );
}
