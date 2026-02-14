import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Car } from "lucide-react";

interface VehicleData {
  plate: string;
  year: string;
  model: string;
}

interface VehicleDataSectionProps {
  vehicleData: VehicleData;
  onChange: (field: keyof VehicleData, value: string) => void;
}

export function VehicleDataSection({ vehicleData, onChange }: VehicleDataSectionProps) {
  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 7) {
      onChange('plate', value);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      onChange('year', value);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Car className="h-5 w-5" />
          Dados do Veículo
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="plate">Placa</Label>
            <Input
              id="plate"
              value={vehicleData.plate}
              onChange={handlePlateChange}
              placeholder="ABC1D23"
              maxLength={7}
            />
          </div>
          
          <div>
            <Label htmlFor="year">Ano</Label>
            <Input
              id="year"
              value={vehicleData.year}
              onChange={handleYearChange}
              placeholder="2024"
              maxLength={4}
            />
          </div>
          
          <div>
            <Label htmlFor="model">Modelo</Label>
            <Input
              id="model"
              value={vehicleData.model}
              onChange={(e) => onChange('model', e.target.value)}
              placeholder="Ex: Civic, Corolla, Gol"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
