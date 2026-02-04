import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Beaker, Search, Calculator, Lightbulb } from "lucide-react";
import { SolutionCalcType, SolutionFormState, ChemResult } from "./types";
import { COMPOUNDS } from "./constants";
import { 
  calculateMolarity, 
  calculateNormality, 
  calculateMolality,
  calculateMolarFraction,
  calculateDilution,
  calculatePPM,
  searchCompounds
} from "./chemistryUtils";
import { ResultDisplay } from "./ResultDisplay";

interface SolutionsCalculatorProps {
  precision: number;
  isMobile: boolean;
}

const CALC_OPTIONS: { id: SolutionCalcType; label: string; shortLabel: string }[] = [
  { id: 'molarity', label: 'Molaridad', shortLabel: 'M' },
  { id: 'normality', label: 'Normalidad', shortLabel: 'N' },
  { id: 'molality', label: 'Molalidad', shortLabel: 'm' },
  { id: 'molarFraction', label: 'Fracción Molar', shortLabel: 'X' },
  { id: 'dilution', label: 'Dilución', shortLabel: 'Dil' },
  { id: 'percentMassVolume', label: '% m/v', shortLabel: '%' },
  { id: 'ppm', label: 'ppm', shortLabel: 'ppm' },
];

export function SolutionsCalculator({ precision, isMobile }: SolutionsCalculatorProps) {
  const [calcType, setCalcType] = useState<SolutionCalcType>('molarity');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [result, setResult] = useState<ChemResult | null>(null);
  
  // Form states
  const [mass, setMass] = useState('55.2');
  const [molarMass, setMolarMass] = useState('81.995');
  const [volume, setVolume] = useState('3000');
  const [volumeUnit, setVolumeUnit] = useState<'L' | 'mL'>('mL');
  const [purity, setPurity] = useState('100');
  const [normalityType, setNormalityType] = useState<'acidBase' | 'redox'>('acidBase');
  const [equivalentFactor, setEquivalentFactor] = useState('3');
  const [selectedCompound, setSelectedCompound] = useState<string>('');
  
  // Dilution states
  const [c1, setC1] = useState('1.0');
  const [v1, setV1] = useState('100');
  const [c2, setC2] = useState('0.1');
  const [v2, setV2] = useState('');
  const [solveFor, setSolveFor] = useState<'c1' | 'v1' | 'c2' | 'v2'>('v2');
  
  // Molar fraction states
  const [massSolute, setMassSolute] = useState('40');
  const [massSolvent, setMassSolvent] = useState('60');
  const [molarMassSolute, setMolarMassSolute] = useState('46.068');
  const [molarMassSolvent, setMolarMassSolvent] = useState('18.015');

  // Search compounds
  const filteredCompounds = useMemo(() => {
    if (!searchQuery) return COMPOUNDS.slice(0, 10);
    return searchCompounds(searchQuery);
  }, [searchQuery]);

  // Select compound and fill data
  const handleSelectCompound = (compoundId: string) => {
    const compound = COMPOUNDS.find(c => c.id === compoundId);
    if (compound) {
      setSelectedCompound(compoundId);
      setMolarMass(compound.molarMass.toString());
      if (compound.nH) setEquivalentFactor(compound.nH.toString());
      if (compound.nOH) setEquivalentFactor(compound.nOH.toString());
      if (compound.nE) setEquivalentFactor(compound.nE.toString());
    }
  };

  const handleCalculate = () => {
    const volumeL = volumeUnit === 'mL' ? parseFloat(volume) / 1000 : parseFloat(volume);
    
    switch (calcType) {
      case 'molarity':
        setResult(calculateMolarity(
          parseFloat(mass),
          parseFloat(molarMass),
          volumeL,
          parseFloat(purity),
          precision
        ));
        break;
      case 'normality':
        setResult(calculateNormality(
          parseFloat(mass),
          parseFloat(molarMass),
          volumeL,
          parseFloat(equivalentFactor),
          normalityType,
          precision
        ));
        break;
      case 'molality':
        setResult(calculateMolality(
          parseFloat(massSolute),
          parseFloat(molarMassSolute),
          parseFloat(massSolvent) / 1000,
          precision
        ));
        break;
      case 'molarFraction':
        setResult(calculateMolarFraction(
          parseFloat(massSolute),
          parseFloat(molarMassSolute),
          parseFloat(massSolvent),
          parseFloat(molarMassSolvent),
          precision
        ));
        break;
      case 'dilution':
        setResult(calculateDilution(
          parseFloat(c1),
          parseFloat(v1),
          parseFloat(c2),
          parseFloat(v2),
          solveFor,
          precision
        ));
        break;
      case 'ppm':
        setResult(calculatePPM(
          parseFloat(mass),
          parseFloat(volume),
          precision
        ));
        break;
      default:
        setResult(calculateMolarity(
          parseFloat(mass),
          parseFloat(molarMass),
          volumeL,
          parseFloat(purity),
          precision
        ));
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector de tipo de cálculo */}
      <div className="flex flex-wrap gap-2">
        {CALC_OPTIONS.map(option => (
          <Button
            key={option.id}
            variant={calcType === option.id ? "default" : "outline"}
            size={isMobile ? "sm" : "default"}
            onClick={() => setCalcType(option.id)}
            className="rounded-xl"
          >
            {isMobile ? option.shortLabel : option.label}
          </Button>
        ))}
      </div>

      {/* Tutorial toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch checked={showTutorial} onCheckedChange={setShowTutorial} />
          <Label className="text-sm">Modo tutorial</Label>
        </div>
        {showTutorial && (
          <Badge variant="secondary" className="gap-1">
            <Lightbulb className="h-3 w-3" />
            Tutorial activo
          </Badge>
        )}
      </div>

      {/* Tutorial card */}
      {showTutorial && (
        <Card className="p-4 bg-primary/5 border-primary/20 rounded-xl">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            {calcType === 'molarity' && 'Molaridad (M)'}
            {calcType === 'normality' && 'Normalidad (N)'}
            {calcType === 'molality' && 'Molalidad (m)'}
            {calcType === 'molarFraction' && 'Fracción Molar (X)'}
            {calcType === 'dilution' && 'Dilución'}
            {calcType === 'ppm' && 'Partes por millón (ppm)'}
          </h4>
          <p className="text-sm text-muted-foreground">
            {calcType === 'molarity' && 'La molaridad es el número de moles de soluto por litro de solución. M = n/V donde n = masa/masa_molar.'}
            {calcType === 'normality' && 'La normalidad mide equivalentes por litro. En ácidos, depende del número de H⁺ disociables; en redox, del número de electrones transferidos.'}
            {calcType === 'molality' && 'La molalidad es moles de soluto por kilogramo de solvente (no solución). Es independiente de la temperatura.'}
            {calcType === 'molarFraction' && 'La fracción molar es la razón entre los moles de un componente y los moles totales. Siempre ΣXᵢ = 1.'}
            {calcType === 'dilution' && 'C₁V₁ = C₂V₂. La cantidad de soluto se conserva al diluir. Solo cambia la concentración.'}
            {calcType === 'ppm' && 'Partes por millón = (masa soluto / masa solución) × 10⁶. Útil para concentraciones muy pequeñas.'}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Panel de entrada */}
        <Card className="p-4 rounded-xl space-y-4">
          {/* Buscador de compuestos */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar compuesto
            </Label>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej: H₃PO₃, ácido sulfúrico..."
                className="rounded-xl"
              />
            </div>
            {searchQuery && filteredCompounds.length > 0 && (
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {filteredCompounds.map(c => (
                  <Button
                    key={c.id}
                    variant={selectedCompound === c.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelectCompound(c.id)}
                    className="text-xs"
                  >
                    {c.formula} - {c.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Formulario según tipo de cálculo */}
          {(calcType === 'molarity' || calcType === 'normality' || calcType === 'percentMassVolume' || calcType === 'ppm') && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Masa de soluto (g)</Label>
                  <Input
                    type="number"
                    value={mass}
                    onChange={(e) => setMass(e.target.value)}
                    placeholder="55.2"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Masa molar (g/mol)</Label>
                  <Input
                    type="number"
                    value={molarMass}
                    onChange={(e) => setMolarMass(e.target.value)}
                    placeholder="81.995"
                    className="rounded-xl"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Volumen</Label>
                  <Input
                    type="number"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    placeholder="3000"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidad</Label>
                  <Select value={volumeUnit} onValueChange={(v: 'L' | 'mL') => setVolumeUnit(v)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mL">mL</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {calcType === 'molarity' && (
                <div className="space-y-2">
                  <Label>Pureza (%)</Label>
                  <Input
                    type="number"
                    value={purity}
                    onChange={(e) => setPurity(e.target.value)}
                    placeholder="100"
                    className="rounded-xl"
                  />
                </div>
              )}

              {calcType === 'normality' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de equivalencia</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={normalityType === 'acidBase' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNormalityType('acidBase')}
                        className="flex-1 rounded-xl"
                      >
                        Ácido-Base
                      </Button>
                      <Button
                        variant={normalityType === 'redox' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNormalityType('redox')}
                        className="flex-1 rounded-xl"
                      >
                        Redox
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {normalityType === 'acidBase' 
                        ? 'Número de H⁺ u OH⁻ disociables' 
                        : 'Número de electrones transferidos'}
                    </Label>
                    <Input
                      type="number"
                      value={equivalentFactor}
                      onChange={(e) => setEquivalentFactor(e.target.value)}
                      placeholder="3"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {(calcType === 'molality' || calcType === 'molarFraction') && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Masa soluto (g)</Label>
                  <Input
                    type="number"
                    value={massSolute}
                    onChange={(e) => setMassSolute(e.target.value)}
                    placeholder="40"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>MM soluto (g/mol)</Label>
                  <Input
                    type="number"
                    value={molarMassSolute}
                    onChange={(e) => setMolarMassSolute(e.target.value)}
                    placeholder="46.068"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Masa solvente (g)</Label>
                  <Input
                    type="number"
                    value={massSolvent}
                    onChange={(e) => setMassSolvent(e.target.value)}
                    placeholder="60"
                    className="rounded-xl"
                  />
                </div>
                {calcType === 'molarFraction' && (
                  <div className="space-y-2">
                    <Label>MM solvente (g/mol)</Label>
                    <Input
                      type="number"
                      value={molarMassSolvent}
                      onChange={(e) => setMolarMassSolvent(e.target.value)}
                      placeholder="18.015"
                      className="rounded-xl"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {calcType === 'dilution' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(['v2', 'c2', 'v1', 'c1'] as const).map(sf => (
                  <Button
                    key={sf}
                    variant={solveFor === sf ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSolveFor(sf)}
                    className="rounded-xl"
                  >
                    Calcular {sf.toUpperCase().replace('1', '₁').replace('2', '₂')}
                  </Button>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>C₁ (M) - Inicial</Label>
                  <Input
                    type="number"
                    value={c1}
                    onChange={(e) => setC1(e.target.value)}
                    disabled={solveFor === 'c1'}
                    placeholder="1.0"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>V₁ (mL) - Inicial</Label>
                  <Input
                    type="number"
                    value={v1}
                    onChange={(e) => setV1(e.target.value)}
                    disabled={solveFor === 'v1'}
                    placeholder="100"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>C₂ (M) - Final</Label>
                  <Input
                    type="number"
                    value={c2}
                    onChange={(e) => setC2(e.target.value)}
                    disabled={solveFor === 'c2'}
                    placeholder="0.1"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>V₂ (mL) - Final</Label>
                  <Input
                    type="number"
                    value={v2}
                    onChange={(e) => setV2(e.target.value)}
                    disabled={solveFor === 'v2'}
                    placeholder="?"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleCalculate} className="w-full gap-2 rounded-xl h-11">
            <Calculator className="h-4 w-4" />
            Calcular
          </Button>
        </Card>

        {/* Panel de resultados */}
        <div>
          {result ? (
            <ResultDisplay result={result} isMobile={isMobile} />
          ) : (
            <Card className="p-8 rounded-xl flex flex-col items-center justify-center min-h-[300px] text-center">
              <Beaker className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Ingresa los datos</h3>
              <p className="text-sm text-muted-foreground">
                Completa el formulario y presiona "Calcular" para ver el procedimiento paso a paso.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
