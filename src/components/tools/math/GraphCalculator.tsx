import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart as LineChartIcon, CheckCircle, AlertCircle, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter
} from "recharts";
import { FunctionData, GraphRange } from "./types";
import { generateGraphData } from "./mathUtils";
import { GRAPH_COLORS, COMMON_FUNCTIONS } from "./constants";

interface GraphCalculatorProps {
  precision: number;
  onResult?: (input: string, result: string) => void;
}

export function GraphCalculator({ precision, onResult }: GraphCalculatorProps) {
  const [functionInput, setFunctionInput] = useState("sin(x)");
  const [graphRange, setGraphRange] = useState<GraphRange>({ min: -10, max: 10, step: 0.1 });
  const [graphData, setGraphData] = useState<FunctionData | null>(null);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [showDerivative, setShowDerivative] = useState(false);
  const [showIntegral, setShowIntegral] = useState(false);
  const [graphType, setGraphType] = useState<"line" | "bar" | "area" | "scatter">("line");
  const [graphColor, setGraphColor] = useState(GRAPH_COLORS[0]);

  const generate = useCallback(() => {
    const { data, error } = generateGraphData(functionInput, graphRange, showDerivative, showIntegral);
    setGraphData(data);
    setGraphError(error);
    if (data) {
      onResult?.(`f(x) = ${functionInput}`, `[${graphRange.min}, ${graphRange.max}]`);
    }
  }, [functionInput, graphRange, showDerivative, showIntegral, onResult]);

  useEffect(() => {
    if (functionInput) generate();
  }, [functionInput, graphRange, showDerivative, showIntegral]);

  const zoom = (factor: number) => {
    setGraphRange(prev => ({
      ...prev,
      min: prev.min * factor,
      max: prev.max * factor
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Controls */}
      <Card className="p-4 rounded-2xl">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
          <LineChartIcon className="h-5 w-5 text-primary" />
          Graficador de Funciones
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Función f(x)</Label>
            <Input
              value={functionInput}
              onChange={(e) => setFunctionInput(e.target.value)}
              className="rounded-xl h-11 font-mono"
              placeholder="sin(x), x^2, exp(x)"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {COMMON_FUNCTIONS.map((f) => (
              <Badge
                key={f.label} variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs transition-colors"
                onClick={() => setFunctionInput(f.value)}
              >
                {f.label}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Min X</Label>
              <Input
                type="number" value={graphRange.min}
                onChange={(e) => setGraphRange(prev => ({ ...prev, min: parseFloat(e.target.value) || -10 }))}
                className="rounded-xl h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max X</Label>
              <Input
                type="number" value={graphRange.max}
                onChange={(e) => setGraphRange(prev => ({ ...prev, max: parseFloat(e.target.value) || 10 }))}
                className="rounded-xl h-9"
              />
            </div>
          </div>

          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="flex-1 gap-1 rounded-lg" onClick={() => zoom(0.5)}>
              <ZoomIn className="h-3 w-3" /> Zoom +
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1 rounded-lg" onClick={() => zoom(2)}>
              <ZoomOut className="h-3 w-3" /> Zoom -
            </Button>
            <Button variant="outline" size="sm" className="gap-1 rounded-lg" onClick={() => setGraphRange({ min: -10, max: 10, step: 0.1 })}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Tipo de gráfica</Label>
            <Select value={graphType} onValueChange={(v: any) => setGraphType(v)}>
              <SelectTrigger className="rounded-xl h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Línea</SelectItem>
                <SelectItem value="area">Área</SelectItem>
                <SelectItem value="bar">Barras</SelectItem>
                <SelectItem value="scatter">Dispersión</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Mostrar derivada f'(x)</Label>
              <Switch checked={showDerivative} onCheckedChange={setShowDerivative} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Mostrar integral ∫f(x)dx</Label>
              <Switch checked={showIntegral} onCheckedChange={setShowIntegral} />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Color</Label>
            <div className="flex gap-1 flex-wrap">
              {GRAPH_COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${graphColor === color ? "scale-125 border-foreground" : "border-transparent"}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setGraphColor(color)}
                />
              ))}
            </div>
          </div>

          <Button onClick={generate} className="w-full h-11 gap-2 rounded-xl">
            <CheckCircle className="h-4 w-4" />
            Generar Gráfica
          </Button>
        </div>
      </Card>

      {/* Graph */}
      <Card className="p-4 rounded-2xl lg:col-span-2">
        {graphError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{graphError}</AlertDescription>
          </Alert>
        )}

        {graphData ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">
                f(x) = {functionInput}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {graphData.points.length} puntos
              </Badge>
            </div>

            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {graphType === "line" ? (
                  <LineChart data={graphData.points}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="x" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="y" stroke={graphColor} strokeWidth={2} dot={false} name="f(x)" />
                    {showDerivative && graphData.derivativePoints && (
                      <Line type="monotone" data={graphData.derivativePoints} dataKey="y" stroke="#ef4444" strokeWidth={2} dot={false} name="f'(x)" />
                    )}
                    {showIntegral && graphData.integralPoints && (
                      <Line type="monotone" data={graphData.integralPoints} dataKey="y" stroke="#10b981" strokeWidth={2} dot={false} name="∫f(x)dx" />
                    )}
                  </LineChart>
                ) : graphType === "area" ? (
                  <AreaChart data={graphData.points}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="x" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Area type="monotone" dataKey="y" stroke={graphColor} fill={`${graphColor}40`} />
                  </AreaChart>
                ) : graphType === "bar" ? (
                  <BarChart data={graphData.points.slice(0, 50)}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="x" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="y" fill={graphColor} />
                  </BarChart>
                ) : (
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="x" className="text-xs" />
                    <YAxis dataKey="y" className="text-xs" />
                    <Tooltip />
                    <Scatter data={graphData.points} fill={graphColor} />
                  </ScatterChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Dominio: </span>
                <span className="font-mono font-bold">[{graphData.domain[0]}, {graphData.domain[1]}]</span>
              </div>
              <div className="p-2 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Rango: </span>
                <span className="font-mono font-bold">[{graphData.range[0].toFixed(2)}, {graphData.range[1].toFixed(2)}]</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <LineChartIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p>Ingrese una función para graficar</p>
          </div>
        )}
      </Card>
    </div>
  );
}
