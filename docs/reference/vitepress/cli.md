# CLI Reference

VitePress ships with a built-in command-line interface. Once installed, you can run `vitepress` commands directly via `npx` or through scripts defined in your `package.json`.

## Commands Overview

| Command                    | Description                             |
| -------------------------- | --------------------------------------- |
| `vitepress dev [root]`     | Start the local development server      |
| `vitepress build [root]`   | Build the site for production           |
| `vitepress preview [root]` | Preview the production build locally    |
| `vitepress init [root]`    | Run the setup wizard in a new directory |

The `[root]` argument is the path to your docs folder. It defaults to the current working directory if omitted.

## vitepress dev

Starts a local development server with hot module replacement. Changes to Markdown files, config, and Vue components are reflected instantly in the browser without a full page reload.

```bash
vitepress dev docs
```

### Options

| Option         | Default     | Description                      |
| -------------- | ----------- | -------------------------------- |
| `--port`       | `5173`      | Port to listen on                |
| `--host`       | `localhost` | Hostname to bind to              |
| `--open`       | `false`     | Open browser on startup          |
| `--base`       | `/`         | Public base path                 |
| `--cors`       | `false`     | Enable CORS headers              |
| `--strictPort` | `false`     | Exit if port is already in use   |
| `--force`      | `false`     | Force dependency re-optimization |

### Examples

```bash
# Start on the default port
vitepress dev docs

# Start on a custom port
vitepress dev docs --port 3000

# Open the browser automatically
vitepress dev docs --open

# Expose to the local network (useful for testing on mobile)
vitepress dev docs --host 0.0.0.0

# Start on a specific port and fail if it is already taken
vitepress dev docs --port 4000 --strictPort
```

### package.json Script

```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs"
  }
}
```

```bash
npm run docs:dev
```

## vitepress build

Builds the site for production. The output is a fully static site with pre-rendered HTML, optimized JavaScript bundles, and hashed asset filenames for long-term caching.

```bash
vitepress build docs
```

### Options

| Option                | Default           | Description                                  |
| --------------------- | ----------------- | -------------------------------------------- |
| `--base`              | `/`               | Public base path                             |
| `--target`            | `modules`         | Transpile target for the build               |
| `--outDir`            | `.vitepress/dist` | Output directory relative to project root    |
| `--minify`            | `esbuild`         | Minifier to use (`esbuild` or `terser`)      |
| `--assetsInlineLimit` | `4096`            | Inline assets smaller than this size (bytes) |
| `--no-ssr`            | —                 | Disable server-side rendering                |

### Examples

```bash
# Standard production build
vitepress build docs

# Build with a custom output directory
vitepress build docs --outDir ./dist

# Build without SSR (client-side rendering only)
vitepress build docs --no-ssr

# Build with terser for smaller bundles (slower)
vitepress build docs --minify terser
```

### package.json Script

```json
{
  "scripts": {
    "docs:build": "vitepress build docs"
  }
}
```

```bash
npm run docs:build
```

### Build Output Structure

After a successful build, the output directory contains:

```
docs/.vitepress/dist/
├── index.html
├── 404.html
├── guide/
│   ├── introduction.html
│   ├── installation.html
│   └── quick-start.html
├── reference/
│   ├── config.html
│   └── cli.html
└── assets/
    ├── app.abc123.js
    ├── chunks/
    └── inter-xyz789.woff2
```

All asset filenames include a content hash, so browsers always serve the latest version after a deployment.

## vitepress preview

Serves the production build locally so you can verify the output before deploying. Unlike `vitepress dev`, this command serves the already-built static files from `docs/.vitepress/dist`.

```bash
vitepress preview docs
```

> **Note:** Always run `vitepress build` before `vitepress preview`. The preview server serves whatever is currently in the `dist` folder.

### Options

| Option         | Default     | Description                    |
| -------------- | ----------- | ------------------------------ |
| `--port`       | `4173`      | Port to listen on              |
| `--host`       | `localhost` | Hostname to bind to            |
| `--base`       | `/`         | Public base path               |
| `--open`       | `false`     | Open browser on startup        |
| `--strictPort` | `false`     | Exit if port is already in use |

### Examples

```bash
# Preview on the default port
vitepress preview docs

# Preview on a custom port
vitepress preview docs --port 8080

# Open the browser automatically
vitepress preview docs --open

# Expose to the local network
vitepress preview docs --host 0.0.0.0
```

### package.json Script

