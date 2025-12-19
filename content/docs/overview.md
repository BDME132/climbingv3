# RockClimbUtah Website Specification

## Project Overview

**Name:** RockClimbUtah  
**Purpose:** A curated, static website that helps climbers quickly answer "What route should I climb today?" by providing organized recommendations for climbing areas throughout Utah.  
**Tech Stack:** MDX (mdx.bridger.to) compiled by Velite, Next.js App Router, Tailwind CSS  
**Type:** Static site with no user accounts or dynamic content  
**Content Model (Current):** All content is authored as MDX files in the `content/` directory and compiled by Velite into a `posts` collection (with fields like `slug`, `title`, `description`, `date`, `tags`, `published`, and `body`). The site currently treats each piece of content—including climbing areas and docs—as an MDX **post** rather than using a separate area/route database.

---

## Core Concept

Unlike Mountain Project's comprehensive database, RockClimbUtah provides a **curated "greatest hits"** selection of 20-25 routes per climbing area, organized by specific criteria to help climbers quickly find appropriate routes without information overload. In the current implementation, each climbing area is represented as **one MDX post** (an article) that follows the content guidelines below; routes are written as structured markdown content inside that post.

---

## Site Structure

### Homepage

**Initial MVP (Current Implementation):**

- Hero section at the top of the page that introduces the project and links to the underlying MDX starter
- A **“Recent Posts”** list that shows the most recent published MDX posts from the Velite `posts` collection (these posts can represent climbing areas, documentation, or other RockClimbUtah content)
- Clean, minimal, mobile-responsive design using shared layout components (`Main`, `Section`, `Container`, `Prose`)

**Future Enhancements:**

- Interactive map of Utah with clickable areas
- Search bar functionality
- Regional grouping (Northern, Central, Southern Utah)

### Area Pages

Each climbing area is represented as its own MDX **post** under `content/` (for example, `content/rock-canyon.mdx`). When published, Velite compiles these files into the `posts` collection and the App Router serves them as static pages. Each area post should contain:

#### Page Components (Top to Bottom):

1. **Area Name** (H1 heading)
2. **Hero Image** - Single photo representing the area
3. **Area Introduction** - 2-3 sentences covering:
   - Brief area description
   - Any critical access info or regulations
   - Unique features or characteristics
4. **Route Categories** - Each containing 3-5 routes

---

## Route Categories

### Primary Categories (Sport/Trad)

- **Beginner Routes** (5.6-5.9)
- **Intermediate Routes** (5.10-5.11)
- **Expert Routes** (5.12+)
- **Classic/Iconic Routes** - The must-do routes regardless of grade
- **Epic/Long Routes** - Full-day adventures or notably long single pitches

### Discipline-Specific Categories

- **Best Crack Climbs** (if trad climbing exists in area)
- **Best Sport Routes** (if particularly notable sport routes exist)
- **Best Boulders** (if bouldering exists in area)

**Note:** Only include categories relevant to each area. Skip categories if no suitable routes exist.

---

## Route Information Format

Each route entry is intentionally **kept minimal** and includes:

1. **Route Name** - Bold or styled as header
2. **Grade** - In parentheses (e.g., "5.10a")
3. **Mountain Project Link** - Styled as button or clear link
   - Text: "View on Mountain Project" or just "MP →"

Routes **do not include a separate short description**. Any narrative context (what the route feels like, why it’s special, access notes, etc.) should live in the **area introduction** or **category introduction** instead of per-route blurbs.

### Example Route Entry:

```
**The Schoolroom** (5.6)
[View on Mountain Project →](https://mountainproject.com/route/...)
```

---

## URL Structure

The site uses file-based routing driven by MDX files in the `content/` directory and a catch-all route in the Next.js App Router:

- `content/example.mdx` → `/example`
- `content/blog/getting-started.mdx` → `/blog/getting-started`
- `content/docs/installation.mdx` → `/docs/installation`

Area-style URLs are supported by creating top-level MDX files for each area:

