import { Hero } from "@/components/site/hero";
import { FeaturedPosts } from "@/components/home/featured-posts";
import { AboutSection } from "@/components/home/about-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { Main } from "@/components/ds";
import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <Main>
      <Hero />
      <FeaturedPosts posts={posts} limit={3} />
      <AboutSection />
      <CategoriesSection />
      <NewsletterSection />
    </Main>
  );
}
