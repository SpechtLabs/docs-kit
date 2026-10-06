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
export declare const platforms: {
    readonly darwin_arm64: "macOS (Apple silicon)";
    readonly darwin_amd64: "macOS (Intel)";
    readonly linux_amd64: "Linux (x64)";
    readonly linux_arm64: "Linux (ARM64)";
    readonly windows_amd64: "Windows (x64)";
    readonly windows_arm64: "Windows (ARM64)";
};
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
    notes_html: string;
    downloads: Partial<Record<Platform, Download>>;
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
