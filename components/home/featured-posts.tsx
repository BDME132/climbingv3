import { Section, Container } from "@/components/ds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/mdx";
import Link from "next/link";
import type { Post } from "#site/content";

interface FeaturedPostsProps {
  posts: Post[];
  title?: string;
  limit?: number;
}

export const FeaturedPosts = ({
  posts,
  title = "Featured Guides",
  limit = 3,
}: FeaturedPostsProps) => {
  const featuredPosts = posts.slice(0, limit);

  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <Section id="featured" className="py-12 sm:py-16">
      <Container className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {title}
          </h2>
          <Button asChild variant="ghost">
            <Link href="/posts">View All</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.map((post) => (
            <FeaturedPostCard key={post.slug} post={post} />
          ))}
        </div>
      </Container>
    </Section>
  );
};

const FeaturedPostCard = ({ post }: { post: Post }) => {
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

        <h3 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>

        {post.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {post.description}
          </p>
        )}

        <time
          dateTime={post.date}
          className="text-xs text-muted-foreground block"
        >
          {formatDate(post.date)}
        </time>
      </div>
    </Link>
  );
};
