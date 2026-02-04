import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowRightLeft, Calculator, Lightbulb, Scale } from "lucide-react";
import { ConversionType, ChemResult } from "./types";
import { COMPOUNDS } from "./constants";
import { 
  convertTemperature, 
  convertPressure, 
  convertMassToMoles,
  formatNumber 
} from "./chemistryUtils";
import { ResultDisplay } from "./ResultDisplay";

interface ConversionsCalculatorProps {
  precision: number;
  isMobile: boolean;
}

const CONVERSION_OPTIONS: { id: ConversionType; label: string; icon: string }[] = [
  { id: 'massToMoles', label: 'Masa ↔ Moles', icon: '⚖️' },
  { id: 'concentration', label: 'Concentraciones', icon: '🧪' },
  { id: 'temperature', label: 'Temperatura', icon: '🌡️' },
  { id: 'pressure', label: 'Presión', icon: '📊' },
  { id: 'volume', label: 'Volumen', icon: '🧊' },
];

const CONCENTRATION_UNITS = ['M', 'mM', 'µM', 'nM', 'g/L', 'mg/mL', '%', 'ppm'];
const TEMP_UNITS = ['K', '°C', '°F'];
const PRESSURE_UNITS = ['atm', 'kPa', 'mmHg', 'bar', 'Pa', 'psi'];
const VOLUME_UNITS = ['L', 'mL', 'm³', 'cm³', 'gal'];

