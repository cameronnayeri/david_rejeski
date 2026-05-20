# davidrejeski.com — Project Brief

A custom portfolio website for furniture designer David Rejeski, replacing his current ProcessWire site at davidrejeski.com. Built and maintained by Cameron Nayeri.

## Stack

- **Astro** — static site generator, builds the site from markdown content files
- **Decap CMS** — git-based admin panel at `/admin` for David to manage content
- **Netlify** — hosting and Netlify Identity for admin auth
- **GitHub** — private repository, source of truth for both code and content

Total recurring cost: $0. David's existing domain (davidrejeski.com) points to Netlify.

## Pages

1. **Home** — minimal landing with the "2D|3D" logomark centered, footer nav. Per mockup p.1.
2. **Projects** (`/projects`) — filterable grid of pieces. Filter bar across the top with categories: Chairs & Stools, Tables, Lamps, Sculpture, Whimsies, Commission. Each card shows numbered piece (No. 01, No. 02...), title, year, and materials. Per mockup p.2.
3. **Piece detail** (`/projects/[slug]`) — individual piece page. Two-column image grid (the sketch, if present, is the first image). Title, year, materials, description, editorial caption.
4. **Sketch | Object** (`/sketch-object`) — index page surfacing only pieces that have a sketch image. Sketch on left, finished piece on right, editorial caption between or below. Per mockup p.3.

Studio page from mockup p.4 is explicitly **out of scope** for this build.

## Navigation

Top nav (or footer nav, per mockup): Home · Projects · Sketch | Object · Email
Site footer: outbound links to Essays, Music, News (these stay on platforms David already uses, not migrated into this site).

## Design system

Pulled from the mockup. Treat these as starting points, refine in code.

- **Background:** cream / off-white, ~`#F2EFE3`
- **Ink:** near-black, ~`#1A1A1A`
- **Accent:** terracotta / burnt orange, ~`#C5532A` — used sparingly: the bar in the 2D|3D mark, active nav state underline, category labels under piece cards, metadata accents
- **Typography (three voices):**
  - Display sans for headlines and the 2D|3D mark — heavy, contemporary, geometric. Inter Display, Söhne, or similar
  - Editorial serif italic for subheads and captions ("Pieces in wood and steel, from sketch to room")
  - Monospace for metadata labels ("INDEX · SELECTED WORK · 2018 — 2026", material tags, figure numbers)
- **Layout:** generous margins, editorial spacing, numbered pieces ("No. 01"), em-dash separators between metadata fields
- **Imagery:** images sit on the cream background with a subtle tint difference (slightly cooler/whiter image background) per mockup p.2

## Content model

### Piece (collection)

| Field | Type | Notes |
|---|---|---|
| `title` | string | "Plant Stand" |
| `number` | int | auto-assigned or manual; displays as "No. 01" |
| `year` | int | 2024 |
| `category` | enum | one of: Chairs & Stools, Tables, Lamps, Sculpture, Whimsies, Commission (final list pending David's input — may add categories) |
| `materials` | array of strings | ["Figured Mahogany", "Cherry", "One-of-One"] |
| `description` | markdown | short paragraph, optional |
| `caption` | markdown | the editorial italic caption from mockup p.3, optional |
| `sketch_image` | image | optional; if present, becomes the first image in the grid AND qualifies this piece for Sketch \| Object page |
| `images` | array of images | up to 10 |
| `featured` | bool | flag for homepage feature, optional |
| `status` | enum | published / draft / archived |
| `order` | int | manual sort override, optional |

Archive ≠ delete. Archived pieces stay in the repo but don't render.

## Repository structure

```
/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Home
│   │   ├── projects/
│   │   │   ├── index.astro          # Projects grid
│   │   │   └── [slug].astro         # Piece detail
│   │   └── sketch-object.astro      # Sketch | Object index
│   ├── layouts/
│   ├── components/
│   └── styles/
├── content/
│   └── pieces/                       # one .md file per piece
├── public/
│   ├── admin/                        # Decap CMS lives here
│   │   ├── index.html
│   │   └── config.yml
│   └── images/                       # piece images
├── astro.config.mjs
└── netlify.toml
```

## Admin (Decap CMS) auth

Netlify Identity handles login. David is invited by email, sets a password, logs into `davidrejeski.com/admin`. He doesn't need a GitHub account. Decap commits to the private repo using a Netlify-managed token.

Enable in Netlify dashboard:
1. Identity → Enable
2. Identity → Registration → Invite only
3. Identity → Services → Git Gateway → Enable
4. Invite David by email

## Migration

~45 existing pieces on the current site. Workflow:

1. **Scraper** (in this brief's repo, see `scraper.py`) pulls each piece URL, extracts title + description + image URLs, outputs `pieces.csv`.
2. **David categorizes** via Google Sheet (Cameron uploads the CSV to Sheets, adds data validation on the category column, sends link to David).
3. **Importer script** (to be written in Claude Code) reads the completed sheet, downloads images, optimizes them, writes one markdown file per piece into `content/pieces/`, commits everything.

**Image quality caveat:** existing site images are very small (some only 173px wide). Ask David for higher-resolution originals before importing; otherwise the new site will look low-res against its own design.

## Build order (suggested)

1. Astro project scaffold + design tokens (colors, type scale, spacing)
2. Layout + nav + footer
3. Home page
4. Piece content collection schema
5. Piece detail template
6. Projects index with category filter
7. Sketch | Object index
8. Decap CMS config and `/admin` setup
9. Netlify Identity + Git Gateway integration
10. Run importer script (after David returns the categorized sheet)
11. Polish, responsive QA, accessibility pass
12. Domain cutover
13. Record admin walkthrough video for David

## Out of scope

- Studio page / editorial notes
- Essays, Music, News content (footer links to existing platforms only)
- Copywriting beyond what David provides
- Photography or photo retouching
- Logo design beyond the 2D|3D mark in the mockup
- E-commerce, contact forms, mailing list
- Ongoing content updates after handoff (David handles via admin)

## Open questions (pending David's response)

- Category list confirmation — some existing pieces (bowls, loom, guitar, headboard) don't fit cleanly; David may want to add categories.
- Domain registrar — needed for the DNS update at launch.

## Contract terms (reference)

- $2,000 flat. $1,000 on signing, $1,000 on launch.
- 5 weeks from receipt of first payment.
- 2 rounds of revisions per template included.
- 30-day post-launch bug fix window.
