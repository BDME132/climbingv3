# RockClimbUtah Layout Specification

This document describes the **layout and visual design guidelines** for RockClimbUtah as implemented on top of the MDX starter architecture documented in `content/docs/overview.md`. The actual layout and styling are provided primarily by Tailwind CSS (configured in `app/globals.css`) and shared design system components in `components/ds.tsx` (`Layout`, `Main`, `Section`, `Container`, `Prose`), rather than by a standalone custom CSS file.

## Design Philosophy

Clean, minimal, and functional design optimized for quick route selection. Soft contrast colors (greys instead of pure black/white) with subtle accent colors. Mobile-responsive with a consistent content structure across devices, using a centered column (`Container`) and MDX typography handled by the `Prose` component.

---

## Color Palette

The current implementation uses a token-based color system defined in `app/globals.css` with CSS custom properties such as:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.147 0.004 49.25);
  --primary: oklch(0.6837 0.212 40.59);
  --secondary: oklch(0.97 0.001 106.424);
  --muted: oklch(0.97 0.001 106.424);
  --border: oklch(0.923 0.003 48.717);
  /* ... */
}
```

### Design Intent

- **Background / surface:** Use a light, low-contrast background (`--background`, `--card`) to keep the focus on content.
- **Text:** Use `--foreground` for primary text and muted variants (`--muted-foreground`) for secondary copy.
- **Accent:** Use the theme `--primary` (and its foreground) as the main accent for links and interactive elements, matching the link styles already applied by `Prose`.
- **Borders:** Use `--border` for subtle dividers between sections and routes.

### Optional Grade Colors (Future)

For future enhancement, grade-specific colors may be introduced for route labels (not yet in the codebase):

```css
/* Example future tokens (not currently wired up) */
--grade-easy: #7fb069; /* Soft green for beginner grades */
--grade-moderate: #f4a460; /* Sandy orange for intermediate */
--grade-hard: #cd5c5c; /* Muted red for expert grades */
```

These should be integrated as additional Tailwind theme tokens if/when they are implemented.

---

## Global Layout Structure

### Page Container

Pages are structured using the shared `Section` and `Container` components from `components/ds.tsx`. `Container` provides a centered, readable column:

```ts
export const Container = ({ children, className, id, style }: DSProps) => (
  <div
    className={cn("max-w-5xl mx-auto p-4 sm:p-6", className)}
    id={id}
    style={style}
  >
    {children}
  </div>
);
```

This results in an effective content width of ~896px on large screens, centered with responsive padding (`p-4` on mobile, `p-6` on larger devices).

### Typography

Typography inside MDX content is handled by the `Prose` component, which applies Tailwind classes for headings, body text, lists, and links. Key design intentions:

- **Area name (H1):** Largest size on the page (implemented via `Prose` as `text-4xl sm:text-5xl`).
- **Category headers (H2/H3):** Next largest (`text-3xl` / `text-2xl`), clearly separating route sections.
- **Route names:** Bolded within list items, visually above the route description.
- **Descriptions and grades:** Use the base body text size (`text-base` / `text-sm`) and muted variants for secondary details.

The exact font sizes are controlled by Tailwind utilities in `Prose` rather than custom CSS variables, but they should preserve this visual hierarchy.

---

## Navigation Bar

### Current Implementation

The current layout (`app/layout.tsx`) does **not** use a global sticky navigation bar. Instead:

- The logo is rendered within the homepage `Hero` component.
- A `Footer` component appears at the bottom of all pages.
- A floating theme toggle button is positioned in the bottom-right corner.

Navigation between pages happens primarily through links inside MDX content and post lists.

### Future / Recommended Global Nav (Not Yet Implemented)

If a global sticky navigation bar is added in the future, it should:

- Include a home link (logo/title) on the left.
- Optionally include a search icon or area selector on the right.
- Use a fixed top position with a light background, subtle border, and small shadow for separation from content.

The example markup below is **conceptual** and not wired into the current codebase:

```markdown
[Logo/Home] .......................... [Search Icon]
```

---

## Homepage Layout

### Current Homepage (Hero + Recent Posts)

As described in `overview.md`, the homepage (`/`) renders:

- A `Hero` section that introduces the project and links to the underlying MDX starter.
- A **Recent Posts** list built from the Velite `posts` collection (`getAllPosts()`), rendered using the `List` and `Item` components.

The visual layout for this page uses:

- `Main` to wrap the content.
- `Section` + `Container` around the `Hero` and the posts list.
- `Prose` within `Hero` for nicely formatted headings and text.

### Recommended Area Index Layout (Future or Separate Page)

On a future `/areas` index page or a homepage variant focused purely on areas, you can present a list of area posts in the following content pattern:

```markdown
# Climbing Areas in Utah

