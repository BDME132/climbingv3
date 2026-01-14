import { Section, Container } from "@/components/ds";
import { cn } from "@/lib/utils";
import { Map, Settings, Zap, MapPin } from "lucide-react";
import Link from "next/link";

interface Category {
  name: string;
  slug: string;
  description: string;
  icon: React.ReactNode;
}

const defaultCategories: Category[] = [
  {
    name: "Beta",
    slug: "beta",
    description: "Route information, sequences, and climbing strategies",
    icon: <Map className="h-6 w-6" />,
  },
  {
    name: "Gear",
    slug: "gear",
    description: "Equipment reviews, comparisons, and recommendations",
    icon: <Settings className="h-6 w-6" />,
  },
  {
    name: "Training",
    slug: "training",
    description: "Workout plans, exercises, and strength building",
    icon: <Zap className="h-6 w-6" />,
  },
  {
    name: "Destinations",
    slug: "destinations",
    description: "Crag guides, travel tips, and area overviews",
    icon: <MapPin className="h-6 w-6" />,
  },
];

interface CategoriesSectionProps {
  categories?: Category[];
}

export const CategoriesSection = ({
  categories = defaultCategories,
}: CategoriesSectionProps) => {
  return (
    <Section id="categories" className="py-12 sm:py-16">
      <Container className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Explore by Category
          </h2>
          <p className="text-muted-foreground">
            Find exactly what you need with our organized content categories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </Container>
    </Section>
  );
};

const CategoryCard = ({ category }: { category: Category }) => {
  return (
    <Link
      href={`/category/${category.slug}`}
      className={cn(
        "group block p-6 rounded-lg border bg-background",
        "transition-all hover:border-primary/50 hover:shadow-sm"
      )}
    >
      <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        {category.icon}
      </div>

      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
        {category.name}
      </h3>

      <p className="text-sm text-muted-foreground line-clamp-2">
        {category.description}
      </p>
    </Link>
  );
};
