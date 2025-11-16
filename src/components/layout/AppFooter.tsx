import { Link } from 'react-router-dom';
import { Package2, Twitter, Github, Linkedin } from 'lucide-react';
export function AppFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6 text-brand-primary" />
              <span className="text-lg font-bold">NexusDrop</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The future of dropshipping is here. Connect with top suppliers and sell to a global audience.
            </p>
            <p className="text-sm text-muted-foreground">Built with ❤️ at Cloudflare</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Marketplace</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">All Products</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">New Arrivals</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">Best Sellers</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">Deals</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Connect</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">Become a Supplier</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">Affiliate Program</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">Help Center</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} NexusDrop. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <Link to="#" className="text-muted-foreground hover:text-foreground"><Twitter className="h-5 w-5" /></Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground"><Github className="h-5 w-5" /></Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}