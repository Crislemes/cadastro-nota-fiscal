import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Wrench, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

export interface Part {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface ServiceDataSectionProps {
  parts: Part[];
  laborCost: number;
  observations: string;
  onAddPart: () => void;
  onRemovePart: (id: string) => void;
  onUpdatePart: (id: string, field: keyof Part, value: string | number) => void;
  onLaborCostChange: (value: number) => void;
  onObservationsChange: (value: string) => void;
}

export function ServiceDataSection({
  parts,
  laborCost,
  observations,
  onAddPart,
  onRemovePart,
  onUpdatePart,
  onLaborCostChange,
  onObservationsChange,
}: ServiceDataSectionProps) {
  const handlePriceChange = (id: string, value: string, field: 'unitPrice') => {
    const numValue = parseFloat(value.replace(/\D/g, '')) / 100;
    onUpdatePart(id, field, isNaN(numValue) ? 0 : numValue);
  };

  const handleLaborChange = (value: string) => {
    const numValue = parseFloat(value.replace(/\D/g, '')) / 100;
    onLaborCostChange(isNaN(numValue) ? 0 : numValue);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Wrench className="h-5 w-5" />
          Dados do Serviço
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Lista de Peças */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base">Peças Utilizadas</Label>
            <Button
              type="button"
              onClick={onAddPart}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Peça
            </Button>
          </div>

          {parts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
              Nenhuma peça adicionada. Clique em "Adicionar Peça" para começar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="text-left p-3 text-sm">Descrição</th>
                    <th className="text-left p-3 text-sm w-24">Qtd</th>
                    <th className="text-left p-3 text-sm w-32">Valor Unit.</th>
                    <th className="text-left p-3 text-sm w-32">Subtotal</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map((part) => (
                    <tr key={part.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <Input
                          value={part.name}
                          onChange={(e) => onUpdatePart(part.id, 'name', e.target.value)}
                          placeholder="Descrição da peça"
                          className="h-9"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="1"
                          value={part.quantity || ''}
                          onChange={(e) => onUpdatePart(part.id, 'quantity', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="h-9"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={part.unitPrice ? formatCurrency(part.unitPrice) : ''}
                          onChange={(e) => handlePriceChange(part.id, e.target.value, 'unitPrice')}
                          placeholder="R$ 0,00"
                          className="h-9"
                        />
                      </td>
                      <td className="p-2 text-sm font-medium">
                        {formatCurrency(part.quantity * part.unitPrice)}
                      </td>
                      <td className="p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemovePart(part.id)}
                          className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mão de Obra */}
        <div>
          <Label htmlFor="laborCost">Valor da Mão de Obra</Label>
          <Input
            id="laborCost"
            value={laborCost ? formatCurrency(laborCost) : ''}
            onChange={(e) => handleLaborChange(e.target.value)}
            placeholder="R$ 0,00"
          />
        </div>

        {/* Observações */}
        <div>
          <Label htmlFor="observations">Observações</Label>
          <Textarea
            id="observations"
            value={observations}
            onChange={(e) => onObservationsChange(e.target.value)}
            placeholder="Observações adicionais sobre o serviço..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}
