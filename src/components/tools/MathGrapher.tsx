import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sigma, Calculator, Triangle, PieChart } from "lucide-react";

interface TrigResult {
  angle: number;
  sin: number;
  cos: number;
  tan: number;
  cot: number;
  sec: number;
  csc: number;
}

interface TriangleResult {
  sides: { a: number; b: number; c: number };
  angles: { A: number; B: number; C: number };
  area: number;
  perimeter: number;
  steps: string[];
}

export function MathGrapher() {
  const [calcType, setCalcType] = useState<"trig" | "triangle" | "identity">("trig");
  
  // Trigonometría
  const [angle, setAngle] = useState("");
  const [angleUnit, setAngleUnit] = useState<"deg" | "rad">("deg");
  const [trigResult, setTrigResult] = useState<TrigResult | null>(null);
  
  // Triángulos
  const [sideA, setSideA] = useState("");
  const [sideB, setSideB] = useState("");
  const [angleC, setAngleC] = useState("");
  const [triangleResult, setTriangleResult] = useState<TriangleResult | null>(null);
  
  // Identidades
  const [identityAngle, setIdentityAngle] = useState("");
  
  const notableAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 270, 360];

  const calculateTrig = () => {
    let angleRad = parseFloat(angle) || 0;
    if (angleUnit === "deg") {
      angleRad = (angleRad * Math.PI) / 180;
    }
    
    const sinVal = Math.sin(angleRad);
    const cosVal = Math.cos(angleRad);
    const tanVal = Math.tan(angleRad);
    
    setTrigResult({
      angle: parseFloat(angle) || 0,
      sin: sinVal,
      cos: cosVal,
      tan: Math.abs(cosVal) < 0.0001 ? NaN : tanVal,
      cot: Math.abs(sinVal) < 0.0001 ? NaN : 1 / tanVal,
      sec: Math.abs(cosVal) < 0.0001 ? NaN : 1 / cosVal,
      csc: Math.abs(sinVal) < 0.0001 ? NaN : 1 / sinVal
    });
  };

  const calculateTriangle = () => {
    const a = parseFloat(sideA) || 0;
    const b = parseFloat(sideB) || 0;
    const C = (parseFloat(angleC) || 0) * Math.PI / 180;
    
    const steps: string[] = [];
    
    // Ley de cosenos para encontrar c
    const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C));
    steps.push(`Ley de cosenos: c² = a² + b² - 2ab·cos(C)`);
    steps.push(`c² = ${a}² + ${b}² - 2(${a})(${b})·cos(${angleC}°)`);
    steps.push(`c = ${c.toFixed(4)}`);
    
    // Ley de senos para encontrar A y B
    const sinA = (a * Math.sin(C)) / c;
    const A = Math.asin(sinA) * 180 / Math.PI;
    steps.push(`Ley de senos: sin(A)/a = sin(C)/c`);
    steps.push(`A = arcsin((${a} × sin(${angleC}°)) / ${c.toFixed(4)}) = ${A.toFixed(2)}°`);
    
    const B = 180 - A - parseFloat(angleC);
    steps.push(`B = 180° - A - C = 180° - ${A.toFixed(2)}° - ${angleC}° = ${B.toFixed(2)}°`);
    
    // Área usando fórmula del seno
    const area = 0.5 * a * b * Math.sin(C);
    steps.push(`Área = (1/2) × a × b × sin(C) = (1/2) × ${a} × ${b} × sin(${angleC}°) = ${area.toFixed(4)}`);
    
    const perimeter = a + b + c;
    
    setTriangleResult({
      sides: { a, b, c },
      angles: { A, B, C: parseFloat(angleC) },
      area,
      perimeter,
      steps
    });
  };

  const identities = useMemo(() => {
    const ang = parseFloat(identityAngle) || 0;
    const rad = (ang * Math.PI) / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    
    return [
      {
        name: "Pitagórica fundamental",
        formula: "sin²(θ) + cos²(θ) = 1",
        result: `${(sin * sin).toFixed(6)} + ${(cos * cos).toFixed(6)} = ${(sin * sin + cos * cos).toFixed(6)}`
      },
      {
        name: "Tangente",
        formula: "tan(θ) = sin(θ) / cos(θ)",
        result: `tan(${ang}°) = ${sin.toFixed(6)} / ${cos.toFixed(6)} = ${(sin / cos).toFixed(6)}`
      },
      {
        name: "Ángulo doble (seno)",
        formula: "sin(2θ) = 2·sin(θ)·cos(θ)",
        result: `sin(${2 * ang}°) = 2 × ${sin.toFixed(4)} × ${cos.toFixed(4)} = ${(2 * sin * cos).toFixed(6)}`
      },
      {
        name: "Ángulo doble (coseno)",
        formula: "cos(2θ) = cos²(θ) - sin²(θ)",
        result: `cos(${2 * ang}°) = ${(cos * cos).toFixed(4)} - ${(sin * sin).toFixed(4)} = ${(cos * cos - sin * sin).toFixed(6)}`
      },
      {
        name: "Ángulo mitad (seno)",
        formula: "sin(θ/2) = ±√((1 - cos(θ))/2)",
        result: `sin(${ang / 2}°) = √((1 - ${cos.toFixed(4)})/2) = ${Math.sqrt((1 - cos) / 2).toFixed(6)}`
      },
      {
        name: "Secante",
        formula: "sec(θ) = 1 / cos(θ)",
        result: `sec(${ang}°) = 1 / ${cos.toFixed(6)} = ${(1 / cos).toFixed(6)}`
      }
    ];
  }, [identityAngle]);

  return (
    <div className="space-y-4">
      <Card className="p-5 rounded-2xl border-l-4" style={{ borderLeftColor: "hsl(var(--matematicas))" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[hsl(var(--matematicas))]/15">
            <Sigma className="h-6 w-6 text-[hsl(var(--matematicas))]" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Calculadora Matemática</h2>
            <p className="text-sm text-muted-foreground">Trigonometría e identidades</p>
          </div>
        </div>

        <Tabs value={calcType} onValueChange={(v) => setCalcType(v as typeof calcType)}>
          <TabsList className="w-full rounded-xl mb-4 grid grid-cols-3">
            <TabsTrigger value="trig" className="rounded-lg gap-1 text-xs">
              <PieChart className="h-3 w-3" /> Razones
            </TabsTrigger>
            <TabsTrigger value="triangle" className="rounded-lg gap-1 text-xs">
              <Triangle className="h-3 w-3" /> Triángulos
            </TabsTrigger>
            <TabsTrigger value="identity" className="rounded-lg gap-1 text-xs">
              <Sigma className="h-3 w-3" /> Identidades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trig" className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant={angleUnit === "deg" ? "default" : "outline"}
                  onClick={() => setAngleUnit("deg")}
                  className="flex-1 rounded-xl"
                >
                  Grados (°)
                </Button>
                <Button
                  variant={angleUnit === "rad" ? "default" : "outline"}
                  onClick={() => setAngleUnit("rad")}
                  className="flex-1 rounded-xl"
                >
                  Radianes
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Ángulo</Label>
                <Input
                  type="number"
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                  placeholder={angleUnit === "deg" ? "Ej: 45" : "Ej: 0.785"}
                  className="rounded-xl"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {notableAngles.map((a) => (
                  <Badge
                    key={a}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setAngle(a.toString())}
                  >
                    {a}°
                  </Badge>
                ))}
              </div>
            </div>
            <Button onClick={calculateTrig} className="w-full rounded-xl h-12 gap-2">
              <Calculator className="h-4 w-4" />
              Calcular Razones
            </Button>
          </TabsContent>

          <TabsContent value="triangle" className="space-y-4">
            <p className="text-xs text-muted-foreground p-2 bg-muted rounded-lg">
              Ingresa dos lados y el ángulo entre ellos (ley de cosenos)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label>Lado a</Label>
                <Input
                  type="number"
                  value={sideA}
                  onChange={(e) => setSideA(e.target.value)}
                  placeholder="5"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Lado b</Label>
                <Input
                  type="number"
                  value={sideB}
                  onChange={(e) => setSideB(e.target.value)}
                  placeholder="7"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Ángulo C (°)</Label>
                <Input
                  type="number"
                  value={angleC}
                  onChange={(e) => setAngleC(e.target.value)}
                  placeholder="60"
                  className="rounded-xl"
                />
              </div>
            </div>
            <Button onClick={calculateTriangle} className="w-full rounded-xl h-12 gap-2">
              <Calculator className="h-4 w-4" />
              Resolver Triángulo
            </Button>
          </TabsContent>

          <TabsContent value="identity" className="space-y-4">
            <div className="space-y-2">
              <Label>Ángulo (grados)</Label>
              <Input
                type="number"
                value={identityAngle}
                onChange={(e) => setIdentityAngle(e.target.value)}
                placeholder="Ej: 30"
                className="rounded-xl"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {[30, 45, 60, 90].map((a) => (
                <Badge
                  key={a}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setIdentityAngle(a.toString())}
                >
                  {a}°
                </Badge>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Resultados de razones trigonométricas */}
      {calcType === "trig" && trigResult && (
        <Card className="p-4 rounded-2xl animate-fade-in">
          <h3 className="font-semibold mb-3">
            Razones de {trigResult.angle}{angleUnit === "deg" ? "°" : " rad"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "sin", value: trigResult.sin },
              { name: "cos", value: trigResult.cos },
              { name: "tan", value: trigResult.tan },
              { name: "cot", value: trigResult.cot },
              { name: "sec", value: trigResult.sec },
              { name: "csc", value: trigResult.csc }
            ].map((item) => (
              <div key={item.name} className="p-3 bg-muted rounded-xl text-center">
                <div className="text-sm text-muted-foreground">{item.name}(θ)</div>
                <div className="text-lg font-bold text-[hsl(var(--matematicas))]">
                  {isNaN(item.value) ? "∞" : item.value.toFixed(6)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Resultados de triángulos */}
      {calcType === "triangle" && triangleResult && (
        <div className="space-y-4 animate-fade-in">
          <Card className="p-4 rounded-2xl">
            <h3 className="font-semibold mb-3">Resultados del Triángulo</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-muted rounded-xl text-center">
                <div className="text-sm text-muted-foreground">Lado c</div>
                <div className="text-xl font-bold text-primary">{triangleResult.sides.c.toFixed(4)}</div>
              </div>
              <div className="p-3 bg-muted rounded-xl text-center">
                <div className="text-sm text-muted-foreground">Área</div>
                <div className="text-xl font-bold text-emerald-500">{triangleResult.area.toFixed(4)}</div>
              </div>
              <div className="p-3 bg-muted rounded-xl text-center">
                <div className="text-sm text-muted-foreground">Ángulo A</div>
                <div className="text-lg font-bold">{triangleResult.angles.A.toFixed(2)}°</div>
              </div>
              <div className="p-3 bg-muted rounded-xl text-center">
                <div className="text-sm text-muted-foreground">Ángulo B</div>
                <div className="text-lg font-bold">{triangleResult.angles.B.toFixed(2)}°</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 rounded-2xl">
            <h3 className="font-semibold mb-3">Procedimiento</h3>
            <div className="space-y-2">
              {triangleResult.steps.map((step, idx) => (
                <div key={idx} className="p-2 bg-muted rounded-lg font-mono text-sm">
                  {step}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Identidades */}
      {calcType === "identity" && identityAngle && (
        <Card className="p-4 rounded-2xl animate-fade-in">
          <h3 className="font-semibold mb-3">Identidades para θ = {identityAngle}°</h3>
          <div className="space-y-3">
            {identities.map((id, idx) => (
              <div key={idx} className="p-3 bg-muted rounded-xl">
                <div className="text-sm font-medium text-primary">{id.name}</div>
                <div className="font-mono text-sm text-muted-foreground">{id.formula}</div>
                <div className="font-mono text-sm mt-1">{id.result}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