---

## [Rock Canyon](/rock-canyon)

**Location:** Provo Canyon  
**Routes:** 24 routes  
**Types:** Sport, Trad  
Popular limestone crag with quick approach and afternoon shade.

---

## [American Fork](/american-fork)

**Location:** American Fork Canyon  
**Routes:** 22 routes  
**Types:** Sport  
Steep limestone sport climbing with classic endurance routes.

---
```

Area entries should follow this visual treatment:

- **Title:** Link styled with the primary accent color (handled by `Prose` link styles).
- **Metadata:** Bold labels (e.g., “Location:”) with secondary-colored values.
- **Description:** One short sentence.
- **Separator:** Horizontal rule between entries (`---` in markdown, rendered by `Prose`).

---

## Area Page Layout

### Page Structure (Top to Bottom)

For each climbing area (implemented as an MDX post under `content/`), the recommended content structure is:

1. **Page title** (H1 with the area name)
2. **Hero image** (single photo representing the area)
3. **Introduction text** (2–3 sentences)
4. **Route categories** (e.g., Beginner, Classic, Expert), each followed by a list of routes
5. **Footer** (site-wide footer from the layout)

### Hero Section

```markdown
# Rock Canyon

![Rock Canyon](./images/rock-canyon-hero.jpg)

Popular Provo canyon with excellent limestone sport climbing.
Closes annually March 1 - July 31 for raptor nesting.
Quick approach and afternoon shade make it perfect for after-work sessions.

