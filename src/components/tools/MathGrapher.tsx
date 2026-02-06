import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sigma, Calculator, Triangle, PieChart, Code, LineChart, Grid3x3 } from "lucide-react";
import { MathHistoryItem } from "./math/types";
import { BasicCalculator } from "./math/BasicCalculator";
import { TrigCalculator } from "./math/TrigCalculator";
import { TriangleCalculator } from "./math/TriangleCalculator";
import { AlgebraCalculator } from "./math/AlgebraCalculator";
import { CalculusCalculator } from "./math/CalculusCalculator";
import { GraphCalculator } from "./math/GraphCalculator";
import { IdentityVerifier } from "./math/IdentityVerifier";
import { HistoryPanel } from "./math/HistoryPanel";

export function MathGrapher() {
  const [calcType, setCalcType] = useState<string>("basic");
  const [precision, setPrecision] = useState(6);
  const [history, setHistory] = useState<MathHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("mathgrapher_history");
      if (saved) {
        return JSON.parse(saved).map((item: any) => ({
          ...item,
          timestamp: item.timestamp ? new Date(item.timestamp) : new Date()
        }));
      }
    } catch {}
    return [];
  });

  const addToHistory = useCallback((type: string, input: string, result: string) => {
    const newItem: MathHistoryItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type, input,
      result: result.length > 100 ? result.substring(0, 100) + "..." : result,
      timestamp: new Date()
    };
    setHistory(prev => {
      const updated = [newItem, ...prev.slice(0, 49)];
      localStorage.setItem("mathgrapher_history", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const tabs = [
    { value: "basic", icon: Calculator, label: "Básica" },
    { value: "trig", icon: PieChart, label: "Trigonometría" },
    { value: "triangle", icon: Triangle, label: "Triángulos" },
    { value: "algebra", icon: Code, label: "Álgebra" },
    { value: "calculus", icon: Sigma, label: "Cálculo" },
    { value: "graph", icon: LineChart, label: "Gráficas" },
    { value: "identity", icon: Grid3x3, label: "Identidades" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4 rounded-2xl border-l-4" style={{ borderLeftColor: "hsl(var(--matematicas))" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "hsl(var(--matematicas) / 0.15)" }}
            >
              <Sigma className="h-6 w-6" style={{ color: "hsl(var(--matematicas))" }} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Calculadora Matemática Pro</h2>
              <div className="flex items-center gap-1 flex-wrap">
                {tabs.map((t) => (
                  <Badge key={t.value} variant="outline" className="text-[10px] h-4 px-1">
                    {t.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">Precisión:</Label>
            <Select value={precision.toString()} onValueChange={(v) => setPrecision(parseInt(v))}>
              <SelectTrigger className="w-24 h-8 rounded-lg text-xs">
                <SelectValue>{precision} dec</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {[2, 4, 6, 8, 10, 12, 16].map(n => (
                  <SelectItem key={n} value={n.toString()}>{n} decimales</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={calcType} onValueChange={setCalcType} className="w-full">
          <TabsList className="w-full rounded-xl mb-4 flex overflow-x-auto gap-1 p-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger key={t.value} value={t.value} className="rounded-lg gap-1.5 flex-shrink-0 text-xs px-3">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="basic"><BasicCalculator precision={precision} onResult={(i, r) => addToHistory("basic", i, r)} /></TabsContent>
          <TabsContent value="trig"><TrigCalculator precision={precision} onResult={(i, r) => addToHistory("trig", i, r)} /></TabsContent>
          <TabsContent value="triangle"><TriangleCalculator precision={precision} onResult={(i, r) => addToHistory("triangle", i, r)} /></TabsContent>
          <TabsContent value="algebra"><AlgebraCalculator precision={precision} onResult={(i, r) => addToHistory("algebra", i, r)} /></TabsContent>
          <TabsContent value="calculus"><CalculusCalculator precision={precision} onResult={(i, r) => addToHistory("calculus", i, r)} /></TabsContent>
          <TabsContent value="graph"><GraphCalculator precision={precision} onResult={(i, r) => addToHistory("graph", i, r)} /></TabsContent>
          <TabsContent value="identity"><IdentityVerifier precision={precision} onResult={(i, r) => addToHistory("identity", i, r)} /></TabsContent>
        </Tabs>
      </Card>

      {/* History */}
      <HistoryPanel
        history={history}
        onClear={() => { setHistory([]); localStorage.removeItem("mathgrapher_history"); }}
      />
    </div>
  );
}
