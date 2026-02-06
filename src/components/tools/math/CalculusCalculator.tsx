import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sigma, CheckCircle, Info } from "lucide-react";
import { StepDisplay } from "./StepDisplay";
import { StepDetail } from "./types";
import { calculateDerivative, calculateIntegral } from "./mathUtils";
import { COMMON_FUNCTIONS } from "./constants";

interface CalculusCalculatorProps {
  precision: number;
  onResult?: (input: string, result: string) => void;
}

export function CalculusCalculator({ precision, onResult }: CalculusCalculatorProps) {
  const [func, setFunc] = useState("x^2");
  const [calcType, setCalcType] = useState<"derivative" | "integral" | "limit">("derivative");
  const [result, setResult] = useState("");
  const [steps, setSteps] = useState<StepDetail[]>([]);
  const [atPoint, setAtPoint] = useState("0");

  const calculate = () => {
    if (!func.trim()) return;

    if (calcType === "derivative") {
      const res = calculateDerivative(func, precision);
      setResult(res.result);
      setSteps(res.steps);
      onResult?.(`Derivada: ${func}`, `f'(x) = ${res.result}`);
    } else if (calcType === "integral") {
      const res = calculateIntegral(func);
      setResult(res.result);
      setSteps(res.steps);
      onResult?.(`Integral: ${func}`, res.result);
    } else {
      // Limit - numerical evaluation
      const point = parseFloat(atPoint) || 0;
      const step: StepDetail = {
        step: 1, title: "Cálculo de límite",
        description: `Evaluar cuando x → ${point}`,
        formula: `lim(x→${point}) ${func}`,
        calculation: "Evaluación numérica por aproximación",
        result: `lim(x→${point}) ${func}`,
        explanation: "Evalúe la función cerca del punto para aproximar el límite."
      };
      setResult(`lim(x→${point}) ${func}`);
      setSteps([step]);
      onResult?.(`Límite: ${func} cuando x→${point}`, "Evaluación numérica");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-4 rounded-2xl">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
          <Sigma className="h-5 w-5 text-primary" />
          Cálculo Diferencial e Integral
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de cálculo</Label>
            <Select value={calcType} onValueChange={(v: any) => { setCalcType(v); setResult(""); setSteps([]); }}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="derivative">Derivada (simbólica)</SelectItem>
                <SelectItem value="integral">Integral (indefinida)</SelectItem>
                <SelectItem value="limit">Límite (en un punto)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Función f(x)</Label>
            <Input
              value={func}
              onChange={(e) => setFunc(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && calculate()}
              className="rounded-xl h-11 font-mono"
              placeholder="x^2, sin(x), exp(x), ln(x)"
            />
          </div>

          {calcType === "limit" && (
            <div className="space-y-2">
              <Label>Punto x →</Label>
              <Input
                type="number" value={atPoint}
                onChange={(e) => setAtPoint(e.target.value)}
                className="rounded-xl h-11" placeholder="0"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {COMMON_FUNCTIONS.slice(0, 8).map((f) => (
              <Badge
                key={f.label} variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs transition-colors"
                onClick={() => setFunc(f.value)}
              >
                {f.label}
              </Badge>
            ))}
          </div>

          <Button onClick={calculate} className="w-full h-11 gap-2 rounded-xl">
            <CheckCircle className="h-4 w-4" />
            {calcType === "derivative" ? "Calcular Derivada" : calcType === "integral" ? "Calcular Integral" : "Calcular Límite"}
          </Button>

          <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {calcType === "derivative" ? "Para derivadas numéricas y gráficas, use la pestaña Gráficas." :
               calcType === "integral" ? "Para integrales definidas, use la pestaña Gráficas." :
               "Evalúe la función cerca del punto para límites numéricos."}
            </AlertDescription>
          </Alert>
        </div>
      </Card>

      <Card className="p-4 rounded-2xl">
        {result ? (
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
              Resultado
            </h3>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="text-xs text-muted-foreground mb-1">
                {calcType === "derivative" ? "Derivada:" : calcType === "integral" ? "Integral:" : "Límite:"}
              </div>
              <div className="text-xl font-bold font-mono">
                {calcType === "derivative" ? `f'(x) = ${result}` :
                 calcType === "integral" ? `∫ ${func} dx = ${result}` :
                 result}
              </div>
              {calcType === "integral" && (
                <div className="text-xs text-muted-foreground mt-1">C = constante de integración</div>
              )}
            </div>

            <StepDisplay steps={steps} />
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Sigma className="h-14 w-14 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Ingrese una función para calcular</p>
          </div>
        )}
      </Card>
    </div>
  );
}
