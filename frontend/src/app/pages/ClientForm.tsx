import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useData } from '../context/DataContext';
import { UserPlus, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { formatCPFCNPJ, formatPhone, unformatValue } from '../utils/formatters';

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
      } else {
        toast.error('Cliente não encontrado');
        navigate('/clientes');
      }
    }
  }, [id, isEditing, getClientById, navigate]);

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
      if (isEditing && id) {
        await updateClient(id, formData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await addClient(formData);
        toast.success('Cliente cadastrado com sucesso!');
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
      </div>
    </Layout>
  );
}