import { useState, useEffect } from "react";
import { ClientDataSection } from "../components/ClientDataSection";
import { VehicleDataSection } from "../components/VehicleDataSection";
import { ServiceDataSection, Part } from "../components/ServiceDataSection";
import { InvoiceSummary } from "../components/InvoiceSummary";
import { Button } from "../components/ui/button";
import { Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { db } from "../services/database";
import logoImage from "../../assets/logo-marca-oficina.png";

interface ClientData {
  name: string;
  cpfCnpj: string;
  phone: string;
  address: string;
}

interface VehicleData {
  plate: string;
  year: string;
  model: string;
}

interface InvoiceFormProps {
  onBack: () => void;
  editInvoiceId?: number;
}

export function InvoiceForm({ onBack, editInvoiceId }: InvoiceFormProps) {
  const [clientData, setClientData] = useState<ClientData>({
    name: '',
    cpfCnpj: '',
    phone: '',
    address: '',
  });

  const [vehicleData, setVehicleData] = useState<VehicleData>({
    plate: '',
    year: '',
    model: '',
  });

  const [parts, setParts] = useState<Part[]>([]);
  const [laborCost, setLaborCost] = useState(0);
  const [observations, setObservations] = useState('');

  useEffect(() => {
    if (editInvoiceId) {
      loadInvoiceData(editInvoiceId);
    }
  }, [editInvoiceId]);

  const loadInvoiceData = async (id: number) => {
    const nota = await db.getNotaFiscalById(id);
    if (!nota) return;

    const cliente = await db.getClienteById(nota.cliente_id);
    if (cliente) {
      setClientData({
        name: cliente.nome,
        cpfCnpj: cliente.cpf_cnpj,
        phone: cliente.telefone,
        address: cliente.endereco,
      });
    }

    if (nota.veiculo_id) {
      const veiculo = await db.getVeiculoById(nota.veiculo_id);
      if (veiculo) {
        setVehicleData({
          plate: veiculo.placa,
          year: veiculo.ano,
          model: veiculo.modelo,
        });
      }
    }

    const itens = await db.getItensByNotaId(id);
    setParts(itens.map(item => ({
      id: item.id!.toString(),
      name: item.nome_peca,
      quantity: item.quantidade,
      unitPrice: item.valor_unitario,
    })));

    setLaborCost(nota.valor_mao_de_obra);
    setObservations(nota.observacoes);
  };

  const partsTotal = parts.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0);
  const total = partsTotal + laborCost;

  const handleClientDataChange = (field: keyof ClientData, value: string) => {
    setClientData(prev => ({ ...prev, [field]: value }));
  };

  const handleVehicleDataChange = (field: keyof VehicleData, value: string) => {
    setVehicleData(prev => ({ ...prev, [field]: value }));
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

  const handleRemovePart = (id: string) => {
    setParts(prev => prev.filter(part => part.id !== id));
    toast.success('Peça removida com sucesso!');
  };

  const handleUpdatePart = (id: string, field: keyof Part, value: string | number) => {
    setParts(prev =>
      prev.map(part =>
        part.id === id ? { ...part, [field]: value } : part
      )
    );
  };

  const validateForm = (): boolean => {
    if (!clientData.name.trim()) {
      toast.error('Por favor, preencha o nome do cliente.');
      return false;
    }

    if (parts.length === 0 && laborCost === 0) {
      toast.error('Por favor, adicione pelo menos uma peça ou informe o valor da mão de obra.');
      return false;
    }

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

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editInvoiceId) {
        // Atualizar nota existente
        const itens = parts.map(part => ({
          nota_fiscal_id: editInvoiceId,
          nome_peca: part.name,
          quantidade: part.quantity,
          valor_unitario: part.unitPrice,
          subtotal: part.quantity * part.unitPrice,
        }));

        await db.atualizarNotaFiscal(editInvoiceId, {
          valor_mao_de_obra: laborCost,
          total_pecas: partsTotal,
          valor_total: total,
          observacoes: observations,
        }, itens);

        toast.success('Nota fiscal atualizada com sucesso!');
      } else {
        // Criar nova nota
        const clienteId = await db.salvarCliente({
          nome: clientData.name,
          cpf_cnpj: clientData.cpfCnpj,
          telefone: clientData.phone,
          endereco: clientData.address,
        });

        let veiculoId: number | undefined;
        if (vehicleData.plate || vehicleData.year || vehicleData.model) {
          veiculoId = await db.salvarVeiculo({
            placa: vehicleData.plate,
            ano: vehicleData.year,
            modelo: vehicleData.model,
            cliente_id: clienteId,
          });
        }

        const itens = parts.map(part => ({
          nota_fiscal_id: 0,
          nome_peca: part.name,
          quantidade: part.quantity,
          valor_unitario: part.unitPrice,
          subtotal: part.quantity * part.unitPrice,
        }));

        const numeroNota = db.gerarNumeroNota();
        await db.salvarNotaFiscal({
          numero_nota: numeroNota,
          cliente_id: clienteId,
          veiculo_id: veiculoId,
          valor_mao_de_obra: laborCost,
          total_pecas: partsTotal,
          valor_total: total,
          observacoes: observations,
          status: 'active',
        }, itens);

        toast.success('Nota fiscal salva com sucesso!', {
          description: `Número: ${numeroNota}`,
        });
      }

      setTimeout(() => onBack(), 1000);
    } catch (error) {
      toast.error('Erro ao salvar nota fiscal. Tente novamente.');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
                {editInvoiceId ? 'Editar Nota Fiscal' : 'Sistema de Nota Fiscal'}
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
          <ClientDataSection
            clientData={clientData}
            onChange={handleClientDataChange}
          />

          <VehicleDataSection
            vehicleData={vehicleData}
            onChange={handleVehicleDataChange}
          />

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

          <InvoiceSummary
            partsTotal={partsTotal}
            laborCost={laborCost}
            total={total}
          />

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
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
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-base"
              size="lg"
            >
              <Save className="h-5 w-5 mr-2" />
              {editInvoiceId ? 'Atualizar Nota Fiscal' : 'Salvar Nota Fiscal'}
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
