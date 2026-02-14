import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Eye, FileDown, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { db, NotaFiscal } from "../services/database";
import { toast } from "sonner";
import logoImage from "../../assets/b3da8dea4f58613c66c3dde85a4836b5e6655bf8.png";

interface HomeProps {
  onNavigateToForm: () => void;
  onViewInvoice: (id: number) => void;
  onEditInvoice: (id: number) => void;
}

export function Home({ onNavigateToForm, onViewInvoice, onEditInvoice }: HomeProps) {
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotas, setFilteredNotas] = useState<NotaFiscal[]>([]);

  useEffect(() => {
    loadNotas();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const buscar = async () => {
        const resultado = await db.buscarNotasPorCliente(searchTerm);
        setFilteredNotas(resultado);
      };
      buscar();
    } else {
      setFilteredNotas(notas.slice(0, 10));
    }
  }, [searchTerm, notas]);

  const loadNotas = async () => {
    try {
      console.log('Carregando notas...');
      const todasNotas = await db.getNotasFiscais();
      console.log('Notas recebidas:', todasNotas);
      const notasOrdenadas = todasNotas.sort((a, b) => {
        const dateA = new Date(a.criado_em || 0).getTime();
        const dateB = new Date(b.criado_em || 0).getTime();
        return dateB - dateA;
      });
      setNotas(notasOrdenadas);
      setFilteredNotas(notasOrdenadas.slice(0, 10));
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
      toast.error('Erro ao carregar notas fiscais. Verifique se o backend está rodando.');
    }
  };

  const handleDelete = async (id: number, numeroNota: string) => {
    if (window.confirm(`Deseja realmente excluir a nota fiscal ${numeroNota}?`)) {
      try {
        await db.excluirNotaFiscal(id);
        loadNotas();
        toast.success('Nota fiscal excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir nota fiscal');
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não disponível';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 px-6 py-3 rounded-xl border-2 border-blue-200">
                <img 
                  src={logoImage} 
                  alt="A&C Centro Automotivo" 
                  className="h-14 sm:h-16 object-contain"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Sistema de Nota Fiscal
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Gestão de Serviços Mecânicos
                </p>
              </div>
            </div>
            <Button
              onClick={onNavigateToForm}
              className="bg-blue-600 hover:bg-blue-700 text-white h-12"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Cadastro
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-md">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="text-blue-700">Notas Fiscais Cadastradas</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Busca */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar por nome do cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Lista de Notas */}
            {filteredNotas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Nenhuma nota fiscal encontrada.</p>
                <p className="text-sm mt-2">Clique em "Novo Cadastro" para criar uma nota.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotas.map((nota) => (
                  <div
                    key={nota.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-blue-600">{nota.numero_nota}</span>
                        <span className="text-gray-700 font-medium">{nota.cliente_nome}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>Data: {formatDate(nota.criado_em)}</span>
                        <span>Total: {formatCurrency(nota.valor_total)}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          nota.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {nota.status === 'active' ? 'Ativa' : 'Cancelada'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewInvoice(nota.id!)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Visualizar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditInvoice(nota.id!)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(nota.id!, nota.numero_nota)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!searchTerm && notas.length > 10 && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Mostrando os 10 registros mais recentes. Use a busca para encontrar outros.
              </p>
            )}
          </CardContent>
        </Card>
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
