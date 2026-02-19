import { Link } from 'react-router';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Users, FileText, PlusCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useState } from 'react';

export function Dashboard() {
  const { clients, invoices } = useData();
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Filtrar notas por mês
  const filteredInvoices = selectedMonth === 'all' 
    ? invoices 
    : invoices.filter(inv => {
        const invoiceDate = new Date(inv.createdAt);
        const [year, month] = selectedMonth.split('-');
        return invoiceDate.getFullYear() === parseInt(year) && 
               invoiceDate.getMonth() + 1 === parseInt(month);
      });

  const totalInvoices = filteredInvoices.length;
  const totalClients = clients.length;
  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.laborCost, 0);

  // Gerar lista de meses disponíveis
  const availableMonths = Array.from(new Set(
    invoices.map(inv => {
      const date = new Date(inv.createdAt);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    })
  )).sort().reverse();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatMonthYear = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Bem-vindo ao sistema de gestão de notas fiscais
            </p>
          </div>
          <div className="w-full sm:w-64">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {availableMonths.map(month => (
                  <SelectItem key={month} value={month}>
                    {formatMonthYear(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
              <p className="text-xs text-gray-500 mt-1">
                {selectedMonth === 'all' ? 'Total geral' : `Mês: ${formatMonthYear(selectedMonth)}`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Link to="/clientes">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Lista de Clientes
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Notas Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <FileText className="h-5 w-5" />
                  Notas
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie suas notas fiscais
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <p className="text-sm text-gray-600">
                  Acesse, edite, exclua e gere PDFs das notas fiscais.
                </p>
                <Link to="/notas">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Notas Fiscais
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
