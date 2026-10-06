---
pageLayout: home
config:
  - type: hero
    hero:
      name: docs-kit
      tagline: Shared components for the SpechtLabs docs sites
      actions:
        - theme: brand
          text: Components →
          link: /components/

  - type: VPListCompare
    title: "Copying components vs. docs-kit"
    description: "How the docs sites shared components before, and now"
    left:
      title: "Copied into every site"
      items:
        - title: "Drift"
          description: "Each copy gets its own fixes, or doesn't"
        - "Rate limits in the browser"
    right:
      title: "One package"
      items:
        - title: "One fix, every site"
          description: "Bump the tag and rebuild"
        - "GitHub data fetched at build time"

  - type: VPProjects
    org: SpechtLabs

  - type: VPReleases
    repo: SpechtLabs/tka

  - type: VPContributors
    repo: SpechtLabs/tka

  - type: VPContributors
    org: SpechtLabs
---
