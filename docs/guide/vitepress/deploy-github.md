# Deploy to GitHub Pages

GitHub Pages is a free static site hosting service built directly into GitHub. Every repository gets a free `github.io` subdomain, making it the easiest option if your docs are already hosted on GitHub.

## Prerequisites

Before deploying, make sure you have:

- A GitHub account and a repository for your project
- Your VitePress project pushed to the repository
- A working build (`npm run docs:build` completes without errors)
- GitHub Actions enabled on your repository (it is by default)

## How It Works

GitHub Actions watches your repository for pushes, runs your build command, and publishes the output to a special `gh-pages` branch. GitHub Pages then serves that branch as a static website — all automatically on every push to `main`.

## Step 1 — Set the Base URL

If your site is deployed to a subdirectory (e.g. `https://username.github.io/my-docs/`), you must set the `base` option in `config.ts` to match:

```ts
// docs/.vitepress/config.ts
export default defineConfig({
  base: '/my-docs/'   // must match your repository name exactly
})
```

If you are deploying to a custom domain or a user/organization site at the root (e.g. `https://username.github.io/`), set `base: '/'` or omit it entirely.

## Step 2 — Create the GitHub Actions Workflow

Create the following file in your repository:

```
.github/
└── workflows/
    └── deploy.yml
```

```yaml
# .github/workflows/deploy.yml
name: Deploy VitePress to GitHub Pages

on:
  push:
    branches:
      - main   # change to your default branch if different

  workflow_dispatch:   # allows manual trigger from the Actions tab

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0   # required for lastUpdated to work

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build VitePress site
        run: npm run docs:build

      - name: Upload build artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Step 3 — Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings → Pages**
3. Under **Build and deployment**, set the source to **GitHub Actions**
4. Save the settings

Now push any change to `main` and the workflow will trigger automatically. Your site will be live at:

```
https://your-username.github.io/your-repo-name/
```

## Custom Domain

To use your own domain instead of the default `github.io` URL:

### 1. Add a CNAME File

Create a `docs/public/CNAME` file containing just your domain:

```
docs.example.com
```

VitePress copies everything in `public/` to the build output, so the CNAME file will be included automatically.

### 2. Configure DNS

Add a DNS record at your domain registrar:

| Type    | Host   | Value                     |
| ------- | ------ | ------------------------- |
| `CNAME` | `docs` | `your-username.github.io` |

For apex domains (e.g. `example.com` without a subdomain), add four `A` records pointing to GitHub's IP addresses:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

### 3. Enable in GitHub Settings

1. Go to **Settings → Pages → Custom domain**
2. Enter your domain and click **Save**
3. Check **Enforce HTTPS** once the DNS has propagated

### 4. Update base in config.ts

When using a custom domain, set `base` back to `/`:

```ts
export default defineConfig({
  base: '/'
})
```

## Environment Variables

Add secrets and environment variables in:

**Repository → Settings → Secrets and variables → Actions**

Reference them in your workflow:

```yaml
- name: Build VitePress site
  run: npm run docs:build
  env:
    VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
```

## Monorepo Setup

If your VitePress docs live inside a monorepo alongside other packages, adjust the workflow paths:

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'docs/**'         # only trigger when docs change
      - '.github/workflows/deploy.yml'

steps:
  - name: Install dependencies
    run: npm ci
    working-directory: ./docs

  - name: Build VitePress site
    run: npm run docs:build
    working-directory: ./docs

  - name: Upload build artifact
    uses: actions/upload-pages-artifact@v3
    with:
      path: docs/.vitepress/dist
```

## Caching Dependencies

Speed up your workflow by caching `node_modules` between runs:

```yaml
- name: Cache node modules
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: Install dependencies
  run: npm ci
```

The `actions/setup-node@v4` step with `cache: npm` already does this automatically, so you only need the explicit cache step if you have a more complex setup.

## Deploy to Multiple Environments

Deploy to a staging environment on pull requests and production on merge:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run docs:build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy preview
        run: echo "Deploy to staging environment here"

  deploy-production:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Rollbacks

GitHub Pages does not have a one-click rollback button like Vercel or Netlify, but you can redeploy any previous workflow run:

1. Go to **Actions** in your repository
2. Find a previous successful **Deploy VitePress to GitHub Pages** run
3. Click **Re-run jobs → Re-run all jobs**

GitHub will rebuild and redeploy from that exact commit.

Alternatively, revert your commit and push:

```bash
git revert HEAD
git push origin main
```

This triggers a new deployment that reverts the change.

## Troubleshooting

### Site shows a blank page or broken styles

This usually means the `base` option is missing or incorrect. Double-check it matches your repository name exactly, including the leading and trailing slashes:

```ts
export default defineConfig({
  base: '/my-docs/'   // ✅ correct
  // base: 'my-docs'  // ❌ missing slashes
  // base: '/My-Docs/' // ❌ case mismatch
})
```

### Workflow fails with "Permission denied"

Make sure GitHub Pages permissions are set correctly in your repository:

1. Go to **Settings → Actions → General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Save and re-run the workflow

### Pages source is not set to GitHub Actions

If your site shows a 404 after the workflow succeeds, check:

1. **Settings → Pages → Build and deployment**
2. Make sure **Source** is set to **GitHub Actions**, not **Deploy from a branch**

### lastUpdated shows wrong dates

The `fetch-depth: 0` option in the checkout step is required for Git history to be available:

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
  with:
    fetch-depth: 0   # ← do not remove this
```

Without it, all pages show the same timestamp.

### Build succeeds but deploy step fails

Check that the `pages` and `id-token` permissions are set at the top of the workflow file:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

## Comparison: GitHub Pages vs Vercel vs Netlify

| Feature              | GitHub Pages         | Vercel          | Netlify          |
| -------------------- | -------------------- | --------------- | ---------------- |
| Price                | Free                 | Free tier       | Free tier        |
| Custom domain        | ✅                    | ✅               | ✅                |
| Automatic HTTPS      | ✅                    | ✅               | ✅                |
| Deploy previews      | ❌                    | ✅               | ✅                |
| Serverless functions | ❌                    | ✅               | ✅                |
| Rollbacks            | Manual               | One-click       | One-click        |
| Build minutes        | 2,000/month          | Unlimited       | 300/month        |
| Bandwidth            | 100 GB/month         | 100 GB/month    | 100 GB/month     |
| Best for             | Open source projects | Production apps | Marketing & docs |

GitHub Pages is the best choice for open source projects that are already on GitHub and want zero infrastructure overhead.

## Next Steps

- [Deploy to Vercel](/guide/deploy-vercel)
- [Deploy to Netlify](/guide/deploy-netlify)
- [Site Config](/guide/site-config)