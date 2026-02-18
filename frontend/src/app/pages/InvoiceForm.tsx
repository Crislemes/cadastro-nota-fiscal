import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router';
import { Layout } from '../components/Layout';
import { ClientDataSection } from "../components/ClientDataSection";
import { ServiceDataSection, Part } from "../components/ServiceDataSection";
import { InvoiceSummary } from "../components/InvoiceSummary";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useData } from '../context/DataContext';

interface ClientData {
  name: string;
  cpfCnpj: string;
  phone: string;
  address: string;
}

interface VehicleData {
  plate: string;
  model: string;
  year: string;
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

  const [vehicleData, setVehicleData] = useState<VehicleData>({
    plate: '',
    model: '',
    year: '',
  });

  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [parts, setParts] = useState<Part[]>([]);
  const [laborCost, setLaborCost] = useState(0);
  const [observations, setObservations] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      loadInvoiceData(id);
    }
  }, [id, isEditing]);

  const loadInvoiceData = async (invoiceId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/notas-fiscais/${invoiceId}`);
      if (response.ok) {
        const data = await response.json();
        
        setClientData({
          name: data.cliente_nome,
          cpfCnpj: data.cpf_cnpj || '',
          phone: data.telefone || '',
          address: data.endereco || ''
        });

        if (data.veiculo) {
          setVehicleData({
            plate: data.veiculo.placa || '',
            model: data.veiculo.modelo || '',
            year: data.veiculo.ano || ''
          });
        } else if (data.veiculo_placa || data.veiculo_modelo || data.veiculo_ano) {
          setVehicleData({
            plate: data.veiculo_placa || '',
            model: data.veiculo_modelo || '',
            year: data.veiculo_ano || ''
          });
        }

        setSaleDate((data.data_emissao || data.criado_em).split('T')[0]);
        setLaborCost(data.valor_mao_de_obra || 0);
        setObservations(data.observacoes || '');

        if (data.pecas && data.pecas.length > 0) {
          const mappedParts = data.pecas.map((p: any) => ({
            id: p.id_peca.toString(),
            name: p.descricao,
            quantity: p.quantidade,
            unitPrice: p.valor_unitario
          }));
          setParts(mappedParts);
        }
      } else {
        toast.error('Nota fiscal não encontrada');
        navigate('/notas');
      }
    } catch (error) {
      toast.error('Erro ao carregar nota fiscal');
      navigate('/notas');
    }
  };

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

  const handleSave = async () => {
    if (!validateForm()) return;

    const invoiceData = {
      clientData,
      vehicleData,
      parts,
      laborCost,
      observations,
      partsTotal,
      total,
      status: 'saved' as const,
      createdAt: new Date(saleDate).toISOString(),
    };

    try {
      if (isEditing && id) {
        await updateInvoice(id, invoiceData);
        toast.success('Nota fiscal atualizada com sucesso!');
      } else {
        await addInvoice(invoiceData);
        toast.success('Nota fiscal salva com sucesso!');
      }
      navigate('/notas');
    } catch (error) {
      toast.error('Erro ao salvar nota fiscal');
    }
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

        {/* Data da Venda */}
        <Card className="shadow-md">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="text-blue-700">Data da Venda</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="max-w-xs">
              <Label htmlFor="saleDate">Data *</Label>
              <Input
                id="saleDate"
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Dados do Veículo */}
        <Card className="shadow-md">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="text-blue-700">Dados do Veículo</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="plate">Placa</Label>
                <Input
                  id="plate"
                  value={vehicleData.plate}
                  onChange={(e) => setVehicleData(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                  placeholder="ABC1234"
                  maxLength={7}
                />
              </div>
              <div>
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={vehicleData.model}
                  onChange={(e) => setVehicleData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="Ex: GOL 1.0"
                />
              </div>
              <div>
                <Label htmlFor="year">Ano</Label>
                <Input
                  id="year"
                  value={vehicleData.year}
                  onChange={(e) => setVehicleData(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="2020"
                  maxLength={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

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