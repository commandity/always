# Quick Start

After [installation](/guide/installation), here's everything you need to know to write your first pages.

## Create a page

Every `.md` file inside `docs/` becomes a page. The file path maps directly to the URL:

| File                         | URL                   |
| ---------------------------- | --------------------- |
| `docs/index.md`              | `/`                   |
| `docs/guide/introduction.md` | `/guide/introduction` |
| `docs/reference/config.md`   | `/reference/config`   |

## Add frontmatter

Each page can have optional YAML frontmatter at the top:

```markdown
---
title: My Page Title
description: A short description for SEO
---

# My Page Title

Content goes here...
```

## Link between pages

Use root-relative links:

```markdown
See the [Installation guide](/guide/installation) for setup steps.
```

## Add the page to the sidebar

Open `.vitepress/config.ts` and add an entry to the relevant sidebar group:

```ts
{
  text: 'Getting Started',
  items: [
    { text: 'Introduction', link: '/guide/introduction' },
    { text: 'Installation', link: '/guide/installation' },
    { text: 'Quick Start',  link: '/guide/quick-start' },  // ← add this
  ]
}
```

## Dev server hot reload

The dev server (`npm run docs:dev`) automatically reloads the page whenever you save a `.md` or `.ts` file. No restart needed.
