import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Order } from '@shared/types';
import { OperationsView } from './OperationsView';
import { DollarSign, ShoppingBag, Users } from 'lucide-react';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
interface ManagerViewProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}
const COLORS = ['#FFBB28', '#00C49F', '#0088FE', '#FF8042', '#8884d8'];
const ORDER_STATUSES: Order['status'][] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
export function ManagerView({ orders, setOrders }: ManagerViewProps) {
  const totalRevenue = orders.reduce((sum, order) => order.status !== 'cancelled' ? sum + order.total : sum, 0);
  const newOrdersToday = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    return orderDate.getDate() === today.getDate() &&
           orderDate.getMonth() === today.getMonth() &&
           orderDate.getFullYear() === today.getFullYear();
  }).length;
  const orderStatusData = useMemo(() => {
    return ORDER_STATUSES.map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: orders.filter(order => order.status === status).length,
    })).filter(item => item.value > 0);
  }, [orders]);
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Across {orders.filter(o => o.status !== 'cancelled').length} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Orders (Today)</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newOrdersToday}</div>
            <p className="text-xs text-muted-foreground">New orders placed today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{new Set(orders.map(o => o.userId)).size}</div>
            <p className="text-xs text-muted-foreground">Unique customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie data={orderStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <OperationsView orders={orders} setOrders={setOrders} />
    </div>
  );
}