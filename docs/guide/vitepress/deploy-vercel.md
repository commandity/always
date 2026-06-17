---
title: Deploying VitePress to Vercel in 5 Minutes
date: 2026-03-01
tags:
  - deployment
  - vercel
  - vitepress
  - devops
---

# Deploy to Vercel

Vercel is the easiest platform to deploy your VitePress site. It offers zero-config deployments, automatic HTTPS, and a global CDN out of the box.

## Prerequisites

Before deploying, make sure you have:

- A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
- Your project pushed to a GitHub, GitLab, or Bitbucket repository
- A working VitePress build (`npm run docs:build` completes without errors)

## Quick Deploy

The fastest way to deploy is directly from the Vercel dashboard:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect VitePress and configure the build settings
4. Click **Deploy**

Your site will be live at `https://your-project.vercel.app` within seconds.

## Manual Build Configuration

If Vercel does not auto-detect your setup, configure it manually in the dashboard or via `vercel.json`:

### Dashboard Settings

| Setting          | Value                  |
| ---------------- | ---------------------- |
| Framework Preset | VitePress              |
| Build Command    | `npm run docs:build`   |
| Output Directory | `docs/.vitepress/dist` |
| Install Command  | `npm install`          |

### vercel.json

Alternatively, create a `vercel.json` in your project root:

```json
{
  "buildCommand": "npm run docs:build",
  "outputDirectory": "docs/.vitepress/dist",
  "installCommand": "npm install",
  "framework": null
}
```

## Environment Variables

If your VitePress config references environment variables, add them in:

**Vercel Dashboard → Project → Settings → Environment Variables**

```bash
# Example
VITE_API_BASE_URL=https://api.example.com
```

Then access them in your config:

```ts
// docs/.vitepress/config.ts
export default defineConfig({
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_BASE_URL)
  }
})
```

## Custom Domain

To attach your own domain:

1. Go to **Project → Settings → Domains**
2. Add your domain (e.g. `docs.example.com`)
3. Update your DNS with the CNAME record Vercel provides
4. Vercel automatically provisions an SSL certificate

## Automatic Deployments

Every push to your default branch triggers a new production deployment. Pull requests automatically get **preview URLs**, so you can review docs changes before merging.

| Event               | Result                |
| ------------------- | --------------------- |
| Push to `main`      | Production deployment |
| Pull request opened | Preview deployment    |
| Pull request merged | Production updated    |

## Rollbacks

If a deployment introduces a bug:

1. Go to **Project → Deployments**
2. Find the last working deployment
3. Click **Promote to Production**

Vercel instantly rolls back with zero downtime.

## Troubleshooting

### Build fails with "Cannot find module"

Make sure all dependencies are in `dependencies` or `devDependencies` in your `package.json`, then redeploy.

### Output directory not found

Double-check your output directory matches your VitePress config. If you use a custom `outDir`:

```ts
// docs/.vitepress/config.ts
export default defineConfig({
  outDir: '../dist'   // ← must match Vercel output directory setting
})
```

### Pages return 404

Add a `vercel.json` with rewrite rules:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Next Steps

- [Deploy to Netlify](/guide/deploy-netlify)
- [Deploy to GitHub Pages](/guide/deploy-github)
- [Site Config Reference](/reference/config)