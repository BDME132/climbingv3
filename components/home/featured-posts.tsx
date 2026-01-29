import { Section, Container } from "@/components/ds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/mdx";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Post } from "#site/content";

interface FeaturedPostsProps {
  posts: Post[];
  title?: string;
  description?: string;
  limit?: number;
  sectionId?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export const FeaturedPosts = ({
  posts,
  title = "Recent Guides",
  description,
  limit = 3,
  sectionId = "featured",
  showViewAll = false,
  viewAllHref = "/posts",
  viewAllLabel = "View All",
  ctaLabel,
  ctaHref,
}: FeaturedPostsProps) => {
  const featuredPosts = posts.slice(0, limit);

  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <Section id={sectionId} className="py-12 sm:py-16">
      <Container className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {showViewAll && (
            <Button asChild variant="ghost">
              <Link href={viewAllHref}>{viewAllLabel}</Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {featuredPosts.map((post) => (
            <FeaturedPostCard key={post.slug} post={post} />
          ))}
          {ctaLabel && ctaHref && (
            <CtaCard label={ctaLabel} href={ctaHref} />
          )}
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

const CtaCard = ({ label, href }: { label: string; href: string }) => {
  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-lg p-5 transition-all",
        "border-l-4 border-l-primary border border-primary/20",
        "bg-primary/5 hover:bg-primary/10 hover:shadow-md"
      )}
    >
      <div className="h-full min-h-[172px] flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold text-primary uppercase tracking-wider">
            All Areas
          </div>
          <h3 className="mt-2 text-lg font-semibold leading-snug">
            Browse every Utah area guide
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            See the full library of curated route lists.
          </p>
        </div>
        <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          {label}
          <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
        </div>
      </div>
    </Link>
  );
};