- `content/rock-canyon.mdx` → `/rock-canyon`
- `content/american-fork.mdx` → `/american-fork`

**Note:** Use kebab-case for slugs/URLs (rock-canyon, not rock_canyon or RockCanyon).

---

## Content Guidelines

### Route Selection Criteria

Routes should be selected based on:

- **Quality** - Well-regarded routes with good rock
- **Popularity** - Routes people actually climb
- **Accessibility** - Reasonable approaches
- **Variety** - Different styles within each category
- **Safety** - Especially for beginner routes

### Grade Overlaps

When a route fits multiple categories:

- Iconic routes take precedence
- Place in the category where it best serves climbers
- Use logical judgment (a 5.9 that's iconic goes in "Iconic" not "Beginner")

---

## Design Requirements

### Mobile-First Responsive Design

- Single column layout on mobile
- Easily tappable links
- Readable without zooming
- Fast loading (minimal images)

### Desktop Experience

- All routes visible without excessive scrolling
- Clean typography
- Sufficient whitespace
- Professional appearance

### Visual Hierarchy

1. Area name (largest)
2. Category headers (medium, bold)
3. Route names (medium)
4. Descriptions and grades (smallest)

---

## Technical Implementation

### High-Level Architecture

- **Content authoring:** All content (including area pages and documentation) lives in MDX files under the `content/` directory.
- **Content compilation:** Velite reads `content/**/*.mdx` and builds a typed `posts` collection (written to the generated `.velite` module) based on the schema in `velite.config.ts` (`slug`, `title`, `description`, `date`, `tags`, `published`, `body`, etc.).
- **Data access:** Helper functions in `lib/posts.ts` (`getAllPosts`, `getPostBySlug`, `getPostsByPrefix`, `getAllTags`, `getPostsByTag`) read from the generated `posts` collection.
- **Routing:** The Next.js App Router uses:
  - `app/page.tsx` for the homepage (`/`), which renders the `Hero` component and a recent posts list.
  - `app/[...slug]/page.tsx` as a catch-all route that maps any slug path to the corresponding MDX post, using `getPostBySlug` and `generateStaticParams` for static generation.
- **MDX rendering:** The `MDXContent` component in `components/markdown/mdx-content.tsx` takes the compiled MDX `body` string from each post, evaluates it using `react/jsx-runtime`, and renders it with shared components for paragraphs, code blocks, images (`Media`), bookmarks, and YouTube embeds.

### File Structure (Current)

Conceptual file layout for RockClimbUtah on top of the MDX starter:

```
/app
  /page.tsx              # Homepage (Hero + Recent Posts)
  /[...slug]/page.tsx    # Catch-all route for MDX posts
/content
  /example.mdx           # Example MDX page
  /blog/getting-started.mdx
  /docs/installation.mdx
  /rock-canyon.mdx       # (Example) Rock Canyon area post
/components
  /markdown/mdx-content.tsx  # MDX renderer + shared components
  /site/hero.tsx             # Hero section used on homepage
  /site/footer.tsx           # Site footer
/lib
  /posts.ts              # Helpers to query compiled posts
  /mdx.ts                # Shared MDX utilities (e.g., formatDate)
velite.config.ts         # Velite content schema and options
```

### MDX Page Template (Area as Post)

Area pages are implemented as MDX posts that follow the content guidelines above. They do **not** rely on custom React components like `RouteList` or `AreaHeader` in the current codebase; instead, they use standard markdown headings, lists, links, and images.

```mdx
---
title: "Rock Canyon"
description: "Classic Wasatch limestone sport climbing"
date: "2025-01-09"
tags: ["area", "sport", "provo"]
published: true
---

# Rock Canyon

![Rock Canyon hero image](/rock-canyon-hero.jpg)

Popular Provo canyon with excellent limestone sport climbing.  
Closes annually March 1 - July 31 for raptor nesting.  
Quick approach and afternoon shade make it perfect for after-work sessions.

## Beginner Routes (5.6–5.9)

- **The Schoolroom** (5.6) – Perfect first lead with bomber gear placements and positive holds. [MP →](https://mountainproject.com/route/...)
- **Dairy Queen** (5.7) – Juggy sport route with a fun roof pull at half-height. [MP →](https://mountainproject.com/route/...)
- **Limestone Cowboy** (5.8) – Technical face climbing on excellent rock quality. [MP →](https://mountainproject.com/route/...)

## Classic Routes

- **The Project** (5.12a) – Rock Canyon's original testpiece with sustained crimpy climbing. [MP →](https://mountainproject.com/route/...)
- **Boschido** (5.10c) – Striking arete feature visible from the canyon floor. [MP →](https://mountainproject.com/route/...)
- **The Wave** (5.11b) – Overhanging jug haul on the canyon's most featured wall. [MP →](https://mountainproject.com/route/...)
```

---

## Development Phases

### Phase 1: MVP (Rock Canyon)

1. Set up MDX/Next.js project
2. Create homepage with single area link
3. Build Rock Canyon page with all categories
4. Implement responsive design
5. Deploy to Vercel/Netlify

### Phase 2: Expand Areas (3-5 areas)

1. Add American Fork Canyon
2. Add Little Cottonwood Canyon
3. Add Big Cottonwood Canyon
4. Refine component structure
5. Improve navigation

### Phase 3: Scale Up (10+ areas)

1. Add search functionality
2. Create area index page
3. Add more Utah areas
4. Implement area categories/regions

### Phase 4: Enhancements

1. Interactive map on homepage
2. Seasonal notes system
3. Download/offline functionality
4. SEO optimization

---

## Content Research Process

### For Each New Area:

1. **Identify Categories** - What types of climbing exist?
2. **Research Routes** - Use Mountain Project, guidebooks, local knowledge
3. **Select Routes** - 3-5 per category based on criteria
4. **Gather Links** - Mountain Project URLs for each route
5. **Find Hero Image** - One quality area photo
6. **Write Introduction** - 2-3 sentences about the area and any key notes that would otherwise be per-route “descriptions”

### AI-Assisted Research Workflow:

1. Prompt AI with area name and climbing discipline
2. Request route suggestions by category
3. Verify grades and names on Mountain Project
4. Refine area and category introductions for accuracy
5. Fact-check any access/regulation info\*\*\* End Patch

---

## Future Considerations

### Potential Features (Not MVP):

- Weather integration
- Recent condition reports
- Printable route lists
- Email newsletter for new areas
- Partner finder board
- Local guide contacts

### Monetization Options:

- Minimal ads (climbing gear affiliates)
- "Buy me a coffee" donations
- Premium features (custom lists, offline access)
- Local climbing shop partnerships

---

## Success Metrics

- **Primary:** Climbers find useful route suggestions quickly
- **Usability:** <30 seconds to find relevant routes
- **Coverage:** 20+ climbing areas within first year
- **Traffic:** Consistent returning visitors
- **Feedback:** Positive user responses about simplicity

---

## Example Content

### Rock Canyon Page Example

#### Beginner Routes (5.6-5.9)

1. **The Schoolroom** (5.6) - Perfect first lead with bomber gear placements and positive holds. [MP →]
2. **Dairy Queen** (5.7) - Juggy sport route with a fun roof pull at half-height. [MP →]
3. **Limestone Cowboy** (5.8) - Technical face climbing on excellent rock quality. [MP →]

#### Classic Routes

1. **The Project** (5.12a) - Rock Canyon's original testpiece with sustained crimpy climbing. [MP →]
2. **Boschido** (5.10c) - Striking arete feature visible from the canyon floor. [MP →]
3. **The Wave** (5.11b) - Overhanging jug haul on the canyon's most featured wall. [MP →]

---

## Notes

- Keep it simple - resist feature creep
- Focus on curation quality over quantity
- Prioritize mobile experience
- Let Mountain Project handle detailed beta
- Build incrementally, starting with one perfect area page
