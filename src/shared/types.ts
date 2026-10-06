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

// The platforms the Releases component offers downloads for
export const platforms = {
  darwin_arm64: "macOS (Apple silicon)",
  darwin_amd64: "macOS (Intel)",
  linux_amd64: "Linux (x64)",
  linux_arm64: "Linux (ARM64)",
  windows_amd64: "Windows (x64)",
  windows_arm64: "Windows (ARM64)",
} as const;

export type Platform = keyof typeof platforms;

export interface Download {
  name: string;
  url: string;
}

export interface Release {
  id: number;
  name: string;
  tag_name: string;
  html_url: string;
  published_at: string;
  prerelease: boolean;
  // The release notes as HTML, rendered and sanitized by GitHub
  notes_html: string;
  // The archive to download for each platform the release ships
  downloads: Partial<Record<Platform, Download>>;
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
