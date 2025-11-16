import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { Order, User, AuditLog } from '@shared/types';
import { format } from 'date-fns';
import { MoreHorizontal, Users, ShoppingBag, Loader2, BookLock, BarChart2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
const ROLES: User['role'][] = ['admin', 'vendor', 'employee', 'buyer'];
const ORDER_STATUSES: Order['status'][] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
export default function AdminDashboardPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
    } else {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [allUsers, allOrders, allLogs] = await Promise.all([
            api<User[]>('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
            api<Order[]>('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
            api<AuditLog[]>('/api/admin/audit-logs', { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          setUsers(allUsers);
          setOrders(allOrders);
          setAuditLogs(allLogs);
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
  const analyticsData = useMemo(() => {
    const userRoleData = ROLES.map(role => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      count: users.filter(u => u.role === role).length,
    }));
    const revenueByMonth = orders.reduce((acc, order) => {
      const month = format(new Date(order.createdAt), 'MMM yyyy');
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += order.total;
      return acc;
    }, {} as Record<string, number>);
    const revenueData = Object.entries(revenueByMonth)
      .map(([name, revenue]) => ({ name, revenue: parseFloat(revenue.toFixed(2)) }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    return { userRoleData, revenueData };
  }, [users, orders]);
  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    try {
      await api(`/api/admin/users/${userId}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ role: newRole }) });
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success("User role updated successfully.");
    } catch (error) { toast.error("Failed to update user role."); }
  };
  const handleDeleteUser = async (userId: string) => {
    try {
      await api(`/api/admin/users/${userId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      toast.success("User deleted successfully.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to delete user."); }
  };
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrderId(orderId);
    try {
      const updatedOrder = await api<Order>(`/api/orders/${orderId}/status`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: newStatus }) });
      setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? updatedOrder : order));
      toast.success(`Order ...${orderId.slice(-6)} status updated to ${newStatus}.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to update order status."); } finally { setUpdatingOrderId(null); }
  };
  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="space-y-8"><Skeleton className="h-12 w-1/4" /><Skeleton className="h-96 w-full" /></div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <header className="mb-8"><h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1><p className="text-muted-foreground mt-2">Oversee and manage the entire marketplace.</p></header>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-4 md:w-[800px]">
              <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Users</TabsTrigger>
              <TabsTrigger value="orders"><ShoppingBag className="mr-2 h-4 w-4" />Orders</TabsTrigger>
              <TabsTrigger value="logs"><BookLock className="mr-2 h-4 w-4" />Audit Logs</TabsTrigger>
              <TabsTrigger value="analytics"><BarChart2 className="mr-2 h-4 w-4" />Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="users">
              <Card className="mt-4">
                <CardHeader><CardTitle>User Management</CardTitle><CardDescription>View and manage all users on the platform.</CardDescription></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
                    <TableBody>{users.map(u => (<TableRow key={u.id}><TableCell className="font-medium">{u.name}</TableCell><TableCell>{u.email}</TableCell><TableCell><Badge variant={u.role === 'admin' ? 'destructive' : 'secondary'} className="capitalize">{u.role}</Badge></TableCell><TableCell><AlertDialog><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuSub><DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger><DropdownMenuPortal><DropdownMenuSubContent>{ROLES.map(role => (<DropdownMenuItem key={role} onClick={() => handleRoleChange(u.id, role)} disabled={u.role === role}><span className="capitalize">{role}</span></DropdownMenuItem>))}</DropdownMenuSubContent></DropdownMenuPortal></DropdownMenuSub><AlertDialogTrigger asChild><DropdownMenuItem className="text-red-500" onSelect={(e) => e.preventDefault()}>Delete User</DropdownMenuItem></AlertDialogTrigger></DropdownMenuContent></DropdownMenu><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the user account for {u.name}.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(u.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>))}</TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="orders">
              <Card className="mt-4">
                <CardHeader><CardTitle>All Orders</CardTitle><CardDescription>A complete list of all orders placed on the marketplace.</CardDescription></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Order ID</TableHead><TableHead>Date</TableHead><TableHead>Customer ID</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
                    <TableBody>{orders.map(order => (<TableRow key={order.id}><TableCell className="font-medium">...{order.id.slice(-6)}</TableCell><TableCell>{format(new Date(order.createdAt), 'PPP')}</TableCell><TableCell>...{order.userId.slice(-6)}</TableCell><TableCell><Badge variant="secondary" className="capitalize">{order.status}</Badge></TableCell><TableCell>${order.total.toFixed(2)}</TableCell><TableCell className="text-right">{updatingOrderId === order.id ? (<Loader2 className="h-4 w-4 animate-spin ml-auto" />) : (<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{ORDER_STATUSES.map(status => (<DropdownMenuItem key={status} disabled={order.status === status} onClick={() => handleStatusUpdate(order.id, status)} className="capitalize">Mark as {status}</DropdownMenuItem>))}</DropdownMenuContent></DropdownMenu>)}</TableCell></TableRow>))}</TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="logs">
              <Card className="mt-4">
                <CardHeader><CardTitle>Audit Logs</CardTitle><CardDescription>An immutable record of all significant actions taken on the platform.</CardDescription></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Actor</TableHead><TableHead>Action</TableHead><TableHead>Target</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                    <TableBody>{auditLogs.map(log => (<TableRow key={log.id}><TableCell className="font-medium">{log.actorName}<br/><span className="text-xs text-muted-foreground">...{log.actorId.slice(-6)}</span></TableCell><TableCell>{log.action}</TableCell><TableCell className="capitalize">{log.targetType}: ...{log.targetId.slice(-6)}</TableCell><TableCell>{format(new Date(log.createdAt), 'PPP p')}</TableCell></TableRow>))}</TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <Card>
                  <CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.revenueData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value) => `$${value}`} /><Legend /><Bar dataKey="revenue" fill="#8884d8" /></BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>User Role Distribution</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={analyticsData.userRoleData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{analyticsData.userRoleData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie>
                        <Tooltip /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}