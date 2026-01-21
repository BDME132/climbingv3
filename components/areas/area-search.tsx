"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { Post } from "#site/content";

interface AreaSearchProps {
  posts: Post[];
}

export function AreaSearch({ posts }: AreaSearchProps) {
  const [query, setQuery] = useState("");

  const filteredPosts = posts.filter((post) => {
    if (!query.trim()) return true;

    const searchTerm = query.toLowerCase();
    const titleMatch = post.title.toLowerCase().includes(searchTerm);
    const descriptionMatch = post.description?.toLowerCase().includes(searchTerm);
    const tagMatch = post.tags?.some((tag) =>
      tag.toLowerCase().includes(searchTerm)
    );

    return titleMatch || descriptionMatch || tagMatch;
  });

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

      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <AreaCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No areas found matching &quot;{query}&quot;</p>
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
