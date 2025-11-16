import { Link, useNavigate } from 'react-router-dom';
import { Package2, Search, ShoppingCart, User, LogOut, LayoutDashboard, Store, ShieldCheck, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useCartStore } from '@/hooks/useCartStore';
import { CartSheet } from '@/components/cart/CartSheet';
import { useState } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
export function AppHeader() {
  const itemCount = useCartStore(s => s.itemCount);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.actions.logout);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
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
            <form onSubmit={handleSearch} className="relative hidden sm:block w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full rounded-lg bg-secondary pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge variant="destructive" className="absolute -right-2 -top-2 h-5 w-5 justify-center rounded-full p-0 text-xs">
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">Open cart</span>
            </Button>
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
                  </DropdownMenuItem>
                  {user.role === 'vendor' && (
                    <DropdownMenuItem asChild>
                      <Link to="/vendor/dashboard"><Store className="mr-2 h-4 w-4" /> Vendor Portal</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard"><ShieldCheck className="mr-2 h-4 w-4" /> Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'employee' && (
                    <DropdownMenuItem asChild>
                      <Link to="/employee/dashboard"><Briefcase className="mr-2 h-4 w-4" /> Employee Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/login">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Login</span>
                </Link>
              </Button>
            )}
            <ThemeToggle className="relative top-0 right-0" />
          </div>
        </div>
      </header>
      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}