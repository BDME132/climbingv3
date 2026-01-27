import { Section, Container, Prose } from "@/components/ds";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export const Hero = () => {
  return (
    <Section className="relative border-b py-16 sm:py-24 overflow-hidden">
      
      <div className="absolute inset-0 bg-[#eeeeee]" />
      <Container className="relative z-10 grid gap-8 text-center max-w-3xl">
        <Logo width={48} className="mx-auto text-white" />
        <Prose isSpaced className="space-y-4 text-white">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight text-balance text-[#555555]">
            What Should I Climb Today?
          </h1>
          
        </Prose>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/areas">Search Utah Areas</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="bg-white/10 text-[#555555] border-[rgba(85,85,85,0.4)] hover:bg-white/20"
          >
            <Link href="#how-it-works">How It Works</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
};
