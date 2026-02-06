import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Triangle, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { StepDisplay } from "./StepDisplay";
import { TriangleResult } from "./types";
import { validateTriangleSSS, solveTriangleSSS, generateSSSSteps } from "./mathUtils";
import { TEST_CASES_SSS } from "./constants";

interface TriangleCalculatorProps {
  precision: number;
  onResult?: (input: string, result: string) => void;
}

export function TriangleCalculator({ precision, onResult }: TriangleCalculatorProps) {
  const [triangleType, setTriangleType] = useState<"SSS" | "SAS">("SSS");
  const [sideA, setSideA] = useState("3");
  const [sideB, setSideB] = useState("4");
  const [sideC, setSideC] = useState("5");
  const [result, setResult] = useState<TriangleResult | null>(null);

  const calculate = () => {
    if (triangleType === "SSS") {
      const a = parseFloat(sideA) || 0;
      const b = parseFloat(sideB) || 0;
      const c = parseFloat(sideC) || 0;
      const validation = validateTriangleSSS(a, b, c);

      if (!validation.isValid) {
        setResult({
          valid: false, sides: { a, b, c },
          steps: generateSSSSteps(a, b, c, validation, null),
          errors: validation.errors, sumArithmetic: validation.sumArithmetic
        });
        return;
      }

      const solution = solveTriangleSSS(a, b, c);
      const steps = generateSSSSteps(a, b, c, validation, solution);
      
      setResult({
        valid: true, sides: { a, b, c },
        angles: solution.angles, area: solution.area,
        perimeter: solution.perimeter, type: solution.type,
        steps, height: solution.height,
        inscribedRadius: solution.inscribedRadius,
        circumscribedRadius: solution.circumscribedRadius
      });
      
      onResult?.(`SSS: ${a}, ${b}, ${c}`, `Área: ${solution.area.toFixed(2)}, ${solution.type}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Input */}
      <Card className="p-4 rounded-2xl">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
          <Triangle className="h-5 w-5 text-primary" />
          Resolución de Triángulos
        </h3>

        <div className="space-y-4">
          <Alert className="bg-primary/5 border-primary/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">Validación rigurosa</AlertTitle>
            <AlertDescription className="text-xs">
              El sistema valida completamente antes de calcular. Sin errores NaN.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Tipo de resolución</Label>
            <Select value={triangleType} onValueChange={(v: any) => setTriangleType(v)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SSS">SSS — Tres lados conocidos</SelectItem>
                <SelectItem value="SAS">SAS — Dos lados y ángulo (próx.)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {triangleType === "SSS" && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Lado a", value: sideA, setter: setSideA },
                  { label: "Lado b", value: sideB, setter: setSideB },
                  { label: "Lado c", value: sideC, setter: setSideC },
                ].map((s) => (
                  <div key={s.label} className="space-y-1">
                    <Label className="text-xs">{s.label}</Label>
                    <Input
                      type="number" step="0.001" min="0.001"
                      value={s.value} onChange={(e) => s.setter(e.target.value)}
                      className="rounded-xl h-11 text-center" placeholder="0.000"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Casos de prueba:</Label>
                <div className="flex flex-wrap gap-1">
                  {TEST_CASES_SSS.map((tc, idx) => (
                    <Badge
                      key={idx} variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs transition-colors"
                      onClick={() => {
                        setSideA(tc.a.toString());
                        setSideB(tc.b.toString());
                        setSideC(tc.c.toString());
                      }}
                    >
                      {tc.name.split('(')[0].trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Button onClick={calculate} className="w-full h-11 gap-2 rounded-xl">
            <CheckCircle className="h-4 w-4" />
            Resolver Triángulo
          </Button>
        </div>
      </Card>

      {/* Results */}
      <Card className="p-4 rounded-2xl">
        {result ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-lg flex items-center gap-2 ${result.valid ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                {result.valid ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                {result.valid ? "Triángulo Válido" : "No Válido"}
              </h3>
              {result.valid && result.type && (
                <Badge className="bg-primary/10 text-primary">{result.type}</Badge>
              )}
            </div>

            {result.valid && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Perímetro", value: result.perimeter?.toFixed(4), color: "text-blue-600 dark:text-blue-400" },
                    { label: "Área", value: result.area?.toFixed(4), color: "text-emerald-600 dark:text-emerald-400" },
                    { label: "Altura (hₐ)", value: result.height?.toFixed(4), color: "text-orange-600 dark:text-orange-400" },
                    { label: "Inradio", value: result.inscribedRadius?.toFixed(4), color: "text-purple-600 dark:text-purple-400" },
                  ].map((m) => (
                    <div key={m.label} className="p-3 rounded-xl bg-muted/50 text-center">
                      <div className="text-xs text-muted-foreground">{m.label}</div>
                      <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {result.angles && (
                  <div className="p-3 rounded-xl bg-muted/30">
                    <h4 className="font-semibold text-sm mb-2">Ángulos</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "A", value: result.angles.A },
                        { label: "B", value: result.angles.B },
                        { label: "C", value: result.angles.C },
                      ].map((a) => (
                        <div key={a.label} className="text-center p-2 bg-background rounded-lg">
                          <div className="text-xs text-muted-foreground">∠{a.label}</div>
                          <div className="font-bold">{a.value?.toFixed(2)}°</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <StepDisplay steps={result.steps} />
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Triangle className="h-14 w-14 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Ingrese los lados para resolver</p>
          </div>
        )}
      </Card>
    </div>
  );
}