```json
{
  "scripts": {
    "docs:preview": "vitepress preview docs"
  }
}
```

```bash
npm run docs:preview
```

## vitepress init

Runs an interactive setup wizard to scaffold a new VitePress project. If you run it inside an existing project, it adds VitePress configuration without overwriting existing files.

```bash
vitepress init
```

### What It Creates

Running `vitepress init` in an empty directory creates:

```
my-docs/
├── docs/
│   ├── .vitepress/
│   │   └── config.ts
│   ├── api-examples.md
│   ├── markdown-examples.md
│   └── index.md
├── package.json
└── node_modules/
```

### Wizard Prompts

```
┌  Welcome to VitePress!
│
◇  Where should VitePress initialize the config?
│  ./docs
│
◇  Site title:
│  My Awesome Docs
│
◇  Site description:
│  A VitePress Site
│
◇  Theme:
│  Default Theme
│
◇  Use TypeScript for config and theme files?
│  Yes
│
◇  Add VitePress npm scripts to package.json?
│  Yes
│
└  Done!
```

## Full package.json Setup

A complete scripts block for a VitePress project:

```json
{
  "name": "my-docs",
  "type": "module",
  "scripts": {
    "docs:dev":     "vitepress dev docs",
    "docs:build":   "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  "devDependencies": {
    "vitepress": "^1.0.0"
  }
}
```

## Using npx

If you have not installed VitePress globally, run all commands with `npx`:

```bash
npx vitepress dev docs
npx vitepress build docs
npx vitepress preview docs
```

## Global Installation

Install VitePress globally to run commands without `npx`:

```bash
npm install -g vitepress
```

```bash
vitepress dev docs
vitepress build docs
vitepress preview docs
```

> **Note:** Global installation is not recommended for team projects. Pin the version in `devDependencies` instead to ensure everyone uses the same version.

## Environment Variables

VitePress respects the following environment variables at build time:

| Variable   | Description                                                       |
| ---------- | ----------------------------------------------------------------- |
| `NODE_ENV` | Set to `production` during `vitepress build`                      |
| `VITE_*`   | Any variable prefixed with `VITE_` is exposed to client-side code |

### Using .env Files

Create `.env` files in your project root to define environment-specific variables:

```bash
# .env
VITE_API_URL=https://api.example.com

# .env.development
VITE_API_URL=http://localhost:3000

# .env.production
VITE_API_URL=https://api.example.com
```

Access them in your config or Vue components:

```ts
// Available in config.ts
console.log(process.env.VITE_API_URL)

// Available in Vue components and Markdown
console.log(import.meta.env.VITE_API_URL)
```

## Debugging

### Verbose Output

VitePress does not have a built-in `--verbose` flag, but you can get more output from Vite by setting the `DEBUG` environment variable:

```bash
DEBUG=vite:* npm run docs:dev
```

### Inspect Plugin Pipeline

Use `vite-plugin-inspect` to visualize how files are transformed through the plugin pipeline:

```bash
npm install -D vite-plugin-inspect
```

```ts
// docs/.vitepress/config.ts
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  vite: {
    plugins: [Inspect()]
  }
})
```

Visit `http://localhost:5173/__inspect/` while the dev server is running.

### Check VitePress Version

```bash
npx vitepress --version
```

Or check `package.json`:

```bash
cat package.json | grep vitepress
```

## Common Errors

### Port already in use

```
Error: listen EADDRINUSE: address already in use :::5173
```

Kill the process using the port and retry, or use a different port:

```bash
# Find and kill the process on port 5173
lsof -ti:5173 | xargs kill

# Or just use a different port
vitepress dev docs --port 3000
```

### Cannot find module 'vitepress'

```
Error: Cannot find module 'vitepress'
```

VitePress is not installed. Run:

```bash
npm install
```

Or install it explicitly:

```bash
npm install -D vitepress
```

### Build fails with out of memory

For very large documentation sites, the Node.js heap may run out of memory during the build. Increase the limit:

```json
{
  "scripts": {
    "docs:build": "node --max-old-space-size=4096 node_modules/.bin/vitepress build docs"
  }
}
```

### Config file not found

```
failed to load config from /path/to/docs/.vitepress/config.ts
```

Make sure your config file exists at `docs/.vitepress/config.ts` and contains a valid default export:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'MyDocs'
})
```

## Next Steps

- [Config Reference](/reference/config)
- [Frontmatter Reference](/reference/frontmatter)
- [Deploy to Vercel](/guide/deploy-vercel)