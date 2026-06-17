# Installation

## Prerequisites

- [Node.js](https://nodejs.org/) version **18** or higher
- npm, pnpm, or yarn

## Option A — Scaffold a new project (recommended)

```bash
npm create vitepress@latest my-docs
cd my-docs
npm install
npm run docs:dev
```

Your site is now running at `http://localhost:5173`.

## Option B — Add to an existing project

```bash
npm install -D vitepress
```

Then add these scripts to your `package.json`:

```json
{
  "scripts": {
    "docs:dev":     "vitepress dev docs",
    "docs:build":   "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  }
}
```

## Build for production

```bash
npm run docs:build
```

The output goes to `docs/.vitepress/dist/` — deploy that folder to any static host.
