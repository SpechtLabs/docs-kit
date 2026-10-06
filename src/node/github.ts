import {
  type Contributor,
  type Download,
  type GitHubData,
  type OrgData,
  type Platform,
  type Project,
  type Release,
  type RepoData,
  platforms,
} from "../shared/types.js";

// Fetching this in the browser burns through the unauthenticated rate limit
// (60 requests/hour per IP) after a couple of page loads, since the org-wide
// contributor list needs one request per repository. So it happens once, at
// build time, authenticated with GITHUB_TOKEN when it is set.

const perPage = 100;
const releaseCount = 10;

function headers(accept: string): Record<string, string> {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  return {
    Accept: accept,
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const attempts = 3;

// Retries network errors and server errors, which do happen when a build
// fires a few dozen requests at once. Client errors (404, rate limits) won't
// get better on a retry, so they fail straight away.
async function fetchWithRetry(url: string, accept: string): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: headers(accept) });
      if (res.status < 500 || attempt === attempts) return res;
    } catch (err) {
      if (attempt === attempts) throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
  }
}

async function fetchJson(
  path: string,
  accept = "application/vnd.github+json",
): Promise<any> {
  const res = await fetchWithRetry(`https://api.github.com/${path}`, accept).catch(
    (err) => {
      throw new Error(`GET ${path}: ${err.cause?.message ?? err.message}`);
    },
  );
  if (!res.ok) {
    throw new Error(`GET ${path}: ${res.status} ${res.statusText}`);
  }
  // Empty repositories respond with 204 No Content to list requests
  if (res.status === 204) return [];
  return res.json();
}

function fetchPage(path: string, page: number): Promise<any[]> {
  const sep = path.includes("?") ? "&" : "?";
  return fetchJson(`${path}${sep}per_page=${perPage}&page=${page}`);
}

// Fetch every page of a paginated GitHub list endpoint
async function fetchAllPages(path: string): Promise<any[]> {
  const items: any[] = [];
  for (let page = 1; ; page++) {
    const pageItems = await fetchPage(path, page);
    items.push(...pageItems);
    if (pageItems.length < perPage) break;
  }
  return items;
}

// Merge contributor lists, dropping bots and summing contributions per user
function aggregateContributors(lists: any[][]): Contributor[] {
  const byLogin = new Map<string, Contributor>();
  for (const c of lists.flat()) {
    if (c.type !== "User") continue;
    const existing = byLogin.get(c.login);
    if (existing) {
      existing.contributions += c.contributions ?? 0;
    } else {
      byLogin.set(c.login, {
        login: c.login,
        avatar_url: c.avatar_url,
        html_url: c.html_url,
        contributions: c.contributions ?? 0,
      });
    }
  }
  return Array.from(byLogin.values()).sort(
    (a, b) => b.contributions - a.contributions,
  );
}

// An authenticated token from an org member also sees private (and internal)
// repos and draft releases. Only public data may end up on a site, so filter
// by visibility explicitly rather than trusting the token's reach.
function isPublic(repo: any): boolean {
  return repo.visibility === "public" && !repo.private;
}

async function fetchRepoData(fullName: string): Promise<RepoData> {
  if (!isPublic(await fetchJson(`repos/${fullName}`))) {
    throw new Error(`${fullName} is not a public repository`);
  }

  const [contributors, releases] = await Promise.all([
    fetchAllPages(`repos/${fullName}/contributors`),
    // The data ends up in every page's bundle, so keep it to the newest
    // few; the component shows at most five per platform. The html media
    // type adds body_html, the notes as GitHub renders and sanitizes them.
    fetchJson(
      `repos/${fullName}/releases?per_page=${releaseCount}`,
      "application/vnd.github.html+json",
    ),
  ]);

  return {
    contributors: aggregateContributors([contributors]),
    releases: releases
      .filter((r: any) => !r.draft)
      .map(
        (r: any): Release => ({
          id: r.id,
          name: r.name || r.tag_name,
          tag_name: r.tag_name,
          html_url: r.html_url,
          published_at: r.published_at,
          prerelease: r.prerelease,
          notes_html: stripVersionHeading(r.body_html ?? "", r.tag_name),
          downloads: downloadsByPlatform(r.assets ?? []),
        }),
      )
      .sort((a: Release, b: Release) =>
        b.published_at.localeCompare(a.published_at),
      ),
  };
}

