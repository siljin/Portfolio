# PM Portfolio

Single-page portfolio for a Product Manager, built with **Next.js 15** (App Router), **Geist** typography, and static content in `lib/`.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server uses Turbopack (`next dev --turbopack`).

## Production (static export)

This repo uses [`output: "export"`](next.config.ts): `next build` emits plain files under **`out/`**, including **`out/index.html`** for the home page. You do not maintain a hand-written `index.html` in source; Next generates it at build time.

```bash
npm run build
# Preview the exported site locally (optional):
npx --yes serve out
```

With static export, `next start` is not used (there is no Node server—only static files).

## Deploy

### Netlify

[`netlify.toml`](netlify.toml) is configured so Netlify runs **`npm run build`** and publishes **`out/`**.

1. In [Netlify](https://www.netlify.com/), add a new site from this Git repo (settings are usually picked up from `netlify.toml`).
2. Default **Build command**: `npm run build`  
3. Default **Publish directory**: `out`

After deploy, `/` is served from the generated `index.html`; project pages are emitted as HTML under `out/projects/`.

### Other hosts

Any static host (S3, GitHub Pages, etc.) can upload the contents of **`out/`** after `npm run build`. See Next.js [static exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports).

You can also deploy to [Vercel](https://vercel.com) with the same repo; Vercel runs `next build` and does not require the `out/` folder when using their Next.js runtime (this project is optimized for Netlify static publish via `out/`).

## Content: add a project

1. Add an entry to [`lib/projects.ts`](lib/projects.ts) (slug, title, descriptor, tag, `coverSrc`, `sections`).
2. Put a cover image under [`public/images/projects/`](public/images/projects/) and set `coverSrc` (for example `/images/projects/my-cover.jpg`).
3. Run `npm run build` to confirm the new slug is picked up by `generateStaticParams`.

Optional longer-form writing later: add MDX files under [`content/projects/`](content/projects/) and wire a loader when you need it.

## Structure

- [`app/page.tsx`](app/page.tsx) — home sections
- [`app/projects/[slug]/page.tsx`](app/projects/[slug]/page.tsx) — project detail pages
- [`components/`](components/) — UI sections and client motion (`Hero` spotlight, `Reveal` on scroll)
- [`lib/projects.ts`](lib/projects.ts), [`lib/demos.ts`](lib/demos.ts), [`lib/skills.ts`](lib/skills.ts) — data

## License

Private / your choice.
