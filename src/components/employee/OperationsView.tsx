import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Order } from '@shared/types';
import { format } from 'date-fns';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/hooks/useAuthStore';
import { api } from '@/lib/api-client';
import { useState } from 'react';
interface OperationsViewProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}
const ORDER_STATUSES: Order['status'][] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
export function OperationsView({ orders, setOrders }: OperationsViewProps) {
  const token = useAuthStore(s => s.token);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrderId(orderId);
    try {
      const updatedOrder = await api<Order>(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? updatedOrder : order
        )
      );
      toast.success(`Order ...${orderId.slice(-6)} status updated to ${newStatus}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Fulfillment</CardTitle>
        <CardDescription>Manage and update the status of customer orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? orders.map(order => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">...{order.id.slice(-6)}</TableCell>
                <TableCell>{format(new Date(order.createdAt), 'PPP')}</TableCell>
                <TableCell><Badge variant="secondary" className="capitalize">{order.status}</Badge></TableCell>
                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {updatingOrderId === order.id ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {ORDER_STATUSES.map(status => (
                          <DropdownMenuItem
                            key={status}
                            disabled={order.status === status}
                            onClick={() => handleStatusUpdate(order.id, status)}
                            className="capitalize"
                          >
                            Mark as {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={5} className="text-center">No orders found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}