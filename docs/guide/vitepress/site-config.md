# Site Configuration

All site-level configuration lives in `docs/.vitepress/config.ts`. This page covers every top-level option available.

## Basic Setup

A minimal config looks like this:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'MyDocs',
  description: 'My documentation site',
  lang: 'en-US'
})
```

## Top-Level Options

| Option        | Type                | Default              | Description                                    |
| ------------- | ------------------- | -------------------- | ---------------------------------------------- |
| `title`       | `string`            | `'VitePress'`        | Site title shown in the browser tab and navbar |
| `description` | `string`            | `'A VitePress site'` | Meta description used for SEO                  |
| `lang`        | `string`            | `'en-US'`            | HTML `lang` attribute                          |
| `base`        | `string`            | `'/'`                | Base URL when deploying to a subdirectory      |
| `appearance`  | `boolean \| 'dark'` | `true`               | Dark/light mode behavior                       |
| `lastUpdated` | `boolean`           | `false`              | Show last updated timestamp on pages           |
| `cleanUrls`   | `boolean`           | `false`              | Remove `.html` from URLs                       |
| `srcDir`      | `string`            | `'.'`                | Directory where markdown files live            |
| `outDir`      | `string`            | `'.vitepress/dist'`  | Build output directory                         |
| `cacheDir`    | `string`            | `'.vitepress/cache'` | Cache directory for build                      |

## title

The site title appears in the browser tab and is prepended to each page's `<title>` tag.

```ts
export default defineConfig({
  title: 'MyDocs'
})
```

If a page has its own title in frontmatter, the final tab title becomes:
`Page Title | Site Title`

To customize the separator:

```ts
export default defineConfig({
  title: 'MyDocs',
  titleTemplate: ':title — MyDocs'
})
```

## description

Used as the default `<meta name="description">` tag for SEO. Individual pages can override this via frontmatter.

```ts
export default defineConfig({
  description: 'Clean, fast documentation built with VitePress'
})
```

## lang

Sets the `lang` attribute on the `<html>` element. Important for accessibility and search engines.

```ts
export default defineConfig({
  lang: 'en-US'   // or 'zh-CN', 'ja-JP', etc.
})
```

## base

Required when deploying to a subdirectory instead of the root domain.

```ts
// Deploying to https://example.com/docs/
export default defineConfig({
  base: '/docs/'
})
```

All asset paths and internal links are automatically prefixed with the base value.

## appearance

Controls the dark/light mode toggle behavior.

```ts
export default defineConfig({
  appearance: true,    // follow system preference (default)
  // appearance: 'dark',  // force dark mode on first load
  // appearance: false,   // disable the toggle entirely
})
```

## lastUpdated

When enabled, VitePress reads the last Git commit timestamp for each file and displays it at the bottom of the page.

```ts
export default defineConfig({
  lastUpdated: true
})
```

Requires your project to be a Git repository with commit history.

## cleanUrls

Removes `.html` from all URLs, so `/guide/introduction.html` becomes `/guide/introduction`.

```ts
export default defineConfig({
  cleanUrls: true
})
```

> **Note:** Your hosting provider must support URL rewriting for this to work correctly. Vercel and Netlify support it out of the box.

## srcDir

By default VitePress looks for markdown files in the same directory as your config. Use `srcDir` to point to a different folder.

```ts
export default defineConfig({
  srcDir: './pages'   // markdown files live in docs/pages/
})
```

## outDir

The directory where the built site is output. Relative to the project root.

```ts
export default defineConfig({
  outDir: '../dist'   // output to project root /dist
})
```

## Head Tags

Inject custom tags into the `<head>` of every page:

```ts
export default defineConfig({
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { property: 'og:title', content: 'MyDocs' }],
    ['script', { src: 'https://cdn.example.com/analytics.js' }]
  ]
})
```

Each entry is a tuple of `[tag, attributes, content?]`.

## Markdown Options

Customize the Markdown renderer:

```ts
export default defineConfig({
  markdown: {
    theme: 'material-theme-palenight',  // code block theme
    lineNumbers: true,                   // show line numbers
    toc: { level: [2, 3] },             // TOC depth
    config(md) {
      // use markdown-it plugins
      md.use(require('markdown-it-footnote'))
    }
  }
})
```

### Available Code Themes

VitePress uses [Shiki](https://shiki.matsu.io) for syntax highlighting. Popular themes include:

- `github-light` / `github-dark`
- `material-theme-palenight`
- `nord`
- `one-dark-pro`
- `dracula`

You can also use different themes for light and dark mode:

```ts
export default defineConfig({
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
})
```

## Vite Config

Pass options directly to the underlying Vite instance:

```ts
import { defineConfig } from 'vitepress'
import { resolve } from 'path'

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@': resolve(__dirname, '../src')
      }
    },
    plugins: []
  }
})
```

## Vue Config

Pass options to the Vue compiler:

```ts
export default defineConfig({
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('my-')
      }
    }
  }
})
```

## Full Example

A complete `config.ts` combining all common options:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'MyDocs',
  description: 'My documentation site',
  lang: 'en-US',
  base: '/',
  appearance: true,
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#646cff' }]
  ],

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  },

  themeConfig: {
    // ... your theme config
  }
})
```

## Next Steps

- [Theme Options](/guide/theme-options)
- [Plugins](/guide/plugins)
- [Deploy to Vercel](/guide/deploy-vercel)