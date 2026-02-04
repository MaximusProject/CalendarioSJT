import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Calculator, Lightbulb, Flame } from "lucide-react";
import { ThermoCalcType, ChemResult } from "./types";
import { SPECIFIC_HEATS, FORMATION_ENTHALPIES } from "./constants";
import { calculateHeat, calculateEnthalpyReaction, formatNumber } from "./chemistryUtils";
import { ResultDisplay } from "./ResultDisplay";

interface ThermoCalculatorProps {
  precision: number;
  isMobile: boolean;
}

const CALC_OPTIONS: { id: ThermoCalcType; label: string; icon: string }[] = [
  { id: 'specificHeat', label: 'Calor Específico', icon: '🔥' },
  { id: 'calorimetry', label: 'Calorimetría', icon: '🌡️' },
  { id: 'reactionEnthalpy', label: 'Entalpía de Reacción', icon: '⚗️' },
  { id: 'hess', label: 'Ley de Hess', icon: '📊' },
];

export function ThermoCalculator({ precision, isMobile }: ThermoCalculatorProps) {
  const [calcType, setCalcType] = useState<ThermoCalcType>('calorimetry');
  const [showTutorial, setShowTutorial] = useState(false);
  const [result, setResult] = useState<ChemResult | null>(null);

  // Calorimetría
  const [mass, setMass] = useState('100');
  const [specificHeat, setSpecificHeat] = useState('4.184');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [ti, setTi] = useState('25');
  const [tf, setTf] = useState('75');
  
  // Entalpía de reacción
  const [enthalpyReaction, setEnthalpyReaction] = useState('-285.8');
  const [molesReacted, setMolesReacted] = useState('1');
  
  // Hess
  const [reactions, setReactions] = useState([
    { equation: 'C + O₂ → CO₂', enthalpy: '-393.5', multiplier: '1' },
    { equation: 'H₂ + ½O₂ → H₂O', enthalpy: '-285.8', multiplier: '2' },
  ]);

  const handleSelectMaterial = (material: string) => {
    setSelectedMaterial(material);
    setSpecificHeat(SPECIFIC_HEATS[material]?.toString() || '4.184');
  };

  const handleAddReaction = () => {
    setReactions([...reactions, { equation: '', enthalpy: '', multiplier: '1' }]);
  };

  const handleRemoveReaction = (index: number) => {
    setReactions(reactions.filter((_, i) => i !== index));
  };

  const handleCalculate = () => {
    switch (calcType) {
      case 'calorimetry':
      case 'specificHeat':
        const deltaT = parseFloat(tf) - parseFloat(ti);
        setResult(calculateHeat(
          parseFloat(mass),
          parseFloat(specificHeat),
          deltaT,
          precision
        ));
        break;
      case 'reactionEnthalpy':
        setResult(calculateEnthalpyReaction(
          parseFloat(enthalpyReaction),
          parseFloat(molesReacted),
          precision
        ));
        break;
      case 'hess':
        // Suma de entalpías según multiplicadores
        const totalEnthalpy = reactions.reduce((sum, r) => {
          return sum + (parseFloat(r.enthalpy) || 0) * (parseFloat(r.multiplier) || 1);
        }, 0);
        
        const steps = reactions.map((r, i) => ({
          label: `Reacción ${i + 1}`,
          formula: r.equation,
          result: `ΔH = ${r.enthalpy} × ${r.multiplier} = ${formatNumber(parseFloat(r.enthalpy) * parseFloat(r.multiplier), precision)} kJ`
        }));
        
        steps.push({
          label: 'Suma total (Ley de Hess)',
          formula: 'ΔH_total = Σ(ΔHᵢ × nᵢ)',
          result: `${formatNumber(totalEnthalpy, precision)} kJ`
        });
        
        setResult({
          title: 'Ley de Hess',
          steps,
          finalValue: formatNumber(totalEnthalpy, precision),
          unit: 'kJ',
          classification: totalEnthalpy < 0 ? 'Proceso exotérmico' : 'Proceso endotérmico',
          tip: 'La entalpía es una función de estado: el camino no importa, solo los estados inicial y final.'
        });
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector de tipo */}
      <div className="flex flex-wrap gap-2">
        {CALC_OPTIONS.map(option => (
          <Button
            key={option.id}
            variant={calcType === option.id ? "default" : "outline"}
            size={isMobile ? "sm" : "default"}
            onClick={() => setCalcType(option.id)}
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
            {CALC_OPTIONS.find(o => o.id === calcType)?.label}
          </h4>
          <p className="text-sm text-muted-foreground">
            {calcType === 'calorimetry' && 'Q = m × c × ΔT. El calor depende de la masa, el calor específico del material y el cambio de temperatura.'}
            {calcType === 'specificHeat' && 'El calor específico (c) es la energía necesaria para elevar 1°C la temperatura de 1 gramo de sustancia.'}
            {calcType === 'reactionEnthalpy' && 'ΔH indica si una reacción es exotérmica (ΔH < 0, libera calor) o endotérmica (ΔH > 0, absorbe calor).'}
            {calcType === 'hess' && 'La ley de Hess permite calcular la entalpía de una reacción sumando las entalpías de reacciones intermedias.'}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 rounded-xl space-y-4">
          {(calcType === 'calorimetry' || calcType === 'specificHeat') && (
            <div className="space-y-4">
              {/* Selector de material */}
              <div className="space-y-2">
                <Label>Material (opcional)</Label>
                <Select value={selectedMaterial} onValueChange={handleSelectMaterial}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Seleccionar material..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SPECIFIC_HEATS).map(([name, c]) => (
                      <SelectItem key={name} value={name}>
                        {name} (c = {c} J/g·°C)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Masa (g)</Label>
                  <Input
                    type="number"
                    value={mass}
                    onChange={(e) => setMass(e.target.value)}
                    placeholder="100"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>c (J/g·°C)</Label>
                  <Input
                    type="number"
                    value={specificHeat}
                    onChange={(e) => setSpecificHeat(e.target.value)}
                    placeholder="4.184"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>T inicial (°C)</Label>
                  <Input
                    type="number"
                    value={ti}
                    onChange={(e) => setTi(e.target.value)}
                    placeholder="25"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>T final (°C)</Label>
                  <Input
                    type="number"
                    value={tf}
                    onChange={(e) => setTf(e.target.value)}
                    placeholder="75"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-xl">
                <div className="text-sm">
                  <span className="font-medium">ΔT = </span>
                  <span className="text-primary font-bold">
                    {formatNumber(parseFloat(tf) - parseFloat(ti), 2)} °C
                  </span>
                </div>
              </div>
            </div>
          )}

          {calcType === 'reactionEnthalpy' && (
            <div className="space-y-4">
              {/* Selector de entalpías comunes */}
              <div className="space-y-2">
                <Label>Entalpías de formación estándar</Label>
                <Select onValueChange={(v) => setEnthalpyReaction(FORMATION_ENTHALPIES[v]?.toString() || '0')}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Seleccionar compuesto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FORMATION_ENTHALPIES).map(([name, h]) => (
                      <SelectItem key={name} value={name}>
                        {name}: ΔH°f = {h} kJ/mol
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>ΔH° (kJ/mol)</Label>
                  <Input
                    type="number"
                    value={enthalpyReaction}
                    onChange={(e) => setEnthalpyReaction(e.target.value)}
                    placeholder="-285.8"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Moles reaccionados</Label>
                  <Input
                    type="number"
                    value={molesReacted}
                    onChange={(e) => setMolesReacted(e.target.value)}
                    placeholder="1"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-xl flex items-center gap-2">
                <Flame className={`h-5 w-5 ${parseFloat(enthalpyReaction) < 0 ? 'text-red-500' : 'text-blue-500'}`} />
                <span className="text-sm">
                  {parseFloat(enthalpyReaction) < 0 ? 'Reacción exotérmica (libera calor)' : 'Reacción endotérmica (absorbe calor)'}
                </span>
              </div>
            </div>
          )}

          {calcType === 'hess' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Reacciones intermedias</Label>
                <Button variant="outline" size="sm" onClick={handleAddReaction}>
                  + Agregar
                </Button>
              </div>

              <div className="space-y-3">
                {reactions.map((r, idx) => (
                  <div key={idx} className="p-3 bg-muted/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Reacción {idx + 1}</Badge>
                      {reactions.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveReaction(idx)}
                          className="text-destructive h-6 text-xs"
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                    <Input
                      value={r.equation}
                      onChange={(e) => {
                        const newR = [...reactions];
                        newR[idx].equation = e.target.value;
                        setReactions(newR);
                      }}
                      placeholder="Ej: C + O₂ → CO₂"
                      className="rounded-xl text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        value={r.enthalpy}
                        onChange={(e) => {
                          const newR = [...reactions];
                          newR[idx].enthalpy = e.target.value;
                          setReactions(newR);
                        }}
                        placeholder="ΔH (kJ/mol)"
                        className="rounded-xl text-sm"
                      />
                      <Input
                        type="number"
                        value={r.multiplier}
                        onChange={(e) => {
                          const newR = [...reactions];
                          newR[idx].multiplier = e.target.value;
                          setReactions(newR);
                        }}
                        placeholder="Multiplicador"
                        className="rounded-xl text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleCalculate} className="w-full gap-2 rounded-xl h-11">
            <Calculator className="h-4 w-4" />
            Calcular
          </Button>
        </Card>

        {/* Resultados */}
        <div>
          {result ? (
            <ResultDisplay result={result} isMobile={isMobile} />
          ) : (
            <Card className="p-8 rounded-xl flex flex-col items-center justify-center min-h-[300px] text-center">
              <Thermometer className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Termoquímica</h3>
              <p className="text-sm text-muted-foreground">
                Calcula calor, entalpías y aplica la ley de Hess.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
