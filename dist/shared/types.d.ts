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
    contributors: Contributor[];
}
export interface GitHubData {
    repos: Record<string, RepoData>;
    orgs: Record<string, OrgData>;
    error?: string;
}
