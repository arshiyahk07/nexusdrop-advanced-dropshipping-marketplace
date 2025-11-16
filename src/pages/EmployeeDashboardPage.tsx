import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
export default function EmployeeDashboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'employee') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);
  if (!user) {
    return null; // Or a loading spinner while auth state is being determined
  }
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Employee Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome, {user.name}. Here are your tools and tasks.</p>
          </header>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Workspace</span>
                </CardTitle>
                <CardDescription>
                  This is your dedicated workspace. Role-specific modules and tasks will appear here in future updates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Currently, the employee dashboard is under construction. Please check back later for more features.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}