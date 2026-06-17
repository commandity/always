# MyDocs — VitePress Starter

A documentation site starter with all 5 features pre-configured:

- 🌙 Dark / light mode toggle
- 📁 Left sidebar with collapsible groups
- 🔗 Top navigation bar with hyperlinks
- ⌘K Search bar with keyboard shortcut
- 📱 Mobile-responsive layout

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (hot reload)
npm run docs:dev

# 3. Build for production
npm run docs:build

# 4. Preview the production build
npm run docs:preview
```

## File & folder structure

```
my-docs/
├── package.json                  ← npm scripts & dependencies
├── .gitignore
├── README.md
└── docs/
    ├── index.md                  ← Home page (hero layout)
    ├── guide/
    │   ├── introduction.md
    │   ├── installation.md
    │   └── quick-start.md
    ├── reference/
    │   └── config.md
    └── .vitepress/
        ├── config.ts             ← ALL site config (nav, sidebar, search, theme)
        └── theme/                ← Optional: custom theme overrides
            └── index.ts          ← (create if you need custom styles/components)
```

## How to add a new page

1. Create a `.md` file anywhere inside `docs/`
2. Add it to the sidebar in `docs/.vitepress/config.ts`

Example — adding `docs/guide/my-page.md`:

```ts
// in config.ts → themeConfig.sidebar['/guide/']
{
  text: 'My Group',
  items: [
    { text: 'My Page', link: '/guide/my-page' }
  ]
}
```

## Deployment

Build output goes to `docs/.vitepress/dist/`. Deploy that folder to:

- **Vercel** — connect your repo, set build command to `npm run docs:build`, output dir to `docs/.vitepress/dist`
- **Netlify** — same build command and publish directory
- **GitHub Pages** — use the official [VitePress GitHub Actions workflow](https://vitepress.dev/guide/deploy#github-pages)
