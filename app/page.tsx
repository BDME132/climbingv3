import { Hero } from "@/components/site/hero";
import { FeaturedPosts } from "@/components/home/featured-posts";
import { AboutSection } from "@/components/home/about-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { Main } from "@/components/ds";
import { WebSiteJsonLd } from "@/components/seo/json-ld";

import { getAllPosts, getPostsByTag } from "@/lib/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Utah Climbing Routes & Area Guides | RockClimbUtah",
  description:
    "Find the best routes in every Utah climbing area. RockClimbUtah curates 20-25 routes per area, organized by grade and style, so you can pick what to climb fast.",
};

export default function HomePage() {
  const areaPosts = getPostsByTag("area");
  const posts = areaPosts.length > 0 ? areaPosts : getAllPosts();

  return (
    <Main>
      <WebSiteJsonLd />
      <Hero />
      <FeaturedPosts
        posts={posts}
        title="Popular Utah Area Guides"
        description="Curated route lists for Rock Canyon, American Fork, Little Cottonwood, and more."
        limit={2}
        sectionId="areas"
        ctaLabel="Browse all areas"
        ctaHref="/areas"
      />
      <AboutSection />
      <div className="hidden sm:block">
        <CategoriesSection />
      </div>
      <NewsletterSection />
    </Main>
  );
}
