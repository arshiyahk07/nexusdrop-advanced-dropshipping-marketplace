import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@shared/types';
import { format } from 'date-fns';
interface SupportViewProps {
  orders: Order[];
}
export function SupportView({ orders }: SupportViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Customer Orders</CardTitle>
        <CardDescription>Read-only view of all orders on the platform for support purposes.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? orders.map(order => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">...{order.id.slice(-6)}</TableCell>
                <TableCell>{format(new Date(order.createdAt), 'PPP')}</TableCell>
                <TableCell>...{order.userId.slice(-6)}</TableCell>
                <TableCell><Badge variant="secondary" className="capitalize">{order.status}</Badge></TableCell>
                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
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