# Config Reference

All configuration lives in `docs/.vitepress/config.ts`.

## Top-level options

| Option | Type | Description |
|--------|------|-------------|
| `title` | `string` | Site title shown in the browser tab and navbar |
| `description` | `string` | Meta description for SEO |
| `lang` | `string` | HTML lang attribute, e.g. `en-US` |
| `appearance` | `boolean \| 'dark'` | Dark mode setting. `true` = follow system (default) |

## `themeConfig.nav`

Array of top navigation links:

```ts
nav: [
  { text: 'Guide', link: '/guide/introduction' },
  {
    text: 'More',
    items: [
      { text: 'About', link: '/about' }
    ]
  }
]
```

## `themeConfig.sidebar`

Object keyed by path prefix, each value is an array of groups:

```ts
sidebar: {
  '/guide/': [
    {
      text: 'Group label',
      collapsed: false,   // true = collapsed by default
      items: [
        { text: 'Page name', link: '/guide/page' }
      ]
    }
  ]
}
```

## `themeConfig.search`

Enable built-in local search (⌘K shortcut included):

```ts
search: {
  provider: 'local'
}
```

No external service or API key required.
