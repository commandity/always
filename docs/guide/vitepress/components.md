# Components

VitePress treats every `.md` file as a Vue Single File Component, which means you can use Vue components directly inside your Markdown files. This page covers how to create, register, and use custom components in your documentation.

## Using Vue in Markdown

Since Markdown files are Vue components under the hood, you can use Vue features directly without any setup:

````md
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

## Interactive Counter

Current count: {{ count }}

<button @click="count++">Increment</button>
<button @click="count--">Decrement</button>
<button @click="count = 0">Reset</button>
````

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

## Interactive Counter

Current count: {{ count }}

<button @click="count++">Increment</button>
<button @click="count--">Decrement</button>
<button @click="count = 0">Reset</button>

## Creating a Component

Components live in `docs/.vitepress/theme/components/`. Create the directory if it does not exist:

````
docs/
└── .vitepress/
    └── theme/
        ├── index.ts
        ├── custom.css
        └── components/
            ├── MyButton.vue
            ├── Badge.vue
            └── CodePreview.vue
````

### Basic Component Example

````vue
<!-- docs/.vitepress/theme/components/MyButton.vue -->
<script setup lang="ts">
defineProps<{
  text: string
  href?: string
  variant?: 'brand' | 'alt' | 'danger'
}>()
</script>

<template>
  
    v-if="href"
    :href="href"
    class="my-button"
    :class="`my-button--${variant ?? 'brand'}`"
  >
    {{ text }}
  </a>
  <button
    v-else
    class="my-button"
    :class="`my-button--${variant ?? 'brand'}`"
  >
    {{ text }}
  </button>
</template>

<style scoped>
.my-button {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  border: none;
  transition: opacity 0.2s;
}
.my-button:hover { opacity: 0.8; }
.my-button--brand {
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
}
.my-button--alt {
  background: var(--vp-button-alt-bg);
  color: var(--vp-button-alt-text);
}
.my-button--danger {
  background: var(--vp-c-danger-3);
  color: white;
}
</style>
````

## Registering Components Globally

To use a component on any page without importing it every time, register it globally in `docs/.vitepress/theme/index.ts`:

````ts
// docs/.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import MyButton from './components/MyButton.vue'
import Badge from './components/Badge.vue'
import CodePreview from './components/CodePreview.vue'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('MyButton', MyButton)
    app.component('Badge', Badge)
    app.component('CodePreview', CodePreview)
  }
}
````

Once registered globally, use them in any `.md` file without importing:

````md
<MyButton text="Get Started" href="/guide/introduction" />
<MyButton text="Danger Zone" variant="danger" />
````

## Importing Components Locally

For components used on only one or two pages, import them directly in the Markdown file:

````md
<script setup>
import MyButton from './.vitepress/theme/components/MyButton.vue'
</script>

<MyButton text="Click Me" />
````

Or use a path alias:

````md
<script setup>
import MyButton from '@theme/components/MyButton.vue'
</script>
````

## Practical Component Examples

### Badge Component

A small inline label useful for marking items as new, deprecated, or experimental:

````vue
<!-- docs/.vitepress/theme/components/Badge.vue -->
<script setup lang="ts">
defineProps<{
  text: string
  type?: 'info' | 'tip' | 'warning' | 'danger'
}>()
</script>

<template>
  <span class="badge" :class="`badge--${type ?? 'info'}`">
    {{ text }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.5;
  vertical-align: middle;
  margin-left: 0.4rem;
}
.badge--info    { background: var(--vp-badge-info-bg);    color: var(--vp-badge-info-text); }
.badge--tip     { background: var(--vp-badge-tip-bg);     color: var(--vp-badge-tip-text); }
.badge--warning { background: var(--vp-badge-warning-bg); color: var(--vp-badge-warning-text); }
.badge--danger  { background: var(--vp-badge-danger-bg);  color: var(--vp-badge-danger-text); }
</style>
````

Use it inline next to headings or list items:

````md
## Configuration <Badge text="New" type="tip" />

- `cleanUrls` <Badge text="Experimental" type="warning" />
- `lastUpdated` <Badge text="Deprecated" type="danger" />
````

### CodePreview Component

Show a live preview alongside the source code:

````vue
<!-- docs/.vitepress/theme/components/CodePreview.vue -->
<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="code-preview">
    <div v-if="title" class="code-preview__title">{{ title }}</div>
    <div class="code-preview__demo">
      <slot name="preview" />
    </div>
    <div class="code-preview__code">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.code-preview {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 1.5rem 0;
}
.code-preview__title {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}
.code-preview__demo {
  padding: 1.5rem;
  background: var(--vp-c-bg);
}
.code-preview__code :deep(div[class*='language-']) {
  margin: 0;
  border-radius: 0;
}
</style>
````

Usage in Markdown:

````md
<CodePreview title="Button Example">
  <template #preview>
    <MyButton text="Click Me" />
  </template>

```vue
  <MyButton text="Click Me" />
```
</CodePreview>
````

### Tabs Component

Display content in switchable tabs:

````vue
<!-- docs/.vitepress/theme/components/Tabs.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  tabs: string[]
}>()

const active = ref(0)
</script>

<template>
  <div class="tabs">
    <div class="tabs__header">
      <button
        v-for="(tab, i) in tabs"
        :key="tab"
        class="tabs__tab"
        :class="{ 'tabs__tab--active': active === i }"
        @click="active = i"
      >
        {{ tab }}
      </button>
    </div>
    <div class="tabs__content">
      <slot :name="tabs[active]" />
    </div>
  </div>
