import { Main, Section, Container, Prose } from "@/components/ds";
import { Button } from "@/components/ui/button";
import { getAllPosts, getPostsByTag } from "@/lib/posts";
import { AreaSearch } from "@/components/areas/area-search";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Utah Climbing Areas Library | RockClimbUtah",
  description:
    "Browse every Utah climbing area guide. Each area includes a curated list of 20-25 routes organized by grade and style.",
};

export default function AreasPage() {
  const areaPosts = getPostsByTag("area");
  const posts = areaPosts.length > 0 ? areaPosts : getAllPosts();

  return (
    <Main>
      <Section className="py-12 sm:py-16">
        <Container className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <Prose>
              <h1>Utah Climbing Areas</h1>
              <p className="text-muted-foreground">
                Every area guide is a curated list of the best routes in Utah,
                organized by grade and style so you can choose a route fast.
              </p>
            </Prose>
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </div>

          <AreaSearch posts={posts} />
        </Container>
      </Section>
    </Main>
  );
}
