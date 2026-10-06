// The GitHub data docs-kit fetches at build time and hands to the client
// components as `@temp/docs-kit/github.js`.

export interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export interface Project {
  name: string;
  homepage: string;
  html_url: string;
  description: string;
  topics: string[];
  stargazers_count: number;
  created_at: string;
}

export interface ReleaseAsset {
  id: number;
  name: string;
  browser_download_url: string;
}

export interface Release {
  id: number;
  name: string;
  tag_name: string;
  html_url: string;
  published_at: string;
  prerelease: boolean;
  body: string;
  assets: ReleaseAsset[];
}

export interface RepoData {
  contributors: Contributor[];
  releases: Release[];
}

export interface OrgData {
  projects: Project[];
  // Contributors across all public, non-fork repos plus public org members
  contributors: Contributor[];
}

export interface GitHubData {
  // Keyed by lowercase "owner/name"
  repos: Record<string, RepoData>;
  // Keyed by lowercase org login
  orgs: Record<string, OrgData>;
  error?: string;
}
