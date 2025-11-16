import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { Order } from '@shared/types';
import { format } from 'date-fns';
export default function DashboardPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      const fetchOrders = async () => {
        try {
          setIsLoading(true);
          const userOrders = await api<Order[]>('/api/orders/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setOrders(userOrders);
        } catch (error) {
          console.error("Failed to fetch orders", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrders();
    }
  }, [isAuthenticated, navigate, token]);
  if (!user) {
    return null; // Or a loading spinner
  }
  const OrderHistory = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    if (orders.length === 0) {
      return <p className="text-muted-foreground text-center py-8">You haven't placed any orders yet.</p>;
    }
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">...{order.id.slice(-6)}</TableCell>
                  <TableCell>{format(new Date(order.createdAt), 'PPP')}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="capitalize">{order.status}</Badge>
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Welcome, {user.name}!</h1>
            <p className="text-muted-foreground mt-2">Here's a summary of your account and recent activity.</p>
          </header>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Manage your personal details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <Button variant="outline" className="mt-2">Edit Profile</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Saved Addresses</CardTitle>
                <CardDescription>Your default shipping addresses.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No addresses saved yet.</p>
                <Button variant="outline" className="mt-2">Add Address</Button>
              </CardContent>
            </Card>
          </div>
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
            <OrderHistory />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}