---
```

**Image Specifications:**

- **Max-width:** 600px
- **Height:** 300px (aspect ratio ~2:1)
- **Border-radius:** 8px
- **Margin:** 20px 0

### Jump Links Section (Future)

```markdown
**Jump to:** [Beginner](#beginner) • [Intermediate](#intermediate) • [Expert](#expert) • [Classic](#classic) • [Epic](#epic)

---
```

---

## Route List Layout

### Category Section

```markdown
## Beginner Routes

- **The Schoolroom** (5.6)  
  [View on Mountain Project →](https://mountainproject.com/...)

- **Dairy Queen** (5.7)  
  [View on Mountain Project →](https://mountainproject.com/...)

- **Limestone Cowboy** (5.8)  
  [View on Mountain Project →](https://mountainproject.com/...)

---
```

### Route Entry Structure

Each route follows this pattern:

1. **Bullet point** with bold route name
2. **Grade** in parentheses on the same line
3. **Link** on the next line (2 space indent for markdown)

Per-route short descriptions are **intentionally omitted**. Any additional context about what the routes feel like or why they’re notable should be included in the **area introduction** or a short paragraph above each category.

### Visual Treatment

```css
/* Category Headers */
h2 {
  font-size: 1.5rem;
  color: #2d2d2d;
  margin-top: 40px;
  margin-bottom: 20px;
  font-weight: 600;
}

/* Route Names */
strong {
  color: #2d2d2d;
  font-size: 1.125rem;
}

/* Grades */
/* Inline with route name, regular weight */
color: #6b6b6b;
font-size: 1rem;

/* Secondary text (optional notes) */
color: #6b6b6b;
font-size: 0.875rem;
line-height: 1.5;

/* Links */
a {
  color: #4a7c59;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

a:hover {
  color: #3a6249;
  text-decoration: underline;
}

/* Dividers */
hr {
  border: none;
  border-top: 1px solid #e5e5e5;
  margin: 40px 0;
}
```

---

## Mobile Responsiveness

### Breakpoints

```css
/* Mobile: < 640px */
/* Tablet: 640px - 1024px */
/* Desktop: > 1024px */
```

### Mobile Adjustments

- **Container padding:** 16px (instead of 20px)
- **Font sizes:** Remain same (already optimized)
- **Layout:** Vertical stack maintained
- **Hero image:** Width 100%, max-height 200px
- **Navigation:** Same sticky behavior

### No Changes Between Devices

- Route list structure
- Category organization
- Link placement
- General hierarchy

---

## MDX Route Content Implementation

The current implementation does **not** use custom React components like `RouteList` or `Category`. Instead, route lists are written directly in MDX using standard markdown elements and rendered/styled via the `Prose` component.

### Recommended Route Category Structure (Current)

```mdx
## Beginner Routes

- **The Schoolroom** (5.6)  
  Perfect first lead with bomber gear placements.  
  [View on Mountain Project →](https://mountainproject.com/...)

- **Dairy Queen** (5.7)  
  Juggy sport route with fun roof pull.  
  [View on Mountain Project →](https://mountainproject.com/...)

- **Limestone Cowboy** (5.8)  
  Technical face climbing on excellent rock.  
  [View on Mountain Project →](https://mountainproject.com/...)
```

Each category is a heading (`##`) followed by markdown list items styled by `Prose` (custom bullets, spacing, and link styling).

### Possible Future React Components

In the future, React components like `RouteList` or `Category` could be added to encapsulate route layout and styling. If implemented, they should wrap standard markdown-like content rather than replace the underlying content structure.

---

## Complete Page Template

### MDX Area Page Structure (Current Implementation)

Area pages should follow the same MDX pattern described in `overview.md`—a frontmatter block plus pure markdown content:

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
Quick approach and afternoon shade.

---

## Beginner Routes

- **The Schoolroom** (5.6)  
  Perfect first lead with bomber gear placements.  
  [View on Mountain Project →](https://mountainproject.com/...)

- **Dairy Queen** (5.7)  
  Juggy sport route with fun roof pull.  
  [View on Mountain Project →](https://mountainproject.com/...)

---

## Classic Routes

- **The Project** (5.12a)  
  Rock Canyon's original testpiece.  
  [View on Mountain Project →](https://mountainproject.com/...)
```

---

## Spacing Guidelines

### Vertical Rhythm

- **Between navbar and content:** 0 (handled by margin-top)
- **After page title:** 20px
- **After hero image:** 20px
- **After introduction:** 40px (via hr)
- **Between categories:** 40px (via hr)
- **Between routes:** 24px
- **Between route name and description:** 4px (line break)
- **Between description and link:** 4px (line break)

### Horizontal Spacing

- **Page margins:** 20px mobile, 40px desktop
- **Max content width:** 800px
- **List indent:** 20px for bullet point

---

## Link Styling Standards

Link styles are primarily controlled by the `Prose` component, which applies consistent Tailwind classes to all standard anchors:

- **Color:** Use the primary accent color (`text-primary`) for links.
- **Decoration:** Underline with a slight offset, appearing on hover and focus.
- **Size:** Match surrounding body text (typically `text-sm` or `text-base`).

### Mountain Project Links

Format: `View on Mountain Project →` or `MP →`, as described in `overview.md`. They should:

- Use the same color and hover behavior as other links.
- Be clearly associated with the relevant route entry.

### Jump Links (Future)

For future enhancements (e.g., jump links to categories), use inline markdown like:

```markdown
**Jump to:** [Beginner](#beginner) • [Classic](#classic)
```

Rendered via `Prose`, these will inherit the standard link styling and spacing.

---

## Accessibility Considerations

### Semantic HTML

- Proper heading hierarchy (h1 > h2 > h3)
- Lists for route collections
- Nav element for navigation
- Main element for content

### Visual Accessibility

- **Contrast ratios:** All text meets WCAG AA standards
- **Font sizes:** Minimum 14px for body text
- **Touch targets:** Minimum 44x44px for links
- **Focus indicators:** Visible outline on tab navigation

---

## Performance Optimizations

### Image Handling

- **Hero images:** Optimized to ~100KB
- **Format:** WebP with JPG fallback
- **Lazy loading:** For below-fold images
- **Responsive sizing:** srcset for different screens

### CSS Strategy

- **Minimal CSS:** Under 10KB total
- **Inline critical CSS:** For above-fold content
- **No JavaScript for layout:** Pure CSS/HTML

---

## Future Enhancement Placeholders

### Search Bar (Header)

- Hidden initially, icon only
- Expands on click (future JS)
- Searches area names and route names

### Jump Navigation

- Sticky sub-nav below main nav
- Smooth scroll to sections
- Highlights current section

### Filter System

- Grade range selector
- Climbing type filter
- Would modify visible routes (requires JS)

---

## Implementation Notes

1. **Use semantic markdown** wherever possible
2. **Avoid inline styles** except for images
3. **Keep specificity low** for easy overrides
4. **Test on real devices** especially phones at crags
5. **Ensure fast load times** (< 2 seconds on 3G)
6. **Validate markdown rendering** in MDX environment

---

## Example Styling Approach (Tailwind-First)

Instead of a standalone `styles/global.css` with custom layout and reset rules, this project uses:

- `app/globals.css` to define design tokens (colors, radius) and minimal base styles.
- Tailwind utilities (including those composed in `Prose`, `Section`, and `Container`) to control spacing, typography, and layout.

Any additional layout or visual refinements should be expressed using Tailwind classes or small component-level styles, keeping global CSS minimal and aligned with the existing theme.
