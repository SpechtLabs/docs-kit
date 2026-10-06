# docs-kit

The components, Markdown containers and build-time GitHub data shared by the SpechtLabs docs sites. These used to be copied from site to site. Now they live here, and each site installs them from a tag.

It's a VuePress plugin for sites built with [vuepress-theme-plume](https://theme-plume.vuejs.press/).

## Install

docs-kit is installed straight from git, pinned to a release tag:

```sh
bun add github:SpechtLabs/docs-kit#v0.1.0
```

Renovate picks up new tags like any other dependency.

Then add the plugin to `docs/.vuepress/config.ts`:

```ts
import { docsKitPlugin } from "@spechtlabs/docs-kit";

export default defineUserConfig({
  plugins: [
    docsKitPlugin({
      github: {
        // The Contributors and Releases components for one repository
        repos: ["SpechtLabs/tka"],
        // The Projects component and org-wide Contributors
        orgs: ["SpechtLabs"],
      },
    }),
  ],
});
```

The plugin registers every component globally, so there is nothing to import in `client.ts`.

## GitHub data

Contributors, releases and projects are fetched from the GitHub API once, at build time, not in the visitor's browser. Visitors make no API calls, and the sections are part of the pre-rendered HTML.

The build authenticates with `GITHUB_TOKEN` (or `GH_TOKEN`) when it's set. Unauthenticated, GitHub allows 60 requests an hour, and an org-wide contributor list needs one per repository. In GitHub Actions, pass the workflow's token to the build step:

```yaml
- name: Build
  run: mise run build
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Locally:

```sh
env GITHUB_TOKEN=(gh auth token) mise run dev   # fish
GITHUB_TOKEN=$(gh auth token) mise run dev      # bash, zsh
```

The data is only as fresh as the last build, so rebuild the site on a schedule (daily works well) and when a release is published.

Only public data ends up on a site. A token from an org member can also see private repositories and draft releases; docs-kit filters both out.

If a fetch fails in CI (`CI` is set), the build fails, so a broken build never replaces a working site. Locally it only warns, and the affected components show the error.

## Home page sections

Use these as `type:` entries in the home page's `config` frontmatter:

```yaml
config:
  - type: VPReleases
    repo: SpechtLabs/tka

  - type: VPContributors
    repo: SpechtLabs/tka # one repository's contributors
  - type: VPContributors
    org: SpechtLabs # everyone who contributed to any public org project

  - type: VPProjects
    org: SpechtLabs

  - type: VPListCompare
    title: "Manual juggling vs. kush"
    left:
      title: "The manual way"
      items:
        - title: "kubectl config use-context"
          description: "Mutates global state shared by every shell"
    right:
      title: "kush"
      items:
        - "One context per shell"

  - type: VPSwaggerUI
    url: /swagger.json
```

Releases shows the latest five releases with their notes (rendered by GitHub) and a Download button for the visitor's platform, which it preselects. It recognizes both Go-style asset names (`tool_1.2.3_darwin_arm64.tar.gz`) and Rust target triples (`tool-1.2.3-aarch64-apple-darwin.tar.gz`), skips checksums, signatures and SBOMs, and only offers the platforms the project ships.

Each one wraps the component of the same name without the `VP` prefix (`Contributors`, `Releases`, `Projects`, `ListCompare`, `SwaggerUI`), which can also be used directly in Markdown.

Repository and org names aren't case-sensitive, but every repo and org a page shows has to be listed in the plugin's `github` options.

## Markdown

### Terminal

A fenced code block shown as a terminal window, with a copy button:

````md
::: terminal Install with Homebrew

```shell
brew install spechtlabs/tap/kush
```

:::
````

### Asciinema recordings

```md
::: cast src=/casts/demo.cast title="kush in action" rows=16
:::
```

Recordings are played with [asciinema-player](https://docs.asciinema.org/manual/player/), which handles asciicast v2 and v3 and full-screen TUIs. It's loaded only in the browser, and only on pages that have a recording.

### File trees

```md
<FileTree>

- docs
  - .vuepress
    - config.ts
- package.json

</FileTree>
```

### Swagger UI

```md
<SwaggerUI url="/swagger.json" />
```

Swagger UI is loaded only on pages that use it. `url` defaults to `/swagger.json`, served from `.vuepress/public`.

## Development

```sh
mise run demo        # the demo site with hot reload
mise run check       # every gate CI runs
```

The demo site in `demo/` uses every component and container, and CI builds it.

`src/` compiles to `dist/`, and `dist/` is committed: sites install docs-kit from git, and neither Node nor bun builds a git dependency on install. Run `mise run build` after changing anything under `src/` and commit the result; CI fails when `dist/` is stale. The `.vue` components ship as source and are compiled by each site's VuePress build.

Releases are cut by release-please from the Conventional Commits on `main`.
