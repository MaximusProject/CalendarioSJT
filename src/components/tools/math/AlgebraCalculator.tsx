import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Code, CheckCircle, XCircle, Info } from "lucide-react";
import { StepDisplay } from "./StepDisplay";
import { AlgebraResult } from "./types";
import { solveLinearEquation, solveQuadraticEquation } from "./mathUtils";

interface AlgebraCalculatorProps {
  precision: number;
  onResult?: (input: string, result: string) => void;
}

export function AlgebraCalculator({ precision, onResult }: AlgebraCalculatorProps) {
  const [equation, setEquation] = useState("2x + 3 = 7");
  const [equationType, setEquationType] = useState<"linear" | "quadratic">("linear");
  const [result, setResult] = useState<AlgebraResult | null>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    if (!equation.trim()) { setError("Ecuación vacía"); return; }
    setError("");

    if (equationType === "linear") {
      const res = solveLinearEquation(equation, precision);
      if (res.error) { setError(res.error); return; }
      setResult({ solutions: res.solutions, steps: res.steps });
      onResult?.(`Lineal: ${equation}`, `x = ${res.solutions[0]}`);
    } else {
      const res = solveQuadraticEquation(equation, precision);
      if (res.error) { setError(res.error); return; }
      setResult({ solutions: res.solutions, discriminant: res.discriminant, nature: res.nature, steps: res.steps });
      onResult?.(`Cuadrática: ${equation}`, `Soluciones: ${res.solutions.join(", ")}`);
    }
  };

  const examples = equationType === "linear" 
    ? [{ label: "2x + 3 = 7", value: "2x + 3 = 7" }, { label: "5x - 10 = 0", value: "5x - 10 = 0" }, { label: "3x + 1 = 16", value: "3x + 1 = 16" }]
    : [{ label: "x² - 5x + 6 = 0", value: "1x^2 - 5x + 6 = 0" }, { label: "2x² + 3x - 2 = 0", value: "2x^2 + 3x - 2 = 0" }, { label: "x² + 1 = 0", value: "1x^2 + 0x + 1 = 0" }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-4 rounded-2xl">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
          <Code className="h-5 w-5 text-primary" />
          Álgebra — Ecuaciones
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de ecuación</Label>
            <Select value={equationType} onValueChange={(v: any) => { setEquationType(v); setResult(null); setError(""); }}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Lineal (ax + b = c)</SelectItem>
                <SelectItem value="quadratic">Cuadrática (ax² + bx + c = 0)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ecuación</Label>
            <Input
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && calculate()}
              className="rounded-xl h-11 font-mono"
              placeholder={equationType === "linear" ? "2x + 3 = 7" : "1x^2 - 5x + 6 = 0"}
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {examples.map((ex) => (
              <Badge
                key={ex.label} variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs transition-colors"
                onClick={() => setEquation(ex.value)}
              >
                {ex.label}
              </Badge>
            ))}
          </div>

          <Button onClick={calculate} className="w-full h-11 gap-2 rounded-xl">
            <CheckCircle className="h-4 w-4" />
            Resolver Ecuación
          </Button>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {equationType === "linear" 
                ? "Formato: ax + b = c (ej: 2x + 3 = 7)" 
                : "Formato: ax^2 + bx + c = 0 (ej: 1x^2 - 5x + 6 = 0)"}
            </AlertDescription>
          </Alert>
        </div>
      </Card>

      <Card className="p-4 rounded-2xl">
        {result && result.solutions.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
              Solución Encontrada
            </h3>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <h4 className="font-semibold text-sm mb-2">Soluciones:</h4>
              <div className="space-y-1">
                {result.solutions.map((sol, idx) => (
                  <div key={idx} className="text-lg font-bold font-mono p-2 bg-background rounded-lg">
                    x{result.solutions.length > 1 ? `₍${idx + 1}₎` : ""} = {sol}
                  </div>
                ))}
              </div>
              {result.nature && (
                <div className="mt-3 pt-2 border-t border-primary/10">
                  <span className="text-xs text-muted-foreground">Naturaleza: </span>
                  <span className="text-sm font-medium">{result.nature}</span>
                </div>
              )}
              {result.discriminant !== undefined && (
                <div className="mt-1">
                  <span className="text-xs text-muted-foreground">Δ = </span>
                  <span className="text-sm font-bold font-mono">{result.discriminant.toFixed(precision)}</span>
                </div>
              )}
            </div>

            <StepDisplay steps={result.steps} />
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Code className="h-14 w-14 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Ingrese una ecuación para resolver</p>
          </div>
        )}
      </Card>
    </div>
  );
}
