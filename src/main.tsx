import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import ProductPage from '@/pages/ProductPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import CheckoutPage from '@/pages/CheckoutPage';
import VendorDashboardPage from '@/pages/VendorDashboardPage';
import VendorProductFormPage from '@/pages/VendorProductFormPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/product/:productId",
    element: <ProductPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/checkout",
    element: <CheckoutPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/vendor/dashboard",
    element: <VendorDashboardPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/vendor/products/new",
    element: <VendorProductFormPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/vendor/products/edit/:productId",
    element: <VendorProductFormPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/dashboard",
    element: <AdminDashboardPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)