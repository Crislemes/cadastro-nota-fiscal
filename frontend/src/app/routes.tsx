import { createBrowserRouter, Navigate } from "react-router";
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ClientsList } from './pages/ClientsList';
import { ClientForm } from './pages/ClientForm';
import { InvoicesList } from './pages/InvoicesList';
import { InvoiceForm } from './pages/InvoiceForm';
import { InvoiceView } from './pages/InvoiceView';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Navigate to="/dashboard" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/clientes",
    element: (
      <ProtectedRoute>
        <ClientsList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/clientes/novo",
    element: (
      <ProtectedRoute>
        <ClientForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/clientes/:id/editar",
    element: (
      <ProtectedRoute>
        <ClientForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notas",
    element: (
      <ProtectedRoute>
        <InvoicesList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notas/nova",
    element: (
      <ProtectedRoute>
        <InvoiceForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notas/:id",
    element: (
      <ProtectedRoute>
        <InvoiceView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notas/:id/editar",
    element: (
      <ProtectedRoute>
        <InvoiceForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
