import { Link } from 'react-router';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, FileText, PlusCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { useData } from '../context/DataContext';

export function Dashboard() {
  const { clients, invoices } = useData();

  const totalInvoices = invoices.length;
  const totalClients = clients.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo ao sistema de gestão de notas fiscais
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Clientes
              </CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalClients}</div>
              <p className="text-xs text-gray-500 mt-1">Clientes cadastrados</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Notas Fiscais
              </CardTitle>
              <FileText className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{totalInvoices}</div>
              <p className="text-xs text-gray-500 mt-1">Notas emitidas</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Faturamento Total
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {formatCurrency(totalRevenue)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Valor total de notas</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Clientes Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Users className="h-5 w-5" />
                  Clientes
                </CardTitle>
                <CardDescription>
                  Gerencie seus clientes cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <p className="text-sm text-gray-600">
                  Cadastre, visualize e edite os dados dos seus clientes.
                </p>
                <div className="space-y-2">
                  <Link to="/clientes">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Ver Lista de Clientes
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/clientes/novo">
                    <Button variant="outline" className="w-full border-blue-200">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Cadastrar Novo Cliente
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Notas Cadastradas Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <FileText className="h-5 w-5" />
                  Notas Cadastradas
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie suas notas fiscais
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <p className="text-sm text-gray-600">
                  Acesse, edite, exclua e gere PDFs das notas fiscais.
                </p>
                <div className="space-y-2">
                  <Link to="/notas">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Ver Notas Fiscais
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Nova Nota Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow border-2 border-purple-200">
              <CardHeader className="bg-purple-50 border-b">
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <PlusCircle className="h-5 w-5" />
                  Nova Nota Fiscal
                </CardTitle>
                <CardDescription>
                  Cadastre uma nova nota fiscal
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <p className="text-sm text-gray-600">
                  Crie uma nova nota fiscal com dados do cliente e serviços.
                </p>
                <div className="space-y-2">
                  <Link to="/notas/nova">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Criar Nova Nota
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
