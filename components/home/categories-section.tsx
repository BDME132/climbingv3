import { Section, Container } from "@/components/ds";
import { cn } from "@/lib/utils";
import {
  CircleDot,
  Flame,
  Mountain,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

interface RouteCategory {
  name: string;
  detail?: string;
  description: string;
  icon: React.ReactNode;
}

const defaultCategories: RouteCategory[] = [
  {
    name: "Beginner Routes",
    detail: "5.6-5.9",
    description: "Friendly climbs for new leaders and easy days",
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    name: "Intermediate Routes",
    detail: "5.10-5.11",
    description: "Solid classics for most weekend climbers",
    icon: <TrendingUp className="h-6 w-6" />,
  },
  {
    name: "Expert Routes",
    detail: "5.12+",
    description: "Steep, technical, and earned",
    icon: <Flame className="h-6 w-6" />,
  },
  {
    name: "Classic / Iconic",
    description: "The must-do routes every area is known for",
    icon: <Star className="h-6 w-6" />,
  },
  {
    name: "Epic / Long",
    description: "Longer missions and full-day adventures",
    icon: <Mountain className="h-6 w-6" />,
  },
  {
    name: "Boulders",
    description: "Short problems for strength and movement sessions",
    icon: <CircleDot className="h-6 w-6" />,
  },
];

interface CategoriesSectionProps {
  categories?: RouteCategory[];
}

export const CategoriesSection = ({
  categories = defaultCategories,
}: CategoriesSectionProps) => {
  return (
    <Section id="categories" className="py-12 sm:py-16">
      <Container className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Route Categories You&apos;ll See in Every Area
          </h2>
          <p className="text-muted-foreground">
            Consistent groupings make it fast to choose a route by grade, style,
            and objective.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </Container>
    </Section>
  );
};

const CategoryCard = ({ category }: { category: RouteCategory }) => {
  return (
    <div
      className={cn(
        "p-6 rounded-lg border bg-background",
        "transition-all hover:border-primary/50 hover:shadow-sm"
      )}
    >
      <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-4">
        {category.icon}
      </div>

      <h3 className="font-semibold mb-1">{category.name}</h3>

      {category.detail && (
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
          {category.detail}
        </p>
      )}

      {category.name === "Boulders" && (
        <div className="mb-2">
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            If boulders are in the area
          </span>
        </div>
      )}

      <p className="text-sm text-muted-foreground line-clamp-2">
        {category.description}
      </p>
    </div>
  );
};
