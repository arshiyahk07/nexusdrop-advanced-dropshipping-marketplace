import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, Truck, Shield, Loader2, User } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/hooks/useCartStore';
import { toast } from 'sonner';
import type { Product } from '@shared/types';
import { api } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const mockReviews = [
  { id: 1, author: 'Jane Doe', rating: 5, text: 'Absolutely love these headphones! The sound quality is incredible and they are so comfortable to wear for hours.', date: '2 weeks ago' },
  { id: 2, author: 'John Smith', rating: 4, text: 'Great product, very happy with my purchase. The noise cancellation could be a little better, but for the price, it\'s fantastic.', date: '1 month ago' },
];
export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const { addItem } = useCartStore(s => s.actions);
  const { isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("No product ID provided.");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const fetchedProduct = await api<Product>(`/api/products/${productId}`);
        setProduct(fetchedProduct);
        if (fetchedProduct.variants.length > 0) {
          setSelectedVariantId(fetchedProduct.variants[0].id);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);
  const handleAddToCart = () => {
    if (product && selectedVariantId) {
      addItem(product.id, selectedVariantId);
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error('Please select a variant.');
    }
  };
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || reviewText.trim() === '') {
      toast.error('Please provide a rating and a review.');
      return;
    }
    // Mock submission
    toast.success('Thank you for your review!');
    setRating(0);
    setReviewText('');
  };
  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4"><Skeleton className="w-full aspect-square" /><div className="grid grid-cols-4 gap-4"><Skeleton className="w-full aspect-square" /><Skeleton className="w-full aspect-square" /><Skeleton className="w-full aspect-square" /><Skeleton className="w-full aspect-square" /></div></div>
            <div className="space-y-6"><Skeleton className="h-6 w-1/4" /><Skeleton className="h-12 w-3/4" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-10 w-1/3" /><Skeleton className="h-12 w-full" /><Skeleton className="h-24 w-full" /></div>
          </div>
        </div>
      </AppLayout>
    );
  }
  if (error || !product) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl font-bold">Product not found</h1>
          <p className="mt-4 text-muted-foreground">{error || "We couldn't find the product you're looking for."}</p>
          <Button asChild className="mt-6"><Link to="/">Back to Marketplace</Link></Button>
        </div>
      </AppLayout>
    );
  }
  const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
  const displayPrice = product.price + (selectedVariant?.priceModifier ?? 0);
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <img src={product.images[0]} alt={product.name} className="w-full rounded-lg shadow-lg aspect-square object-cover" />
              <div className="grid grid-cols-4 gap-4 mt-4">
                {product.images.map((img, index) => (
                  <button key={index} className="rounded-lg overflow-hidden border-2 border-transparent hover:border-brand-primary focus:border-brand-primary transition">
                    <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover aspect-square" />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-brand-primary font-semibold">{product.category}</p>
                <h1 className="text-4xl lg:text-5xl font-bold mt-1">{product.name}</h1>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1"><Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /><span className="font-medium">{product.rating}</span><span className="text-muted-foreground">({product.reviewCount} reviews)</span></div>
                  <Badge variant="secondary" className="gap-1"><CheckCircle className="w-4 h-4 text-green-500" />In Stock</Badge>
                </div>
              </div>
              <p className="text-4xl font-bold">${displayPrice.toFixed(2)}</p>
              {product.variants.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">{product.variants[0].name}</h3>
                  <RadioGroup value={selectedVariantId} onValueChange={setSelectedVariantId} className="flex gap-2">
                    {product.variants.map(variant => (<div key={variant.id}><RadioGroupItem value={variant.id} id={variant.id} className="sr-only" /><Label htmlFor={variant.id} className="cursor-pointer rounded-md border-2 p-3 text-sm font-medium hover:bg-accent has-[input:checked]:border-brand-primary">{variant.value}</Label></div>))}
                  </RadioGroup>
                </div>
              )}
              <Button size="lg" className="w-full bg-brand-primary hover:bg-brand-secondary text-brand-primary-foreground text-lg" onClick={handleAddToCart}>Add to Cart</Button>
              <Separator />
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Truck className="w-5 h-5 text-brand-primary" /><span>Free shipping on orders over $50</span></div>
                <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-brand-primary" /><span>30-day money-back guarantee</span></div>
              </div>
              <Separator />
              <div><h3 className="text-lg font-semibold mb-2">Description</h3><p className="text-muted-foreground leading-relaxed">{product.description}</p></div>
            </div>
          </div>
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {mockReviews.map(review => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar><AvatarFallback><User className="h-5 w-5" /></AvatarFallback></Avatar>
                        <div>
                          <div className="flex items-center justify-between"><p className="font-semibold">{review.author}</p><p className="text-xs text-muted-foreground">{review.date}</p></div>
                          <div className="flex items-center gap-0.5 mt-1">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />))}</div>
                          <p className="mt-3 text-muted-foreground text-pretty">{review.text}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div>
                <Card>
                  <CardHeader><CardTitle>Write a Review</CardTitle></CardHeader>
                  <CardContent>
                    {isAuthenticated ? (
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <Label>Your Rating</Label>
                          <div className="flex items-center gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button type="button" key={star} onClick={() => setRating(star)}>
                                <Star className={`w-6 h-6 cursor-pointer transition-colors ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-300'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div><Label htmlFor="reviewText">Your Review</Label><Textarea id="reviewText" value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="What did you like or dislike?" /></div>
                        <Button type="submit" className="w-full">Submit Review</Button>
                      </form>
                    ) : (
                      <div className="text-center text-muted-foreground p-4 border rounded-md">
                        <p>You must be logged in to write a review.</p>
                        <Button asChild variant="link"><Link to="/login">Login now</Link></Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}