import { useState, useMemo, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Sigma, Calculator, Triangle, PieChart, 
  LineChart, Grid3x3, History, // Removido Function
  Zap, RotateCw, Download, Share2,
  ChevronRight, Info, HelpCircle,
  Check, X, Minus, Divide, Plus,
  Save, Copy, Trash2, Moon, Sun,
  Square, Code, Variable, Hash, // Añadidos nuevos íconos
  Braces, Parentheses, Equal
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';

interface TrigResult {
  angle: number;
  sin: number;
  cos: number;
  tan: number;
  cot: number;
  sec: number;
  csc: number;
  exactValues?: {
    sin: string;
    cos: string;
    tan: string;
  };
}

interface TriangleResult {
  sides: { a: number; b: number; c: number };
  angles: { A: number; B: number; C: number };
  area: number;
  perimeter: number;
  type: string;
  steps: string[];
  height: number;
  inscribedRadius: number;
  circumscribedRadius: number;
}

interface GraphPoint {
  x: number;
  y: number;
}

interface FunctionData {
  points: GraphPoint[];
  domain: [number, number];
  range: [number, number];
  derivativePoints?: GraphPoint[];
  integralPoints?: GraphPoint[];
}

interface MathHistoryItem {
  id: string;
  type: string;
  input: string;
  result: string;
  timestamp: Date;
}

interface CalculusResult {
  derivative: string;
  integral: string;
  limit: string;
}

export function MathGrapher() {
  const [calcType, setCalcType] = useState<"trig" | "triangle" | "identity" | "graph" | "basic" | "algebra" | "calculus">("basic");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [precision, setPrecision] = useState(6);
  const [history, setHistory] = useState<MathHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [graphType, setGraphType] = useState<"line" | "bar" | "area">("line");
  
  // Trigonometría avanzada
  const [angle, setAngle] = useState("45");
  const [angleUnit, setAngleUnit] = useState<"deg" | "rad" | "grad">("deg");
  const [trigResult, setTrigResult] = useState<TrigResult | null>(null);
  
  // Triángulos avanzados
  const [triangleType, setTriangleType] = useState<"SSS" | "SAS" | "ASA" | "AAS">("SAS");
  const [sideA, setSideA] = useState("5");
  const [sideB, setSideB] = useState("7");
  const [sideC, setSideC] = useState("");
  const [angleA, setAngleA] = useState("");
  const [angleB, setAngleB] = useState("");
  const [angleC, setAngleC] = useState("60");
  const [triangleResult, setTriangleResult] = useState<TriangleResult | null>(null);
  
  // Identidades avanzadas
  const [identityAngle, setIdentityAngle] = useState("30");
  const [identityType, setIdentityType] = useState<"basic" | "advanced" | "inverse">("basic");
  
  // Gráficas
  const [functionInput, setFunctionInput] = useState("sin(x)");
  const [graphRange, setGraphRange] = useState({ min: -10, max: 10, step: 0.1 });
  const [graphData, setGraphData] = useState<FunctionData | null>(null);
  const [showDerivative, setShowDerivative] = useState(false);
  const [showIntegral, setShowIntegral] = useState(false);
  const [graphColor, setGraphColor] = useState("#3b82f6");
  
  // Calculadora básica
  const [basicInput, setBasicInput] = useState("");
  const [basicResult, setBasicResult] = useState<string>("0");
  
  // Álgebra
  const [equation, setEquation] = useState("");
  const [algebraResult, setAlgebraResult] = useState<string[]>([]);
  const [equationType, setEquationType] = useState<"linear" | "quadratic" | "system">("linear");
  
  // Cálculo
  const [calculusFunction, setCalculusFunction] = useState("x^2");
  const [calculusType, setCalculusType] = useState<"derivative" | "integral" | "limit">("derivative");
  const [calculusResult, setCalculusResult] = useState<CalculusResult>({
    derivative: "",
    integral: "",
    limit: ""
  });
  
  const [atPoint, setAtPoint] = useState("0");
  
  const notableAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
  
  const exactValues = useMemo(() => ({
    0: { sin: "0", cos: "1", tan: "0" },
    30: { sin: "1/2", cos: "√3/2", tan: "√3/3" },
    45: { sin: "√2/2", cos: "√2/2", tan: "1" },
    60: { sin: "√3/2", cos: "1/2", tan: "√3" },
    90: { sin: "1", cos: "0", tan: "∞" },
    120: { sin: "√3/2", cos: "-1/2", tan: "-√3" },
    135: { sin: "√2/2", cos: "-√2/2", tan: "-1" },
    150: { sin: "1/2", cos: "-√3/2", tan: "-√3/3" },
    180: { sin: "0", cos: "-1", tan: "0" },
    210: { sin: "-1/2", cos: "-√3/2", tan: "√3/3" },
    225: { sin: "-√2/2", cos: "-√2/2", tan: "1" },
    240: { sin: "-√3/2", cos: "-1/2", tan: "√3" },
    270: { sin: "-1", cos: "0", tan: "∞" },
    300: { sin: "-√3/2", cos: "1/2", tan: "-√3" },
    315: { sin: "-√2/2", cos: "√2/2", tan: "-1" },
    330: { sin: "-1/2", cos: "√3/2", tan: "-√3/3" },
    360: { sin: "0", cos: "1", tan: "0" }
  }), []);

  const addToHistory = (type: string, input: string, result: string) => {
    const newItem: MathHistoryItem = {
      id: Date.now().toString(),
      type,
      input,
      result: result.length > 50 ? result.substring(0, 50) + "..." : result,
      timestamp: new Date()
    };
    setHistory(prev => [newItem, ...prev.slice(0, 19)]);
  };

  const calculateTrig = () => {
    setIsLoading(true);
    setTimeout(() => {
      let angleRad = parseFloat(angle) || 0;
      let angleDeg = angleRad;
      
      if (angleUnit === "deg") {
        angleRad = (angleRad * Math.PI) / 180;
      } else if (angleUnit === "grad") {
        angleRad = (angleRad * Math.PI) / 200;
        angleDeg = (angleRad * 180) / Math.PI;
      }
      
      const sinVal = Math.sin(angleRad);
      const cosVal = Math.cos(angleRad);
      const tanVal = Math.tan(angleRad);
      
      const result: TrigResult = {
        angle: parseFloat(angle) || 0,
        sin: sinVal,
        cos: cosVal,
        tan: Math.abs(cosVal) < 1e-10 ? NaN : tanVal,
        cot: Math.abs(sinVal) < 1e-10 ? NaN : 1 / tanVal,
        sec: Math.abs(cosVal) < 1e-10 ? NaN : 1 / cosVal,
        csc: Math.abs(sinVal) < 1e-10 ? NaN : 1 / sinVal
      };
      
      if (angleUnit === "deg") {
        const roundedAngle = Math.round(angleDeg);
        if (exactValues[roundedAngle as keyof typeof exactValues]) {
          result.exactValues = exactValues[roundedAngle as keyof typeof exactValues];
        }
      }
      
      setTrigResult(result);
      addToHistory("trig", `Ángulo: ${angle}${angleUnit === "deg" ? "°" : angleUnit === "rad" ? " rad" : " grad"}`, 
        `sin=${sinVal.toFixed(precision)}, cos=${cosVal.toFixed(precision)}`);
      setIsLoading(false);
    }, 300);
  };

  const calculateTriangle = () => {
    setIsLoading(true);
    setTimeout(() => {
      const steps: string[] = [];
      let a = parseFloat(sideA) || 0;
      let b = parseFloat(sideB) || 0;
      let c = parseFloat(sideC) || 0;
      let A = (parseFloat(angleA) || 0) * Math.PI / 180;
      let B = (parseFloat(angleB) || 0) * Math.PI / 180;
      let C = (parseFloat(angleC) || 0) * Math.PI / 180;
      
      const deg = (rad: number) => (rad * 180 / Math.PI).toFixed(2);
      
      switch (triangleType) {
        case "SAS":
          c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C));
          steps.push(`1. Ley de cosenos para hallar c:`);
          steps.push(`   c² = a² + b² - 2ab·cos(C)`);
          steps.push(`   c² = ${a}² + ${b}² - 2·${a}·${b}·cos(${(C * 180 / Math.PI).toFixed(2)}°)`);
          steps.push(`   c = ${c.toFixed(4)}`);
          
          A = Math.asin((a * Math.sin(C)) / c);
          steps.push(`2. Ley de senos para hallar A:`);
          steps.push(`   sin(A)/a = sin(C)/c`);
          steps.push(`   A = arcsin((${a}·sin(${(C * 180 / Math.PI).toFixed(2)}°))/${c.toFixed(4)})`);
          steps.push(`   A = ${deg(A)}°`);
          
          B = Math.PI - A - C;
          steps.push(`3. Suma de ángulos para hallar B:`);
          steps.push(`   B = 180° - A - C`);
          steps.push(`   B = 180° - ${deg(A)}° - ${(C * 180 / Math.PI).toFixed(2)}°`);
          steps.push(`   B = ${deg(B)}°`);
          break;
          
        case "SSS":
          A = Math.acos((b * b + c * c - a * a) / (2 * b * c));
          steps.push(`1. Ley de cosenos para hallar A:`);
          steps.push(`   A = arccos((b² + c² - a²)/(2bc))`);
          steps.push(`   A = arccos((${b}² + ${c}² - ${a}²)/(2·${b}·${c}))`);
          steps.push(`   A = ${deg(A)}°`);
          
          B = Math.acos((a * a + c * c - b * b) / (2 * a * c));
          steps.push(`2. Ley de cosenos para hallar B:`);
          steps.push(`   B = arccos((a² + c² - b²)/(2ac))`);
          steps.push(`   B = arccos((${a}² + ${c}² - ${b}²)/(2·${a}·${c}))`);
          steps.push(`   B = ${deg(B)}°`);
          
          C = Math.PI - A - B;
          steps.push(`3. Suma de ángulos para hallar C:`);
          steps.push(`   C = 180° - A - B`);
          steps.push(`   C = 180° - ${deg(A)}° - ${deg(B)}°`);
          steps.push(`   C = ${deg(C)}°`);
          break;
          
        case "ASA":
          A = (parseFloat(angleA) || 0) * Math.PI / 180;
          C = (parseFloat(angleC) || 0) * Math.PI / 180;
          b = parseFloat(sideB) || 0;
          B = Math.PI - A - C;
          steps.push(`1. Suma de ángulos para hallar B:`);
          steps.push(`   B = 180° - A - C`);
          steps.push(`   B = 180° - ${(A * 180 / Math.PI).toFixed(2)}° - ${(C * 180 / Math.PI).toFixed(2)}°`);
          steps.push(`   B = ${deg(B)}°`);
          
          a = (b * Math.sin(A)) / Math.sin(B);
          steps.push(`2. Ley de senos para hallar a:`);
          steps.push(`   a/sin(A) = b/sin(B)`);
          steps.push(`   a = b·sin(A)/sin(B)`);
          steps.push(`   a = ${b}·sin(${(A * 180 / Math.PI).toFixed(2)}°)/sin(${deg(B)}°)`);
          steps.push(`   a = ${a.toFixed(4)}`);
          
          c = (b * Math.sin(C)) / Math.sin(B);
          steps.push(`3. Ley de senos para hallar c:`);
          steps.push(`   c/sin(C) = b/sin(B)`);
          steps.push(`   c = b·sin(C)/sin(B)`);
          steps.push(`   c = ${b}·sin(${(C * 180 / Math.PI).toFixed(2)}°)/sin(${deg(B)}°)`);
          steps.push(`   c = ${c.toFixed(4)}`);
          break;
          
        case "AAS":
          A = (parseFloat(angleA) || 0) * Math.PI / 180;
          B = (parseFloat(angleB) || 0) * Math.PI / 180;
          a = parseFloat(sideA) || 0;
          C = Math.PI - A - B;
          steps.push(`1. Suma de ángulos para hallar C:`);
          steps.push(`   C = 180° - A - B`);
          steps.push(`   C = 180° - ${(A * 180 / Math.PI).toFixed(2)}° - ${(B * 180 / Math.PI).toFixed(2)}°`);
          steps.push(`   C = ${deg(C)}°`);
          
          b = (a * Math.sin(B)) / Math.sin(A);
          steps.push(`2. Ley de senos para hallar b:`);
          steps.push(`   b/sin(B) = a/sin(A)`);
          steps.push(`   b = a·sin(B)/sin(A)`);
          steps.push(`   b = ${a}·sin(${(B * 180 / Math.PI).toFixed(2)}°)/sin(${(A * 180 / Math.PI).toFixed(2)}°)`);
          steps.push(`   b = ${b.toFixed(4)}`);
          
          c = (a * Math.sin(C)) / Math.sin(A);
          steps.push(`3. Ley de senos para hallar c:`);
          steps.push(`   c/sin(C) = a/sin(A)`);
          steps.push(`   c = a·sin(C)/sin(A)`);
          steps.push(`   c = ${a}·sin(${deg(C)}°)/sin(${(A * 180 / Math.PI).toFixed(2)}°)`);
          steps.push(`   c = ${c.toFixed(4)}`);
          break;
      }
      
      const area = 0.5 * a * b * Math.sin(C);
      const perimeter = a + b + c;
      const s = perimeter / 2;
      const inscribedRadius = Math.sqrt((s - a) * (s - b) * (s - c) / s) || 0;
      const circumscribedRadius = (a * b * c) / (4 * Math.sqrt(s * (s - a) * (s - b) * (s - c))) || 0;
      
      let type = "Escaleno";
      if (Math.abs(a - b) < 0.001 && Math.abs(b - c) < 0.001) type = "Equilátero";
      else if (Math.abs(a - b) < 0.001 || Math.abs(b - c) < 0.001 || Math.abs(a - c) < 0.001) type = "Isósceles";
      
      if (Math.max(A, B, C) > Math.PI / 2 + 0.01) type += " Obtusángulo";
      else if (Math.abs(Math.max(A, B, C) - Math.PI / 2) < 0.01) type += " Rectángulo";
      else type += " Acutángulo";
      
      const result: TriangleResult = {
        sides: { a, b, c },
        angles: { A: parseFloat(deg(A)), B: parseFloat(deg(B)), C: parseFloat(deg(C)) },
        area,
        perimeter,
        type,
        steps,
        height: (2 * area) / a,
        inscribedRadius,
        circumscribedRadius
      };
      
      setTriangleResult(result);
      addToHistory("triangle", `Triángulo ${triangleType}`, `Área: ${area.toFixed(2)}, Perímetro: ${perimeter.toFixed(2)}`);
      setIsLoading(false);
    }, 500);
  };

  const generateGraphData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const points: GraphPoint[] = [];
      const derivativePoints: GraphPoint[] = [];
      const integralPoints: GraphPoint[] = [];
      
      try {
        const func = new Function('x', `return ${functionInput
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/exp\(/g, 'Math.exp(')
          .replace(/abs\(/g, 'Math.abs(')
          .replace(/pow\(/g, 'Math.pow(')
          .replace(/\^/g, '**')}`);
        
        let integralSum = 0;
        
        for (let x = graphRange.min; x <= graphRange.max; x += graphRange.step) {
          try {
            const y = func(x);
            if (isFinite(y)) {
              points.push({ x, y });
              
              if (showDerivative) {
                const h = 0.001;
                const y1 = func(x + h);
                const derivative = (y1 - y) / h;
                if (isFinite(derivative)) {
                  derivativePoints.push({ x, y: derivative });
                }
              }
              
              if (showIntegral && x > graphRange.min) {
                const prevX = x - graphRange.step;
                const prevY = func(prevX);
                if (isFinite(prevY)) {
                  integralSum += (y + prevY) * graphRange.step / 2;
                  integralPoints.push({ x, y: integralSum });
                }
              }
            }
          } catch (e) {
            console.error("Error en punto x=", x, e);
          }
        }
        
        const yValues = points.map(p => p.y).filter(y => isFinite(y));
        const minY = yValues.length > 0 ? Math.min(...yValues) : -10;
        const maxY = yValues.length > 0 ? Math.max(...yValues) : 10;
        
        setGraphData({
          points,
          domain: [graphRange.min, graphRange.max],
          range: [minY, maxY],
          derivativePoints: showDerivative ? derivativePoints : undefined,
          integralPoints: showIntegral ? integralPoints : undefined
        });
        
        addToHistory("graph", `f(x) = ${functionInput}`, `Dominio: [${graphRange.min}, ${graphRange.max}]`);
      } catch (error) {
        console.error("Error al generar gráfica:", error);
        setGraphData(null);
      }
      setIsLoading(false);
    }, 400);
  };

  const calculateBasic = () => {
    try {
      const expression = basicInput
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/exp\(/g, 'Math.exp(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/π/g, 'Math.PI')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/\^/g, '**');
      
      const result = eval(expression);
      setBasicResult(result.toFixed(precision));
      addToHistory("basic", basicInput, result.toString());
    } catch (error) {
      setBasicResult("Error de sintaxis");
    }
  };

  const solveEquation = () => {
    try {
      const eq = equation.toLowerCase().replace(/\s/g, '');
      const results: string[] = [];
      
      if (equationType === "quadratic" && eq.includes('x^2')) {
        const parts = eq.split('=');
        const left = parts[0];
        const right = parts[1] || '0';
        
        const match = left.match(/(-?\d*\.?\d*)x\^2\s*([+-]\s*\d*\.?\d*)x?\s*([+-]\s*\d*\.?\d*)?/);
        
        if (match) {
          let a = match[1] === '' || match[1] === '-' ? (match[1] === '-' ? -1 : 1) : parseFloat(match[1]);
          let b = match[2] ? parseFloat(match[2].replace(/\s/g, '')) : 0;
          let c = match[3] ? parseFloat(match[3].replace(/\s/g, '')) : 0;
          
          const constant = parseFloat(right) || 0;
          c -= constant;
          
          const discriminant = b * b - 4 * a * c;
          
          if (discriminant > 0) {
            const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            results.push(`x₁ = ${x1.toFixed(precision)}`, `x₂ = ${x2.toFixed(precision)}`);
            results.push(`Discriminante: ${discriminant.toFixed(precision)} (positivo)`);
          } else if (discriminant === 0) {
            const x = -b / (2 * a);
            results.push(`x = ${x.toFixed(precision)} (raíz doble)`);
            results.push(`Discriminante: 0`);
          } else {
            const real = -b / (2 * a);
            const imag = Math.sqrt(-discriminant) / (2 * a);
            results.push(`x₁ = ${real.toFixed(precision)} + ${imag.toFixed(precision)}i`, 
                         `x₂ = ${real.toFixed(precision)} - ${imag.toFixed(precision)}i`);
            results.push(`Discriminante: ${discriminant.toFixed(precision)} (negativo)`);
          }
        }
      } else if (equationType === "linear" && eq.includes('x')) {
        const parts = eq.split('=');
        const left = parts[0];
        const right = parts[1] || '0';
        
        const xMatch = left.match(/(-?\d*\.?\d*)x/);
        const constantMatch = left.match(/([+-]\s*\d*\.?\d*)(?![\d*x])/);
        
        let a = xMatch ? (xMatch[1] === '' || xMatch[1] === '-' ? (xMatch[1] === '-' ? -1 : 1) : parseFloat(xMatch[1])) : 0;
        let b = constantMatch ? parseFloat(constantMatch[1].replace(/\s/g, '')) : 0;
        const c = parseFloat(right) || 0;
        
        b -= c;
        
        if (a !== 0) {
          const x = -b / a;
          results.push(`x = ${x.toFixed(precision)}`);
        } else if (b === 0) {
          results.push(`Ecuación indeterminada (infinitas soluciones)`);
        } else {
          results.push(`Ecuación sin solución (contradicción)`);
        }
      }
      
      setAlgebraResult(results);
      if (results.length > 0) {
        addToHistory("algebra", equation, results[0]);
      }
    } catch (error) {
      setAlgebraResult(["Error al resolver la ecuación"]);
    }
  };

  const calculateCalculus = () => {
    try {
      const f = calculusFunction;
      const point = parseFloat(atPoint) || 0;
      let derivative = "";
      let integral = "";
      let limit = "";
      
      if (calculusType === "derivative") {
        if (f.includes('x^')) {
          const match = f.match(/(-?\d*\.?\d*)x\^(\d*\.?\d*)/);
          if (match) {
            const coef = match[1] === '' || match[1] === '-' ? (match[1] === '-' ? -1 : 1) : parseFloat(match[1]);
            const power = parseFloat(match[2]);
            derivative = `f'(x) = ${(coef * power).toFixed(precision)}x^${(power - 1).toFixed(precision)}`;
            if (!isNaN(point)) {
              const value = coef * power * Math.pow(point, power - 1);
              derivative += `, f'(${point}) = ${value.toFixed(precision)}`;
            }
          }
        } else if (f.includes('sin(x)')) {
          derivative = "f'(x) = cos(x)";
          if (!isNaN(point)) {
            derivative += `, f'(${point}) = ${Math.cos(point).toFixed(precision)}`;
          }
        } else if (f.includes('cos(x)')) {
          derivative = "f'(x) = -sin(x)";
          if (!isNaN(point)) {
            derivative += `, f'(${point}) = ${(-Math.sin(point)).toFixed(precision)}`;
          }
        } else if (f.includes('e^x')) {
          derivative = "f'(x) = e^x";
          if (!isNaN(point)) {
            derivative += `, f'(${point}) = ${Math.exp(point).toFixed(precision)}`;
          }
        } else if (f.includes('x')) {
          derivative = "f'(x) = 1";
          if (!isNaN(point)) {
            derivative += `, f'(${point}) = 1`;
          }
        }
      } else if (calculusType === "integral") {
        if (f.includes('x^')) {
          const match = f.match(/(-?\d*\.?\d*)x\^(\d*\.?\d*)/);
          if (match) {
            const coef = match[1] === '' || match[1] === '-' ? (match[1] === '-' ? -1 : 1) : parseFloat(match[1]);
            const power = parseFloat(match[2]);
            const newPower = power + 1;
            integral = `∫f(x)dx = ${(coef / newPower).toFixed(precision)}x^${newPower.toFixed(precision)} + C`;
          }
        } else if (f.includes('sin(x)')) {
          integral = "∫f(x)dx = -cos(x) + C";
        } else if (f.includes('cos(x)')) {
          integral = "∫f(x)dx = sin(x) + C";
        } else if (f.includes('e^x')) {
          integral = "∫f(x)dx = e^x + C";
        } else if (f.includes('x')) {
          integral = "∫f(x)dx = (1/2)x² + C";
        }
      } else if (calculusType === "limit") {
        if (f.includes('/x') || f.includes('1/x')) {
          limit = "lim(x→0) f(x) = ∞";
        } else {
          limit = `lim(x→${point}) f(x) = ${point * 2}`;
        }
      }
      
      const newResult: CalculusResult = {
        derivative: calculusType === "derivative" ? derivative : calculusResult.derivative,
        integral: calculusType === "integral" ? integral : calculusResult.integral,
        limit: calculusType === "limit" ? limit : calculusResult.limit
      };
      
      setCalculusResult(newResult);
      const currentResult = calculusType === "derivative" ? derivative : calculusType === "integral" ? integral : limit;
      if (currentResult) {
        addToHistory("calculus", `${calculusType}: ${f}`, currentResult);
      }
    } catch (error) {
      setCalculusResult({
        ...calculusResult,
        [calculusType]: "Error en cálculo"
      });
    }
  };

  const identities = useMemo(() => {
    const ang = parseFloat(identityAngle) || 0;
    const rad = (ang * Math.PI) / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    const tan = Math.tan(rad);
    
    const basicIdents = [
      {
        name: "Pitagórica fundamental",
        formula: "sin²(θ) + cos²(θ) = 1",
        result: `${(sin * sin).toFixed(precision)} + ${(cos * cos).toFixed(precision)} = ${(sin * sin + cos * cos).toFixed(precision)}`,
        verified: Math.abs(sin * sin + cos * cos - 1) < 0.0001
      },
      {
        name: "Tangente",
        formula: "tan(θ) = sin(θ) / cos(θ)",
        result: `tan(${ang}°) = ${sin.toFixed(precision)} / ${cos.toFixed(precision)} = ${(sin / cos).toFixed(precision)}`,
        verified: Math.abs(tan - (sin / cos)) < 0.0001
      },
      {
        name: "Recíprocas",
        formula: "sin(θ) · csc(θ) = 1",
        result: `${sin.toFixed(precision)} × ${(1/sin).toFixed(precision)} = ${(sin * (1/sin)).toFixed(precision)}`,
        verified: Math.abs(sin * (1/sin) - 1) < 0.0001
      },
      {
        name: "Cofunción",
        formula: "sin(90° - θ) = cos(θ)",
        result: `sin(${90-ang}°) = cos(${ang}°) = ${cos.toFixed(precision)}`,
        verified: Math.abs(Math.sin((90-ang) * Math.PI / 180) - cos) < 0.0001
      }
    ];
    
    const advancedIdents = [
      {
        name: "Ángulo doble (seno)",
        formula: "sin(2θ) = 2·sin(θ)·cos(θ)",
        result: `sin(${2*ang}°) = 2 × ${sin.toFixed(precision)} × ${cos.toFixed(precision)} = ${(2 * sin * cos).toFixed(precision)}`,
        verified: Math.abs(Math.sin(2*rad) - (2 * sin * cos)) < 0.0001
      },
      {
        name: "Ángulo doble (coseno)",
        formula: "cos(2θ) = cos²(θ) - sin²(θ)",
        result: `cos(${2*ang}°) = ${(cos*cos).toFixed(precision)} - ${(sin*sin).toFixed(precision)} = ${(cos*cos - sin*sin).toFixed(precision)}`,
        verified: Math.abs(Math.cos(2*rad) - (cos*cos - sin*sin)) < 0.0001
      },
      {
        name: "Suma de ángulos (seno)",
        formula: "sin(α+β) = sinα·cosβ + cosα·sinβ",
        result: `sin(${ang+30}°) = sin${ang}°·cos30° + cos${ang}°·sin30° = ${(sin*Math.cos(30*Math.PI/180) + cos*Math.sin(30*Math.PI/180)).toFixed(precision)}`,
        verified: Math.abs(Math.sin((ang+30)*Math.PI/180) - (sin*Math.cos(30*Math.PI/180) + cos*Math.sin(30*Math.PI/180))) < 0.0001
      },
      {
        name: "Suma de ángulos (coseno)",
        formula: "cos(α+β) = cosα·cosβ - sinα·sinβ",
        result: `cos(${ang+30}°) = cos${ang}°·cos30° - sin${ang}°·sin30° = ${(cos*Math.cos(30*Math.PI/180) - sin*Math.sin(30*Math.PI/180)).toFixed(precision)}`,
        verified: Math.abs(Math.cos((ang+30)*Math.PI/180) - (cos*Math.cos(30*Math.PI/180) - sin*Math.sin(30*Math.PI/180))) < 0.0001
      }
    ];
    
    const inverseIdents = [
      {
        name: "Arcoseno",
        formula: "sin(arcsin(x)) = x",
        result: `sin(arcsin(${sin.toFixed(2)})) = ${Math.sin(Math.asin(sin)).toFixed(precision)}`,
        verified: Math.abs(Math.sin(Math.asin(sin)) - sin) < 0.0001
      },
      {
        name: "Arcoseno simetría",
        formula: "arcsin(-x) = -arcsin(x)",
        result: `arcsin(-${sin.toFixed(2)}) = -${Math.asin(sin).toFixed(precision)}`,
        verified: Math.abs(Math.asin(-sin) - (-Math.asin(sin))) < 0.0001
      },
      {
        name: "Arcotangente",
        formula: "tan(arctan(x)) = x",
        result: `tan(arctan(${tan.toFixed(2)})) = ${Math.tan(Math.atan(tan)).toFixed(precision)}`,
        verified: Math.abs(Math.tan(Math.atan(tan)) - tan) < 0.0001
      },
      {
        name: "Relación fundamental",
        formula: "arcsin(x) + arccos(x) = π/2",
        result: `arcsin(${sin.toFixed(2)}) + arccos(${sin.toFixed(2)}) = ${(Math.asin(sin) + Math.acos(sin)).toFixed(precision)} ≈ ${(Math.PI/2).toFixed(precision)}`,
        verified: Math.abs((Math.asin(sin) + Math.acos(sin)) - Math.PI/2) < 0.0001
      }
    ];
    
    return identityType === "basic" ? basicIdents : 
           identityType === "advanced" ? advancedIdents : inverseIdents;
  }, [identityAngle, identityType, precision]);

  useEffect(() => {
    if (calcType === "graph" && functionInput) {
      generateGraphData();
    }
  }, [functionInput, graphRange, showDerivative, showIntegral]);

  useEffect(() => {
    if (calcType === "trig" && angle) {
      calculateTrig();
    }
  }, [angle, angleUnit]);

  const copyResult = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const handleNumberClick = (num: string) => {
    setBasicInput(prev => prev + num);
  };

  const handleOperationClick = (op: string) => {
    setBasicInput(prev => prev + op);
  };

  const clearInput = () => {
    setBasicInput("");
    setBasicResult("0");
  };

  const calculateResult = () => {
    calculateBasic();
  };

  const renderGraph = () => {
    if (!graphData) return null;

    return (
      <ResponsiveContainer width="100%" height="100%">
        {graphType === "line" ? (
          <RechartsLineChart data={graphData.points}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="x" 
              label={{ value: 'x', position: 'insideBottom', offset: -5 }}
              stroke="#9CA3AF"
            />
            <YAxis 
              label={{ value: 'f(x)', angle: -90, position: 'insideLeft' }}
              stroke="#9CA3AF"
            />
            <Tooltip 
              formatter={(value) => [Number(value).toFixed(precision), 'f(x)']}
              labelFormatter={(label) => `x = ${Number(label).toFixed(precision)}`}
              contentStyle={{ backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="y"
              stroke={graphColor}
              strokeWidth={2}
              dot={false}
              name="f(x)"
            />
            {showDerivative && graphData.derivativePoints && (
              <Line
                type="monotone"
                data={graphData.derivativePoints}
                dataKey="y"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
                name="f'(x)"
              />
            )}
            {showIntegral && graphData.integralPoints && (
              <Line
                type="monotone"
                data={graphData.integralPoints}
                dataKey="y"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                name="∫f(x)dx"
              />
            )}
          </RechartsLineChart>
        ) : graphType === "area" ? (
          <AreaChart data={graphData.points}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="x" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip />
            <Area type="monotone" dataKey="y" stroke={graphColor} fill={`${graphColor}20`} />
          </AreaChart>
        ) : (
          <BarChart data={graphData.points.slice(0, 50)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="x" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip />
            <Bar dataKey="y" fill={graphColor} />
          </BarChart>
        )}
      </ResponsiveContainer>
    );
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"} transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <Card className="p-6 rounded-2xl border-l-4 shadow-lg mb-8" style={{ borderLeftColor: "hsl(var(--matematicas))" }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Sigma className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Calculadora Matemática Profesional
                </h1>
                <p className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Check className="h-3 w-3" /> Trigonometría
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" /> Álgebra
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" /> Cálculo
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" /> Gráficas
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" /> Geometría
                  </Badge>
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">Precisión:</Label>
                <Select value={precision.toString()} onValueChange={(v) => setPrecision(parseInt(v))}>
                  <SelectTrigger className="w-28">
                    <SelectValue>{precision} decimales</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 4, 6, 8, 10, 12].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} decimales</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="rounded-full"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={calcType} onValueChange={(v) => setCalcType(v as typeof calcType)} className="w-full">
            <TabsList className="w-full rounded-xl mb-8 grid grid-cols-2 md:grid-cols-7 gap-2 p-1 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="basic" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <Calculator className="h-4 w-4" />
                <span className="hidden md:inline">Básica</span>
              </TabsTrigger>
              <TabsTrigger value="trig" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <PieChart className="h-4 w-4" />
                <span className="hidden md:inline">Trigonometría</span>
              </TabsTrigger>
              <TabsTrigger value="triangle" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <Triangle className="h-4 w-4" />
                <span className="hidden md:inline">Triángulos</span>
              </TabsTrigger>
              <TabsTrigger value="algebra" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <Code className="h-4 w-4" /> {/* Cambiado de Function a Code */}
                <span className="hidden md:inline">Álgebra</span>
              </TabsTrigger>
              <TabsTrigger value="calculus" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <Sigma className="h-4 w-4" />
                <span className="hidden md:inline">Cálculo</span>
              </TabsTrigger>
              <TabsTrigger value="graph" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <LineChart className="h-4 w-4" />
                <span className="hidden md:inline">Gráficas</span>
              </TabsTrigger>
              <TabsTrigger value="identity" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <Grid3x3 className="h-4 w-4" />
                <span className="hidden md:inline">Identidades</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            
            {/* Basic Calculator */}
            <TabsContent value="basic" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="p-6">
                    <div className="mb-6">
                      <div className="text-right p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
                        <div className="text-sm text-muted-foreground text-left">Expresión:</div>
                        <div className="text-xl font-mono break-all min-h-8">{basicInput || "0"}</div>
                        <div className="text-3xl font-bold text-primary mt-2">{basicResult}</div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
                          <Button 
                            key={btn}
                            variant={btn === '=' ? "default" : "outline"}
                            size="lg"
                            className={`h-14 text-lg ${btn === '=' ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}`}
                            onClick={() => {
                              if (btn === '=') {
                                calculateResult();
                              } else {
                                handleNumberClick(btn);
                              }
                            }}
                          >
                            {btn}
                          </Button>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-5 gap-2">
                        {['C', '(', ')', '^', '√'].map((op) => (
                          <Button 
                            key={op}
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              if (op === 'C') {
                                clearInput();
                              } else if (op === '√') {
                                handleOperationClick('sqrt(');
                              } else {
                                handleOperationClick(op);
                              }
                            }}
                          >
                            {op}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">Funciones matemáticas</Label>
                        <div className="flex flex-wrap gap-2">
                          {['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'exp(', 'abs(', 'π', 'e'].map((func) => (
                            <Badge
                              key={func}
                              variant="outline"
                              className="cursor-pointer px-3 py-2 hover:bg-primary hover:text-primary-foreground"
                              onClick={() => handleOperationClick(func)}
                            >
                              {func}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Input
                          value={basicInput}
                          onChange={(e) => setBasicInput(e.target.value)}
                          placeholder="Ej: 2+3*sin(π/4)+sqrt(9)"
                          className="flex-1 h-12"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              calculateResult();
                            }
                          }}
                        />
                        <Button onClick={calculateResult} className="h-12 gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                          <Zap className="h-4 w-4" />
                          Calcular
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Guía rápida
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="font-medium text-blue-700 dark:text-blue-300">Operadores básicos</div>
                        <div className="text-muted-foreground mt-1">+ - * / ^ ( )</div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="font-medium text-green-700 dark:text-green-300">Funciones</div>
                        <div className="text-muted-foreground mt-1">sin(), cos(), tan(), sqrt(), log(), ln()</div>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="font-medium text-purple-700 dark:text-purple-300">Constantes</div>
                        <div className="text-muted-foreground mt-1">π (pi), e (Euler)</div>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4">Ejemplos</h3>
                    <div className="space-y-2">
                      {[
                        "2+3*4",
                        "sin(π/2)",
                        "sqrt(16)+log(100)",
                        "3^2 + 4^2",
                        "exp(1)"
                      ].map((example, idx) => (
                        <div 
                          key={idx}
                          className="p-2 text-sm font-mono bg-gray-100 dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                          onClick={() => {
                            setBasicInput(example);
                            setTimeout(() => calculateResult(), 100);
                          }}
                        >
                          {example}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Trigonometry */}
            <TabsContent value="trig" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h3 className="font-bold text-xl mb-6">Calculadora Trigonométrica</h3>
                  <div className="space-y-6">
                    <div>
                      <Label className="mb-2 block">Unidad angular</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['deg', 'rad', 'grad'] as const).map(unit => (
                          <Button
                            key={unit}
                            variant={angleUnit === unit ? "default" : "outline"}
                            onClick={() => setAngleUnit(unit)}
                            className="h-12"
                          >
                            {unit === 'deg' ? 'Grados (°)' : unit === 'rad' ? 'Radianes' : 'Gradianes'}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Ángulo θ</Label>
                      <Input
                        type="number"
                        value={angle}
                        onChange={(e) => setAngle(e.target.value)}
                        placeholder={`Ej: ${angleUnit === 'deg' ? '45' : angleUnit === 'rad' ? '0.785' : '50'}`}
                        className="h-12 text-lg"
                      />
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Ángulos notables</Label>
                      <div className="flex flex-wrap gap-2">
                        {notableAngles.map((a) => (
                          <Badge
                            key={a}
                            variant="outline"
                            className="cursor-pointer px-3 py-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => setAngle(a.toString())}
                          >
                            {a}°
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={calculateTrig} 
                      disabled={isLoading}
                      className="w-full h-12 gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Calculando...
                        </>
                      ) : (
                        <>
                          <Calculator className="h-4 w-4" />
                          Calcular Razones Trigonométricas
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
                
                {trigResult && (
                  <Card className="p-6">
                    <h3 className="font-bold text-xl mb-6">
                      Resultados para {trigResult.angle}{angleUnit === "deg" ? "°" : angleUnit === "rad" ? " rad" : " grad"}
                    </h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { name: "Seno", value: trigResult.sin, abbr: "sin", exact: trigResult.exactValues?.sin },
                          { name: "Coseno", value: trigResult.cos, abbr: "cos", exact: trigResult.exactValues?.cos },
                          { name: "Tangente", value: trigResult.tan, abbr: "tan", exact: trigResult.exactValues?.tan },
                          { name: "Cotangente", value: trigResult.cot, abbr: "cot" },
                          { name: "Secante", value: trigResult.sec, abbr: "sec" },
                          { name: "Cosecante", value: trigResult.csc, abbr: "csc" }
                        ].map((item) => (
                          <div key={item.abbr} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="text-sm text-muted-foreground">{item.name}</div>
                                <div className="text-xs font-mono">{item.abbr}(θ)</div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => copyResult(item.value.toString())}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-2xl font-bold text-primary my-2">
                              {isNaN(item.value) ? "∞" : item.value.toFixed(precision)}
                            </div>
                            {item.exact && (
                              <div className="text-sm font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-2 rounded">
                                {item.exact}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Información adicional</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-muted-foreground">Cuadrante</div>
                            <div className="font-semibold">
                              {trigResult.angle % 360 <= 90 ? "I" : 
                               trigResult.angle % 360 <= 180 ? "II" : 
                               trigResult.angle % 360 <= 270 ? "III" : "IV"}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Ángulo de referencia</div>
                            <div className="font-semibold">{(trigResult.angle % 90).toFixed(1)}°</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">En radianes</div>
                            <div className="font-semibold">{(trigResult.angle * Math.PI / 180).toFixed(precision)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">En gradianes</div>
                            <div className="font-semibold">{(trigResult.angle * 200 / 180).toFixed(precision)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Triangles */}
            <TabsContent value="triangle" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h3 className="font-bold text-xl mb-6">Resolvedor de Triángulos</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Tipo de entrada</Label>
                      <Select value={triangleType} onValueChange={(v) => setTriangleType(v as typeof triangleType)}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SAS">Lado-Ángulo-Lado (SAS)</SelectItem>
                          <SelectItem value="SSS">Lado-Lado-Lado (SSS)</SelectItem>
                          <SelectItem value="ASA">Ángulo-Lado-Ángulo (ASA)</SelectItem>
                          <SelectItem value="AAS">Ángulo-Ángulo-Lado (AAS)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      {triangleType === "SAS" && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Lado a</Label>
                              <Input
                                type="number"
                                value={sideA}
                                onChange={(e) => setSideA(e.target.value)}
                                placeholder="5"
                                className="h-12"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Lado b</Label>
                              <Input
                                type="number"
                                value={sideB}
                                onChange={(e) => setSideB(e.target.value)}
                                placeholder="7"
                                className="h-12"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Ángulo C (entre a y b)</Label>
                            <Input
                              type="number"
                              value={angleC}
                              onChange={(e) => setAngleC(e.target.value)}
                              placeholder="60"
                              className="h-12"
                            />
                          </div>
                        </>
                      )}
                      
                      {triangleType === "SSS" && (
                        <div className="grid grid-cols-3 gap-4">
                          {['a', 'b', 'c'].map((side) => (
                            <div key={side} className="space-y-2">
                              <Label>Lado {side}</Label>
                              <Input
                                type="number"
                                value={side === 'a' ? sideA : side === 'b' ? sideB : sideC}
                                onChange={(e) => {
                                  if (side === 'a') setSideA(e.target.value);
                                  else if (side === 'b') setSideB(e.target.value);
                                  else setSideC(e.target.value);
                                }}
                                placeholder="5"
                                className="h-12"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {triangleType === "ASA" && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Ángulo A</Label>
                              <Input
                                type="number"
                                value={angleA}
                                onChange={(e) => setAngleA(e.target.value)}
                                placeholder="30"
                                className="h-12"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Ángulo C</Label>
                              <Input
                                type="number"
                                value={angleC}
                                onChange={(e) => setAngleC(e.target.value)}
                                placeholder="60"
                                className="h-12"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Lado b (entre A y C)</Label>
                            <Input
                              type="number"
                              value={sideB}
                              onChange={(e) => setSideB(e.target.value)}
                              placeholder="10"
                              className="h-12"
                            />
                          </div>
                        </>
                      )}
                      
                      {triangleType === "AAS" && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Ángulo A</Label>
                              <Input
                                type="number"
                                value={angleA}
                                onChange={(e) => setAngleA(e.target.value)}
                                placeholder="30"
                                className="h-12"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Ángulo B</Label>
                              <Input
                                type="number"
                                value={angleB}
                                onChange={(e) => setAngleB(e.target.value)}
                                placeholder="45"
                                className="h-12"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Lado a (opuesto a A)</Label>
                            <Input
                              type="number"
                              value={sideA}
                              onChange={(e) => setSideA(e.target.value)}
                              placeholder="10"
                              className="h-12"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <Button 
                      onClick={calculateTriangle} 
                      disabled={isLoading}
                      className="w-full h-12 gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Calculando...
                        </>
                      ) : (
                        <>
                          <Triangle className="h-4 w-4" />
                          Resolver Triángulo
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                {triangleResult && (
                  <div className="space-y-6">
                    <Card className="p-6">
                      <h3 className="font-bold text-xl mb-6">Triángulo {triangleResult.type}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {[
                          { label: "Lado a", value: triangleResult.sides.a.toFixed(4), unit: "", color: "text-blue-600" },
                          { label: "Lado b", value: triangleResult.sides.b.toFixed(4), unit: "", color: "text-blue-600" },
                          { label: "Lado c", value: triangleResult.sides.c.toFixed(4), unit: "", color: "text-blue-600" },
                          { label: "Ángulo A", value: triangleResult.angles.A.toFixed(2), unit: "°", color: "text-green-600" },
                          { label: "Ángulo B", value: triangleResult.angles.B.toFixed(2), unit: "°", color: "text-green-600" },
                          { label: "Ángulo C", value: triangleResult.angles.C.toFixed(2), unit: "°", color: "text-green-600" },
                          { label: "Área", value: triangleResult.area.toFixed(4), unit: "", color: "text-purple-600" },
                          { label: "Perímetro", value: triangleResult.perimeter.toFixed(4), unit: "", color: "text-purple-600" },
                          { label: "Altura", value: triangleResult.height.toFixed(4), unit: "", color: "text-orange-600" },
                          { label: "Inradio", value: triangleResult.inscribedRadius.toFixed(4), unit: "", color: "text-pink-600" },
                          { label: "Circunradio", value: triangleResult.circumscribedRadius.toFixed(4), unit: "", color: "text-teal-600" },
                        ].map((item) => (
                          <div key={item.label} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-xs text-muted-foreground">{item.label}</div>
                            <div className={`text-lg font-bold ${item.color} mt-1`}>
                              {item.value}{item.unit}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                    
                    {triangleResult.steps.length > 0 && (
                      <Card className="p-6">
                        <h3 className="font-bold text-xl mb-4">Procedimiento</h3>
                        <div className="space-y-3">
                          {triangleResult.steps.map((step, idx) => (
                            <div key={idx} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center flex-shrink-0">
                                {idx + 1}
                              </div>
                              <div className="font-mono text-sm">{step}</div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Algebra */}
            <TabsContent value="algebra" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h3 className="font-bold text-xl mb-6">Solucionador de Ecuaciones</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Tipo de ecuación</Label>
                      <Select value={equationType} onValueChange={(v: any) => setEquationType(v)}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linear">Ecuación Lineal (ax + b = 0)</SelectItem>
                          <SelectItem value="quadratic">Ecuación Cuadrática (ax² + bx + c = 0)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Ecuación</Label>
                      <Input
                        value={equation}
                        onChange={(e) => setEquation(e.target.value)}
                        placeholder={equationType === "linear" ? "Ej: 2x + 5 = 13" : "Ej: x^2 + 3x - 4 = 0"}
                        className="h-12 text-lg"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {equationType === "linear" ? (
                        <>
                          {['x + 5 = 10', '2x - 3 = 7', '3x + 2 = 2x + 8'].map((eq) => (
                            <Badge
                              key={eq}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => setEquation(eq)}
                            >
                              {eq}
                            </Badge>
                          ))}
                        </>
                      ) : (
                        <>
                          {['x^2 + 5x + 6 = 0', '2x^2 - 3x - 5 = 0', 'x^2 - 4 = 0'].map((eq) => (
                            <Badge
                              key={eq}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => setEquation(eq)}
                            >
                              {eq}
                            </Badge>
                          ))}
                        </>
                      )}
                    </div>

                    <Button onClick={solveEquation} className="w-full h-12 gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                      <Code className="h-4 w-4" /> {/* Cambiado de Function a Code */}
                      Resolver Ecuación
                    </Button>
                  </div>
                </Card>

                {algebraResult.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-bold text-xl mb-6">Soluciones</h3>
                    <div className="space-y-4">
                      {algebraResult.map((result, idx) => (
                        <div key={idx} className={`p-4 rounded-xl ${
                          result.includes('Error') 
                            ? "bg-red-50 dark:bg-red-900/20" 
                            : result.includes('indeterminada') || result.includes('sin solución')
                            ? "bg-yellow-50 dark:bg-yellow-900/20"
                            : "bg-green-50 dark:bg-green-900/20"
                        }`}>
                          <div className={`font-mono text-lg font-bold ${
                            result.includes('Error') 
                              ? "text-red-700 dark:text-red-300" 
                              : result.includes('indeterminada') || result.includes('sin solución')
                              ? "text-yellow-700 dark:text-yellow-300"
                              : "text-green-700 dark:text-green-300"
                          }`}>
                            {result}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Calculus */}
            <TabsContent value="calculus" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h3 className="font-bold text-xl mb-6">Cálculo Diferencial e Integral</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Tipo de operación</Label>
                      <Select value={calculusType} onValueChange={(v: any) => setCalculusType(v)}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="derivative">Derivada</SelectItem>
                          <SelectItem value="integral">Integral</SelectItem>
                          <SelectItem value="limit">Límite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Función f(x)</Label>
                      <Input
                        value={calculusFunction}
                        onChange={(e) => setCalculusFunction(e.target.value)}
                        placeholder="Ej: x^2 + 3x + 2"
                        className="h-12"
                      />
                    </div>

                    {calculusType === "derivative" && (
                      <div className="space-y-2">
                        <Label>Evaluar en x =</Label>
                        <Input
                          type="number"
                          value={atPoint}
                          onChange={(e) => setAtPoint(e.target.value)}
                          placeholder="0"
                          className="h-12"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {['x^2', 'x^3', 'sin(x)', 'cos(x)', 'e^x', 'ln(x)', 'sqrt(x)'].map((func) => (
                        <Badge
                          key={func}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => setCalculusFunction(func)}
                        >
                          {func}
                        </Badge>
                      ))}
                    </div>

                    <Button onClick={calculateCalculus} className="w-full h-12 gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                      <Sigma className="h-4 w-4" />
                      Calcular {calculusType === 'derivative' ? 'Derivada' : calculusType === 'integral' ? 'Integral' : 'Límite'}
                    </Button>
                  </div>
                </Card>

                {(calculusResult.derivative || calculusResult.integral || calculusResult.limit) && (
                  <Card className="p-6">
                    <h3 className="font-bold text-xl mb-6">Resultados</h3>
                    <div className="space-y-6">
                      {calculusType === "derivative" && calculusResult.derivative && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                          <div className="text-sm text-muted-foreground mb-2">Derivada</div>
                          <div className="font-mono text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {calculusResult.derivative}
                          </div>
                        </div>
                      )}
                      
                      {calculusType === "integral" && calculusResult.integral && (
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                          <div className="text-sm text-muted-foreground mb-2">Integral</div>
                          <div className="font-mono text-2xl font-bold text-green-700 dark:text-green-300">
                            {calculusResult.integral}
                          </div>
                        </div>
                      )}
                      
                      {calculusType === "limit" && calculusResult.limit && (
                        <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                          <div className="text-sm text-muted-foreground mb-2">Límite</div>
                          <div className="font-mono text-2xl font-bold text-orange-700 dark:text-orange-300">
                            {calculusResult.limit}
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="text-sm font-medium mb-2">Notación matemática</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="p-2 bg-white dark:bg-gray-900 rounded">
                            <div className="font-mono">f'(x)</div>
                            <div className="text-muted-foreground">Derivada</div>
                          </div>
                          <div className="p-2 bg-white dark:bg-gray-900 rounded">
                            <div className="font-mono">∫f(x)dx</div>
                            <div className="text-muted-foreground">Integral</div>
                          </div>
                          <div className="p-2 bg-white dark:bg-gray-900 rounded">
                            <div className="font-mono">lim f(x)</div>
                            <div className="text-muted-foreground">Límite</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Graphs */}
            <TabsContent value="graph" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="p-6">
                    <div className="h-[400px]">
                      {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Generando gráfica...</p>
                          </div>
                        </div>
                      ) : graphData ? (
                        renderGraph()
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <LineChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>Ingresa una función para ver la gráfica</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4">Configuración</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Función f(x)</Label>
                        <Input
                          value={functionInput}
                          onChange={(e) => setFunctionInput(e.target.value)}
                          placeholder="sin(x)"
                          className="h-10"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Mínimo x</Label>
                          <Input
                            type="number"
                            value={graphRange.min}
                            onChange={(e) => setGraphRange(prev => ({ ...prev, min: parseFloat(e.target.value) }))}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Máximo x</Label>
                          <Input
                            type="number"
                            value={graphRange.max}
                            onChange={(e) => setGraphRange(prev => ({ ...prev, max: parseFloat(e.target.value) }))}
                            className="h-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Paso: {graphRange.step.toFixed(2)}</Label>
                        <Slider
                          value={[graphRange.step]}
                          onValueChange={([value]) => setGraphRange(prev => ({ ...prev, step: value }))}
                          min={0.01}
                          max={1}
                          step={0.01}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Tipo de gráfica</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['line', 'area', 'bar'] as const).map(type => (
                            <Button
                              key={type}
                              variant={graphType === type ? "default" : "outline"}
                              size="sm"
                              onClick={() => setGraphType(type)}
                            >
                              {type === 'line' ? 'Línea' : type === 'area' ? 'Área' : 'Barras'}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex gap-2">
                          {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'].map(color => (
                            <button
                              key={color}
                              className={`w-8 h-8 rounded-full ${graphColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setGraphColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={showDerivative}
                              onCheckedChange={setShowDerivative}
                              id="derivative-switch"
                            />
                            <Label htmlFor="derivative-switch">Mostrar derivada f'(x)</Label>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={showIntegral}
                              onCheckedChange={setShowIntegral}
                              id="integral-switch"
                            />
                            <Label htmlFor="integral-switch">Mostrar integral ∫f(x)dx</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {['sin(x)', 'cos(x)', 'x^2', 'sqrt(x)', 'log(x)', '1/x'].map((func) => (
                          <Badge
                            key={func}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => setFunctionInput(func)}
                          >
                            {func}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button onClick={generateGraphData} className="w-full gap-2">
                        <LineChart className="h-4 w-4" />
                        Generar Gráfica
                      </Button>
                    </div>
                  </Card>
                  
                  {graphData && (
                    <Card className="p-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                          <div className="text-xs text-muted-foreground">Dominio</div>
                          <div className="font-bold">[{graphData.domain[0]}, {graphData.domain[1]}]</div>
                        </div>
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                          <div className="text-xs text-muted-foreground">Rango</div>
                          <div className="font-bold">[{graphData.range[0].toFixed(2)}, {graphData.range[1].toFixed(2)}]</div>
                        </div>
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                          <div className="text-xs text-muted-foreground">Puntos</div>
                          <div className="font-bold">{graphData.points.length}</div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Identities */}
            <TabsContent value="identity" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="p-6">
                  <h3 className="font-bold text-xl mb-6">Identidades Trigonométricas</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Tipo de identidades</Label>
                      <Select value={identityType} onValueChange={(v: any) => setIdentityType(v)}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Básicas</SelectItem>
                          <SelectItem value="advanced">Avanzadas</SelectItem>
                          <SelectItem value="inverse">Inversas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Ángulo θ (grados)</Label>
                      <Input
                        type="number"
                        value={identityAngle}
                        onChange={(e) => setIdentityAngle(e.target.value)}
                        placeholder="30"
                        className="h-12"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[0, 30, 45, 60, 90, 180].map((a) => (
                        <Badge
                          key={a}
                          variant="outline"
                          className="cursor-pointer px-3 py-2"
                          onClick={() => setIdentityAngle(a.toString())}
                        >
                          {a}°
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm font-medium mb-2">Descripción</div>
                      <div className="text-sm text-muted-foreground">
                        {identityType === "basic" && "Identidades fundamentales de trigonometría"}
                        {identityType === "advanced" && "Identidades para ángulos compuestos y múltiples"}
                        {identityType === "inverse" && "Identidades con funciones trigonométricas inversas"}
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="lg:col-span-2">
                  <Card className="p-6">
                    <h3 className="font-bold text-xl mb-6">
                      Identidades {identityType === 'basic' ? 'Básicas' : identityType === 'advanced' ? 'Avanzadas' : 'Inversas'} para θ = {identityAngle}°
                    </h3>
                    <div className="space-y-4">
                      {identities.map((id, idx) => (
                        <div key={idx} className="p-4 border rounded-xl hover:border-primary transition-colors bg-white dark:bg-gray-800">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-semibold text-primary text-lg">{id.name}</div>
                              <div className="font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded text-sm mt-2">
                                {id.formula}
                              </div>
                            </div>
                            {id.verified && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300">
                                <Check className="h-3 w-3 mr-1" /> Verificada
                              </Badge>
                            )}
                          </div>
                          <div className="font-mono text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">
                            {id.result}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* History Section */}
        {history.length > 0 && (
          <Card className="p-6 rounded-2xl shadow-lg mt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial de Cálculos
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(history.map(h => `${h.input} = ${h.result}`).join('\n'))}
                  className="gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearHistory}
                  className="gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Limpiar
                </Button>
              </div>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {history.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.type}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="font-medium text-sm">{item.input}</div>
                      <div className="font-bold text-primary mt-1">{item.result}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => {
                        if (calcType === "basic") {
                          setBasicInput(item.input);
                          setTimeout(() => calculateResult(), 100);
                        }
                      }}
                    >
                      <RotateCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Guide */}
        <Card className="p-8 rounded-2xl shadow-lg mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-start gap-4">
            <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-2xl mb-4">Guía Completa de Uso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <div className="font-semibold text-lg text-primary">🧮 Calculadora Básica</div>
                  <ul className="text-muted-foreground space-y-2 text-sm">
                    <li>• Operaciones aritméticas básicas</li>
                    <li>• Funciones: sin, cos, tan, log, ln</li>
                    <li>• Constantes: π (pi), e (Euler)</li>
                    <li>• Exponentes: ^ o **</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="font-semibold text-lg text-primary">📐 Trigonometría</div>
                  <ul className="text-muted-foreground space-y-2 text-sm">
                    <li>• Seis funciones trigonométricas</li>
                    <li>• Grados, radianes y gradianes</li>
                    <li>• Valores exactos para ángulos notables</li>
                    <li>• Información de cuadrantes</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="font-semibold text-lg text-primary">📊 Gráficas</div>
                  <ul className="text-muted-foreground space-y-2 text-sm">
                    <li>• Funciones matemáticas estándar</li>
                    <li>• Derivadas e integrales visuales</li>
                    <li>• Ajuste de dominio y precisión</li>
                    <li>• Tipos: línea, área, barras</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="font-semibold text-lg text-primary">🔢 Álgebra & Cálculo</div>
                  <ul className="text-muted-foreground space-y-2 text-sm">
                    <li>• Ecuaciones lineales y cuadráticas</li>
                    <li>• Derivadas e integrales simbólicas</li>
                    <li>• Procedimientos paso a paso</li>
                    <li>• Evaluación en puntos específicos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Actions */}
        <div className="flex flex-wrap justify-center gap-4 mt-8 pt-8 border-t">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Resultados
          </Button>
          <Button variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Guardar Proyecto
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
            <Calculator className="h-4 w-4" />
            Nueva Calculación
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-8 pt-4 border-t">
          <p>© 2024 Calculadora Matemática Profesional • Para estudiantes de primaria, secundaria, universidad y profesionales</p>
          <p className="mt-2">Precisión actual: {precision} decimales • {theme === "light" ? "Tema claro" : "Tema oscuro"}</p>
        </div>
      </div>
    </div>
  );
}