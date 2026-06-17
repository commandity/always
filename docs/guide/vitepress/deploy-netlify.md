# Deploy to Netlify

Netlify is a popular platform for deploying static sites with zero configuration, automatic HTTPS, instant rollbacks, and a generous free tier. This guide walks you through deploying your VitePress site to Netlify.

## Prerequisites

Before deploying, make sure you have:

- A [Netlify account](https://app.netlify.com/signup) (free tier is sufficient)
- Your project pushed to a GitHub, GitLab, or Bitbucket repository
- A working VitePress build (`npm run docs:build` completes without errors)

## Quick Deploy

The fastest way to get started is directly from the Netlify dashboard:

1. Go to [app.netlify.com](https://app.netlify.com) and log in
2. Click **Add new site → Import an existing project**
3. Connect your Git provider and select your repository
4. Configure the build settings (see below)
5. Click **Deploy site**

Your site will be live at `https://your-site-name.netlify.app` within minutes.

## Build Configuration

### Dashboard Settings

When importing your project, set the following in the Netlify dashboard:

| Setting           | Value                           |
| ----------------- | ------------------------------- |
| Base directory    | *(leave blank unless monorepo)* |
| Build command     | `npm run docs:build`            |
| Publish directory | `docs/.vitepress/dist`          |
| Node version      | `18` or higher                  |

### netlify.toml

For a more reproducible setup, commit a `netlify.toml` file to your project root:

```toml
[build]
  command       = "npm run docs:build"
  publish       = "docs/.vitepress/dist"

[build.environment]
  NODE_VERSION  = "18"

[[redirects]]
  from   = "/*"
  to     = "/index.html"
  status = 200
```

The `[[redirects]]` block is important — it ensures that direct URL access and page refreshes work correctly with VitePress's client-side routing.

## Custom Domain

To attach your own domain to your Netlify site:

1. Go to **Site configuration → Domain management**
2. Click **Add a domain**
3. Enter your domain (e.g. `docs.example.com`)
4. Update your DNS provider with the records Netlify provides:
   - For apex domains: Add an `A` record pointing to Netlify's load balancer IP
   - For subdomains: Add a `CNAME` record pointing to your Netlify subdomain
5. Netlify automatically provisions a free SSL certificate via Let's Encrypt

DNS propagation can take up to 48 hours, though it usually resolves within minutes.

## Environment Variables

If your VitePress config uses environment variables, add them in:

**Netlify Dashboard → Site configuration → Environment variables**

```bash
# Example variables
VITE_API_BASE_URL=https://api.example.com
VITE_ALGOLIA_APP_ID=YOUR_APP_ID
```

Access them in your config:

```ts
// docs/.vitepress/config.ts
export default defineConfig({
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_BASE_URL)
  }
})
```

## Automatic Deployments

Netlify watches your repository and deploys automatically on every push:

| Event                    | Result                         |
| ------------------------ | ------------------------------ |
| Push to `main`           | Production deployment          |
| Push to any other branch | Branch preview deployment      |
| Pull request opened      | Deploy preview with unique URL |
| Pull request merged      | Production updated             |

### Deploy Previews

Every pull request gets its own preview URL like:
`https://deploy-preview-42--your-site.netlify.app`

This makes it easy to review documentation changes before merging. Share the preview URL with teammates for feedback.

### Branch Deploys

Enable branch deploys in **Site configuration → Build & deploy → Branch deploys** to get a live URL for every branch:

`https://my-feature--your-site.netlify.app`

## Build Hooks

Trigger a new deployment from an external service using a build hook:

1. Go to **Site configuration → Build & deploy → Build hooks**
2. Click **Add build hook**
3. Give it a name and select the branch to deploy
4. Copy the generated webhook URL

Trigger it with a simple POST request:

```bash
curl -X POST -d '{}' https://api.netlify.com/build_hooks/YOUR_HOOK_ID
```

Useful for triggering docs rebuilds when content changes in a CMS.

## Netlify Functions

Netlify Functions let you add serverless API endpoints alongside your static docs site. Create a `netlify/functions` directory:

```
my-docs/
├── docs/
├── netlify/
│   └── functions/
│       └── hello.ts
└── netlify.toml
```

```ts
// netlify/functions/hello.ts
import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Netlify Functions!' })
  }
}
```

Access it at `/.netlify/functions/hello`.

Update `netlify.toml` to include the functions directory:

```toml
[build]
  command       = "npm run docs:build"
  publish       = "docs/.vitepress/dist"
  functions     = "netlify/functions"

[build.environment]
  NODE_VERSION  = "18"
```

## Headers and Security

Add custom HTTP headers via `netlify.toml` to improve security:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options           = "DENY"
    X-XSS-Protection          = "1; mode=block"
    X-Content-Type-Options    = "nosniff"
    Referrer-Policy           = "strict-origin-when-cross-origin"
    Permissions-Policy        = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

The second block sets aggressive caching on VitePress's hashed asset files, which never change between deployments.

## Split Testing

Netlify supports A/B testing between branches. Go to **Site configuration → Split testing** to route a percentage of traffic to a different branch — useful for testing a redesign of your docs.

## Rollbacks

If a deployment breaks something:

1. Go to **Deploys** in your site dashboard
2. Find the last working deployment
3. Click **Publish deploy**

Netlify instantly promotes the old deployment to production with zero downtime.

## Netlify CLI

The Netlify CLI lets you deploy and manage your site from the terminal:

```bash
# Install
npm install -g netlify-cli

# Log in
netlify login

# Link to an existing site
netlify link

# Run a local dev server with Netlify features
netlify dev

# Deploy a preview
netlify deploy --build

# Deploy to production
netlify deploy --build --prod
```

### Local Dev Server

`netlify dev` proxies your VitePress dev server and adds Netlify-specific features like Functions, redirects, and environment variables — exactly as they behave in production.

## Troubleshooting

### Build fails with "command not found"

Make sure your build command matches the script name in `package.json`:

```json
{
  "scripts": {
    "docs:build": "vitepress build docs"
  }
}
```

### Pages return 404 on refresh

Add the redirect rule to `netlify.toml`:

```toml
[[redirects]]
  from   = "/*"
  to     = "/index.html"
  status = 200
```

### Node version mismatch

Pin the Node version explicitly in `netlify.toml`:

```toml
[build.environment]
  NODE_VERSION = "20"
```

Or add a `.node-version` file to your project root:

```
20
```

### Build cache issues

Clear the build cache from **Deploys → Trigger deploy → Clear cache and deploy site**.

## Comparison: Netlify vs Vercel

| Feature              | Netlify             | Vercel                 |
| -------------------- | ------------------- | ---------------------- |
| Free tier bandwidth  | 100 GB/month        | 100 GB/month           |
| Serverless functions | ✅ Netlify Functions | ✅ Vercel Functions     |
| Edge functions       | ✅                   | ✅                      |
| Deploy previews      | ✅                   | ✅                      |
| Split testing        | ✅                   | ✅ (via Edge Config)    |
| Forms                | ✅ Built-in          | ❌ Requires third party |
| Analytics            | ✅                   | ✅                      |
| CLI                  | ✅                   | ✅                      |

Both platforms work excellently for VitePress. Choose Netlify if you want built-in form handling or a simpler branch deploy workflow.

## Next Steps

- [Deploy to Vercel](/guide/deploy-vercel)
- [Deploy to GitHub Pages](/guide/deploy-github)
- [Site Config](/guide/site-config)