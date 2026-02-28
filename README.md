<p align="center">
  <img src="docs/images/logo.png" alt="Tiny but Mighty Kitten Rescue" width="120">
</p>

<h1 align="center">Tiny but Mighty Kitten Rescue</h1>

<p align="center">
  Website for <a href="https://mattwren88.github.io/tinybutmightykittenrescue">Tiny but Mighty Kitten Rescue</a> — a registered charity in Cornwall, Ontario rescuing orphaned kittens, supporting pregnant cats, and running subsidized spay/neuter programs.
</p>

---

## Updating Content (Non-Technical Guide)

The site has a built-in content editor. To make changes:

1. Go to **[/admin](https://mattwren88.github.io/tinybutmightykittenrescue/admin/)**
2. Click **Sign in with GitHub** and log in with your GitHub account
3. Choose what you want to update:

| Section | What you can change |
|---|---|
| **Adoptable Cats** | Add or remove cats — name, photo, age, status (Available / Pending / Adopted) |
| **News & Events** | Post updates, event announcements, raffle results |
| **Foster Favourites** | Add Amazon product links — just paste the URL and ASIN, image loads automatically |

4. Make your changes and click **Save** — the site updates automatically within about 60 seconds.

### Adding an Adoptable Cat

1. Open the CMS → **Adoptable Cats** → **New Cat**
2. Fill in the name, age, and description
3. Upload a photo
4. Set **Adoption Status** to `Available`
5. Save

### Adding a Foster Favourite (Amazon product)

1. Open the CMS → **Foster Favourites** → **Favourites List**
2. Scroll to the bottom of the products list and click **Add item**
3. Paste the Amazon product URL (e.g. `https://www.amazon.ca/dp/B0002DHUVG`)
4. Find the **ASIN** — it's the 10-character code after `/dp/` in the URL (e.g. `B0002DHUVG`)
5. Give it a name, category, and optional description
6. Save — the product image loads automatically from Amazon

### Marking a Cat as Adopted

1. Open the CMS → **Adoptable Cats**
2. Find the cat and open their entry
3. Change **Adoption Status** to `Adopted`
4. Save

---

## Developer Notes

### Stack

- **[Astro 4](https://astro.build)** — static site generator (Node 18 compatible; Astro 5 requires Node 20+)
- **[Sveltia CMS](https://github.com/sveltia/sveltia-cms)** — Git-based CMS at `/admin`
- **GitHub Pages** — hosting via GitHub Actions deploy
- **GitHub Actions** — builds and deploys on every push to `main`

### Local Development

```bash
npm install
npm run dev       # dev server at http://localhost:4321/tinybutmightykittenrescue/
npm run build     # production build → dist/
npm run preview   # preview production build
```

### Project Structure

```
src/
  layouts/Base.astro          shared header/footer/nav
  pages/                      one .astro per route
  content/
    cats/*.md                 adoptable cat profiles (managed via CMS)
    news/*.md                 news & event posts (managed via CMS)
    config.ts                 Zod content schemas
  data/
    favourites.json           Amazon affiliate links list (managed via CMS)
public/
  css/style.css               main stylesheet
  js/main.js                  nav accordion/hamburger
  images/                     logo and static images
  admin/
    index.html                Sveltia CMS entry point
    config.yml                CMS collection definitions
.github/workflows/
  deploy.yml                  GitHub Actions: build + deploy to Pages
```

### Content Collections

| Collection | Location | Schema |
|---|---|---|
| Cats | `src/content/cats/*.md` | name, age, breed, sex, photo, status, bondedWith, featured |
| News | `src/content/news/*.md` | title, date, summary, image, body |
| Favourites | `src/data/favourites.json` | items[].{name, url, asin, description, category} |

### GitHub Pages Setup

The site deploys via **GitHub Actions** (not the `docs/` branch method). After pushing this repo:

1. Go to repo **Settings → Pages**
2. Set **Source** to **GitHub Actions**

The workflow at `.github/workflows/deploy.yml` handles build + deploy on every push to `main`.

### CMS Authentication (Sveltia CMS + GitHub OAuth)

Sveltia CMS requires an OAuth proxy server for GitHub login. Deploy the [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) worker to Cloudflare Workers (free), then:

1. Register a GitHub OAuth App — callback URL: `https://YOUR-WORKER.workers.dev/callback`
2. Add `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ALLOWED_DOMAINS` to the Worker
3. Update `public/admin/config.yml`:

```yaml
backend:
  name: github
  repo: mattwren88/tinybutmightykittenrescue
  branch: main
  base_url: https://YOUR-WORKER.workers.dev
```

### Astro Config Notes

- `base: '/tinybutmightykittenrescue/'` — trailing slash is required; `BASE_URL` won't include it otherwise
- `site` must match the full GitHub Pages URL for correct canonical links
- Favourites data lives in `src/data/` (not `src/content/`) — Astro 4 content dir only allows collection subdirectories

### Key Gotchas

- Astro 5 requires Node ≥ 20 — this project pins to Astro 4 for Node 18 compatibility
- GitHub Actions workflow files can't be created with the Write tool (security hook blocks it) — use Bash
- The `docs/` folder is the old static HTML site, kept as reference — it is not the deployed build output
