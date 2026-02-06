import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3x3, CheckCircle, XCircle } from "lucide-react";
import { StepDisplay } from "./StepDisplay";
import { StepDetail } from "./types";

interface IdentityVerifierProps {
  precision: number;
  onResult?: (input: string, result: string) => void;
}

export function IdentityVerifier({ precision, onResult }: IdentityVerifierProps) {
  const [angle, setAngle] = useState("30");
  const [identityType, setIdentityType] = useState<"basic" | "advanced" | "double" | "half">("basic");
  const [result, setResult] = useState("");
  const [steps, setSteps] = useState<StepDetail[]>([]);

  const identities = useMemo(() => {
    const ang = parseFloat(angle) || 0;
    const rad = (ang * Math.PI) / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);

    return [
      {
        id: "basic", name: "Pitagórica fundamental",
        formula: "sin²(θ) + cos²(θ) = 1",
        lhs: sin * sin + cos * cos, rhs: 1,
        detail: `${(sin * sin).toFixed(precision)} + ${(cos * cos).toFixed(precision)} = ${(sin * sin + cos * cos).toFixed(precision)}`
      },
      {
        id: "advanced", name: "Tangente = sin/cos",
        formula: "tan(θ) = sin(θ) / cos(θ)",
        lhs: Math.tan(rad), rhs: sin / cos,
        detail: `tan(${ang}°) = ${Math.tan(rad).toFixed(precision)} vs sin/cos = ${(sin / cos).toFixed(precision)}`
      },
      {
        id: "double", name: "Ángulo doble (seno)",
        formula: "sin(2θ) = 2·sin(θ)·cos(θ)",
        lhs: Math.sin(2 * rad), rhs: 2 * sin * cos,
        detail: `sin(${2 * ang}°) = ${Math.sin(2 * rad).toFixed(precision)} vs 2·sin·cos = ${(2 * sin * cos).toFixed(precision)}`
      },
      {
        id: "half", name: "Ángulo doble (coseno)",
        formula: "cos(2θ) = cos²(θ) - sin²(θ)",
        lhs: Math.cos(2 * rad), rhs: cos * cos - sin * sin,
        detail: `cos(${2 * ang}°) = ${Math.cos(2 * rad).toFixed(precision)} vs cos²-sin² = ${(cos * cos - sin * sin).toFixed(precision)}`
      },
    ];
  }, [angle, precision]);

  const calculate = () => {
    const identity = identities.find(i => i.id === identityType);
    if (!identity) return;

    const verified = Math.abs(identity.lhs - identity.rhs) < 1e-10;
    
    const calcSteps: StepDetail[] = [{
      step: 1, title: identity.name,
      description: `Verificar ${identity.formula}`,
      formula: identity.formula,
      calculation: identity.detail,
      result: verified ? "✓ IDENTIDAD VERIFICADA" : "✗ NO CUMPLE",
      explanation: verified
        ? "La identidad se cumple para este ángulo con la precisión requerida."
        : "Diferencia numérica detectada (puede ser error de punto flotante)."
    }];

    setResult(verified ? `${identity.formula} ✓` : `${identity.formula} ✗`);
    setSteps(calcSteps);
    onResult?.(`Identidad ${identity.name}: ${angle}°`, verified ? "Verificada ✓" : "No cumple ✗");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-4 rounded-2xl">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
          <Grid3x3 className="h-5 w-5 text-primary" />
          Verificación de Identidades
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Identidad a verificar</Label>
            <Select value={identityType} onValueChange={(v: any) => { setIdentityType(v); setResult(""); setSteps([]); }}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">sin²θ + cos²θ = 1</SelectItem>
                <SelectItem value="advanced">tanθ = sinθ/cosθ</SelectItem>
                <SelectItem value="double">sin(2θ) = 2·sinθ·cosθ</SelectItem>
                <SelectItem value="half">cos(2θ) = cos²θ - sin²θ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ángulo θ (grados)</Label>
            <Input
              type="number" value={angle}
              onChange={(e) => setAngle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && calculate()}
              className="rounded-xl h-11" placeholder="30"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {[0, 30, 45, 60, 90, 120, 135, 180, 270, 360].map((a) => (
              <Badge
                key={a} variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs transition-colors"
                onClick={() => setAngle(a.toString())}
              >
                {a}°
              </Badge>
            ))}
          </div>

          <Button onClick={calculate} className="w-full h-11 gap-2 rounded-xl">
            <CheckCircle className="h-4 w-4" />
            Verificar Identidad
          </Button>
        </div>

        {/* All identities quick view */}
        {angle && (
          <div className="mt-4 space-y-2">
            <Label className="text-xs text-muted-foreground">Vista rápida para θ = {angle}°</Label>
            {identities.map((id) => {
              const verified = Math.abs(id.lhs - id.rhs) < 1e-10;
              return (
                <div key={id.id} className="p-2 rounded-lg bg-muted/50 flex items-center gap-2">
                  {verified
                    ? <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                    : <XCircle className="h-3 w-3 text-destructive shrink-0" />}
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{id.name}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate">{id.formula}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-4 rounded-2xl">
        {result ? (
          <div className="space-y-4">
            <h3 className={`font-bold text-lg flex items-center gap-2 ${result.includes('✓') ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
              {result.includes('✓') ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              {result.includes('✓') ? "Identidad Verificada" : "No Cumple"}
            </h3>

            <div className={`p-4 rounded-xl border ${result.includes('✓') ? "bg-emerald-500/10 border-emerald-500/20" : "bg-destructive/10 border-destructive/20"}`}>
              <div className="text-lg font-bold text-center font-mono">{result}</div>
            </div>

            <StepDisplay steps={steps} />
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Grid3x3 className="h-14 w-14 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Seleccione una identidad y verifique</p>
          </div>
        )}
      </Card>
    </div>
  );
}
