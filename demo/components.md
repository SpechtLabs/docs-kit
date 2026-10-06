---
title: Components
---

## Terminal

::: terminal Install with Homebrew

```shell
brew install spechtlabs/tap/kush
# Then start a shell pinned to one context
kush prod
```

:::

## Asciinema recording

::: cast src=/demo.cast title="A short recording" rows=6
:::

## File tree

<FileTree>

- docs
  - .vuepress
    - config.ts
  - README.md
- package.json

</FileTree>

## Releases

Rust-style asset names (`aarch64-apple-darwin`):

<Releases repo="SpechtLabs/telegram-tui" />

A Linux-only project:

<Releases repo="SpechtLabs/StaticPages" />

## Swagger UI

<SwaggerUI url="/swagger.json" />
