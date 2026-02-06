import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, Check } from "lucide-react";
import { StepDisplay } from "./StepDisplay";
import { StepDetail } from "./types";
import { safeEval } from "./mathUtils";
import { BASIC_OPERATIONS, ADVANCED_OPERATIONS } from "./constants";

interface BasicCalculatorProps {
  precision: number;
  onResult?: (input: string, result: string) => void;
}

export function BasicCalculator({ precision, onResult }: BasicCalculatorProps) {
  const [input, setInput] = useState("3+4*2");
  const [result, setResult] = useState("");
  const [steps, setSteps] = useState<StepDetail[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  const handleButton = (value: string) => {
    if (value === "=") calculate();
    else if (value === "C") { setInput(""); setResult(""); }
    else if (value === "⌫") setInput(prev => prev.slice(0, -1));
    else setInput(prev => prev + value);
  };

  const calculate = () => {
    if (!input.trim()) { setResult("Error: Expresión vacía"); return; }

    const { result: evalResult, error, steps: evalSteps } = safeEval(input);
    
    const calcSteps: StepDetail[] = [{
      step: 1, title: "Análisis de expresión", description: "Validación y procesamiento",
      formula: input, calculation: "Verificación de sintaxis",
      result: error ? "❌ Expresión inválida" : "✓ Expresión válida",
      explanation: error || "Expresión validada correctamente."
    }];

    if (error) {
      setResult(`Error: ${error}`);
      setSteps(calcSteps);
      return;
    }

    calcSteps.push({
      step: 2, title: "Evaluación", description: "Cálculo del resultado",
      formula: input, calculation: evalSteps.join(" → "),
      result: evalResult.toFixed(precision),
      explanation: "Resultado obtenido."
    });

    const resultStr = evalResult.toFixed(precision);
    setResult(resultStr);
    setSteps(calcSteps);
    setHistory(prev => [`${input} = ${resultStr}`, ...prev.slice(0, 9)]);
    onResult?.(input, resultStr);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <Card className="p-4 rounded-2xl">
          <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-primary" />
            Calculadora Científica
          </h3>

          {/* Display */}
          <div className="p-4 rounded-xl bg-muted/50 border mb-4">
            <div className="text-xs text-muted-foreground mb-1">Expresión:</div>
            <div className="font-mono text-lg break-all min-h-[24px]">{input || "0"}</div>
            {result && (
              <>
                <div className="text-xs text-muted-foreground mt-2 mb-1">Resultado:</div>
                <div className={`font-mono text-2xl font-bold ${result.startsWith("Error") ? "text-destructive" : "text-primary"}`}>
                  {result}
                </div>
              </>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 mb-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && calculate()}
              className="font-mono rounded-xl"
              placeholder="3+4*2, sqrt(16), sin(π/4)"
            />
            <Button onClick={calculate} className="gap-2 rounded-xl">
              <Check className="h-4 w-4" /> =
            </Button>
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {BASIC_OPERATIONS.map((btn) => (
              <Button
                key={btn.value}
                variant={btn.value === '=' ? "default" : "outline"}
                size="lg"
                className={`h-12 text-lg font-medium rounded-xl ${btn.value === '=' ? "" : ""}`}
                onClick={() => handleButton(btn.value)}
              >
                {btn.value}
              </Button>
            ))}
          </div>

          {/* Advanced Operations */}
          <div className="grid grid-cols-6 gap-1.5">
            {ADVANCED_OPERATIONS.map((op) => (
              <Button
                key={op.value}
                variant="secondary"
                size="sm"
                className="h-9 text-xs rounded-lg"
                onClick={() => handleButton(op.value)}
              >
                {op.display}
              </Button>
            ))}
            <Button variant="secondary" size="sm" className="h-9 text-xs rounded-lg" onClick={() => handleButton("⌫")}>
              ⌫
            </Button>
          </div>
        </Card>

        {steps.length > 0 && (
          <Card className="p-4 rounded-2xl">
            <StepDisplay steps={steps} />
          </Card>
        )}
      </div>

      {/* History */}
      <Card className="p-4 rounded-2xl">
        <h3 className="font-semibold text-sm mb-3">Historial reciente</h3>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">Sin cálculos aún</p>
        ) : (
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="p-2 bg-muted/50 rounded-lg font-mono text-xs cursor-pointer hover:bg-muted transition-colors"
                onClick={() => {
                  const [expr] = item.split(" = ");
                  setInput(expr);
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
