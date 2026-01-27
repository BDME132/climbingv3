import Link from "next/link";
import { Nav } from "@/components/ds";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function SiteHeader() {
  return (
    <Nav
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b"
      containerClassName="flex items-center justify-between"
    >
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="font-semibold tracking-tight text-foreground hover:text-foreground/80 transition-colors"
        >
          RockClimbUtah
        </Link>
        <Link
          href="/areas"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Areas
        </Link>
      </div>
      <ThemeToggle />
    </Nav>
  );
}