</template>

<style scoped>
.tabs__header {
  display: flex;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 1rem;
}
.tabs__tab {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.2s, border-color 0.2s;
}
.tabs__tab--active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
  font-weight: 600;
}
.tabs__tab:hover { color: var(--vp-c-text-1); }
</style>
````

Usage:

````md
<Tabs :tabs="['macOS', 'Windows', 'Linux']">
  <template #macOS>
    Install with Homebrew: `brew install node`
  </template>
  <template #Windows>
    Download the installer from [nodejs.org](https://nodejs.org).
  </template>
  <template #Linux>
    Install with your package manager: `sudo apt install nodejs`
  </template>
</Tabs>
````

### Prop Table Component

A styled table for documenting component props:

````vue
<!-- docs/.vitepress/theme/components/PropTable.vue -->
<script setup lang="ts">
defineProps<{
  props: Array<{
    name: string
    type: string
    default?: string
    description: string
    required?: boolean
  }>
}>()
</script>

<template>
  <table class="prop-table">
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="prop in props" :key="prop.name">
        <td>
          <code>{{ prop.name }}</code>
          <span v-if="prop.required" class="required">*</span>
        </td>
        <td><code>{{ prop.type }}</code></td>
        <td><code>{{ prop.default ?? '—' }}</code></td>
        <td>{{ prop.description }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.prop-table { width: 100%; border-collapse: collapse; }
.prop-table th, .prop-table td {
  padding: 0.6rem 1rem;
  border: 1px solid var(--vp-c-divider);
  font-size: 0.9rem;
}
.prop-table th { background: var(--vp-c-bg-soft); font-weight: 600; }
.required { color: var(--vp-c-danger-1); margin-left: 2px; }
</style>
````

Usage:

````md
<PropTable :props="[
  { name: 'text', type: 'string', required: true, description: 'Button label' },
  { name: 'href', type: 'string', default: 'undefined', description: 'Makes the button a link' },
  { name: 'variant', type: 'brand | alt | danger', default: 'brand', description: 'Visual style' }
]" />
````

## Layout Slots

VitePress exposes named slots in the default layout that you can fill with custom components. Use them in `theme/index.ts`:

````ts
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import MyBanner from './components/MyBanner.vue'
import MyFooter from './components/MyFooter.vue'

export default {
  ...DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-before':    () => h(MyBanner),
      'home-features-after': () => h(MyFooter),
    })
  }
}
````

### Available Layout Slots

| Slot                        | Location                              |
| --------------------------- | ------------------------------------- |
| `layout-top`                | Very top of every page                |
| `layout-bottom`             | Very bottom of every page             |
| `nav-bar-title-before`      | Before the logo/title in the navbar   |
| `nav-bar-title-after`       | After the logo/title in the navbar    |
| `nav-bar-content-before`    | Before nav links                      |
| `nav-bar-content-after`     | After nav links (before social icons) |
| `nav-screen-content-before` | Mobile menu — before nav links        |
| `nav-screen-content-after`  | Mobile menu — after nav links         |
| `sidebar-nav-before`        | Top of the sidebar                    |
| `sidebar-nav-after`         | Bottom of the sidebar                 |
| `page-top`                  | Top of the content area               |
| `page-bottom`               | Bottom of the content area            |
| `doc-before`                | Before the doc content                |
| `doc-after`                 | After the doc content                 |
| `doc-footer-before`         | Before the prev/next footer           |
| `aside-top`                 | Top of the right outline panel        |
| `aside-bottom`              | Bottom of the right outline panel     |
| `aside-outline-before`      | Before the outline list               |
| `aside-outline-after`       | After the outline list                |
| `home-hero-before`          | Before the hero section               |
| `home-hero-image`           | Hero image slot                       |
| `home-hero-after`           | After the hero section                |
| `home-features-before`      | Before the features grid              |
| `home-features-after`       | After the features grid               |

## Using Third-Party Vue Components

Install any Vue 3 compatible component library and register it in `theme/index.ts`:

````bash
npm install @vueuse/components
````

````ts
import DefaultTheme from 'vitepress/theme'
import { UseMouseComponent } from '@vueuse/components'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('UseMouse', UseMouseComponent)
  }
}
````

## ClientOnly Wrapper

Some components use browser APIs that are not available during server-side rendering. Wrap them in `<ClientOnly>` to prevent SSR errors:

````md
<ClientOnly>
  <MyMapComponent />
</ClientOnly>
````

Or inside a Vue component:

````vue
<template>
  <ClientOnly>
    <canvas ref="chartCanvas" />
  </ClientOnly>
</template>
````

## Best Practices

Use `scoped` styles in every component to avoid leaking CSS into the rest of the page. Always use VitePress CSS variables (`--vp-c-brand-1`, `--vp-c-bg`, `--vp-c-divider`, etc.) for colors so your components automatically support dark mode. Keep components small and focused — if a component grows beyond 150 lines, consider splitting it. Name globally registered components with a prefix like `Vp` or your project name to avoid conflicts with HTML elements and third-party components.

## Next Steps

- [Markdown Guide](/guide/markdown)
- [Frontmatter](/guide/frontmatter)
- [Theme Options](/guide/theme-options)