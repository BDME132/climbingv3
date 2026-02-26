"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Post } from "#site/content";

// Damerau-Levenshtein edit distance (counts adjacent transpositions as 1 edit)
function editDistance(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  const d: number[][] = Array.from({ length: la + 1 }, () =>
    Array(lb + 1).fill(0)
  );
  for (let i = 0; i <= la; i++) d[i][0] = i;
  for (let j = 0; j <= lb; j++) d[0][j] = j;

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost); // transposition
      }
    }
  }
  return d[la][lb];
}

interface SearchablePost {
  post: Post;
  fullText: string;
  words: string[];
}

function buildSearchablePost(post: Post): SearchablePost {
  const parts = [post.title, post.slug, post.description ?? "", ...(post.tags ?? [])];
  const fullText = parts.join(" ").toLowerCase();
  const words = fullText.split(/\s+/).filter(Boolean);
  return { post, fullText, words };
}

function matchQueryWord(
  queryWord: string,
  sp: SearchablePost
): "exact" | "fuzzy" | "none" {
  if (sp.fullText.includes(queryWord)) return "exact";
  if (queryWord.length >= 4) {
    for (const word of sp.words) {
      if (editDistance(queryWord, word) <= 1) return "fuzzy";
    }
  }
  return "none";
}

function scorePost(
  queryWords: string[],
  sp: SearchablePost
): number | null {
  let hasFuzzy = false;
  for (const qw of queryWords) {
    const result = matchQueryWord(qw, sp);
    if (result === "none") return null;
    if (result === "fuzzy") hasFuzzy = true;
  }
  return hasFuzzy ? 1 : 2;
}

interface AreaSearchProps {
  posts: Post[];
}

const CLIMBING_STYLE_FILTERS = ["trad", "sport", "bouldering"];
const REGION_FILTERS = [
  "salt lake",
  "utah valley",
  "northern utah",
  "central utah",
  "southeast utah",
  "southwest utah",
  "zion",
  "uintas",
];

export function AreaSearch({ posts }: AreaSearchProps) {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  function toggleFilter(filter: string) {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  }

  const searchablePosts = useMemo(
    () => posts.map(buildSearchablePost),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    // Apply tag filters first (AND logic - must have ALL selected tags)
    let results = posts;
    let filteredSearchable = searchablePosts;

    if (activeFilters.length > 0) {
      results = results.filter((post) =>
        activeFilters.every((filter) => post.tags?.includes(filter))
      );
      filteredSearchable = searchablePosts.filter((sp) =>
        activeFilters.every((filter) => sp.post.tags?.includes(filter))
      );
    }

    // Apply search
    const trimmed = query.trim();
    if (!trimmed) return results;

    const queryWords = trimmed.toLowerCase().split(/\s+/).filter(Boolean);

    const scored: { post: Post; score: number }[] = [];
    for (const sp of filteredSearchable) {
      const s = scorePost(queryWords, sp);
      if (s !== null) scored.push({ post: sp.post, score: s });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.post);
  }, [query, posts, searchablePosts, activeFilters]);

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Label htmlFor="area-search" className="sr-only">
          Search areas
        </Label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          id="area-search"
          type="text"
          placeholder="Search areas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground w-16">Style:</span>
          {CLIMBING_STYLE_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={cn(
                "px-3 py-1 text-sm rounded-full border transition-colors capitalize",
                activeFilters.includes(filter)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-input hover:border-primary/50"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground w-16">Region:</span>
          {REGION_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={cn(
                "px-3 py-1 text-sm rounded-full border transition-colors capitalize",
                activeFilters.includes(filter)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-input hover:border-primary/50"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <AreaCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>
            No areas found
            {query && <> matching &quot;{query}&quot;</>}
            {activeFilters.length > 0 && (
              <> with {activeFilters.join(" + ")} climbing</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function AreaCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/${post.slug}`}
      className="group block border rounded-lg overflow-hidden transition-all hover:shadow-md hover:border-primary/50"
    >
      <div className="p-5 space-y-3">
        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <h2 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h2>

        {post.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {post.description}
          </p>
        )}
      </div>
    </Link>
  );
}
