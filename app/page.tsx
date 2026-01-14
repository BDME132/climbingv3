import { List } from "@/components/posts/list";
import { Hero } from "@/components/site/hero";
import { Main } from "@/components/ds";
import { WebSiteJsonLd } from "@/components/seo/json-ld";

import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <Main>
      <WebSiteJsonLd />
      <Hero />
      <List posts={posts} />
    </Main>
  );
}
