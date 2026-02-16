import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { LogOut, LayoutDashboard, Users, FileText, PlusCircle, RefreshCw } from 'lucide-react';
import logoImage from '../../assets/logo.png';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="bg-blue-50 px-4 py-2 rounded-xl border-2 border-blue-200">
                <img 
                  src={logoImage} 
                  alt="A&C Centro Automotivo" 
                  className="h-12 object-contain"
                />
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Link to="/dashboard">
                <Button
                  variant={isActive('/dashboard') ? 'default' : 'ghost'}
                  className={isActive('/dashboard') ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/clientes">
                <Button
                  variant={isActive('/clientes') ? 'default' : 'ghost'}
                  className={isActive('/clientes') ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Clientes
                </Button>
              </Link>
              <Link to="/notas">
                <Button
                  variant={isActive('/notas') ? 'default' : 'ghost'}
                  className={isActive('/notas') ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Notas Fiscais
                </Button>
              </Link>
              <Link to="/notas/nova">
                <Button
                  variant={isActive('/notas/nova') ? 'default' : 'ghost'}
                  className={isActive('/notas/nova') ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nova Nota
                </Button>
              </Link>
            </nav>

            {/* User & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                title="Recarregar aplicação"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
            <Link to="/dashboard">
              <Button
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                size="sm"
                className={isActive('/dashboard') ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Dashboard
              </Button>
            </Link>
            <Link to="/clientes">
              <Button
                variant={isActive('/clientes') ? 'default' : 'ghost'}
                size="sm"
                className={isActive('/clientes') ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <Users className="h-4 w-4 mr-1" />
                Clientes
              </Button>
            </Link>
            <Link to="/notas">
              <Button
                variant={isActive('/notas') ? 'default' : 'ghost'}
                size="sm"
                className={isActive('/notas') ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <FileText className="h-4 w-4 mr-1" />
                Notas
              </Button>
            </Link>
            <Link to="/notas/nova">
              <Button
                variant={isActive('/notas/nova') ? 'default' : 'ghost'}
                size="sm"
                className={isActive('/notas/nova') ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Nova
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            A&C Centro Automotivo - Sistema de Gestão de Notas Fiscais © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}