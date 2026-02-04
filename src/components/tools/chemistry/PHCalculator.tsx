import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Droplets, Calculator, Lightbulb } from "lucide-react";
import { ChemResult, AcidBaseType, StrengthType } from "./types";
import { COMPOUNDS, PH_SCALE } from "./constants";
import { calculatePH, searchCompounds } from "./chemistryUtils";
import { ResultDisplay } from "./ResultDisplay";

interface PHCalculatorProps {
  precision: number;
  isMobile: boolean;
}

export function PHCalculator({ precision, isMobile }: PHCalculatorProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [result, setResult] = useState<ChemResult | null>(null);

  const [type, setType] = useState<AcidBaseType>('acid');
  const [strength, setStrength] = useState<StrengthType>('strong');
  const [concentration, setConcentration] = useState('0.01');
  const [pKa, setPKa] = useState('4.76');
  const [temperature, setTemperature] = useState('25');
  const [selectedCompound, setSelectedCompound] = useState('');

  // Filtrar compuestos según tipo
  const filteredCompounds = useMemo(() => {
    return COMPOUNDS.filter(c => 
      (type === 'acid' && c.type === 'acid') ||
      (type === 'base' && c.type === 'base')
    );
  }, [type]);

  const handleSelectCompound = (compoundId: string) => {
    const compound = COMPOUNDS.find(c => c.id === compoundId);
    if (compound) {
      setSelectedCompound(compoundId);
      setStrength(compound.strength || 'strong');
      if (compound.pKa && compound.pKa[0]) {
        setPKa(compound.pKa[0].toString());
      }
      if (compound.pKb && compound.pKb[0]) {
        setPKa((14 - compound.pKb[0]).toString());
      }
    }
  };

  const handleCalculate = () => {
    setResult(calculatePH(
      parseFloat(concentration),
      type === 'acid',
      strength === 'strong',
      parseFloat(pKa),
      parseFloat(temperature),
      precision
    ));
  };

  // Escala de pH visual
  const renderPHScale = () => {
    if (!result) return null;
    
    const phValue = parseFloat(result.finalValue);
    const position = Math.min(Math.max((phValue / 14) * 100, 0), 100);
    
    return (
      <div className="mt-4">
        <h4 className="font-semibold mb-2 text-center text-sm">Escala de pH</h4>
        <div className="relative h-8 w-full rounded-lg overflow-hidden border">
          <div className="absolute inset-0 flex">
            {PH_SCALE.map((color, i, arr) => {
              const nextColor = arr[i + 1];
              const width = nextColor ? ((nextColor.ph - color.ph) / 14) * 100 : (100 - (color.ph / 14) * 100);
              return (
                <div 
                  key={i}
                  style={{ 
                    width: `${width}%`,
                    background: `linear-gradient(to right, ${color.color}, ${nextColor?.color || color.color})`
                  }}
                />
              );
            })}
          </div>
          <div 
            className="absolute top-0 bottom-0 w-1 bg-black shadow-lg transition-all duration-300"
            style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 font-bold text-sm bg-background px-2 py-1 rounded-md shadow-md border">
              {phValue.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs mt-2 px-1">
          <span className="text-red-600 font-semibold">0 Ácido</span>
          <span className="text-green-600 font-semibold">7 Neutro</span>
          <span className="text-blue-600 font-semibold">14 Básico</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Tutorial toggle */}
      <div className="flex items-center gap-2">
        <Switch checked={showTutorial} onCheckedChange={setShowTutorial} />
        <Label className="text-sm">Modo tutorial</Label>
      </div>

      {showTutorial && (
        <Card className="p-4 bg-primary/5 border-primary/20 rounded-xl">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Cálculo de pH/pOH
          </h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Ácidos fuertes:</strong> pH = -log[H⁺] (disociación completa)</p>
            <p><strong>Ácidos débiles:</strong> pH ≈ ½(pKa - log C)</p>
            <p><strong>Bases fuertes:</strong> pOH = -log[OH⁻], luego pH = 14 - pOH</p>
            <p><strong>Bases débiles:</strong> pOH ≈ ½(pKb - log C)</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 rounded-xl space-y-4">
          {/* Tipo: Ácido o Base */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={type === 'acid' ? 'default' : 'outline'}
              onClick={() => setType('acid')}
              className="rounded-xl"
            >
              🧪 Ácido [H⁺]
            </Button>
            <Button
              variant={type === 'base' ? 'default' : 'outline'}
              onClick={() => setType('base')}
              className="rounded-xl"
            >
              🧫 Base [OH⁻]
            </Button>
          </div>

          {/* Fuerza */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={strength === 'strong' ? 'default' : 'outline'}
              onClick={() => setStrength('strong')}
              className="rounded-xl"
              size="sm"
            >
              Fuerte
            </Button>
            <Button
              variant={strength === 'weak' ? 'default' : 'outline'}
              onClick={() => setStrength('weak')}
              className="rounded-xl"
              size="sm"
            >
              Débil
            </Button>
          </div>

          {/* Selector de compuesto */}
          <div className="space-y-2">
            <Label>Compuesto (opcional)</Label>
            <Select value={selectedCompound} onValueChange={handleSelectCompound}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Seleccionar compuesto..." />
              </SelectTrigger>
              <SelectContent>
                {filteredCompounds.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.formula} - {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Concentración */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Concentración (M)</Label>
              <span className="text-xs text-muted-foreground">{concentration} mol/L</span>
            </div>
            <Input
              type="number"
              value={concentration}
              onChange={(e) => setConcentration(e.target.value)}
              placeholder="0.01"
              className="rounded-xl"
              step="0.001"
            />
            <Slider
              value={[Math.log10(parseFloat(concentration) || 0.001) + 4]}
              onValueChange={([val]) => setConcentration(Math.pow(10, val - 4).toFixed(6))}
              min={0}
              max={5}
              step={0.1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10⁻⁴ M</span>
              <span>10⁰ M</span>
            </div>
          </div>

          {/* pKa para ácidos/bases débiles */}
          {strength === 'weak' && (
            <div className="space-y-2">
              <Label>{type === 'acid' ? 'pKa' : 'pKb (calculado desde pKa)'}</Label>
              <Input
                type="number"
                value={pKa}
                onChange={(e) => setPKa(e.target.value)}
                placeholder="4.76"
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                {type === 'acid' 
                  ? 'pKa del ácido (ej: ácido acético = 4.76)'
                  : `pKa = ${pKa} → pKb = ${(14 - parseFloat(pKa)).toFixed(2)}`
                }
              </p>
            </div>
          )}

          {/* Temperatura */}
          <div className="space-y-2">
            <Label>Temperatura (°C)</Label>
            <Input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="25"
              className="rounded-xl"
            />
          </div>

          <Button onClick={handleCalculate} className="w-full gap-2 rounded-xl h-11">
            <Calculator className="h-4 w-4" />
            Calcular pH
          </Button>

          {/* Escala de pH */}
          {result && renderPHScale()}
        </Card>

        {/* Resultados */}
        <div>
          {result ? (
            <ResultDisplay result={result} isMobile={isMobile} />
          ) : (
            <Card className="p-8 rounded-xl flex flex-col items-center justify-center min-h-[300px] text-center">
              <Droplets className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Calculadora de pH/pOH</h3>
              <p className="text-sm text-muted-foreground">
                Selecciona el tipo de compuesto e ingresa la concentración para calcular el pH.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
