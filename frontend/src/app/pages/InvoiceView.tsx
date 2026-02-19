import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useData } from '../context/DataContext';
import { ArrowLeft, Edit, Download, User, Wrench, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/formatters';
import { generateInvoicePDF } from '../utils/pdfGenerator';

export function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInvoiceById } = useData();

  const invoice = id ? getInvoiceById(id) : null;

  useEffect(() => {
    if (!invoice) {
      toast.error('Nota fiscal não encontrada');
      navigate('/notas');
    }
  }, [invoice, navigate]);

  if (!invoice) {
    return null;
  }

  const handleDownloadPDF = () => {
    try {
      generateInvoicePDF(invoice);
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
      console.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/notas')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nota Fiscal</h1>
              <p className="text-gray-600 mt-1">
                Criada em {formatDate(invoice.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDownloadPDF}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Link to={`/notas/${id}/editar`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </Link>
          </div>
        </div>

        {/* Client Data */}
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
                <p className="text-sm text-gray-500 mb-1">Nome Completo</p>
                <p className="font-medium text-lg">{invoice.clientData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">CPF/CNPJ</p>
                <p className="font-medium text-lg">{invoice.clientData.cpfCnpj}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Telefone</p>
                <p className="font-medium text-lg">{invoice.clientData.phone}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Endereço</p>
                <p className="font-medium text-lg">{invoice.clientData.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Data */}
        {invoice.vehicleData && (invoice.vehicleData.plate || invoice.vehicleData.model || invoice.vehicleData.year) && (
          <Card className="shadow-md">
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Wrench className="h-5 w-5" />
                Dados do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Placa</p>
                  <p className="font-medium text-lg">{invoice.vehicleData.plate || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Modelo</p>
                  <p className="font-medium text-lg">{invoice.vehicleData.model || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ano</p>
                  <p className="font-medium text-lg">{invoice.vehicleData.year || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Data */}
        <Card className="shadow-md">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Wrench className="h-5 w-5" />
              Dados do Serviço
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Parts Table */}
            <div>
              <h3 className="font-semibold mb-3">Peças Utilizadas</h3>
              {invoice.parts.length === 0 ? (
                <p className="text-gray-500 italic">Nenhuma peça utilizada</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="text-left p-3 text-sm">Nome da Peça</th>
                        <th className="text-left p-3 text-sm w-24">Quantidade</th>
                        <th className="text-left p-3 text-sm w-32">Valor Unitário</th>
                        <th className="text-left p-3 text-sm w-32">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.parts.map((part) => (
                        <tr key={part.id} className="border-b">
                          <td className="p-3">{part.name}</td>
                          <td className="p-3">{part.quantity}</td>
                          <td className="p-3">{formatCurrency(part.unitPrice)}</td>
                          <td className="p-3 font-medium">
                            {formatCurrency(part.quantity * part.unitPrice)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-b">
                        <td className="p-3 font-semibold">Mão de Obra:</td>
                        <td className="p-3 w-24"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 font-semibold">{formatCurrency(invoice.laborCost)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

{/* Observations */}
            {invoice.observations && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Observações</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{invoice.observations}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
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
                <span className="font-medium text-lg">{formatCurrency(invoice.partsTotal)}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Mão de Obra:</span>
                <span className="font-medium text-lg">{formatCurrency(invoice.laborCost)}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 bg-blue-50 -mx-6 px-6 py-4 rounded-lg">
                <span className="text-lg font-semibold text-blue-900">TOTAL DA NOTA:</span>
                <span className="text-2xl font-bold text-blue-700">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
