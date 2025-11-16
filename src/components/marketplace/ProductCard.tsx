import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '@shared/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
interface ProductCardProps {
  product: Product;
}
export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden rounded-lg shadow-sm transition-shadow duration-300 hover:shadow-lg">
        <CardHeader className="p-0 border-b">
          <Link to={`/product/${product.id}`} className="block">
            <div className="aspect-square overflow-hidden relative">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Badge className="absolute top-3 right-3" variant="destructive">
                -{(Math.random() * 20 + 10).toFixed(0)}%
              </Badge>
            </div>
          </Link>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <h3 className="font-semibold text-lg mt-1 leading-tight">
              <Link to={`/product/${product.id}`} className="hover:text-brand-primary transition-colors">
                {product.name}
              </Link>
            </h3>
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
            </div>
          </div>
          <p className="text-2xl font-bold mt-4">${product.price.toFixed(2)}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button className="w-full bg-brand-primary hover:bg-brand-secondary text-brand-primary-foreground">
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}