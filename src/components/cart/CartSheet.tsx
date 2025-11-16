import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/useCartStore";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingBag } from "lucide-react";
interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const items = useCartStore(s => s.items);
  const itemCount = useCartStore(s => s.itemCount);
  const totalPrice = useCartStore(s => s.totalPrice);
  const { removeItem, updateQuantity, clearCart } = useCartStore(s => s.actions);
  const productsById = new Map(MOCK_PRODUCTS.map(p => [p.id, p]));
  const cartItems = Object.values(items);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-6 p-6">
                {cartItems.map(item => {
                  const product = productsById.get(item.productId);
                  if (!product) return null;
                  const variant = product.variants.find(v => v.id === item.variantId);
                  const itemPrice = product.price + (variant?.priceModifier ?? 0);
                  return (
                    <div key={item.variantId} className="flex items-start gap-4">
                      <img src={product.images[0]} alt={product.name} className="h-20 w-20 rounded-md object-cover" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.name}</h3>
                        {variant && <p className="text-sm text-muted-foreground">{variant.name}: {variant.value}</p>}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.variantId, parseInt(e.target.value, 10))}
                              className="h-8 w-16"
                            />
                          </div>
                          <p className="font-medium">${(itemPrice * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => removeItem(item.variantId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="p-6 space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg">Proceed to Checkout</Button>
              <Button variant="outline" className="w-full" onClick={clearCart}>Clear Cart</Button>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground">Add some products to get started.</p>
            <SheetClose asChild>
              <Button>Continue Shopping</Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}