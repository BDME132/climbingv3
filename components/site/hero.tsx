import { Section, Container, Prose } from "@/components/ds";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export const Hero = () => {
  return (
    <Section className="relative border-b py-16 sm:py-24 overflow-hidden">
      <Image
       src="/images/2-head.png"
       alt="Rock Canyon climbing wall in Utah"
       fill
       className="object-cover brightness-120"
       priority
     />
      <div className="absolute inset-0 bg-black/35" />
      <Container className="relative z-10 grid gap-8 text-center max-w-3xl">
        <Logo width={48} className="mx-auto text-white" />
        <Prose isSpaced className="space-y-4 text-white">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight text-balance">
            What Should I Climb Today?
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto text-pretty">
            RockClimbUtah is a curated guide of routes
            built to answer this question. Each guide highlights 30-50 &quot;greatest hits&quot;
            by grade and style, with direct Mountain Project links so you can
            decide what to climb quickly.
          </p>
        </Prose>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/areas">Search Utah Areas</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="bg-white/10 text-white border-white/40 hover:bg-white/20">
            <Link href="#how-it-works">How It Works</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
};
