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
import type { Order, User } from '@shared/types';
import { format } from 'date-fns';
import { MoreHorizontal, Users, ShoppingBag } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function AdminDashboardPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
    } else {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [allUsers, allOrders] = await Promise.all([
            api<User[]>('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
            api<Order[]>('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          setUsers(allUsers);
          setOrders(allOrders);
        } catch (error) {
          console.error("Failed to fetch admin data", error);
          toast.error("Failed to load admin dashboard. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isAuthenticated, navigate, token, user]);
  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="space-y-8">
            <Skeleton className="h-12 w-1/4" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Oversee and manage the entire marketplace.</p>
          </header>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
              <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Users</TabsTrigger>
              <TabsTrigger value="orders"><ShoppingBag className="mr-2 h-4 w-4" />Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="users">
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage all users on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(u => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell><Badge variant={u.role === 'admin' ? 'destructive' : 'secondary'} className="capitalize">{u.role}</Badge></TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit User</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500">Delete User</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="orders">
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>A complete list of all orders placed on the marketplace.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map(order => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">...{order.id.slice(-6)}</TableCell>
                          <TableCell>{format(new Date(order.createdAt), 'PPP')}</TableCell>
                          <TableCell>...{order.userId.slice(-6)}</TableCell>
                          <TableCell><Badge variant="secondary" className="capitalize">{order.status}</Badge></TableCell>
                          <TableCell>${order.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}