import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useData } from '../context/DataContext';
import { UserPlus, Save, ArrowLeft, Car, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCPFCNPJ, formatPhone, unformatValue } from '../utils/formatters';

interface Vehicle {
  id?: string;
  plate: string;
  model: string;
  brand: string;
  year: string;
}

export function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addClient, updateClient, getClientById } = useData();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    cpfCnpj: '',
    phone: '',
    email: '',
    address: '',
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (isEditing && id) {
      const client = getClientById(id);
      if (client) {
        setFormData({
          name: client.name,
          cpfCnpj: client.cpfCnpj,
          phone: client.phone,
          email: client.email || '',
          address: client.address,
        });
        // Carregar veículos do cliente
        loadVehicles(id);
      } else {
        toast.error('Cliente não encontrado');
        navigate('/clientes');
      }
    }
  }, [id, isEditing, getClientById, navigate]);

  const loadVehicles = async (clientId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/clientes/${clientId}/veiculos`);
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map((v: any) => ({
          id: v.id_veiculo.toString(),
          plate: v.placa || '',
          model: v.modelo || '',
          brand: v.marca || '',
          year: v.ano || ''
        }));
        setVehicles(mapped);
      }
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCPFCNPJChange = (value: string) => {
    const formatted = formatCPFCNPJ(value);
    if (unformatValue(formatted).length <= 14) {
      handleChange('cpfCnpj', formatted);
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    if (unformatValue(formatted).length <= 11) {
      handleChange('phone', formatted);
    }
  };

  const handleAddVehicle = () => {
    setVehicles([...vehicles, { plate: '', model: '', brand: '', year: '' }]);
  };

  const handleRemoveVehicle = async (index: number) => {
    const vehicle = vehicles[index];
    
    // Se o veículo tem ID, deletar do banco
    if (vehicle.id && id) {
      try {
        await fetch(`http://localhost:3001/api/veiculos/${vehicle.id}`, {
          method: 'DELETE'
        });
        toast.success('Veículo removido com sucesso!');
      } catch (error) {
        toast.error('Erro ao remover veículo');
        return;
      }
    }
    
    setVehicles(vehicles.filter((_, i) => i !== index));
  };

  const handleVehicleChange = (index: number, field: keyof Vehicle, value: string) => {
    const updated = [...vehicles];
    updated[index] = { ...updated[index], [field]: value };
    setVehicles(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Por favor, preencha o nome do cliente.');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Por favor, preencha o telefone.');
      return;
    }

    try {
      let clientId = id;
      
      if (isEditing && id) {
        await updateClient(id, formData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        clientId = await addClient(formData);
        toast.success('Cliente cadastrado com sucesso!');
        
        // Salvar veículos apenas ao criar novo cliente
        if (clientId && vehicles.length > 0) {
          for (const vehicle of vehicles) {
            if (vehicle.plate || vehicle.model || vehicle.brand || vehicle.year) {
              await fetch('http://localhost:3001/api/veiculos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id_cliente: parseInt(clientId),
                  placa: vehicle.plate,
                  modelo: vehicle.model,
                  marca: vehicle.brand,
                  ano: vehicle.year
                })
              });
            }
          }
        }
      }

      navigate('/clientes');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao salvar cliente');
      }
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
            onClick={() => navigate('/clientes')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="h-8 w-8 text-blue-600" />
              {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Atualize os dados do cliente' : 'Cadastre um novo cliente'}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-md">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <UserPlus className="h-5 w-5" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                  <Input
                    id="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={(e) => handleCPFCNPJChange(e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="cliente@email.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Rua, número, bairro, cidade - UF"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 h-12"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {isEditing ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/clientes')}
                  className="h-12"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Veículos */}
        <Card className="shadow-md">
          <CardHeader className="bg-green-50 border-b">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Car className="h-5 w-5" />
              Veículos do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {vehicles.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Nenhum veículo cadastrado</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddVehicle}
                    className="border-green-200 text-green-600 hover:bg-green-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Veículo
                  </Button>
                </div>
              ) : (
                vehicles.map((vehicle, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor={`plate-${index}`}>Placa</Label>
                    <Input
                      id={`plate-${index}`}
                      value={vehicle.plate}
                      onChange={(e) => handleVehicleChange(index, 'plate', e.target.value.toUpperCase())}
                      placeholder="ABC1234"
                      maxLength={7}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`brand-${index}`}>Marca</Label>
                    <Input
                      id={`brand-${index}`}
                      value={vehicle.brand}
                      onChange={(e) => handleVehicleChange(index, 'brand', e.target.value)}
                      placeholder="Ex: Volkswagen"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`model-${index}`}>Modelo</Label>
                    <Input
                      id={`model-${index}`}
                      value={vehicle.model}
                      onChange={(e) => handleVehicleChange(index, 'model', e.target.value)}
                      placeholder="Ex: GOL 1.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`year-${index}`}>Ano</Label>
                    <Input
                      id={`year-${index}`}
                      value={vehicle.year}
                      onChange={(e) => handleVehicleChange(index, 'year', e.target.value)}
                      placeholder="2020"
                      maxLength={4}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddVehicle}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 flex-1"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Inserir
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveVehicle(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                </div>
              ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}