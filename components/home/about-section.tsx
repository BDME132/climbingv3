import { Section, Container, Prose } from "@/components/ds";
import Image from "next/image";

export const AboutSection = () => {
  return (
    <Section id="how-it-works" className="py-12 sm:py-16 bg-muted/30">
      <Container>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                How It Works
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Pick an Area, Choose a Grade, Climb the Classics
              </h2>
            </div>

            <Prose className="text-muted-foreground space-y-4">
              <p>
                Every Utah area guide is a curated &quot;greatest hits&quot; list
                of 20-25 routes. We focus on quality, popularity, and approach
                simplicity so you can make a plan quickly.
              </p>
              <p>
                Routes are grouped into familiar categories like beginner,
                intermediate, expert, classic, and long routes. Each route keeps
                the format minimal: name, grade, and a direct Mountain Project
                link for detailed beta.
              </p>
            </Prose>

            <ul className="grid gap-3">
              {[
                "20-25 curated routes per Utah area",
                "Beginner (5.6-5.9) through expert (5.12+)",
                "Classic and long routes called out",
                "Direct Mountain Project links for details",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border bg-muted">
            <Image
              src="/images/how-it-works.png"
              alt="Climbers gearing up at a limestone wall in Utah"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
};
