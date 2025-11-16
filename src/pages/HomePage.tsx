import { AppLayout } from "@/components/layout/AppLayout";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ListFilter } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState, useMemo } from "react";
import type { Product } from "@shared/types";
import { api } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "react-router-dom";
export function HomePage() {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const fetchedProducts = await api<Product[]>('/api/products');
        setProducts(fetchedProducts);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);
  const filteredProducts = useMemo(() => {
    if (!searchQuery) {
      return products;
    }
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);
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
  const ProductGridContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      );
    }
    if (error) {
      return <div className="text-center text-red-500">{error}</div>;
    }
    if (filteredProducts.length === 0) {
      return <div className="text-center text-muted-foreground py-16">No products found.</div>;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          {!searchQuery && (
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
          )}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {!isMobile && <div className="lg:w-1/4">{FilterComponent}</div>}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {isMobile && FilterComponent}
                  {searchQuery ? (
                    <h2 className="text-2xl font-bold">Search Results for "{searchQuery}"</h2>
                  ) : (
                    <h2 className="text-2xl font-bold">All Products</h2>
                  )}
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
              <ProductGridContent />
              {!isLoading && !error && !searchQuery && (
                <div className="mt-12 flex justify-center">
                  <Button variant="outline" size="lg">Load More Products</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}