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
import { CreditCard, Loader2, Wallet } from "lucide-react";
import type { Product, Order } from "@shared/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  zipCode: z.string().min(4, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
  // Card details (optional, for validation simulation)
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvc: z.string().optional(),
});
type ShippingFormValues = z.infer<typeof shippingSchema>;
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, itemCount, totalPrice, actions: { clearCart } } = useCartStore();
  const { isAuthenticated, token } = useAuthStore();
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
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
    toast.info(`Processing ${paymentMethod} payment...`);
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="lg:order-2">
                <Card>
                  <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
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
                      <div className="flex justify-between"><p>Subtotal</p><p>${totalPrice.toFixed(2)}</p></div>
                      <div className="flex justify-between"><p>Shipping</p><p>Free</p></div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold text-lg"><p>Total</p><p>${totalPrice.toFixed(2)}</p></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:order-1 space-y-8">
                <Card>
                  <CardHeader><CardTitle>Shipping Information</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2"><Label htmlFor="fullName">Full Name</Label><Input id="fullName" {...register('fullName')} />{errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>}</div>
                    <div className="sm:col-span-2"><Label htmlFor="address">Address</Label><Input id="address" {...register('address')} />{errors.address && <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>}</div>
                    <div><Label htmlFor="city">City</Label><Input id="city" {...register('city')} />{errors.city && <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>}</div>
                    <div><Label htmlFor="zipCode">ZIP Code</Label><Input id="zipCode" {...register('zipCode')} />{errors.zipCode && <p className="text-sm text-red-500 mt-1">{errors.zipCode.message}</p>}</div>
                    <div className="sm:col-span-2"><Label htmlFor="country">Country</Label><Input id="country" {...register('country')} />{errors.country && <p className="text-sm text-red-500 mt-1">{errors.country.message}</p>}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
                  <CardContent>
                    <Tabs defaultValue="card" className="w-full" onValueChange={setPaymentMethod}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="card"><CreditCard className="mr-2 h-4 w-4" />Card</TabsTrigger>
                        <TabsTrigger value="paypal">PayPal</TabsTrigger>
                        <TabsTrigger value="crypto"><Wallet className="mr-2 h-4 w-4" />Crypto</TabsTrigger>
                      </TabsList>
                      <TabsContent value="card" className="pt-4">
                        <div className="space-y-4">
                          <div><Label htmlFor="cardNumber">Card Number</Label><Input id="cardNumber" placeholder="**** **** **** 1234" {...register('cardNumber')} /></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div><Label htmlFor="expiryDate">Expiry Date</Label><Input id="expiryDate" placeholder="MM/YY" {...register('expiryDate')} /></div>
                            <div><Label htmlFor="cvc">CVC</Label><Input id="cvc" placeholder="123" {...register('cvc')} /></div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="paypal" className="pt-4 text-center">
                        <p className="text-muted-foreground mb-4">You will be redirected to PayPal to complete your purchase.</p>
                        <Button type="button" variant="outline">Continue with PayPal</Button>
                      </TabsContent>
                      <TabsContent value="crypto" className="pt-4 text-center">
                        <p className="text-muted-foreground mb-4">Pay with USDT (ERC20/TRC20). An address will be provided.</p>
                        <Button type="button" variant="outline">Continue with Crypto</Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Place Order
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}