export function ConversionsCalculator({ precision, isMobile }: ConversionsCalculatorProps) {
  const [conversionType, setConversionType] = useState<ConversionType>('massToMoles');
  const [showTutorial, setShowTutorial] = useState(false);
  const [result, setResult] = useState<ChemResult | null>(null);

  // General
  const [fromValue, setFromValue] = useState('100');
  const [fromUnit, setFromUnit] = useState('g');
  const [toUnit, setToUnit] = useState('mol');
  const [molarMass, setMolarMass] = useState('58.44');
  const [selectedCompound, setSelectedCompound] = useState('');

  const handleSelectCompound = (compoundId: string) => {
    const compound = COMPOUNDS.find(c => c.id === compoundId);
    if (compound) {
      setSelectedCompound(compoundId);
      setMolarMass(compound.molarMass.toString());
    }
  };

  const handleCalculate = () => {
    const value = parseFloat(fromValue);
    const mm = parseFloat(molarMass);

    switch (conversionType) {
      case 'massToMoles':
        if (fromUnit === 'g' && toUnit === 'mol') {
          setResult(convertMassToMoles(value, mm, precision));
        } else {
          // Moles a masa
          const mass = value * mm;
          setResult({
            title: 'Conversión Moles → Masa',
            steps: [
              {
                label: 'Fórmula',
                formula: 'm = n × M',
                substitution: `m = ${formatNumber(value, precision)} mol × ${formatNumber(mm, precision)} g/mol`,
                result: `${formatNumber(mass, precision)} g`,
                isHighlight: true
              }
            ],
            finalValue: formatNumber(mass, precision),
            unit: 'g'
          });
        }
        break;
      case 'temperature':
        setResult(convertTemperature(value, fromUnit, toUnit, precision));
        break;
      case 'pressure':
        setResult(convertPressure(value, fromUnit, toUnit, precision));
        break;
      case 'concentration':
        // Conversión de concentración
        let resultValue: number;
        const steps: any[] = [];
        
        // Primero convertir a M (Molar)
        let valueInM = value;
        switch (fromUnit) {
          case 'mM': valueInM = value / 1000; break;
          case 'µM': valueInM = value / 1e6; break;
          case 'nM': valueInM = value / 1e9; break;
          case 'g/L': valueInM = value / mm; break;
          case 'mg/mL': valueInM = value / mm; break;
          case '%': valueInM = (value * 10) / mm; break;
          case 'ppm': valueInM = (value / mm) / 1000; break;
        }
        
        steps.push({
          label: 'Conversión a Molar',
          formula: `${value} ${fromUnit} → M`,
          result: `${formatNumber(valueInM, precision)} M`
        });

        // Luego convertir a unidad destino
        switch (toUnit) {
          case 'M': resultValue = valueInM; break;
          case 'mM': resultValue = valueInM * 1000; break;
          case 'µM': resultValue = valueInM * 1e6; break;
          case 'nM': resultValue = valueInM * 1e9; break;
          case 'g/L': resultValue = valueInM * mm; break;
          case 'mg/mL': resultValue = valueInM * mm; break;
          case '%': resultValue = (valueInM * mm) / 10; break;
          case 'ppm': resultValue = valueInM * mm * 1000; break;
          default: resultValue = valueInM;
        }

        steps.push({
          label: 'Conversión final',
          formula: `M → ${toUnit}`,
          result: `${formatNumber(resultValue, precision)} ${toUnit}`,
          isHighlight: true
        });

        setResult({
          title: 'Conversión de Concentración',
          steps,
          finalValue: formatNumber(resultValue, precision),
          unit: toUnit,
          tip: 'Para conversiones que involucran masa (g/L, ppm), se necesita la masa molar.'
        });
        break;
      case 'volume':
        // Conversión de volumen
        const volumeFactors: Record<string, number> = {
          'L': 1,
          'mL': 0.001,
          'm³': 1000,
          'cm³': 0.001,
          'gal': 3.785
        };
        const volumeInL = value * volumeFactors[fromUnit];
        const volumeResult = volumeInL / volumeFactors[toUnit];
        
        setResult({
          title: 'Conversión de Volumen',
          steps: [
            {
              label: 'Conversión',
              formula: `${value} ${fromUnit} → ${toUnit}`,
              substitution: `Vía litros: ${formatNumber(volumeInL, precision)} L`,
              result: `${formatNumber(volumeResult, precision)} ${toUnit}`,
              isHighlight: true
            }
          ],
          finalValue: formatNumber(volumeResult, precision),
          unit: toUnit
        });
        break;
    }
  };

  const getUnitOptions = () => {
    switch (conversionType) {
      case 'massToMoles':
        return ['g', 'mol', 'kg', 'mg'];
      case 'concentration':
        return CONCENTRATION_UNITS;
      case 'temperature':
        return TEMP_UNITS;
      case 'pressure':
        return PRESSURE_UNITS;
      case 'volume':
        return VOLUME_UNITS;
      default:
        return [];
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector de tipo */}
      <div className="flex flex-wrap gap-2">
        {CONVERSION_OPTIONS.map(option => (
          <Button
            key={option.id}
            variant={conversionType === option.id ? "default" : "outline"}
            size={isMobile ? "sm" : "default"}
            onClick={() => {
              setConversionType(option.id);
              // Reset units based on type
              switch (option.id) {
                case 'massToMoles':
                  setFromUnit('g');
                  setToUnit('mol');
                  break;
                case 'concentration':
                  setFromUnit('M');
                  setToUnit('g/L');
                  break;
                case 'temperature':
                  setFromUnit('°C');
                  setToUnit('K');
                  break;
                case 'pressure':
                  setFromUnit('atm');
                  setToUnit('kPa');
                  break;
                case 'volume':
                  setFromUnit('L');
                  setToUnit('mL');
                  break;
              }
            }}
            className="rounded-xl gap-1"
          >
            <span>{option.icon}</span>
            {!isMobile && option.label}
          </Button>
        ))}
      </div>

      {/* Tutorial */}
      <div className="flex items-center gap-2">
        <Switch checked={showTutorial} onCheckedChange={setShowTutorial} />
        <Label className="text-sm">Modo tutorial</Label>
      </div>

      {showTutorial && (
        <Card className="p-4 bg-primary/5 border-primary/20 rounded-xl">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Conversiones
          </h4>
          <p className="text-sm text-muted-foreground">
            {conversionType === 'massToMoles' && 'n = m/M. Los moles conectan masa macroscópica con cantidad de partículas.'}
            {conversionType === 'concentration' && 'Las concentraciones se convierten pasando primero a Molar (mol/L) como unidad intermedia.'}
            {conversionType === 'temperature' && 'K = °C + 273.15. Kelvin es la escala absoluta usada en química.'}
            {conversionType === 'pressure' && '1 atm = 101.325 kPa = 760 mmHg = 1.01325 bar.'}
            {conversionType === 'volume' && '1 L = 1000 mL = 0.001 m³ = 1000 cm³.'}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 rounded-xl space-y-4">
          {/* Selector de compuesto (para conversiones que necesitan MM) */}
          {(conversionType === 'massToMoles' || conversionType === 'concentration') && (
            <div className="space-y-2">
              <Label>Compuesto</Label>
              <Select value={selectedCompound} onValueChange={handleSelectCompound}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Seleccionar compuesto..." />
                </SelectTrigger>
                <SelectContent>
                  {COMPOUNDS.slice(0, 20).map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.formula} - {c.molarMass.toFixed(3)} g/mol
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Masa molar */}
          {(conversionType === 'massToMoles' || conversionType === 'concentration') && (
            <div className="space-y-2">
              <Label>Masa molar (g/mol)</Label>
              <Input
                type="number"
                value={molarMass}
                onChange={(e) => setMolarMass(e.target.value)}
                placeholder="58.44"
                className="rounded-xl"
              />
            </div>
          )}

          {/* Valor y unidades */}
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label>De:</Label>
                <Input
                  type="number"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                  placeholder="100"
                  className="rounded-xl"
                />
              </div>
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger className="w-24 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getUnitOptions().map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  const temp = fromUnit;
                  setFromUnit(toUnit);
                  setToUnit(temp);
                }}
                className="rounded-full"
              >
                <ArrowRightLeft className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label>A:</Label>
                <div className="h-10 px-3 rounded-xl bg-muted flex items-center font-semibold text-primary">
                  {result ? result.finalValue : '?'}
                </div>
              </div>
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger className="w-24 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getUnitOptions().map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleCalculate} className="w-full gap-2 rounded-xl h-11">
            <Calculator className="h-4 w-4" />
            Convertir
          </Button>

          {/* Tabla de conversiones rápidas */}
          {conversionType === 'temperature' && (
            <div className="p-3 bg-muted/50 rounded-xl">
              <h4 className="text-sm font-medium mb-2">Referencias rápidas:</h4>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div>• 0°C = 273.15 K = 32°F (Congelación del agua)</div>
                <div>• 25°C = 298.15 K = 77°F (Temperatura estándar)</div>
                <div>• 100°C = 373.15 K = 212°F (Ebullición del agua)</div>
              </div>
            </div>
          )}

          {conversionType === 'pressure' && (
            <div className="p-3 bg-muted/50 rounded-xl">
              <h4 className="text-sm font-medium mb-2">Equivalencias:</h4>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div>• 1 atm = 101.325 kPa</div>
                <div>• 1 atm = 760 mmHg (Torr)</div>
                <div>• 1 atm = 1.01325 bar</div>
                <div>• 1 atm = 14.696 psi</div>
              </div>
            </div>
          )}
        </Card>

        {/* Resultados */}
        <div>
          {result ? (
            <ResultDisplay result={result} isMobile={isMobile} />
          ) : (
            <Card className="p-8 rounded-xl flex flex-col items-center justify-center min-h-[300px] text-center">
              <Scale className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Conversiones</h3>
              <p className="text-sm text-muted-foreground">
                Selecciona el tipo de conversión e ingresa los valores.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
