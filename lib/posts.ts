import { posts } from ".velite";

/**
 * Get all published posts sorted by date (newest first)
 */
export function getAllPosts() {
  return posts
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a single post by its slug path
 * @param slug - The slug path (e.g., "example" or "blog/getting-started")
 */
export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}

/**
 * Get all posts from a specific directory/prefix
 * @param prefix - The directory prefix (e.g., "blog", "docs")
 */
export function getPostsByPrefix(prefix: string) {
  return posts
    .filter((post) => post.published && post.slug.startsWith(prefix))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get all unique tags from published posts
 */
export function getAllTags() {
  const tags = new Set<string>();
  posts.forEach((post) => {
    if (post.published && post.tags) {
      post.tags.forEach((tag) => tags.add(tag));
    }
  });
  return Array.from(tags).sort();
}

/**
 * Get posts by tag
 */
export function getPostsByTag(tag: string) {
  return posts
    .filter((post) => post.published && post.tags?.includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Priority list of popular Utah climbing areas (most popular first)
 */
const popularAreaSlugs = [
  "indiancreek",
  "littlecottonwoodcanyon",
  "americanforkcanyon",
  "joesvalley",
  "maplecanyon",
  "bigcottonwoodcanyon",
  "zionnationalpark",
  "moesvalleysouthernutah",
  "rockcanyon",
  "wallstreetmoab",
  "castletontower",
  "fishertowers",
  "snowcanyonstatepark",
  "sanrafaelswell",
  "ibex",
  "kolobcanyon",
  "stormmountain",
  "gatebuttresslittlecottonwood",
  "bellscanyon",
  "ogdencanyon",
  "millcreekcanyon",
  "mountolympus",
  "capitolreefclimbing",
  "goblinvalleyarea",
];

/**
 * Get posts by tag, sorted by popularity (popular areas first, then by date)
 */
export function getPostsByTagSortedByPopularity(tag: string) {
  const filtered = posts.filter(
    (post) => post.published && post.tags?.includes(tag)
  );

  return filtered.sort((a, b) => {
    const aIndex = popularAreaSlugs.indexOf(a.slug);
    const bIndex = popularAreaSlugs.indexOf(b.slug);

    // Both in priority list: sort by priority order
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    // Only a in priority list: a comes first
    if (aIndex !== -1) return -1;
    // Only b in priority list: b comes first
    if (bIndex !== -1) return 1;
    // Neither in list: sort by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
