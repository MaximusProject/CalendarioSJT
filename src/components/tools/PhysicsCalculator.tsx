import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Atom, Calculator, ArrowUp, ArrowRight, RotateCw } from "lucide-react";

interface CalculationStep {
  formula: string;
  substitution: string;
  result: string;
  explanation: string;
}

interface PhysicsResult {
  title: string;
  steps: CalculationStep[];
  finalResults: { label: string; value: string; unit: string }[];
}

export function PhysicsCalculator() {
  const [calcType, setCalcType] = useState<"vertical" | "horizontal" | "inclined">("vertical");
  
  // Lanzamiento vertical
  const [v0, setV0] = useState("");
  const [height, setHeight] = useState("");
  const [time, setTime] = useState("");
  
  // Lanzamiento horizontal
  const [vx, setVx] = useState("");
  const [hHeight, setHHeight] = useState("");
  
  // Lanzamiento inclinado
  const [iV0, setIV0] = useState("");
  const [angle, setAngle] = useState("");
  
  const [result, setResult] = useState<PhysicsResult | null>(null);
  
  const g = 9.8; // gravedad

  const calculateVertical = () => {
    const v0Num = parseFloat(v0) || 0;
    const steps: CalculationStep[] = [];
    
    // Altura máxima
    const hMax = (v0Num * v0Num) / (2 * g);
    steps.push({
      formula: "h_max = v₀² / (2g)",
      substitution: `h_max = (${v0Num})² / (2 × ${g})`,
      result: `h_max = ${hMax.toFixed(2)} m`,
      explanation: "La altura máxima se alcanza cuando la velocidad es cero"
    });

    // Tiempo de subida
    const tSubida = v0Num / g;
    steps.push({
      formula: "t_subida = v₀ / g",
      substitution: `t_subida = ${v0Num} / ${g}`,
      result: `t_subida = ${tSubida.toFixed(2)} s`,
      explanation: "Tiempo que tarda en alcanzar la altura máxima"
    });

    // Tiempo total (ida y vuelta)
    const tTotal = 2 * tSubida;
    steps.push({
      formula: "t_total = 2 × t_subida",
      substitution: `t_total = 2 × ${tSubida.toFixed(2)}`,
      result: `t_total = ${tTotal.toFixed(2)} s`,
      explanation: "Tiempo total de vuelo (subida + bajada)"
    });

    // Velocidad final al caer
    const vFinal = v0Num; // misma magnitud
    steps.push({
      formula: "v_final = v₀ (misma magnitud)",
      substitution: `v_final = ${v0Num}`,
      result: `v_final = ${vFinal.toFixed(2)} m/s (hacia abajo)`,
      explanation: "La velocidad final tiene la misma magnitud que la inicial"
    });

    setResult({
      title: "Lanzamiento Vertical",
      steps,
      finalResults: [
        { label: "Altura máxima", value: hMax.toFixed(2), unit: "m" },
        { label: "Tiempo de subida", value: tSubida.toFixed(2), unit: "s" },
        { label: "Tiempo total", value: tTotal.toFixed(2), unit: "s" },
        { label: "Velocidad final", value: vFinal.toFixed(2), unit: "m/s" }
      ]
    });
  };

  const calculateHorizontal = () => {
    const vxNum = parseFloat(vx) || 0;
    const hNum = parseFloat(hHeight) || 0;
    const steps: CalculationStep[] = [];

    // Tiempo de caída
    const tCaida = Math.sqrt((2 * hNum) / g);
    steps.push({
      formula: "t = √(2h / g)",
      substitution: `t = √(2 × ${hNum} / ${g})`,
      result: `t = ${tCaida.toFixed(2)} s`,
      explanation: "Tiempo que tarda en caer desde la altura h"
    });

    // Alcance horizontal
    const alcance = vxNum * tCaida;
    steps.push({
      formula: "x = v₀ × t",
      substitution: `x = ${vxNum} × ${tCaida.toFixed(2)}`,
      result: `x = ${alcance.toFixed(2)} m`,
      explanation: "Distancia horizontal recorrida"
    });

    // Velocidad vertical al caer
    const vy = g * tCaida;
    steps.push({
      formula: "v_y = g × t",
      substitution: `v_y = ${g} × ${tCaida.toFixed(2)}`,
      result: `v_y = ${vy.toFixed(2)} m/s`,
      explanation: "Componente vertical de la velocidad al impactar"
    });

    // Velocidad resultante
    const vResultante = Math.sqrt(vxNum * vxNum + vy * vy);
    steps.push({
      formula: "v = √(v_x² + v_y²)",
      substitution: `v = √(${vxNum}² + ${vy.toFixed(2)}²)`,
      result: `v = ${vResultante.toFixed(2)} m/s`,
      explanation: "Velocidad total al momento del impacto"
    });

    setResult({
      title: "Lanzamiento Horizontal",
      steps,
      finalResults: [
        { label: "Tiempo de caída", value: tCaida.toFixed(2), unit: "s" },
        { label: "Alcance horizontal", value: alcance.toFixed(2), unit: "m" },
        { label: "Velocidad vertical", value: vy.toFixed(2), unit: "m/s" },
        { label: "Velocidad final", value: vResultante.toFixed(2), unit: "m/s" }
      ]
    });
  };

  const calculateInclined = () => {
    const v0Num = parseFloat(iV0) || 0;
    const angleNum = parseFloat(angle) || 45;
    const angleRad = (angleNum * Math.PI) / 180;
    const steps: CalculationStep[] = [];

    // Componentes de velocidad
    const v0x = v0Num * Math.cos(angleRad);
    const v0y = v0Num * Math.sin(angleRad);
    steps.push({
      formula: "v₀x = v₀ × cos(θ) ; v₀y = v₀ × sin(θ)",
      substitution: `v₀x = ${v0Num} × cos(${angleNum}°) ; v₀y = ${v0Num} × sin(${angleNum}°)`,
      result: `v₀x = ${v0x.toFixed(2)} m/s ; v₀y = ${v0y.toFixed(2)} m/s`,
      explanation: "Componentes horizontal y vertical de la velocidad inicial"
    });

    // Altura máxima
    const hMax = (v0y * v0y) / (2 * g);
    steps.push({
      formula: "h_max = v₀y² / (2g)",
      substitution: `h_max = (${v0y.toFixed(2)})² / (2 × ${g})`,
      result: `h_max = ${hMax.toFixed(2)} m`,
      explanation: "Altura máxima alcanzada por el proyectil"
    });

    // Tiempo total de vuelo
    const tTotal = (2 * v0y) / g;
    steps.push({
      formula: "t_total = (2 × v₀y) / g",
      substitution: `t_total = (2 × ${v0y.toFixed(2)}) / ${g}`,
      result: `t_total = ${tTotal.toFixed(2)} s`,
      explanation: "Tiempo total de vuelo"
    });

    // Alcance máximo
    const alcance = v0x * tTotal;
    steps.push({
      formula: "R = v₀x × t_total",
      substitution: `R = ${v0x.toFixed(2)} × ${tTotal.toFixed(2)}`,
      result: `R = ${alcance.toFixed(2)} m`,
      explanation: "Alcance horizontal máximo"
    });

    setResult({
      title: "Lanzamiento Inclinado",
      steps,
      finalResults: [
        { label: "Velocidad horizontal", value: v0x.toFixed(2), unit: "m/s" },
        { label: "Velocidad vertical", value: v0y.toFixed(2), unit: "m/s" },
        { label: "Altura máxima", value: hMax.toFixed(2), unit: "m" },
        { label: "Tiempo de vuelo", value: tTotal.toFixed(2), unit: "s" },
        { label: "Alcance", value: alcance.toFixed(2), unit: "m" }
      ]
    });
  };

  const handleCalculate = () => {
    if (calcType === "vertical") calculateVertical();
    else if (calcType === "horizontal") calculateHorizontal();
    else calculateInclined();
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 rounded-2xl border-l-4" style={{ borderLeftColor: "hsl(var(--fisica))" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[hsl(var(--fisica))]/15">
            <Atom className="h-6 w-6 text-[hsl(var(--fisica))]" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Calculadora de Física</h2>
            <p className="text-sm text-muted-foreground">Cinemática y movimiento de proyectiles</p>
          </div>
        </div>

        <Tabs value={calcType} onValueChange={(v) => setCalcType(v as typeof calcType)}>
          <TabsList className="w-full rounded-xl mb-4 grid grid-cols-3">
            <TabsTrigger value="vertical" className="rounded-lg gap-1 text-xs">
              <ArrowUp className="h-3 w-3" /> Vertical
            </TabsTrigger>
            <TabsTrigger value="horizontal" className="rounded-lg gap-1 text-xs">
              <ArrowRight className="h-3 w-3" /> Horizontal
            </TabsTrigger>
            <TabsTrigger value="inclined" className="rounded-lg gap-1 text-xs">
              <RotateCw className="h-3 w-3" /> Inclinado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vertical" className="space-y-4">
            <div className="space-y-2">
              <Label>Velocidad inicial (v₀) en m/s</Label>
              <Input
                type="number"
                value={v0}
                onChange={(e) => setV0(e.target.value)}
                placeholder="Ej: 20"
                className="rounded-xl"
              />
            </div>
          </TabsContent>

          <TabsContent value="horizontal" className="space-y-4">
            <div className="space-y-2">
              <Label>Velocidad horizontal (v₀) en m/s</Label>
              <Input
                type="number"
                value={vx}
                onChange={(e) => setVx(e.target.value)}
                placeholder="Ej: 15"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Altura inicial (h) en metros</Label>
              <Input
                type="number"
                value={hHeight}
                onChange={(e) => setHHeight(e.target.value)}
                placeholder="Ej: 45"
                className="rounded-xl"
              />
            </div>
          </TabsContent>

          <TabsContent value="inclined" className="space-y-4">
            <div className="space-y-2">
              <Label>Velocidad inicial (v₀) en m/s</Label>
              <Input
                type="number"
                value={iV0}
                onChange={(e) => setIV0(e.target.value)}
                placeholder="Ej: 25"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Ángulo de lanzamiento (°)</Label>
              <Input
                type="number"
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                placeholder="Ej: 45"
                className="rounded-xl"
              />
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
          {/* Resultados finales */}
          <Card className="p-4 rounded-2xl bg-gradient-to-br from-[hsl(var(--fisica))]/10 to-transparent">
            <h3 className="font-semibold mb-3">{result.title} - Resultados</h3>
            <div className="grid grid-cols-2 gap-3">
              {result.finalResults.map((r, idx) => (
                <div key={idx} className="p-3 bg-background rounded-xl text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--fisica))]">{r.value}</div>
                  <div className="text-xs text-muted-foreground">{r.label}</div>
                  <div className="text-xs font-mono">{r.unit}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Procedimiento paso a paso */}
          <Card className="p-4 rounded-2xl">
            <h3 className="font-semibold mb-3">Procedimiento Paso a Paso</h3>
            <div className="space-y-4">
              {result.steps.map((step, idx) => (
                <div key={idx} className="p-3 bg-muted rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-muted-foreground">{step.explanation}</span>
                  </div>
                  <div className="font-mono text-sm bg-background p-2 rounded-lg">
                    <div className="text-muted-foreground">{step.formula}</div>
                    <div>{step.substitution}</div>
                    <div className="text-primary font-bold">{step.result}</div>
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
