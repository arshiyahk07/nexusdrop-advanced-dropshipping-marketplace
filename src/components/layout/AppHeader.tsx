import { Link } from 'react-router-dom';
import { Package2, Search, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useCartStore } from '@/hooks/useCartStore';
import { CartSheet } from '@/components/cart/CartSheet';
import { useState } from 'react';
export function AppHeader() {
  const itemCount = useCartStore(s => s.itemCount);
  const [isCartOpen, setIsCartOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="max-w-7xl mx-auto flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6 text-brand-primary" />
            <span className="text-lg font-bold">NexusDrop</span>
          </Link>
          <nav className="hidden flex-1 gap-6 text-sm font-medium md:flex">
            <Link to="/" className="text-foreground transition-colors hover:text-foreground/80">
              Marketplace
            </Link>
            <Link to="#" className="text-muted-foreground transition-colors hover:text-foreground/80">
              Deals
            </Link>
            <Link to="#" className="text-muted-foreground transition-colors hover:text-foreground/80">
              About
            </Link>
          </nav>
          <div className="flex flex-1 items-center gap-4 justify-end">
            <div className="relative hidden sm:block w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full rounded-lg bg-secondary pl-8"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge variant="destructive" className="absolute -right-2 -top-2 h-5 w-5 justify-center rounded-full p-0 text-xs">
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">Open cart</span>
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">My Account</span>
            </Button>
            <ThemeToggle className="relative top-0 right-0" />
          </div>
        </div>
      </header>
      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}