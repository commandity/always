# Frontmatter

Frontmatter is a YAML block at the very top of any Markdown file, enclosed between two lines of `---`. It lets you control page-level metadata, layout, navigation, and more without touching `config.ts`.

## Basic Syntax

```md
---
title: My Page Title
description: A short description for SEO
---

# Page Content Starts Here
```

The frontmatter block must be the **first thing** in the file — no blank lines or content before the opening `---`.

## How It Works

VitePress parses the YAML block and exposes it as page data. You can access it in Vue components using the `useData()` composable:

```vue
<script setup>
import { useData } from 'vitepress'
const { frontmatter } = useData()
</script>

<template>
  <h1>{{ frontmatter.title }}</h1>
  <p>{{ frontmatter.description }}</p>
</template>
```

## All Available Options

### title

Overrides the page title shown in the browser tab and the `<title>` tag. If not set, VitePress uses the first `#` heading on the page.

```md
---
title: Getting Started with VitePress
---
```

### description

Overrides the `<meta name="description">` tag for this page. Useful for SEO.

```md
---
description: Learn how to install and configure VitePress in under five minutes.
---
```

### layout

Controls which layout template the page uses.

```md
---
layout: doc    # default — shows sidebar, outline, prev/next
---
```

| Value   | Description                                            |
| ------- | ------------------------------------------------------ |
| `doc`   | Standard documentation layout with sidebar and outline |
| `home`  | Full-width hero landing page layout                    |
| `page`  | Full-width blank canvas, no sidebar or outline         |
| `false` | Completely raw — no layout wrapper at all              |

### outline

Controls the right-side "On this page" panel for this specific page.

```md
---
outline: deep        # show all heading levels
---
```

| Value    | Description                     |
| -------- | ------------------------------- |
| `false`  | Hide the outline panel          |
| `2`      | Show h2 headings only           |
| `[2, 3]` | Show h2 and h3 headings         |
| `'deep'` | Show all headings from h2 to h6 |

### lastUpdated

Show or hide the last updated timestamp on this page, overriding the global setting.

```md
---
lastUpdated: true
---
```

### editLink

Override or disable the "Edit this page" link for this specific page.

```md
---
editLink: false
---
```

### prev and next

Customize or disable the previous/next navigation links at the bottom of the page.

```md
---
prev:
  text: Introduction
  link: /guide/introduction
next:
  text: Quick Start
  link: /guide/quick-start
---
```

Disable one or both:

```md
---
prev: false
next: false
---
```

### head

Inject additional `<head>` tags for this page only:

```md
---
head:
  - - meta
    - name: og:title
      content: My Custom OG Title
  - - meta
    - name: og:description
      content: My Custom OG Description
  - - link
    - rel: canonical
      href: https://example.com/guide/frontmatter
---
```

### lang

Override the HTML `lang` attribute for this page:

```md
---
lang: zh-CN
---
```

### sidebar

Show or hide the sidebar on this specific page:

```md
---
sidebar: false
---
```

## Home Layout Frontmatter

When `layout: home` is set, additional frontmatter keys become available to build a hero landing page.

### hero

```md
---
layout: home

hero:
  name: MyDocs
  text: Clean, fast documentation.
  tagline: Built with VitePress — dark mode, search, and collapsible sidebar included.
  image:
    src: /hero-image.png
    alt: MyDocs
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/your-username/my-docs
---
```

| Key       | Description                                     |
| --------- | ----------------------------------------------- |
| `name`    | Large highlighted title (usually the site name) |
| `text`    | Subtitle below the name                         |
| `tagline` | Smaller text below the subtitle                 |
| `image`   | Optional hero image shown on the right          |
| `actions` | Array of CTA buttons                            |

### features

Display a grid of feature cards below the hero:

```md
---
layout: home

features:
  - icon: 🌙
    title: Dark & Light Mode
    details: Toggle between dark and light themes. Remembers your preference.
  - icon: 🔍
    title: Instant Search
    details: Press ⌘K to search all pages instantly — no server needed.
  - icon: 📁
    title: Collapsible Sidebar
    details: Organize your docs into collapsible groups.
  - icon: ⚡
    title: Blazing Fast
    details: Powered by Vite. Pages load instantly with pre-rendering.
---
```

| Key        | Description                         |
| ---------- | ----------------------------------- |
| `icon`     | Emoji, image path, or inline SVG    |
| `title`    | Feature card heading                |
| `details`  | Feature card body text              |
| `link`     | Optional — makes the card clickable |
| `linkText` | Optional — text for the card link   |

## Custom Frontmatter Fields

You can define any custom fields and access them in Vue components:

```md
---
title: My Blog Post
author: Jane Doe
date: 2026-01-15
tags:
  - vitepress
  - documentation
  - vue
draft: false
---
```

Access in a Vue component:

```vue
<script setup>
import { useData } from 'vitepress'
const { frontmatter } = useData()
</script>

<template>
  <div class="post-meta">
    <span>By {{ frontmatter.author }}</span>
    <span>{{ frontmatter.date }}</span>
    <span v-for="tag in frontmatter.tags" :key="tag" class="tag">
      {{ tag }}
    </span>
  </div>
</template>
```

## Accessing Frontmatter Globally

To read frontmatter data across pages, use `createContentLoader` in `config.ts`:

```ts
// docs/.vitepress/config.ts
import { createContentLoader } from 'vitepress'

export default {
  async buildEnd(siteConfig) {
    const posts = await createContentLoader('blog/*.md').load()
    console.log(posts)
    // [{ url, frontmatter, excerpt, html }]
  }
}
```

This is useful for building blog index pages, tag clouds, or RSS feeds.

## Frontmatter Quick Reference

| Key           | Type                                            | Description                        |
| ------------- | ----------------------------------------------- | ---------------------------------- |
| `title`       | `string`                                        | Page title for browser tab and SEO |
| `description` | `string`                                        | Meta description for SEO           |
| `layout`      | `doc \| home \| page \| false`                  | Page layout template               |
| `outline`     | `false \| number \| [number, number] \| 'deep'` | Right outline depth                |
| `lastUpdated` | `boolean`                                       | Show last updated timestamp        |
| `editLink`    | `boolean`                                       | Show or hide edit link             |
| `prev`        | `false \| { text, link }`                       | Previous page link                 |
| `next`        | `false \| { text, link }`                       | Next page link                     |
| `head`        | `HeadConfig[]`                                  | Extra `<head>` tags                |
| `lang`        | `string`                                        | Page language override             |
| `sidebar`     | `boolean`                                       | Show or hide sidebar               |
| `hero`        | `HeroConfig`                                    | Home layout hero section           |
| `features`    | `FeatureConfig[]`                               | Home layout feature cards          |

## Next Steps

- [Components](/guide/components)
- [Markdown Guide](/guide/markdown)
- [Theme Options](/guide/theme-options)