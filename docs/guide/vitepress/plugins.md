# Plugins

VitePress supports two categories of plugins: **Vite plugins** for build-time tooling and **markdown-it plugins** for extending the Markdown renderer. This page covers how to install and configure both.

## Vite Plugins

Since VitePress is built on top of Vite, you can use any Vite-compatible plugin directly in your config.

### Adding a Vite Plugin

Pass plugins via the `vite` option in `config.ts`:

````ts
import { defineConfig } from 'vitepress'
import MyPlugin from 'vite-plugin-example'

export default defineConfig({
  vite: {
    plugins: [
      MyPlugin()
    ]
  }
})
````

### Popular Vite Plugins for Docs Sites

#### vite-plugin-pwa

Turns your docs site into a Progressive Web App with offline support:

````bash
npm install -D vite-plugin-pwa
````

````ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  vite: {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'MyDocs',
          short_name: 'MyDocs',
          theme_color: '#646cff',
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
          ]
        }
      })
    ]
  }
})
````

#### vite-plugin-inspect

Inspect the intermediate state of Vite plugins during development — useful for debugging:

````bash
npm install -D vite-plugin-inspect
````

````ts
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  vite: {
    plugins: [Inspect()]
  }
})
````

Visit `http://localhost:5173/__inspect/` to see the plugin inspector UI.

#### unplugin-icons

Use any icon set (Material, Heroicons, Tabler, etc.) as Vue components:

````bash
npm install -D unplugin-icons @iconify/json
````

````ts
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  vite: {
    plugins: [
      Icons({ compiler: 'vue3' })
    ]
  }
})
````

Then use icons directly in Vue components or `.md` files:

````vue
<script setup>
import IconSun from '~icons/heroicons/sun'
</script>

<IconSun />
````

## Markdown-it Plugins

VitePress uses [markdown-it](https://github.com/markdown-it/markdown-it) under the hood. You can extend it with any markdown-it-compatible plugin.

### Adding a Markdown-it Plugin

Use the `markdown.config` option:

````ts
export default defineConfig({
  markdown: {
    config(md) {
      md.use(require('markdown-it-plugin-name'))
    }
  }
})
````

### Popular Markdown-it Plugins

#### markdown-it-footnote

Adds footnote support:

````bash
npm install -D markdown-it-footnote
````

````ts
import footnote from 'markdown-it-footnote'

export default defineConfig({
  markdown: {
    config(md) {
      md.use(footnote)
    }
  }
})
````

Usage in Markdown:

````md
This is a sentence with a footnote.[^1]

[^1]: This is the footnote content.
````

#### markdown-it-task-lists

Renders GitHub-style task lists:

````bash
npm install -D markdown-it-task-lists
````

````ts
import taskLists from 'markdown-it-task-lists'

export default defineConfig({
  markdown: {
    config(md) {
      md.use(taskLists)
    }
  }
})
````

Usage in Markdown:

````md
- [x] Completed task
- [ ] Pending task
- [ ] Another pending task
````

#### markdown-it-attrs

Add HTML attributes and CSS classes directly to Markdown elements:

````bash
npm install -D markdown-it-attrs
````

````ts
import attrs from 'markdown-it-attrs'

export default defineConfig({
  markdown: {
    config(md) {
      md.use(attrs)
    }
  }
})
````

Usage in Markdown:

````md
# My Heading { .custom-class }

A paragraph with a custom id. { #my-id }
````

#### markdown-it-mathjax3

Render LaTeX math equations:

````bash
npm install -D markdown-it-mathjax3
````

````ts
import mathjax3 from 'markdown-it-mathjax3'

export default defineConfig({
  markdown: {
    config(md) {
      md.use(mathjax3)
    }
  }
})
````

Usage in Markdown:

````md
Inline math: $E = mc^2$

Block math:
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
````

## Built-in VitePress Features

VitePress ships with several powerful features that do not require any extra plugins.

### Syntax Highlighting

All code blocks are automatically highlighted using [Shiki](https://shiki.matsu.io). Specify the language after the opening fence:

````md
```ts
const message: string = 'Hello, VitePress'
console.log(message)
```
````

Supported languages include `ts`, `js`, `vue`, `html`, `css`, `json`, `bash`, `python`, `go`, `rust`, and [hundreds more](https://shiki.matsu.io/languages).

### Line Highlighting

Highlight specific lines in a code block:

````md
```ts{2,4-6}
const a = 1       // line 1
const b = 2       // line 2 — highlighted
const c = 3       // line 3
const d = 4       // line 4 — highlighted
const e = 5       // line 5 — highlighted
const f = 6       // line 6 — highlighted
```
````

### Code Groups

Display multiple code snippets in a tabbed interface:

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

### Custom Containers

VitePress has built-in containers for callouts:

````md
::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details Click to expand
This content is hidden by default.
:::
````

### Image Lazy Loading

Enable lazy loading for all images:

````ts
export default defineConfig({
  markdown: {
    image: {
      lazyLoading: true
    }
  }
})
````

## Building a Custom Plugin

You can write your own Vite plugin tailored to your docs site:

````ts
// plugins/my-plugin.ts
import type { Plugin } from 'vite'

export function myDocsPlugin(): Plugin {
  return {
    name: 'my-docs-plugin',
    transform(code, id) {
      if (!id.endsWith('.md')) return
      // transform markdown content here
      return code
    }
  }
}
````

Then use it in your config:

````ts
import { myDocsPlugin } from './plugins/my-docs-plugin'

export default defineConfig({
  vite: {
    plugins: [myDocsPlugin()]
  }
})
````

## Plugin Compatibility

| Plugin                   | Type     | Purpose               |
| ------------------------ | -------- | --------------------- |
| `vite-plugin-pwa`        | Vite     | Offline / PWA support |
| `vite-plugin-inspect`    | Vite     | Debug plugin pipeline |
| `unplugin-icons`         | Vite     | Icon components       |
| `markdown-it-footnote`   | Markdown | Footnotes             |
| `markdown-it-task-lists` | Markdown | Checkboxes            |
| `markdown-it-attrs`      | Markdown | Custom attributes     |
| `markdown-it-mathjax3`   | Markdown | Math equations        |

## Next Steps

- [Markdown Guide](/guide/markdown)
- [Site Config](/guide/site-config)
- [Deploy to Vercel](/guide/deploy-vercel)