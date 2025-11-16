import { AppLayout } from "@/components/layout/AppLayout";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { ChevronDown, ListFilter } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
export function HomePage() {
  const isMobile = useIsMobile();
  const FilterComponent = isMobile ? (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <ListFilter className="h-4 w-4" />
          <span className="sr-only">Toggle filters</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-sm">
        <FilterSidebar />
      </SheetContent>
    </Sheet>
  ) : (
    <FilterSidebar />
  );
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          {/* Hero Section */}
          <section className="text-center bg-secondary rounded-lg p-8 md:p-16 mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-balance leading-tight">
              Discover Your Next Favorite Thing
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Explore a curated marketplace of high-quality products from the world's best suppliers.
            </p>
            <Button size="lg" className="mt-8 bg-brand-primary hover:bg-brand-secondary text-brand-primary-foreground">
              Shop New Arrivals
            </Button>
          </section>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Filters */}
            {!isMobile && <div className="lg:w-1/4">{FilterComponent}</div>}
            {/* Product Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {isMobile && FilterComponent}
                  <h2 className="text-2xl font-bold">All Products</h2>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      Sort by: Featured <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Featured</DropdownMenuItem>
                    <DropdownMenuItem>Newest</DropdownMenuItem>
                    <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                    <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {MOCK_PRODUCTS.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-12 flex justify-center">
                <Button variant="outline" size="lg">Load More Products</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}