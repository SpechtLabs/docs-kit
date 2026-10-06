// Fetching this in the browser burns through the unauthenticated rate limit
// (60 requests/hour per IP) after a couple of page loads, since the org-wide
// contributor list needs one request per repository. So it happens once, at
// build time, authenticated with GITHUB_TOKEN when it is set.
const perPage = 100;
function headers() {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    return {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}
const attempts = 3;
// Retries network errors and server errors, which do happen when a build
// fires a few dozen requests at once. Client errors (404, rate limits) won't
// get better on a retry, so they fail straight away.
async function fetchWithRetry(url) {
    for (let attempt = 1;; attempt++) {
        try {
            const res = await fetch(url, { headers: headers() });
            if (res.status < 500 || attempt === attempts)
                return res;
        }
        catch (err) {
            if (attempt === attempts)
                throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
}
async function fetchJson(path) {
    const res = await fetchWithRetry(`https://api.github.com/${path}`).catch((err) => {
        throw new Error(`GET ${path}: ${err.cause?.message ?? err.message}`);
    });
    if (!res.ok) {
        throw new Error(`GET ${path}: ${res.status} ${res.statusText}`);
    }
    // Empty repositories respond with 204 No Content to list requests
    if (res.status === 204)
        return [];
    return res.json();
}
function fetchPage(path, page) {
    const sep = path.includes("?") ? "&" : "?";
    return fetchJson(`${path}${sep}per_page=${perPage}&page=${page}`);
}
// Fetch every page of a paginated GitHub list endpoint
async function fetchAllPages(path) {
    const items = [];
    for (let page = 1;; page++) {
        const pageItems = await fetchPage(path, page);
        items.push(...pageItems);
        if (pageItems.length < perPage)
            break;
    }
    return items;
}
// Merge contributor lists, dropping bots and summing contributions per user
function aggregateContributors(lists) {
    const byLogin = new Map();
    for (const c of lists.flat()) {
        if (c.type !== "User")
            continue;
        const existing = byLogin.get(c.login);
        if (existing) {
            existing.contributions += c.contributions ?? 0;
        }
        else {
            byLogin.set(c.login, {
                login: c.login,
                avatar_url: c.avatar_url,
                html_url: c.html_url,
                contributions: c.contributions ?? 0,
            });
        }
    }
    return Array.from(byLogin.values()).sort((a, b) => b.contributions - a.contributions);
}
// An authenticated token from an org member also sees private (and internal)
// repos and draft releases. Only public data may end up on a site, so filter
// by visibility explicitly rather than trusting the token's reach.
function isPublic(repo) {
    return repo.visibility === "public" && !repo.private;
}
async function fetchRepoData(fullName) {
    if (!isPublic(await fetchJson(`repos/${fullName}`))) {
        throw new Error(`${fullName} is not a public repository`);
    }
    const [contributors, releases] = await Promise.all([
        fetchAllPages(`repos/${fullName}/contributors`),
        // The newest page is plenty: the releases component shows the latest few
        fetchPage(`repos/${fullName}/releases`, 1),
    ]);
    return {
        contributors: aggregateContributors([contributors]),
        releases: releases
            .filter((r) => !r.draft)
            .map((r) => ({
            id: r.id,
            name: r.name || r.tag_name,
            tag_name: r.tag_name,
            html_url: r.html_url,
            published_at: r.published_at,
            prerelease: r.prerelease,
            body: r.body ?? "",
            assets: (r.assets ?? []).map((a) => ({
                id: a.id,
                name: a.name,
                browser_download_url: a.browser_download_url,
            })),
        }))
            .sort((a, b) => b.published_at.localeCompare(a.published_at)),
    };
}
async function fetchOrgData(org) {
    const repos = (await fetchAllPages(`orgs/${org}/repos?type=public`)).filter(isPublic);
    const mainRepoName = `${org.toLowerCase()}.github.io`;
    const projects = repos
        .filter((repo) => repo.homepage && repo.name.toLowerCase() !== mainRepoName)
        .map((repo) => ({
        name: repo.name,
        homepage: repo.homepage,
        html_url: repo.html_url,
        description: repo.description ?? "",
        topics: repo.topics ?? [],
        stargazers_count: repo.stargazers_count,
        created_at: repo.created_at,
    }))
        // Newest projects first
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    // Forks are skipped, as they list the upstream project's contributors
    const ownRepos = repos.filter((repo) => !repo.fork);
    const [members, ...perRepo] = await Promise.all([
        fetchAllPages(`orgs/${org}/public_members`),
        ...ownRepos.map((repo) => fetchAllPages(`repos/${org}/${repo.name}/contributors`)),
    ]);
    return {
        projects,
        // Public members may not have committed code themselves, so include them
        contributors: aggregateContributors([
            ...perRepo,
            members.map((m) => ({ ...m, contributions: 0 })),
        ]),
    };
}
export async function fetchGitHubData({ repos = [], orgs = [], }) {
    const data = { repos: {}, orgs: {} };
    for (const repo of repos) {
        data.repos[repo.toLowerCase()] = await fetchRepoData(repo);
    }
    for (const org of orgs) {
        data.orgs[org.toLowerCase()] = await fetchOrgData(org);
    }
    return data;
}
