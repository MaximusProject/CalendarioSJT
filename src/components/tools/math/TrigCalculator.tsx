import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PieChart, CheckCircle, Info } from "lucide-react";
import { StepDisplay } from "./StepDisplay";
import { TrigResult, StepDetail } from "./types";
import { calculateTrigValues } from "./mathUtils";
import { NOTABLE_ANGLES } from "./constants";

interface TrigCalculatorProps {
  precision: number;
  onResult?: (input: string, result: string) => void;
}

export function TrigCalculator({ precision, onResult }: TrigCalculatorProps) {
  const [angle, setAngle] = useState("45");
  const [angleUnit, setAngleUnit] = useState<"deg" | "rad" | "grad">("deg");
  const [result, setResult] = useState<TrigResult | null>(null);
  const [steps, setSteps] = useState<StepDetail[]>([]);

  const calculate = () => {
    if (!angle.trim()) return;
    const angleValue = parseFloat(angle) || 0;
    const { result: trigResult, steps: trigSteps } = calculateTrigValues(angleValue, angleUnit, precision);
    setResult(trigResult);
    setSteps(trigSteps);
    onResult?.(
      `Ángulo: ${angleValue}${angleUnit === "deg" ? "°" : angleUnit === "rad" ? " rad" : " grad"}`,
      `sin=${trigResult.sin.toFixed(precision)}, cos=${trigResult.cos.toFixed(precision)}`
    );
  };

  const unitSuffix = angleUnit === "deg" ? "°" : angleUnit === "rad" ? " rad" : " grad";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Input */}
      <Card className="p-4 rounded-2xl">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
          <PieChart className="h-5 w-5 text-primary" />
          Funciones Trigonométricas
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Unidad angular</Label>
            <Select value={angleUnit} onValueChange={(v: any) => setAngleUnit(v)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="deg">Grados (°)</SelectItem>
                <SelectItem value="rad">Radianes (rad)</SelectItem>
                <SelectItem value="grad">Gradianes (grad)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ángulo</Label>
            <Input
              type="number"
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && calculate()}
              placeholder={angleUnit === "deg" ? "Ej: 45" : "Ej: 0.785"}
              className="rounded-xl h-11"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {NOTABLE_ANGLES.filter((_, i) => i % 2 === 0 || NOTABLE_ANGLES.indexOf(_) < 10).slice(0, 12).map((a) => (
              <Badge
                key={a}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                onClick={() => { setAngle(a.toString()); setAngleUnit("deg"); }}
              >
                {a}°
              </Badge>
            ))}
          </div>

          <Button onClick={calculate} className="w-full h-11 gap-2 rounded-xl">
            <CheckCircle className="h-4 w-4" />
            Calcular Funciones
          </Button>
        </div>
      </Card>

      {/* Results */}
      <Card className="p-4 rounded-2xl">
        {result ? (
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
              Resultados — {result.angle}{unitSuffix}
            </h3>

            {result.exactValues && (
              <Alert className="bg-emerald-500/10 border-emerald-500/20">
                <Info className="h-4 w-4 text-emerald-600" />
                <AlertTitle className="text-emerald-700 dark:text-emerald-300">Ángulo notable</AlertTitle>
                <AlertDescription className="text-xs">
                  sin = {result.exactValues.sin}, cos = {result.exactValues.cos}, tan = {result.exactValues.tan}
                </AlertDescription>
              </Alert>
            )}

            {/* Basic functions */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "sin", value: result.sin, color: "text-blue-600 dark:text-blue-400" },
                { name: "cos", value: result.cos, color: "text-purple-600 dark:text-purple-400" },
                { name: "tan", value: result.tan, color: "text-emerald-600 dark:text-emerald-400" },
              ].map((fn) => (
                <div key={fn.name} className="p-3 rounded-xl bg-muted/50 text-center">
                  <div className="text-xs text-muted-foreground">{fn.name}(θ)</div>
                  <div className={`text-lg font-bold ${fn.color}`}>
                    {isNaN(fn.value) ? "∞" : fn.value.toFixed(precision)}
                  </div>
                </div>
              ))}
            </div>

            {/* Reciprocal functions */}
            <div className="p-3 rounded-xl bg-muted/30">
              <h4 className="font-semibold text-sm mb-2">Recíprocas</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "cot", value: result.cot },
                  { name: "sec", value: result.sec },
                  { name: "csc", value: result.csc },
                ].map((fn) => (
                  <div key={fn.name} className="text-center p-2 bg-background rounded-lg">
                    <div className="text-xs text-muted-foreground">{fn.name}(θ)</div>
                    <div className="font-bold text-sm">
                      {isNaN(fn.value) ? "∞" : fn.value.toFixed(precision)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <StepDisplay steps={steps} />
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <PieChart className="h-14 w-14 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Ingrese un ángulo para ver resultados</p>
          </div>
        )}
      </Card>
    </div>
  );
}
