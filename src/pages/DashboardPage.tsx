import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
const mockOrders = [
  { id: 'ORD001', date: '2023-10-26', status: 'Delivered', total: '$120.00' },
  { id: 'ORD002', date: '2023-10-24', status: 'Shipped', total: '$45.50' },
  { id: 'ORD003', date: '2023-10-22', status: 'Delivered', total: '$75.00' },
];
export default function DashboardPage() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  if (!user) {
    return null; // Or a loading spinner
  }
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
                    {mockOrders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>{order.status}</Badge>
                        </TableCell>
                        <TableCell>{order.total}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}