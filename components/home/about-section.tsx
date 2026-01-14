import { Section, Container, Prose } from "@/components/ds";
import { Mountain } from "lucide-react";

export const AboutSection = () => {
  return (
    <Section className="py-12 sm:py-16 bg-muted/30">
      <Container>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                About Us
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Empowering Climbers at Every Level
              </h2>
            </div>

            <Prose className="text-muted-foreground space-y-4">
              <p>
                We are a community of passionate climbers dedicated to sharing
                knowledge, beta, and inspiration. Whether you are just starting
                out or pushing into the double digits, our guides are crafted to
                help you progress.
              </p>
              <p>
                From detailed route beta to comprehensive gear reviews and
                science-backed training programs, we provide the resources you
                need to climb stronger and smarter.
              </p>
            </Prose>

            <ul className="grid gap-3">
              {[
                "Detailed route beta and topos",
                "Honest, tested gear reviews",
                "Science-backed training programs",
                "Community-driven content",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative aspect-square bg-muted rounded-lg border flex items-center justify-center">
            <Mountain className="h-24 w-24 text-muted-foreground/30" />
          </div>
        </div>
      </Container>
    </Section>
  );
};
