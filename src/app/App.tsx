import { useState } from "react";
import { ClientDataSection } from "./components/ClientDataSection";
import { ServiceDataSection, Part } from "./components/ServiceDataSection";
import { InvoiceSummary } from "./components/InvoiceSummary";
import { Button } from "./components/ui/button";
import { Save, FileDown } from "lucide-react";
import { toast, Toaster } from "sonner";
import { generateInvoicePDF } from "./utils/pdfGenerator";
import logoImage from "../assets/b3da8dea4f58613c66c3dde85a4836b5e6655bf8.png";

interface ClientData {
  name: string;
  cpfCnpj: string;
  phone: string;
  address: string;
}

function App() {
  const [clientData, setClientData] = useState<ClientData>({
    name: '',
    cpfCnpj: '',
    phone: '',
    address: '',
  });

  const [parts, setParts] = useState<Part[]>([]);
  const [laborCost, setLaborCost] = useState(0);
  const [observations, setObservations] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Cálculos automáticos
  const partsTotal = parts.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0);
  const total = partsTotal + laborCost;

  const handleClientDataChange = (field: keyof ClientData, value: string) => {
    setClientData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleAddPart = () => {
    const newPart: Part = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unitPrice: 0,
    };
    setParts(prev => [...prev, newPart]);
    setIsSaved(false);
  };

  const handleRemovePart = (id: string) => {
    setParts(prev => prev.filter(part => part.id !== id));
    setIsSaved(false);
    toast.success('Peça removida com sucesso!');
  };

  const handleUpdatePart = (id: string, field: keyof Part, value: string | number) => {
    setParts(prev =>
      prev.map(part =>
        part.id === id ? { ...part, [field]: value } : part
      )
    );
    setIsSaved(false);
  };

  const validateForm = (): boolean => {
    if (!clientData.name.trim()) {
      toast.error('Por favor, preencha o nome do cliente.');
      return false;
    }
    if (!clientData.cpfCnpj.trim()) {
      toast.error('Por favor, preencha o CPF/CNPJ do cliente.');
      return false;
    }
    if (!clientData.phone.trim()) {
      toast.error('Por favor, preencha o telefone do cliente.');
      return false;
    }
    if (!clientData.address.trim()) {
      toast.error('Por favor, preencha o endereço do cliente.');
      return false;
    }

    // Validar se há pelo menos uma peça ou valor de mão de obra
    if (parts.length === 0 && laborCost === 0) {
      toast.error('Por favor, adicione pelo menos uma peça ou informe o valor da mão de obra.');
      return false;
    }

    // Validar peças preenchidas corretamente
    for (const part of parts) {
      if (!part.name.trim()) {
        toast.error('Por favor, preencha o nome de todas as peças.');
        return false;
      }
      if (part.quantity <= 0) {
        toast.error('A quantidade das peças deve ser maior que zero.');
        return false;
      }
      if (part.unitPrice <= 0) {
        toast.error('O valor unitário das peças deve ser maior que zero.');
        return false;
      }
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Simular salvamento (em produção, enviaria para API/banco de dados)
    setIsSaved(true);
    toast.success('Nota fiscal salva com sucesso!', {
      description: 'Você já pode gerar o PDF da nota fiscal.',
    });
  };

  const handleDownloadPDF = () => {
    if (!isSaved) {
      toast.warning('Por favor, salve a nota fiscal antes de gerar o PDF.');
      return;
    }

    try {
      const invoiceData = {
        clientData,
        parts,
        laborCost,
        observations,
        partsTotal,
        total,
      };

      generateInvoicePDF(invoiceData);
      toast.success('PDF gerado com sucesso!', {
        description: 'O arquivo foi baixado para o seu dispositivo.',
      });
    } catch (error) {
      toast.error('Erro ao gerar PDF. Por favor, tente novamente.');
      console.error(error);
    }
  };

  const handleNewInvoice = () => {
    setClientData({
      name: '',
      cpfCnpj: '',
      phone: '',
      address: '',
    });
    setParts([]);
    setLaborCost(0);
    setObservations('');
    setIsSaved(false);
    toast.info('Formulário limpo. Você pode cadastrar uma nova nota fiscal.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Dados do Cliente */}
          <ClientDataSection
            clientData={clientData}
            onChange={handleClientDataChange}
          />

          {/* Dados do Serviço */}
          <ServiceDataSection
            parts={parts}
            laborCost={laborCost}
            observations={observations}
            onAddPart={handleAddPart}
            onRemovePart={handleRemovePart}
            onUpdatePart={handleUpdatePart}
            onLaborCostChange={setLaborCost}
            onObservationsChange={setObservations}
          />

          {/* Resumo */}
          <InvoiceSummary
            partsTotal={partsTotal}
            laborCost={laborCost}
            total={total}
          />

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-base"
              size="lg"
            >
              <Save className="h-5 w-5 mr-2" />
              Salvar Nota Fiscal
            </Button>

            <Button
              onClick={handleDownloadPDF}
              disabled={!isSaved}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              <FileDown className="h-5 w-5 mr-2" />
              Baixar PDF
            </Button>

            <Button
              onClick={handleNewInvoice}
              variant="outline"
              className="flex-1 h-12 text-base border-2"
              size="lg"
            >
              Nova Nota Fiscal
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

export default App;