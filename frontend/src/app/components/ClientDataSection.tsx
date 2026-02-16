import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { User } from "lucide-react";
import { formatCPFCNPJ, formatPhone, unformatValue } from "../utils/formatters";

interface ClientData {
  name: string;
  cpfCnpj: string;
  phone: string;
  address: string;
}

interface ClientDataSectionProps {
  clientData: ClientData;
  onChange: (field: keyof ClientData, value: string) => void;
}

export function ClientDataSection({ clientData, onChange }: ClientDataSectionProps) {
  const handleCPFCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPFCNPJ(e.target.value);
    if (unformatValue(formatted).length <= 14) {
      onChange('cpfCnpj', formatted);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (unformatValue(formatted).length <= 11) {
      onChange('phone', formatted);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <User className="h-5 w-5" />
          Dados do Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={clientData.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Digite o nome completo do cliente"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="cpfCnpj">CPF/CNPJ *</Label>
            <Input
              id="cpfCnpj"
              value={clientData.cpfCnpj}
              onChange={handleCPFCNPJChange}
              placeholder="000.000.000-00"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              value={clientData.phone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="address">Endereço Completo *</Label>
            <Input
              id="address"
              value={clientData.address}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="Rua, número, bairro, cidade - UF"
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
