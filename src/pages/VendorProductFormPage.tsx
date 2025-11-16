import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/hooks/useAuthStore';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import type { Product } from '@shared/types';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
const variantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Variant name is required'),
  value: z.string().min(1, 'Variant value is required'),
  sku: z.string().min(1, 'SKU is required'),
  priceModifier: z.coerce.number().default(0),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
});
const productSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  description: z.string().min(10, 'Description is required'),
  price: z.coerce.number().min(0.01, 'Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  images: z.array(z.object({ value: z.string().url("Must be a valid URL") })).min(1, 'At least one image URL is required'),
  tags: z.array(z.string()).optional(),
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),
});
type ProductFormValues = z.infer<typeof productSchema>;
export default function VendorProductFormPage() {
  const { productId } = useParams<{ productId?: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!productId);
  const isEditMode = !!productId;
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      images: [{ value: '' }],
      variants: [{ name: 'Size', value: 'One Size', sku: '', priceModifier: 0, stock: 0 }],
      tags: [],
    },
  });
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: 'variants' });
  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control, name: 'images' });
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'vendor') {
      navigate('/login');
    }
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const product = await api<Product>(`/api/products/${productId}`);
          const formValues: ProductFormValues = {
            ...product,
            images: product.images.map(url => ({ value: url })),
            tags: product.tags || [],
          };
          reset(formValues);
        } catch (error) {
          toast.error('Failed to fetch product details.');
          navigate('/vendor/dashboard');
        } finally {
          setIsFetching(false);
        }
      };
      fetchProduct();
    }
  }, [isAuthenticated, user, navigate, isEditMode, productId, reset]);
  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const apiPayload = {
        ...data,
        images: data.images.map(img => img.value),
        rating: 0,
        reviewCount: 0,
      };
      if (isEditMode) {
        await api<Product>(`/api/vendor/products/${productId}`, {
          method: 'PUT',
          body: JSON.stringify(apiPayload),
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Product updated successfully!');
      } else {
        await api<Product>('/api/vendor/products', {
          method: 'POST',
          body: JSON.stringify(apiPayload),
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Product created successfully!');
      }
      navigate('/vendor/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  if (isFetching) {
    return <AppLayout><div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div></AppLayout>;
  }
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-6">{isEditMode ? 'Edit Product' : 'Create New Product'}</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label htmlFor="name">Product Name</Label><Input id="name" {...register('name')} />{errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}</div>
              <div><Label htmlFor="description">Description</Label><Textarea id="description" {...register('description')} />{errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}</div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="price">Price</Label><Input id="price" type="number" step="0.01" {...register('price')} />{errors.price && <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>}</div>
                <div><Label htmlFor="category">Category</Label><Input id="category" {...register('category')} />{errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Images</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {imageFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input {...register(`images.${index}.value` as const)} placeholder="https://example.com/image.png" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              {errors.images && <p className="text-sm text-red-500 mt-1">{errors.images.message || errors.images.root?.message}</p>}
              <Button type="button" variant="outline" size="sm" onClick={() => appendImage({ value: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Image URL</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Variants</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {variantFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-md relative">
                  <div className="md:col-span-5 flex justify-end absolute -top-3 -right-3"><Button type="button" variant="destructive" size="icon" className="h-6 w-6" onClick={() => removeVariant(index)}><Trash2 className="h-4 w-4" /></Button></div>
                  <div><Label>Name</Label><Input {...register(`variants.${index}.name`)} /></div>
                  <div><Label>Value</Label><Input {...register(`variants.${index}.value`)} /></div>
                  <div><Label>SKU</Label><Input {...register(`variants.${index}.sku`)} /></div>
                  <div><Label>Price Mod</Label><Input type="number" step="0.01" {...register(`variants.${index}.priceModifier`)} /></div>
                  <div><Label>Stock</Label><Input type="number" {...register(`variants.${index}.stock`)} /></div>
                </div>
              ))}
              {errors.variants && <p className="text-sm text-red-500 mt-1">{errors.variants.message}</p>}
              <Button type="button" variant="outline" size="sm" onClick={() => appendVariant({ id: crypto.randomUUID(), name: 'Size', value: '', sku: '', priceModifier: 0, stock: 0 })}><PlusCircle className="mr-2 h-4 w-4" />Add Variant</Button>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/vendor/dashboard')}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isEditMode ? 'Save Changes' : 'Create Product'}</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}