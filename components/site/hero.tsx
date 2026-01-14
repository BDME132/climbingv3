import { Section, Container, Prose } from "@/components/ds";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const Hero = () => {
  return (
    <Section className="bg-muted/30 border-b py-12 sm:py-20">
      <Container className="grid gap-8 text-center max-w-3xl">
        <Logo width={48} className="mx-auto" />
        <Prose isSpaced className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance">
            Your Guide to Climbing Adventures
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Expert beta, gear reviews, and training guides to help you send your
            projects and explore the world&apos;s best crags.
          </p>
        </Prose>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="#featured">Explore Guides</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#categories">View Categories</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
};
