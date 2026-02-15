import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeft, FileDown, User, Car, Wrench, Calculator } from "lucide-react";
import { db, NotaFiscal, Cliente, Veiculo, ItemNotaFiscal } from "../services/database";
import { generateInvoicePDF } from "../utils/pdfGenerator";
import { toast } from "sonner";
import logoImage from "../../assets/logo-marca-oficina.png";

interface ViewInvoiceProps {
  invoiceId: number;
  onBack: () => void;
}

export function ViewInvoice({ invoiceId, onBack }: ViewInvoiceProps) {
  const [nota, setNota] = useState<NotaFiscal | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [itens, setItens] = useState<ItemNotaFiscal[]>([]);

  useEffect(() => {
    loadInvoiceData();
  }, [invoiceId]);

  const loadInvoiceData = async () => {
    const notaData = await db.getNotaFiscalById(invoiceId);
    if (!notaData) {
      toast.error('Nota fiscal não encontrada');
      onBack();
      return;
    }

    setNota(notaData);
    const clienteData = await db.getClienteById(notaData.cliente_id);
    setCliente(clienteData);
    
    if (notaData.veiculo_id) {
      const veiculoData = await db.getVeiculoById(notaData.veiculo_id);
      setVeiculo(veiculoData);
    }
    
    const itensData = await db.getItensByNotaId(invoiceId);
    setItens(itensData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não disponível';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDownloadPDF = () => {
    if (!nota || !cliente) return;

    const invoiceData = {
      clientData: {
        name: cliente.nome,
        cpfCnpj: cliente.cpf_cnpj,
        phone: cliente.telefone,
        address: cliente.endereco,
      },
      vehicleData: {
        plate: veiculo?.placa || '',
        year: veiculo?.ano || '',
        model: veiculo?.modelo || '',
      },
      parts: itens.map(item => ({
        id: item.id!.toString(),
        name: item.nome_peca,
        quantity: item.quantidade,
        unitPrice: item.valor_unitario,
      })),
      laborCost: nota.valor_mao_de_obra,
      observations: nota.observacoes,
      partsTotal: nota.total_pecas,
      total: nota.valor_total,
    };

    generateInvoicePDF(invoiceData);
    toast.success('PDF gerado com sucesso!');
  };

  if (!nota || !cliente) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 px-6 py-3 rounded-xl border-2 border-blue-200">
              <img 
                src={logoImage} 
                alt="A&C Centro Automotivo" 
                className="h-14 sm:h-16 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Visualizar Nota Fiscal
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {nota.numero_nota} - {formatDate(nota.criado_em)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Dados do Cliente */}
          <Card className="shadow-md">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <User className="h-5 w-5" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome Completo</p>
                  <p className="font-medium">{cliente.nome}</p>
                </div>
                {cliente.cpf_cnpj && (
                  <div>
                    <p className="text-sm text-gray-600">CPF/CNPJ</p>
                    <p className="font-medium">{cliente.cpf_cnpj}</p>
                  </div>
                )}
                {cliente.telefone && (
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="font-medium">{cliente.telefone}</p>
                  </div>
                )}
                {cliente.endereco && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Endereço</p>
                    <p className="font-medium">{cliente.endereco}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dados do Veículo */}
          {veiculo && (
            <Card className="shadow-md">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Car className="h-5 w-5" />
                  Dados do Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {veiculo.placa && (
                    <div>
                      <p className="text-sm text-gray-600">Placa</p>
                      <p className="font-medium">{veiculo.placa}</p>
                    </div>
                  )}
                  {veiculo.ano && (
                    <div>
                      <p className="text-sm text-gray-600">Ano</p>
                      <p className="font-medium">{veiculo.ano}</p>
                    </div>
                  )}
                  {veiculo.modelo && (
                    <div>
                      <p className="text-sm text-gray-600">Modelo</p>
                      <p className="font-medium">{veiculo.modelo}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dados do Serviço */}
          <Card className="shadow-md">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Wrench className="h-5 w-5" />
                Dados do Serviço
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {itens.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Peças Utilizadas</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b">
                          <th className="text-left p-3 text-sm">Descrição</th>
                          <th className="text-left p-3 text-sm w-24">Qtd</th>
                          <th className="text-left p-3 text-sm w-32">Valor Unit.</th>
                          <th className="text-left p-3 text-sm w-32">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itens.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="p-3">{item.nome_peca}</td>
                            <td className="p-3">{item.quantidade}</td>
                            <td className="p-3">{formatCurrency(item.valor_unitario)}</td>
                            <td className="p-3 font-medium">{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 text-gray-600">Mão de Obra:</td>
                      <td className="p-3 w-24"></td>
                      <td className="p-3 w-32"></td>
                      <td className="p-3 w-32 font-medium">{formatCurrency(nota.valor_mao_de_obra)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {nota.observacoes && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Observações</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{nota.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo */}
          <Card className="shadow-md border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Calculator className="h-5 w-5" />
                Resumo da Nota Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Total das Peças:</span>
                  <span className="font-medium text-lg">{formatCurrency(nota.total_pecas)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Mão de Obra:</span>
                  <span className="font-medium text-lg">{formatCurrency(nota.valor_mao_de_obra)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 bg-blue-50 -mx-6 px-6 py-4 rounded-lg">
                  <span className="text-lg font-semibold text-blue-900">TOTAL DA NOTA:</span>
                  <span className="text-2xl font-bold text-blue-700">{formatCurrency(nota.valor_total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1 h-12 text-base border-2"
              size="lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={handleDownloadPDF}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 text-base"
              size="lg"
            >
              <FileDown className="h-5 w-5 mr-2" />
              Baixar PDF
            </Button>
          </div>
        </div>
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
