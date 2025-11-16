import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { Order, User } from '@shared/types';
import { toast } from 'sonner';
import { SupportView } from '@/components/employee/SupportView';
import { OperationsView } from '@/components/employee/OperationsView';
import { ManagerView } from '@/components/employee/ManagerView';
const ROLE_NAMES = { 1: 'Support', 2: 'Operations', 3: 'Manager' };
export default function EmployeeDashboardPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'employee') {
      navigate('/login');
    } else {
      const fetchOrders = async () => {
        try {
          setIsLoading(true);
          const allOrders = await api<Order[]>('/api/admin/orders', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setOrders(allOrders);
        } catch (error) {
          console.error("Failed to fetch orders for employee", error);
          toast.error("Could not load orders.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrders();
    }
  }, [isAuthenticated, user, navigate, token]);
  if (!user) {
    return null;
  }
  const renderContent = () => {
    if (isLoading) {
      return <Skeleton className="h-96 w-full" />;
    }
    switch (user.level) {
      case 1:
        return <SupportView orders={orders} />;
      case 2:
        return <OperationsView orders={orders} setOrders={setOrders} />;
      case 3:
        return <ManagerView orders={orders} setOrders={setOrders} />;
      default:
        return <p>You do not have a specific role assigned.</p>;
    }
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Employee Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome, {user.name}. You are logged in as a Level {user.level} ({ROLE_NAMES[user.level as keyof typeof ROLE_NAMES] || 'Unknown'}).
            </p>
          </header>
          {renderContent()}
        </div>
      </div>
    </AppLayout>
  );
}