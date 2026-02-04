import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Cloud, Calculator, Plus, Trash2, Lightbulb } from "lucide-react";
import { GasLawType, ChemResult } from "./types";
import { CONSTANTS } from "./constants";
import { calculateIdealGas, calculateDaltonPartialPressures, formatNumber } from "./chemistryUtils";
import { ResultDisplay } from "./ResultDisplay";

interface GasesCalculatorProps {
  precision: number;
  isMobile: boolean;
}

const GAS_LAWS: { id: GasLawType; label: string; formula: string }[] = [
  { id: 'ideal', label: 'Gas Ideal', formula: 'PV = nRT' },
  { id: 'boyle', label: 'Boyle', formula: 'P₁V₁ = P₂V₂' },
  { id: 'charles', label: 'Charles', formula: 'V₁/T₁ = V₂/T₂' },
  { id: 'gayLussac', label: 'Gay-Lussac', formula: 'P₁/T₁ = P₂/T₂' },
  { id: 'combined', label: 'Combinada', formula: 'P₁V₁/T₁ = P₂V₂/T₂' },
  { id: 'dalton', label: 'Dalton', formula: 'P_total = ΣPᵢ' },
];

export function GasesCalculator({ precision, isMobile }: GasesCalculatorProps) {
  const [gasLaw, setGasLaw] = useState<GasLawType>('ideal');
  const [showTutorial, setShowTutorial] = useState(false);
  const [result, setResult] = useState<ChemResult | null>(null);

  // Estado 1
  const [p1, setP1] = useState('1');
  const [v1, setV1] = useState('22.4');
  const [t1, setT1] = useState('273.15');
  const [n, setN] = useState('1');
  
  // Estado 2
  const [p2, setP2] = useState('');
  const [v2, setV2] = useState('');
  const [t2, setT2] = useState('');
  
  // Unidades
  const [pressureUnit, setPressureUnit] = useState('atm');
  const [volumeUnit, setVolumeUnit] = useState('L');
  const [tempUnit, setTempUnit] = useState('K');
  
  // Resolver para
  const [solveFor, setSolveFor] = useState<'P' | 'V' | 'T' | 'n'>('V');
  
  // Dalton
  const [partialPressures, setPartialPressures] = useState<{ gas: string; pressure: string }[]>([
    { gas: 'Gas 1', pressure: '0.5' },
    { gas: 'Gas 2', pressure: '0.3' },
  ]);

  const handleAddGas = () => {
    setPartialPressures([...partialPressures, { gas: `Gas ${partialPressures.length + 1}`, pressure: '' }]);
  };

  const handleRemoveGas = (index: number) => {
    setPartialPressures(partialPressures.filter((_, i) => i !== index));
  };

  const handleCalculate = () => {
    if (gasLaw === 'dalton') {
      const pressures = partialPressures.map(p => parseFloat(p.pressure) || 0);
      setResult(calculateDaltonPartialPressures(pressures, precision));
      return;
    }

    // Convertir temperatura a Kelvin si es necesario
    let tempK = parseFloat(t1);
    if (tempUnit === '°C') {
      tempK = parseFloat(t1) + 273.15;
    }

    if (gasLaw === 'ideal') {
      setResult(calculateIdealGas(
        parseFloat(p1),
        parseFloat(v1),
        parseFloat(n),
        tempK,
        solveFor,
        precision
      ));
    } else {
      // Leyes combinadas - cálculo simplificado
      const steps = [];
      let resultValue: number;
      let resultUnit: string;

      switch (gasLaw) {
        case 'boyle':
          // P1V1 = P2V2, n y T constantes
          if (solveFor === 'V') {
            resultValue = (parseFloat(p1) * parseFloat(v1)) / parseFloat(p2);
            resultUnit = volumeUnit;
          } else {
            resultValue = (parseFloat(p1) * parseFloat(v1)) / parseFloat(v2);
            resultUnit = pressureUnit;
          }
          break;
        case 'charles':
          // V1/T1 = V2/T2, n y P constantes
          let t1K = tempUnit === '°C' ? parseFloat(t1) + 273.15 : parseFloat(t1);
          let t2K = tempUnit === '°C' ? parseFloat(t2) + 273.15 : parseFloat(t2);
          if (solveFor === 'V') {
            resultValue = (parseFloat(v1) * t2K) / t1K;
            resultUnit = volumeUnit;
          } else {
            resultValue = (t1K * parseFloat(v2)) / parseFloat(v1);
            resultUnit = 'K';
          }
          break;
        default:
          resultValue = 0;
          resultUnit = '';
      }

      setResult({
        title: `Ley de ${GAS_LAWS.find(g => g.id === gasLaw)?.label}`,
        steps: [
          {
            label: 'Fórmula aplicada',
            formula: GAS_LAWS.find(g => g.id === gasLaw)?.formula || '',
            result: 'Condiciones constantes aplicadas'
          },
          {
            label: 'Resultado',
            formula: `${solveFor} = ?`,
            result: `${formatNumber(resultValue!, precision)} ${resultUnit}`,
            isHighlight: true
          }
        ],
        finalValue: formatNumber(resultValue!, precision),
        unit: resultUnit!
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector de ley */}
      <div className="flex flex-wrap gap-2">
        {GAS_LAWS.map(law => (
          <Button
            key={law.id}
            variant={gasLaw === law.id ? "default" : "outline"}
            size={isMobile ? "sm" : "default"}
            onClick={() => setGasLaw(law.id)}
            className="rounded-xl"
          >
            <div className="text-left">
              <div className={isMobile ? "text-xs" : "text-sm"}>{law.label}</div>
              <div className="text-[10px] font-mono opacity-70">{law.formula}</div>
            </div>
          </Button>
        ))}
      </div>

      {/* Tutorial toggle */}
      <div className="flex items-center gap-2">
        <Switch checked={showTutorial} onCheckedChange={setShowTutorial} />
        <Label className="text-sm">Modo tutorial</Label>
      </div>

      {showTutorial && (
        <Card className="p-4 bg-primary/5 border-primary/20 rounded-xl">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            {GAS_LAWS.find(g => g.id === gasLaw)?.label}
          </h4>
          <p className="text-sm text-muted-foreground">
            {gasLaw === 'ideal' && `PV = nRT donde R = ${CONSTANTS.R_ATM} L·atm/(mol·K). Asume gas ideal: sin volumen molecular ni fuerzas intermoleculares.`}
            {gasLaw === 'boyle' && 'A temperatura constante, el volumen de un gas es inversamente proporcional a su presión.'}
            {gasLaw === 'charles' && 'A presión constante, el volumen de un gas es directamente proporcional a su temperatura absoluta.'}
            {gasLaw === 'gayLussac' && 'A volumen constante, la presión de un gas es directamente proporcional a su temperatura absoluta.'}
            {gasLaw === 'combined' && 'Combina las tres leyes cuando ninguna variable permanece constante (excepto n).'}
            {gasLaw === 'dalton' && 'La presión total de una mezcla de gases es la suma de las presiones parciales de cada gas.'}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 rounded-xl space-y-4">
          {gasLaw === 'dalton' ? (
            /* Interfaz para Dalton */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Presiones Parciales</Label>
                <Button variant="outline" size="sm" onClick={handleAddGas} className="gap-1">
                  <Plus className="h-3 w-3" />
                  Agregar gas
                </Button>
              </div>
              
              <div className="space-y-2">
                {partialPressures.map((pp, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      value={pp.gas}
                      onChange={(e) => {
                        const newPP = [...partialPressures];
                        newPP[idx].gas = e.target.value;
                        setPartialPressures(newPP);
                      }}
                      placeholder="Nombre"
                      className="rounded-xl flex-1"
                    />
                    <Input
                      type="number"
                      value={pp.pressure}
                      onChange={(e) => {
                        const newPP = [...partialPressures];
                        newPP[idx].pressure = e.target.value;
                        setPartialPressures(newPP);
                      }}
                      placeholder="Presión (atm)"
                      className="rounded-xl w-32"
                    />
                    {partialPressures.length > 2 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveGas(idx)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Interfaz para otras leyes */
            <div className="space-y-4">
              {/* Unidades */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Presión</Label>
                  <Select value={pressureUnit} onValueChange={setPressureUnit}>
                    <SelectTrigger className="h-8 rounded-xl text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="atm">atm</SelectItem>
                      <SelectItem value="kPa">kPa</SelectItem>
                      <SelectItem value="mmHg">mmHg</SelectItem>
                      <SelectItem value="bar">bar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Volumen</Label>
                  <Select value={volumeUnit} onValueChange={setVolumeUnit}>
                    <SelectTrigger className="h-8 rounded-xl text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="mL">mL</SelectItem>
                      <SelectItem value="m³">m³</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Temperatura</Label>
                  <Select value={tempUnit} onValueChange={setTempUnit}>
                    <SelectTrigger className="h-8 rounded-xl text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="K">K</SelectItem>
                      <SelectItem value="°C">°C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Resolver para */}
              {gasLaw === 'ideal' && (
                <div className="space-y-2">
                  <Label>Calcular:</Label>
                  <div className="flex gap-2">
                    {(['P', 'V', 'T', 'n'] as const).map(sf => (
                      <Button
                        key={sf}
                        variant={solveFor === sf ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSolveFor(sf)}
                        className="flex-1 rounded-xl"
                      >
                        {sf}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Estado 1 */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">
                  {gasLaw === 'ideal' ? 'Valores conocidos' : 'Estado inicial'}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">P ({pressureUnit})</Label>
                    <Input
                      type="number"
                      value={p1}
                      onChange={(e) => setP1(e.target.value)}
                      disabled={solveFor === 'P'}
                      placeholder="1"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">V ({volumeUnit})</Label>
                    <Input
                      type="number"
                      value={v1}
                      onChange={(e) => setV1(e.target.value)}
                      disabled={solveFor === 'V'}
                      placeholder="22.4"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">T ({tempUnit})</Label>
                    <Input
                      type="number"
                      value={t1}
                      onChange={(e) => setT1(e.target.value)}
                      disabled={solveFor === 'T'}
                      placeholder="273.15"
                      className="rounded-xl"
                    />
                  </div>
                  {gasLaw === 'ideal' && (
                    <div className="space-y-1">
                      <Label className="text-xs">n (mol)</Label>
                      <Input
                        type="number"
                        value={n}
                        onChange={(e) => setN(e.target.value)}
                        disabled={solveFor === 'n'}
                        placeholder="1"
                        className="rounded-xl"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Estado 2 para leyes combinadas */}
              {(gasLaw === 'boyle' || gasLaw === 'charles' || gasLaw === 'gayLussac' || gasLaw === 'combined') && (
                <div className="space-y-3 pt-3 border-t">
                  <h4 className="font-medium text-sm">Estado final</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {(gasLaw !== 'charles') && (
                      <div className="space-y-1">
                        <Label className="text-xs">P₂ ({pressureUnit})</Label>
                        <Input
                          type="number"
                          value={p2}
                          onChange={(e) => setP2(e.target.value)}
                          placeholder="?"
                          className="rounded-xl"
                        />
                      </div>
                    )}
                    {(gasLaw !== 'gayLussac') && (
                      <div className="space-y-1">
                        <Label className="text-xs">V₂ ({volumeUnit})</Label>
                        <Input
                          type="number"
                          value={v2}
                          onChange={(e) => setV2(e.target.value)}
                          placeholder="?"
                          className="rounded-xl"
                        />
                      </div>
                    )}
                    {(gasLaw !== 'boyle') && (
                      <div className="space-y-1">
                        <Label className="text-xs">T₂ ({tempUnit})</Label>
                        <Input
                          type="number"
                          value={t2}
                          onChange={(e) => setT2(e.target.value)}
                          placeholder="?"
                          className="rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
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
              <Cloud className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Leyes de Gases</h3>
              <p className="text-sm text-muted-foreground">
                Selecciona una ley y completa los datos para calcular.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
