# leonardobaeta.dev

Personal engineering blog - [leonardobaeta.dev](https://leonardobaeta.dev)

Built from scratch on Node.js / Express / EJS, self-hosted on a small VPS.

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Defaults are fine for local dev - no changes needed
```

### 3. Start the dev server

```bash
npm run dev       # nodemon - restarts on file changes, http://localhost:3000
npm start         # plain node, no auto-reload
```

---

## Testing

```bash
npm test          # node --test - covers post index validation, drafts, series, redirects, JSON-LD escaping
```

Manual smoke test (server must be running):

```bash
BASE=http://localhost:3000
curl -s $BASE/healthz                                            # -> {"status":"ok","posts":N}
curl -s -o /dev/null -w "%{http_code}\n" $BASE/posts            # -> 200
curl -s $BASE/feed.xml  | head -5                               # valid RSS 2.0
curl -s $BASE/sitemap.xml | head -5                             # valid sitemap
```

---

## Deployment

Deployment is git-based: the server holds a checkout of this repo, and updating
is a pull plus a process reload. The server's `.env` and `node_modules/` are
gitignored, so they survive every pull.

Host details, the deploy runbook, and server maintenance commands live in the
private workspace repo - not here.

Only runtime code lives in this repo. Planning docs, drafts, and career material
stay in that private workspace and never reach the server.

Published posts live in `posts/` in this repo, so they ship with a normal
commit - no separate post-deploy step. Drafts stay in the workspace repo until
they're ready. The post index is built at startup, so the reload after a pull is
what publishes new or edited posts.

---

## Writing Posts

### Create a post

Add a `.md` file to `posts/`. Filename doesn't matter - the `slug` frontmatter field is the URL.

```markdown
---
title: "Your Post Title"
slug: your-post-slug
date: 2026-06-01
description: "One or two sentences - used in meta description and OG tags. Under 160 chars."
status: published
---

Your markdown content here.
```

The post is live at `/posts/your-post-slug` after the next restart.

### Frontmatter reference

| Field | Required | Description |
|---|---|---|
| `title` | yes | Display title |
| `slug` | yes | URL path segment - kebab-case, unique |
| `date` | yes | Publication date - `YYYY-MM-DD` |
| `description` | yes | Meta description and OG tag |
| `status` | yes | `published` or `draft` - drafts are hidden in production |
| `post_type` | | `field-notes` or `reference` - shown as a label on the post |
| `updated` | | Last-updated date - `YYYY-MM-DD` |
| `excerpt` | | Teaser shown in the post list; falls back to `description` |
| `series` | | Series slug, e.g. `board-bringup` |
| `series_part` | | Integer position within the series |
| `redirectFrom` | | List of old slugs that should 301 to this post |
| `embed` | | Path to a `.wasm` file under `public/embeds/` |
| `correction` | | Short correction note rendered at the top of the post |
| `post_next` | | Slug of a recommended next post |

### Edit a post

Edit the file locally, commit, and push - then deploy per the private runbook:

```bash
git add posts/your-post-slug.md && git commit -m "post: ..." && git push
```

### Drafts

Posts with `status: draft` are served locally (`NODE_ENV=development`) but never in production. Use this to work on posts before they're ready.

---

## Project Structure

```
/
+-- src/
|   +-- server.js              # Entry point
|   +-- app.js                 # Express app, middleware registration
|   +-- config.js              # All env vars in one place
|   +-- lib/
|   |   +-- bootstrap.js       # Startup orchestration - shiki init + post index
|   |   +-- post-index.js      # Frontmatter validation and post index builder
|   |   +-- renderer.js        # markdown-it + shiki rendering pipeline
|   |   +-- render-cache.js    # FIFO in-memory HTML cache
|   |   +-- meta.js            # OG/canonical meta builder + JSON-LD
|   |   +-- dates.js           # Date formatting
|   |   +-- xml.js             # XML escaping for RSS/sitemap
|   +-- middleware/
|   |   +-- security.js        # Helmet + CSP headers
|   |   +-- redirects.js       # 301 redirect map middleware
|   +-- routes/
|       +-- index.js           # GET /
|       +-- posts.js           # GET /posts, GET /posts/:slug
|       +-- feeds.js           # GET /feed.xml, /sitemap.xml, /robots.txt
|       +-- health.js          # GET /healthz
+-- views/                     # EJS templates
|   +-- layout.ejs
|   +-- home.ejs
|   +-- about.ejs
|   +-- posts.ejs
|   +-- post.ejs
|   +-- partials/
+-- public/
|   +-- css/
|   +-- js/
|   +-- fonts/
|   +-- embeds/                # .wasm binaries
+-- posts/                     # Markdown blog posts
+-- test/
+-- ecosystem.config.js        # PM2 configuration
+-- .env.example               # Environment variable reference
```

---

## Environment Variables

Full reference in `.env.example`.

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | `development` or `production` | `development` |
| `PORT` | HTTP server port | `3000` |
| `SITE_URL` | Canonical base URL - **must be set in production** | `http://localhost:3000` |
| `GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID (`G-...`) | *(empty - analytics disabled)* |
| `AUTHOR_NAME` | Author display name | `Leonardo Baeta` |
| `AUTHOR_BIO` | One-line author bio | *(empty)* |
| `AUTHOR_GITHUB` | GitHub profile URL | *(empty)* |
| `AUTHOR_LINKEDIN` | LinkedIn profile URL | *(empty)* |
| `MAX_CACHE_ENTRIES` | Post render cache size | `200` |

`SITE_URL` is required in production - the server will refuse to start without it.
