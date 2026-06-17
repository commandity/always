# Markdown Guide

VitePress uses [markdown-it](https://github.com/markdown-it/markdown-it) as its Markdown renderer, extended with many features tailored for technical documentation. This page covers everything you can do in `.md` files.

## Basic Syntax

### Headings

````md
# H1 — Page Title
## H2 — Major Section
### H3 — Subsection
#### H4 — Minor Section
````

Headings are automatically added to the right-side outline panel. The outline depth is controlled by the `outline.level` option in `config.ts`.

### Paragraphs and Line Breaks

Separate paragraphs with a blank line. A single line break within a paragraph is ignored — use two spaces at the end of a line or a blank line to force a break.

### Bold, Italic, Strikethrough

````md
**bold text**
*italic text*
~~strikethrough~~
**_bold and italic_**
````

**bold text**
*italic text*
~~strikethrough~~
**_bold and italic_**

### Inline Code

Wrap code in backticks:

````md
Use the `defineConfig` function to configure your site.
````

Use the `defineConfig` function to configure your site.

### Horizontal Rule

````md
---
````

---

## Links

### Internal Links

````md
[Introduction](/guide/introduction)
[Site Config](/guide/site-config)
````

Internal links are automatically resolved relative to the docs root. VitePress will warn you at build time if a link points to a missing page.

### External Links

````md
[VitePress](https://vitepress.dev)
[GitHub](https://github.com)
````

External links automatically get `target="_blank"` and `rel="noopener noreferrer"`.

### Anchor Links

Link to a specific heading on the same page:

````md
[Back to top](#markdown-guide)
[Jump to Tables](#tables)
````

### Link with Title

````md
[VitePress](https://vitepress.dev "Official VitePress Docs")
````

## Images

### Basic Image

````md
![Alt text](/images/screenshot.png)
````

### Image with Title

````md
![Alt text](/images/screenshot.png "Image title")
````

### Relative Path

````md
![Logo](./images/logo.svg)
````

### Lazy Loading

Enable lazy loading globally in `config.ts`:

````ts
export default defineConfig({
  markdown: {
    image: {
      lazyLoading: true
    }
  }
})
````

## Lists

### Unordered List

````md
- Item one
- Item two
  - Nested item
  - Another nested item
- Item three
````

- Item one
- Item two
  - Nested item
  - Another nested item
- Item three

### Ordered List

````md
1. First step
2. Second step
3. Third step
````

1. First step
2. Second step
3. Third step

### Task List

````md
- [x] Install VitePress
- [x] Create config.ts
- [ ] Write documentation
- [ ] Deploy to Vercel
````

- [x] Install VitePress
- [x] Create config.ts
- [ ] Write documentation
- [ ] Deploy to Vercel

## Tables

````md
| Name    | Type     | Default | Description         |
| ------- | -------- | ------- | ------------------- |
| `title` | `string` | —       | Site title          |
| `lang`  | `string` | `en-US` | HTML lang attribute |
| `base`  | `string` | `/`     | Base URL            |
````

| Name    | Type     | Default | Description         |
| ------- | -------- | ------- | ------------------- |
| `title` | `string` | —       | Site title          |
| `lang`  | `string` | `en-US` | HTML lang attribute |
| `base`  | `string` | `/`     | Base URL            |

### Alignment

````md
| Left | Center | Right |
| :--- | :----: | ----: |
| A    |   B    |     C |
````

| Left | Center | Right |
| :--- | :----: | ----: |
| A    |   B    |     C |

## Blockquotes

````md
> This is a blockquote.
> It can span multiple lines.

> **Note**
> Blockquotes can contain other Markdown elements.
````

> This is a blockquote.
> It can span multiple lines.

## Code Blocks

### Fenced Code Block

````md
```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'MyDocs'
})
```
````

### Line Numbers

Enable globally in `config.ts`:

````ts
export default defineConfig({
  markdown: {
    lineNumbers: true
  }
})
````

Or per block with `:line-numbers`:

````md
```ts:line-numbers
const a = 1
const b = 2
const c = a + b
```
````

### Line Highlighting

Highlight specific lines:

````md
```ts{1,3-5}
const a = 1        // highlighted
const b = 2
const c = 3        // highlighted
const d = 4        // highlighted
const e = 5        // highlighted
```
````

### Focus Lines

Dim all lines except the focused ones using `// [!code focus]`:

````md
```ts
const a = 1
const b = 2  // [!code focus]
const c = 3
```
````

### Diff View

Show added and removed lines using `// [!code ++]` and `// [!code --]`:

````md
```ts
const greeting = 'Hello'        // [!code --]
const greeting = 'Hello World'  // [!code ++]
```
````

### Code Groups

Tabbed code snippets for showing the same code in multiple languages or package managers:

````md
::: code-group

```bash [npm]
npm install vitepress
```

```bash [yarn]
yarn add vitepress
```

```bash [pnpm]
pnpm add vitepress
```

:::
````

### Import Code Snippets

Import code directly from a file:

````md
<<< @/snippets/example.ts
````

Import a specific line range:

````md
<<< @/snippets/example.ts{2-10}
````

## Custom Containers

VitePress provides styled callout containers:

````md
::: info
Useful background information.
:::

::: tip
A helpful tip or recommendation.
:::

::: warning
Something to be careful about.
:::

::: danger
A critical warning — proceed with caution.
:::

::: details Click me to expand
Hidden content revealed on click.
:::
````

::: info
Useful background information.
:::

::: tip
A helpful tip or recommendation.
:::

::: warning
Something to be careful about.
:::

::: danger
A critical warning — proceed with caution.
:::

::: details Click me to expand
Hidden content revealed on click.
:::

### Custom Title

````md
::: warning My Custom Title
This warning has a custom heading.
:::
````

## Frontmatter

Every Markdown page can have a YAML frontmatter block at the top:

````md
---
title: My Page Title
description: A short description for SEO
layout: doc
outline: deep
lastUpdated: true
prev: false
next:
  text: Next Page
  link: /guide/next-page
---
````

| Key             | Description                                       |
| --------------- | ------------------------------------------------- |
| `title`         | Overrides the page title in the browser tab       |
| `description`   | Overrides the meta description                    |
| `layout`        | `doc`, `home`, or `page`                          |
| `outline`       | `false`, a number, a range, or `'deep'`           |
| `lastUpdated`   | `true` or `false` to toggle per page              |
| `prev` / `next` | `false` to hide, or `{ text, link }` to customize |

## Using Vue in Markdown

VitePress treats every `.md` file as a Vue Single File Component. You can use Vue syntax directly.

### Interpolation

````md
The current year is {{ new Date().getFullYear() }}.
````

The current year is {{ new Date().getFullYear() }}.

### Directives

````md
<span v-if="true">This is always visible</span>
````

### Script Setup

````md
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

Count: {{ count }}
<button @click="count++">Increment</button>
````

### Importing Components

````md
<script setup>
import MyComponent from './components/MyComponent.vue'
</script>

<MyComponent />
````

## Emoji

VitePress supports GitHub-style emoji shortcodes:

````md
:tada: :100: :rocket: :white_check_mark: :warning:
````

:tada: :100: :rocket: :white_check_mark: :warning:

## Table of Contents

Insert an auto-generated table of contents anywhere on the page:

````md
[[toc]]
````

The depth is controlled by `outline.level` in `config.ts`.

## Math Equations

Install `markdown-it-mathjax3` to render LaTeX:

````bash
npm install -D markdown-it-mathjax3
````

````ts
import mathjax3 from 'markdown-it-mathjax3'

export default defineConfig({
  markdown: {
    config(md) { md.use(mathjax3) }
  }
})
````

Then write math in your Markdown:

````md
Inline: $E = mc^2$

Block:
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$
````

## Syntax Reference

| Element         | Syntax             |
| --------------- | ------------------ |
| Bold            | `**text**`         |
| Italic          | `*text*`           |
| Strikethrough   | `~~text~~`         |
| Inline code     | `` `code` ``       |
| Link            | `[text](url)`      |
| Image           | `![alt](url)`      |
| Blockquote      | `> text`           |
| Horizontal rule | `---`              |
| Table           | `\| col \| col \|` |
| Task list       | `- [x] done`       |
| Emoji           | `:tada:`           |
| TOC             | `[[toc]]`          |

## Next Steps

- [Frontmatter](/guide/frontmatter)
- [Components](/guide/components)
- [Plugins](/guide/plugins)