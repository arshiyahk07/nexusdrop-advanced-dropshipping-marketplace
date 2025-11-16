import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/hooks/useCartStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { CreditCard, Loader2 } from "lucide-react";
import type { Product, Order } from "@shared/types";
const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  zipCode: z.string().min(4, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
});
type ShippingFormValues = z.infer<typeof shippingSchema>;
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, itemCount, totalPrice, actions: { clearCart } } = useCartStore();
  const { isAuthenticated, token } = useAuthStore();
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
  });
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
    if (itemCount === 0) {
      navigate('/');
    }
  }, [isAuthenticated, itemCount, navigate]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await api<Product[]>('/api/products');
        setProducts(new Map(allProducts.map(p => [p.id, p])));
      } catch (error) {
        console.error("Failed to fetch products for checkout", error);
      }
    };
    fetchProducts();
  }, []);
  const onSubmit = async (data: ShippingFormValues) => {
    setIsLoading(true);
    try {
      await api<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: Object.values(items),
          shippingAddress: data,
          total: totalPrice,
        }),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Order placed successfully!");
      clearCart();
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place order.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <h1 className="text-4xl font-bold tracking-tight text-center mb-12">Checkout</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="lg:order-2">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.values(items).map(item => {
                      const product = products.get(item.productId);
                      if (!product) return null;
                      return (
                        <div key={item.variantId} className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <img src={product.images[0]} alt={product.name} className="w-16 h-16 rounded-md object-cover" />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-medium">${(product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      );
                    })}
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p>Subtotal</p>
                      <p>${totalPrice.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p>Shipping</p>
                      <p>Free</p>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <p>Total</p>
                      <p>${totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:order-1">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" {...register('fullName')} />
                      {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" {...register('address')} />
                      {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" {...register('city')} />
                      {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input id="zipCode" {...register('zipCode')} />
                      {errors.zipCode && <p className="text-sm text-red-500 mt-1">{errors.zipCode.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" {...register('country')} />
                      {errors.country && <p className="text-sm text-red-500 mt-1">{errors.country.message}</p>}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <CreditCard className="h-6 w-6" />
                            <p>Card payment will be implemented in a future phase.</p>
                        </div>
                    </div>
                  </CardContent>
                </Card>
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Place Order
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}