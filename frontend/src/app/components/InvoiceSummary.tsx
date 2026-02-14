import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calculator } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

interface InvoiceSummaryProps {
  partsTotal: number;
  laborCost: number;
  total: number;
}

export function InvoiceSummary({ partsTotal, laborCost, total }: InvoiceSummaryProps) {
  return (
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
            <span className="font-medium text-lg">{formatCurrency(partsTotal)}</span>
          </div>
          
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="text-gray-600">Mão de Obra:</span>
            <span className="font-medium text-lg">{formatCurrency(laborCost)}</span>
          </div>
          
          <div className="flex justify-between items-center pt-2 bg-blue-50 -mx-6 px-6 py-4 rounded-lg">
            <span className="text-lg font-semibold text-blue-900">TOTAL DA NOTA:</span>
            <span className="text-2xl font-bold text-blue-700">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
