import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Calculator, Droplets, Zap, Thermometer } from "lucide-react";

interface ChemResult {
  title: string;
  steps: { label: string; formula: string; result: string }[];
  finalValue: string;
  unit: string;
}

export function ChemistryCalculator() {
  const [calcType, setCalcType] = useState<"ph" | "dilution" | "molarity">("ph");
  
  // pH/pOH
  const [concentration, setConcentration] = useState("");
  const [acidOrBase, setAcidOrBase] = useState<"acid" | "base">("acid");
  
  // Diluciones
  const [c1, setC1] = useState("");
  const [v1, setV1] = useState("");
  const [c2, setC2] = useState("");
  const [v2, setV2] = useState("");
  const [solveFor, setSolveFor] = useState<"c2" | "v2">("v2");
  
  // Molaridad
  const [mass, setMass] = useState("");
  const [molarMass, setMolarMass] = useState("");
  const [volume, setVolume] = useState("");
  
  const [result, setResult] = useState<ChemResult | null>(null);

  const calculatePH = () => {
    const conc = parseFloat(concentration) || 0;
    const steps: ChemResult["steps"] = [];
    let finalValue = "";
    let unit = "";

    if (acidOrBase === "acid") {
      // Ácido fuerte: pH = -log[H+]
      const pH = -Math.log10(conc);
      const pOH = 14 - pH;
      
      steps.push({
        label: "Fórmula del pH",
        formula: "pH = -log[H⁺]",
        result: `pH = -log(${conc}) = ${pH.toFixed(2)}`
      });
      steps.push({
        label: "Relación pH + pOH = 14",
        formula: "pOH = 14 - pH",
        result: `pOH = 14 - ${pH.toFixed(2)} = ${pOH.toFixed(2)}`
      });
      
      finalValue = pH.toFixed(2);
      unit = "pH";
    } else {
      // Base fuerte: pOH = -log[OH-]
      const pOH = -Math.log10(conc);
      const pH = 14 - pOH;
      
      steps.push({
        label: "Fórmula del pOH",
        formula: "pOH = -log[OH⁻]",
        result: `pOH = -log(${conc}) = ${pOH.toFixed(2)}`
      });
      steps.push({
        label: "Relación pH + pOH = 14",
        formula: "pH = 14 - pOH",
        result: `pH = 14 - ${pOH.toFixed(2)} = ${pH.toFixed(2)}`
      });
      
      finalValue = pH.toFixed(2);
      unit = "pH";
    }

    // Clasificación
    const phValue = parseFloat(finalValue);
    let classification = "";
    if (phValue < 7) classification = "Solución ácida";
    else if (phValue > 7) classification = "Solución básica";
    else classification = "Solución neutra";
    
    steps.push({
      label: "Clasificación",
      formula: "pH < 7 = ácido | pH = 7 = neutro | pH > 7 = básico",
      result: classification
    });

    setResult({ title: "Cálculo de pH", steps, finalValue, unit });
  };

  const calculateDilution = () => {
    const c1Val = parseFloat(c1) || 0;
    const v1Val = parseFloat(v1) || 0;
    const c2Val = parseFloat(c2) || 0;
    const v2Val = parseFloat(v2) || 0;
    
    const steps: ChemResult["steps"] = [];
    let finalValue = "";
    let unit = "";

    steps.push({
      label: "Fórmula de dilución",
      formula: "C₁ × V₁ = C₂ × V₂",
      result: "Ley de conservación de soluto"
    });

    if (solveFor === "v2") {
      const result = (c1Val * v1Val) / c2Val;
      steps.push({
        label: "Despejando V₂",
        formula: "V₂ = (C₁ × V₁) / C₂",
        result: `V₂ = (${c1Val} × ${v1Val}) / ${c2Val} = ${result.toFixed(2)} mL`
      });
      finalValue = result.toFixed(2);
      unit = "mL";
    } else {
      const result = (c1Val * v1Val) / v2Val;
      steps.push({
        label: "Despejando C₂",
        formula: "C₂ = (C₁ × V₁) / V₂",
        result: `C₂ = (${c1Val} × ${v1Val}) / ${v2Val} = ${result.toFixed(4)} M`
      });
      finalValue = result.toFixed(4);
      unit = "M";
    }

    setResult({ title: "Dilución", steps, finalValue, unit });
  };

  const calculateMolarity = () => {
    const massVal = parseFloat(mass) || 0;
    const mmVal = parseFloat(molarMass) || 0;
    const volVal = parseFloat(volume) || 0;
    
    const steps: ChemResult["steps"] = [];

    // Calcular moles
    const moles = massVal / mmVal;
    steps.push({
      label: "Calcular moles",
      formula: "n = masa / masa molar",
      result: `n = ${massVal} g / ${mmVal} g/mol = ${moles.toFixed(4)} mol`
    });

    // Convertir volumen a litros si está en mL
    const volumeL = volVal / 1000;
    steps.push({
      label: "Convertir volumen a litros",
      formula: "V(L) = V(mL) / 1000",
      result: `V = ${volVal} mL / 1000 = ${volumeL.toFixed(4)} L`
    });

    // Calcular molaridad
    const molarity = moles / volumeL;
    steps.push({
      label: "Calcular molaridad",
      formula: "M = n / V",
      result: `M = ${moles.toFixed(4)} mol / ${volumeL.toFixed(4)} L = ${molarity.toFixed(4)} M`
    });

    setResult({ 
      title: "Molaridad", 
      steps, 
      finalValue: molarity.toFixed(4), 
      unit: "M (mol/L)" 
    });
  };

  const handleCalculate = () => {
    if (calcType === "ph") calculatePH();
    else if (calcType === "dilution") calculateDilution();
    else calculateMolarity();
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 rounded-2xl border-l-4" style={{ borderLeftColor: "hsl(var(--quimica))" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[hsl(var(--quimica))]/15">
            <FlaskConical className="h-6 w-6 text-[hsl(var(--quimica))]" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Laboratorio Químico</h2>
            <p className="text-sm text-muted-foreground">pH, diluciones y molaridad</p>
          </div>
        </div>

        <Tabs value={calcType} onValueChange={(v) => setCalcType(v as typeof calcType)}>
          <TabsList className="w-full rounded-xl mb-4 grid grid-cols-3">
            <TabsTrigger value="ph" className="rounded-lg gap-1 text-xs">
              <Droplets className="h-3 w-3" /> pH/pOH
            </TabsTrigger>
            <TabsTrigger value="dilution" className="rounded-lg gap-1 text-xs">
              <Zap className="h-3 w-3" /> Dilución
            </TabsTrigger>
            <TabsTrigger value="molarity" className="rounded-lg gap-1 text-xs">
              <Thermometer className="h-3 w-3" /> Molaridad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ph" className="space-y-4">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Button
                variant={acidOrBase === "acid" ? "default" : "outline"}
                onClick={() => setAcidOrBase("acid")}
                className="rounded-xl"
              >
                Ácido [H⁺]
              </Button>
              <Button
                variant={acidOrBase === "base" ? "default" : "outline"}
                onClick={() => setAcidOrBase("base")}
                className="rounded-xl"
              >
                Base [OH⁻]
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Concentración (M)</Label>
              <Input
                type="number"
                value={concentration}
                onChange={(e) => setConcentration(e.target.value)}
                placeholder="Ej: 0.001"
                className="rounded-xl"
                step="0.0001"
              />
            </div>
          </TabsContent>

          <TabsContent value="dilution" className="space-y-4">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Button
                variant={solveFor === "v2" ? "default" : "outline"}
                onClick={() => setSolveFor("v2")}
                className="rounded-xl text-xs"
              >
                Calcular V₂
              </Button>
              <Button
                variant={solveFor === "c2" ? "default" : "outline"}
                onClick={() => setSolveFor("c2")}
                className="rounded-xl text-xs"
              >
                Calcular C₂
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>C₁ (M)</Label>
                <Input
                  type="number"
                  value={c1}
                  onChange={(e) => setC1(e.target.value)}
                  placeholder="Conc. inicial"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>V₁ (mL)</Label>
                <Input
                  type="number"
                  value={v1}
                  onChange={(e) => setV1(e.target.value)}
                  placeholder="Vol. inicial"
                  className="rounded-xl"
                />
              </div>
              {solveFor === "v2" ? (
                <div className="space-y-2">
                  <Label>C₂ (M)</Label>
                  <Input
                    type="number"
                    value={c2}
                    onChange={(e) => setC2(e.target.value)}
                    placeholder="Conc. final"
                    className="rounded-xl"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>V₂ (mL)</Label>
                  <Input
                    type="number"
                    value={v2}
                    onChange={(e) => setV2(e.target.value)}
                    placeholder="Vol. final"
                    className="rounded-xl"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="molarity" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Masa del soluto (g)</Label>
                <Input
                  type="number"
                  value={mass}
                  onChange={(e) => setMass(e.target.value)}
                  placeholder="Ej: 58.44"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Masa molar (g/mol)</Label>
                <Input
                  type="number"
                  value={molarMass}
                  onChange={(e) => setMolarMass(e.target.value)}
                  placeholder="Ej: 58.44 (NaCl)"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Volumen de solución (mL)</Label>
                <Input
                  type="number"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="Ej: 500"
                  className="rounded-xl"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={handleCalculate} className="w-full mt-4 rounded-xl h-12 gap-2">
          <Calculator className="h-4 w-4" />
          Calcular
        </Button>
      </Card>

      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Resultado principal */}
          <Card className="p-4 rounded-2xl bg-gradient-to-br from-[hsl(var(--quimica))]/10 to-transparent text-center">
            <h3 className="font-semibold mb-2">{result.title}</h3>
            <div className="text-4xl font-bold text-[hsl(var(--quimica))]">{result.finalValue}</div>
            <div className="text-sm text-muted-foreground">{result.unit}</div>
          </Card>

          {/* Procedimiento */}
          <Card className="p-4 rounded-2xl">
            <h3 className="font-semibold mb-3">Procedimiento</h3>
            <div className="space-y-3">
              {result.steps.map((step, idx) => (
                <div key={idx} className="p-3 bg-muted rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  <div className="font-mono text-sm pl-7">
                    <div className="text-muted-foreground">{step.formula}</div>
                    <div className="text-primary">{step.result}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
