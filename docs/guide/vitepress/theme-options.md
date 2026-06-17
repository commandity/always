# Theme Options

VitePress ships with a default theme that is highly configurable through `themeConfig` in your `config.ts`. This page covers all available options.

## Overview

All theme options live under the `themeConfig` key:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    // all options go here
  }
})
```

## Logo

Display a logo in the top-left navbar next to the site title:

```ts
themeConfig: {
  logo: '/logo.svg'
}
```

To show the logo without the site title text:

```ts
themeConfig: {
  logo: '/logo.svg',
  siteTitle: false   // hides the text title
}
```

You can also use a different logo for dark mode:

```ts
themeConfig: {
  logo: {
    light: '/logo-light.svg',
    dark: '/logo-dark.svg'
  }
}
```

## Navigation Bar

### Basic Links

```ts
themeConfig: {
  nav: [
    { text: 'Guide', link: '/guide/introduction' },
    { text: 'Reference', link: '/reference/config' }
  ]
}
```

### Dropdown Menus

```ts
themeConfig: {
  nav: [
    {
      text: 'More',
      items: [
        { text: 'About', link: '/about' },
        { text: 'Changelog', link: '/changelog' },
        {
          // nested group with a label
          items: [
            { text: 'Twitter', link: 'https://twitter.com' },
            { text: 'Discord', link: 'https://discord.com' }
          ]
        }
      ]
    }
  ]
}
```

### Active Link Matching

By default the active state is determined by whether the current URL starts with the link path. Override it with `activeMatch`:

```ts
themeConfig: {
  nav: [
    {
      text: 'Guide',
      link: '/guide/introduction',
      activeMatch: '/guide/'   // highlight for any /guide/* page
    }
  ]
}
```

## Sidebar

### Simple Array

Show the same sidebar on every page:

```ts
themeConfig: {
  sidebar: [
    {
      text: 'Getting Started',
      items: [
        { text: 'Introduction', link: '/introduction' },
        { text: 'Installation', link: '/installation' }
      ]
    }
  ]
}
```

### Per-Path Sidebar

Show different sidebars depending on the current path:

```ts
themeConfig: {
  sidebar: {
    '/guide/': [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide/introduction' }
        ]
      }
    ],
    '/reference/': [
      {
        text: 'Reference',
        items: [
          { text: 'Config', link: '/reference/config' }
        ]
      }
    ]
  }
}
```

### Collapsible Groups

```ts
themeConfig: {
  sidebar: [
    {
      text: 'Advanced',
      collapsed: true,    // collapsed by default
      items: [...]
    }
  ]
}
```

Setting `collapsed: false` makes the group open by default but still shows the toggle arrow.

## Social Links

Display icon links in the top-right corner of the navbar:

```ts
themeConfig: {
  socialLinks: [
    { icon: 'github',   link: 'https://github.com/your-username' },
    { icon: 'twitter',  link: 'https://twitter.com/your-handle' },
    { icon: 'discord',  link: 'https://discord.gg/your-server' },
    { icon: 'youtube',  link: 'https://youtube.com/@your-channel' },
    { icon: 'linkedin', link: 'https://linkedin.com/in/your-profile' }
  ]
}
```

### Custom SVG Icon

```ts
themeConfig: {
  socialLinks: [
    {
      icon: {
        svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="..."/></svg>'
      },
      link: 'https://example.com'
    }
  ]
}
```

## Search

VitePress has two built-in search providers.

### Local Search (recommended)

No API key needed. Indexes all your pages at build time:

```ts
themeConfig: {
  search: {
    provider: 'local'
  }
}
```

### Algolia DocSearch

For larger sites with Algolia integration:

```ts
themeConfig: {
  search: {
    provider: 'algolia',
    options: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'YOUR_INDEX_NAME'
    }
  }
}
```

## Footer

Shown at the bottom of every page (only on pages without a sidebar):

```ts
themeConfig: {
  footer: {
    message: 'Released under the MIT License.',
    copyright: 'Copyright © 2026 MyDocs'
  }
}
```

## Edit Link

Adds an "Edit this page" link at the bottom of each doc page:

```ts
themeConfig: {
  editLink: {
    pattern: 'https://github.com/your-username/my-docs/edit/main/docs/:path',
    text: 'Edit this page on GitHub'   // optional, this is the default
  }
}
```

The `:path` token is replaced with the page's file path relative to the docs root.

## Last Updated

Show the last Git commit date at the bottom of each page. First enable it in the top-level config:

```ts
export default defineConfig({
  lastUpdated: true,   // top-level, not inside themeConfig
  themeConfig: {
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    }
  }
})
```

## Outline (Table of Contents)

Controls the right-side "On this page" panel:

```ts
themeConfig: {
  outline: {
    level: [2, 3],       // show h2 and h3 headings
    label: 'On this page'
  }
}
```

Set `level: 'deep'` to include all heading levels from h2 to h6.

## Doc Footer

Customize the previous/next page navigation links at the bottom:

```ts
themeConfig: {
  docFooter: {
    prev: 'Previous page',
    next: 'Next page'
  }
}
```

Disable them entirely on a specific page using frontmatter:

```md
---
prev: false
next: false
---
```

## Carbon Ads

VitePress supports Carbon Ads out of the box:

```ts
themeConfig: {
  carbonAds: {
    code: 'your-carbon-code',
    placement: 'your-carbon-placement'
  }
}
```

## Appearance Toggle Label

Customize the tooltip on the dark/light mode toggle:

```ts
themeConfig: {
  darkModeSwitchLabel: 'Appearance',
  lightModeSwitchTitle: 'Switch to light mode',
  darkModeSwitchTitle: 'Switch to dark mode'
}
```

## Mobile Menu Label

Customize the label for the hamburger menu on mobile:

```ts
themeConfig: {
  sidebarMenuLabel: 'Menu',
  returnToTopLabel: 'Return to top'
}
```

## Full themeConfig Example

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide',     link: '/guide/introduction' },
      { text: 'Reference', link: '/reference/config' },
      {
        text: 'More',
        items: [
          { text: 'About',     link: '/about' },
          { text: 'Changelog', link: '/changelog' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start',  link: '/guide/quick-start' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/my-docs' }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 MyDocs'
    },

    editLink: {
      pattern: 'https://github.com/your-username/my-docs/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    outline: {
      level: [2, 3],
      label: 'On this page'
    },

    docFooter: {
      prev: 'Previous page',
      next: 'Next page'
    }
  }
})
```

## Next Steps

- [Plugins](/guide/plugins)
- [Markdown Guide](/guide/markdown)
- [Site Config](/guide/site-config)