// Checksums, signatures, attestations and SBOMs sit next to the archives
// but aren't what anyone means by "download".
const notADownload =
  /checksums|sha256sums|\.(txt|sig|asc|pem|bundle|json|jsonl|sbom|sha256)$/;

// Release assets name their platform in one of two styles: Go's
// (`tool_1.2.3_darwin_arm64.tar.gz`) or Rust's target triples
// (`tool-1.2.3-aarch64-apple-darwin.tar.gz`). Match both by looking for an
// OS and an architecture anywhere in the name.
const os: Record<string, RegExp> = {
  darwin: /darwin|macos|apple/,
  linux: /linux/,
  windows: /windows|win64|\.exe$/,
};
const arch: Record<string, RegExp> = {
  amd64: /amd64|x86_64|x64/,
  arm64: /arm64|aarch64/,
};
// macOS universal binaries run on both architectures
const universal = /universal|darwin[_-]all/;

function assetPlatforms(name: string): Platform[] {
  const n = name.toLowerCase();
  if (notADownload.test(n)) return [];
  return (Object.keys(platforms) as Platform[]).filter((platform) => {
    const [o, a] = platform.split("_");
    if (!os[o].test(n)) return false;
    return arch[a].test(n) || (o === "darwin" && universal.test(n));
  });
}

function downloadsByPlatform(
  assets: any[],
): Partial<Record<Platform, Download>> {
  const downloads: Partial<Record<Platform, Download>> = {};
  for (const asset of assets) {
    for (const platform of assetPlatforms(asset.name)) {
      // First match wins; releases list one archive per platform
      downloads[platform] ??= {
        name: asset.name,
        url: asset.browser_download_url,
      };
    }
  }
  return downloads;
}

// release-please starts every set of notes with a heading for the version
// and date (`## [0.7.3](compare link) (2026-10-05)`), which the component
// already shows. Drop it when it names this release's version.
function stripVersionHeading(html: string, tag: string): string {
  const version = tag.replace(/^v/, "");
  return html.replace(/^\s*<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/, (heading, text) =>
    text.includes(version) ? "" : heading,
  );
}

async function fetchOrgData(org: string): Promise<OrgData> {
  const repos = (await fetchAllPages(`orgs/${org}/repos?type=public`)).filter(
    isPublic,
  );
  const mainRepoName = `${org.toLowerCase()}.github.io`;

  const projects = repos
    .filter(
      (repo: any) =>
        repo.homepage && repo.name.toLowerCase() !== mainRepoName,
    )
    .map(
      (repo: any): Project => ({
        name: repo.name,
        homepage: repo.homepage,
        html_url: repo.html_url,
        description: repo.description ?? "",
        topics: repo.topics ?? [],
        stargazers_count: repo.stargazers_count,
        created_at: repo.created_at,
      }),
    )
    // Newest projects first
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  // Forks are skipped, as they list the upstream project's contributors
  const ownRepos = repos.filter((repo: any) => !repo.fork);
  const [members, ...perRepo] = await Promise.all([
    fetchAllPages(`orgs/${org}/public_members`),
    ...ownRepos.map((repo: any) =>
      fetchAllPages(`repos/${org}/${repo.name}/contributors`),
    ),
  ]);

  return {
    projects,
    // Public members may not have committed code themselves, so include them
    contributors: aggregateContributors([
      ...perRepo,
      members.map((m: any) => ({ ...m, contributions: 0 })),
    ]),
  };
}

export interface GitHubOptions {
  // Repositories ("owner/name") the Contributors and Releases components show
  repos?: string[];
  // Organizations the Projects component and org-wide Contributors show
  orgs?: string[];
}

export async function fetchGitHubData({
  repos = [],
  orgs = [],
}: GitHubOptions): Promise<GitHubData> {
  const data: GitHubData = { repos: {}, orgs: {} };
  for (const repo of repos) {
    data.repos[repo.toLowerCase()] = await fetchRepoData(repo);
  }
  for (const org of orgs) {
    data.orgs[org.toLowerCase()] = await fetchOrgData(org);
  }
  return data;
}
