import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router';
import { Layout } from '../components/Layout';
import { ClientDataSection } from "../components/ClientDataSection";
import { ServiceDataSection, Part } from "../components/ServiceDataSection";
import { InvoiceSummary } from "../components/InvoiceSummary";
import { Button } from "../components/ui/button";
import { Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useData } from '../context/DataContext';

interface ClientData {
  name: string;
  cpfCnpj: string;
  phone: string;
  address: string;
}

export function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addInvoice, updateInvoice, getInvoiceById } = useData();
  const isEditing = !!id;

  const [clientData, setClientData] = useState<ClientData>({
    name: '',
    cpfCnpj: '',
    phone: '',
    address: '',
  });

  const [parts, setParts] = useState<Part[]>([]);
  const [laborCost, setLaborCost] = useState(0);
  const [observations, setObservations] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      const invoice = getInvoiceById(id);
      if (invoice) {
        setClientData(invoice.clientData);
        setParts(invoice.parts);
        setLaborCost(invoice.laborCost);
        setObservations(invoice.observations);
      } else {
        toast.error('Nota fiscal não encontrada');
        navigate('/notas');
      }
    }
  }, [id, isEditing, getInvoiceById, navigate]);

  // Cálculos automáticos
  const partsTotal = parts.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0);
  const total = partsTotal + laborCost;

  const handleClientDataChange = (field: keyof ClientData, value: string) => {
    setClientData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPart = () => {
    const newPart: Part = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unitPrice: 0,
    };
    setParts(prev => [...prev, newPart]);
  };

  const handleRemovePart = (partId: string) => {
    setParts(prev => prev.filter(part => part.id !== partId));
    toast.success('Peça removida com sucesso!');
  };

  const handleUpdatePart = (partId: string, field: keyof Part, value: string | number) => {
    setParts(prev =>
      prev.map(part =>
        part.id === partId ? { ...part, [field]: value } : part
      )
    );
  };

  const validateForm = (): boolean => {
    if (!clientData.name.trim()) {
      toast.error('Por favor, preencha o nome do cliente.');
      return false;
    }
    if (!clientData.phone.trim()) {
      toast.error('Por favor, preencha o telefone do cliente.');
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

    const invoiceData = {
      clientData,
      parts,
      laborCost,
      observations,
      partsTotal,
      total,
      status: 'saved' as const,
    };

    if (isEditing && id) {
      updateInvoice(id, invoiceData);
      toast.success('Nota fiscal atualizada com sucesso!');
    } else {
      addInvoice(invoiceData);
      toast.success('Nota fiscal salva com sucesso!');
    }

    navigate('/notas');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
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
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Atualize os dados da nota fiscal' : 'Cadastre uma nova nota fiscal de serviço'}
            </p>
          </div>
        </div>

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
            {isEditing ? 'Atualizar Nota Fiscal' : 'Salvar Nota Fiscal'}
          </Button>

          <Button
            onClick={() => navigate('/notas')}
            variant="outline"
            className="flex-1 h-12 text-base border-2"
            size="lg"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Layout>
  );
}