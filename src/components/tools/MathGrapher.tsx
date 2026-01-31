import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sigma, Calculator, Triangle, PieChart, 
  LineChart, Grid3x3, History,
  Zap, RotateCw, Download, Share2,
  ChevronRight, Info, HelpCircle,
  Check, X, Minus, Divide, Plus,
  Save, Copy, Trash2, Moon, Sun,
  Code, Variable, Square, Braces,
  AlertCircle, BookOpen, ChevronDown, ChevronUp
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
  steps: { step: number; description: string; formula?: string; calculation?: string; result?: string }[];
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

interface StepDetail {
  step: number;
  title: string;
  description: string;
  formula: string;
  calculation: string;
  result: string;
  explanation: string;
}

export function MathGrapher() {
  const [calcType, setCalcType] = useState<"trig" | "triangle" | "identity" | "graph" | "basic" | "algebra" | "calculus">("basic");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [precision, setPrecision] = useState(6);
  const [history, setHistory] = useState<MathHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [graphType, setGraphType] = useState<"line" | "bar" | "area">("line");
  const [showDetailedSteps, setShowDetailedSteps] = useState(true);
  const [mobileView, setMobileView] = useState(false);
  
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
  const [graphError, setGraphError] = useState<string | null>(null);
  
  // Calculadora básica
  const [basicInput, setBasicInput] = useState("");
  const [basicResult, setBasicResult] = useState<string>("0");
  const [basicSteps, setBasicSteps] = useState<StepDetail[]>([]);
  
  // Álgebra
  const [equation, setEquation] = useState("");
  const [algebraResult, setAlgebraResult] = useState<string[]>([]);
  const [equationType, setEquationType] = useState<"linear" | "quadratic" | "system">("linear");
  const [algebraSteps, setAlgebraSteps] = useState<StepDetail[]>([]);
  
  // Cálculo
  const [calculusFunction, setCalculusFunction] = useState("x^2");
  const [calculusType, setCalculusType] = useState<"derivative" | "integral" | "limit">("derivative");
  const [calculusResult, setCalculusResult] = useState<CalculusResult>({
    derivative: "",
    integral: "",
    limit: ""
  });
  const [calculusSteps, setCalculusSteps] = useState<StepDetail[]>([]);
  
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

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const safeEval = (expression: string): { result: any; error: string | null } => {
    try {
      // Reemplazar funciones matemáticas
      const safeExpression = expression
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/log\(/g, '(x => x > 0 ? Math.log10(x) : NaN)(')
        .replace(/ln\(/g, '(x => x > 0 ? Math.log(x) : NaN)(')
        .replace(/exp\(/g, 'Math.exp(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/π/g, 'Math.PI')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/\^/g, '**')
        .replace(/\/0(?!\.|\d)/g, '/0.000000001') // Evitar división por cero
        .replace(/\/\s*0(?!\.|\d)/g, '/0.000000001');

      // Evaluar de forma segura
      const result = Function('"use strict"; return (' + safeExpression + ')')();
      
      // Verificar resultados inválidos
      if (typeof result === 'number') {
        if (isNaN(result)) {
          return { result: null, error: "Resultado indefinido (NaN)" };
        }
        if (!isFinite(result)) {
          return { result: null, error: Math.abs(result) === Infinity ? "División por cero o resultado infinito" : "Resultado no finito" };
        }
        if (expression.includes('log(') || expression.includes('ln(')) {
          // Verificar argumentos de logaritmo
          const logMatch = expression.match(/(log|ln)\(([^)]+)\)/);
          if (logMatch) {
            const arg = logMatch[2];
            const argResult = safeEval(arg);
            if (argResult.result <= 0) {
              return { result: null, error: `Logaritmo de número no positivo: ${arg}` };
            }
          }
        }
        if (expression.includes('/0')) {
          return { result: null, error: "División por cero detectada" };
        }
      }
      
      return { result, error: null };
    } catch (error) {
      return { result: null, error: "Error de sintaxis en la expresión" };
    }
  };

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
      
      // Evitar cálculos problemáticos
      const sinVal = Math.sin(angleRad);
      const cosVal = Math.cos(angleRad);
      const tanVal = Math.abs(cosVal) > 1e-10 ? Math.tan(angleRad) : Infinity;
      
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
      const steps: { step: number; description: string; formula?: string; calculation?: string; result?: string }[] = [];
      let a = parseFloat(sideA) || 0;
      let b = parseFloat(sideB) || 0;
      let c = parseFloat(sideC) || 0;
      let A = (parseFloat(angleA) || 0) * Math.PI / 180;
      let B = (parseFloat(angleB) || 0) * Math.PI / 180;
      let C = (parseFloat(angleC) || 0) * Math.PI / 180;
      
      let stepCounter = 1;
      
      switch (triangleType) {
        case "SAS":
          steps.push({
            step: stepCounter++,
            description: "Aplicar la Ley de Cosenos para encontrar el lado c",
            formula: "c² = a² + b² - 2ab·cos(C)",
            calculation: `c² = ${a}² + ${b}² - 2·${a}·${b}·cos(${(C * 180 / Math.PI).toFixed(2)}°)`,
            result: ""
          });
          
          c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C));
          steps[steps.length - 1].result = `c = ${c.toFixed(4)}`;
          
          steps.push({
            step: stepCounter++,
            description: "Aplicar la Ley de Senos para encontrar el ángulo A",
            formula: "sin(A)/a = sin(C)/c",
            calculation: `A = arcsin((${a}·sin(${(C * 180 / Math.PI).toFixed(2)}°))/${c.toFixed(4)})`,
            result: ""
          });
          
          A = Math.asin((a * Math.sin(C)) / c);
          steps[steps.length - 1].result = `A = ${(A * 180 / Math.PI).toFixed(2)}°`;
          
          steps.push({
            step: stepCounter++,
            description: "Usar la suma de ángulos para encontrar el ángulo B",
            formula: "A + B + C = 180°",
            calculation: `B = 180° - ${(A * 180 / Math.PI).toFixed(2)}° - ${(C * 180 / Math.PI).toFixed(2)}°`,
            result: ""
          });
          
          B = Math.PI - A - C;
          steps[steps.length - 1].result = `B = ${(B * 180 / Math.PI).toFixed(2)}°`;
          break;
          
        case "SSS":
          steps.push({
            step: stepCounter++,
            description: "Ley de Cosenos para el ángulo A",
            formula: "cos(A) = (b² + c² - a²)/(2bc)",
            calculation: `A = arccos((${b}² + ${c}² - ${a}²)/(2·${b}·${c}))`,
            result: ""
          });
          
          A = Math.acos((b * b + c * c - a * a) / (2 * b * c));
          steps[steps.length - 1].result = `A = ${(A * 180 / Math.PI).toFixed(2)}°`;
          
          steps.push({
            step: stepCounter++,
            description: "Ley de Cosenos para el ángulo B",
            formula: "cos(B) = (a² + c² - b²)/(2ac)",
            calculation: `B = arccos((${a}² + ${c}² - ${b}²)/(2·${a}·${c}))`,
            result: ""
          });
          
          B = Math.acos((a * a + c * c - b * b) / (2 * a * c));
          steps[steps.length - 1].result = `B = ${(B * 180 / Math.PI).toFixed(2)}°`;
          
          steps.push({
            step: stepCounter++,
            description: "Suma de ángulos para el ángulo C",
            formula: "C = 180° - A - B",
            calculation: `C = 180° - ${(A * 180 / Math.PI).toFixed(2)}° - ${(B * 180 / Math.PI).toFixed(2)}°`,
            result: ""
          });
          
          C = Math.PI - A - B;
          steps[steps.length - 1].result = `C = ${(C * 180 / Math.PI).toFixed(2)}°`;
          break;
          
        case "ASA":
          A = (parseFloat(angleA) || 0) * Math.PI / 180;
          C = (parseFloat(angleC) || 0) * Math.PI / 180;
          b = parseFloat(sideB) || 0;
          
          steps.push({
            step: stepCounter++,
            description: "Suma de ángulos para encontrar B",
            formula: "B = 180° - A - C",
            calculation: `B = 180° - ${(A * 180 / Math.PI).toFixed(2)}° - ${(C * 180 / Math.PI).toFixed(2)}°`,
            result: ""
          });
          
          B = Math.PI - A - C;
          steps[steps.length - 1].result = `B = ${(B * 180 / Math.PI).toFixed(2)}°`;
          
          steps.push({
            step: stepCounter++,
            description: "Ley de Senos para el lado a",
            formula: "a/sin(A) = b/sin(B)",
            calculation: `a = ${b}·sin(${(A * 180 / Math.PI).toFixed(2)}°)/sin(${(B * 180 / Math.PI).toFixed(2)}°)`,
            result: ""
          });
          
          a = (b * Math.sin(A)) / Math.sin(B);
          steps[steps.length - 1].result = `a = ${a.toFixed(4)}`;
          
          steps.push({
            step: stepCounter++,
            description: "Ley de Senos para el lado c",
            formula: "c/sin(C) = b/sin(B)",
            calculation: `c = ${b}·sin(${(C * 180 / Math.PI).toFixed(2)}°)/sin(${(B * 180 / Math.PI).toFixed(2)}°)`,
            result: ""
          });
          
          c = (b * Math.sin(C)) / Math.sin(B);
          steps[steps.length - 1].result = `c = ${c.toFixed(4)}`;
          break;
          
        case "AAS":
          A = (parseFloat(angleA) || 0) * Math.PI / 180;
          B = (parseFloat(angleB) || 0) * Math.PI / 180;
          a = parseFloat(sideA) || 0;
          
          steps.push({
            step: stepCounter++,
            description: "Suma de ángulos para encontrar C",
            formula: "C = 180° - A - B",
            calculation: `C = 180° - ${(A * 180 / Math.PI).toFixed(2)}° - ${(B * 180 / Math.PI).toFixed(2)}°`,
            result: ""
          });
          
          C = Math.PI - A - B;
          steps[steps.length - 1].result = `C = ${(C * 180 / Math.PI).toFixed(2)}°`;
          
          steps.push({
            step: stepCounter++,
            description: "Ley de Senos para el lado b",
            formula: "b/sin(B) = a/sin(A)",
            calculation: `b = ${a}·sin(${(B * 180 / Math.PI).toFixed(2)}°)/sin(${(A * 180 / Math.PI).toFixed(2)}°)`,
            result: ""
          });
          
          b = (a * Math.sin(B)) / Math.sin(A);
          steps[steps.length - 1].result = `b = ${b.toFixed(4)}`;
          
          steps.push({
            step: stepCounter++,
            description: "Ley de Senos para el lado c",
            formula: "c/sin(C) = a/sin(A)",
            calculation: `c = ${a}·sin(${(C * 180 / Math.PI).toFixed(2)}°)/sin(${(A * 180 / Math.PI).toFixed(2)}°)`,
            result: ""
          });
          
          c = (a * Math.sin(C)) / Math.sin(A);
          steps[steps.length - 1].result = `c = ${c.toFixed(4)}`;
          break;
      }
      
      // Cálculos adicionales
      const area = 0.5 * a * b * Math.sin(C);
      const perimeter = a + b + c;
      const s = perimeter / 2;
      const inscribedRadius = Math.sqrt((s - a) * (s - b) * (s - c) / s) || 0;
      const circumscribedRadius = (a * b * c) / (4 * Math.sqrt(s * (s - a) * (s - b) * (s - c))) || 0;
      
      steps.push({
        step: stepCounter++,
        description: "Calcular el área usando fórmula del seno",
        formula: "Área = (1/2)·a·b·sin(C)",
        calculation: `Área = (1/2)·${a}·${b}·sin(${(C * 180 / Math.PI).toFixed(2)}°)`,
        result: `Área = ${area.toFixed(4)}`
      });
      
      steps.push({
        step: stepCounter++,
        description: "Calcular el perímetro",
        formula: "P = a + b + c",
        calculation: `P = ${a} + ${b} + ${c}`,
        result: `Perímetro = ${perimeter.toFixed(4)}`
      });
      
      let type = "Escaleno";
      if (Math.abs(a - b) < 0.001 && Math.abs(b - c) < 0.001) type = "Equilátero";
      else if (Math.abs(a - b) < 0.001 || Math.abs(b - c) < 0.001 || Math.abs(a - c) < 0.001) type = "Isósceles";
      
      if (Math.max(A, B, C) > Math.PI / 2 + 0.01) type += " Obtusángulo";
      else if (Math.abs(Math.max(A, B, C) - Math.PI / 2) < 0.01) type += " Rectángulo";
      else type += " Acutángulo";
      
      const result: TriangleResult = {
        sides: { a, b, c },
        angles: { A: parseFloat((A * 180 / Math.PI).toFixed(2)), B: parseFloat((B * 180 / Math.PI).toFixed(2)), C: parseFloat((C * 180 / Math.PI).toFixed(2)) },
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
    setGraphError(null);
    setTimeout(() => {
      const points: GraphPoint[] = [];
      const derivativePoints: GraphPoint[] = [];
      const integralPoints: GraphPoint[] = [];
      
      try {
        // Validar función antes de procesar
        const safeFunc = (x: number): number => {
          try {
            const expr = functionInput
              .replace(/x/g, x.toString())
              .replace(/sin\(/g, 'Math.sin(')
              .replace(/cos\(/g, 'Math.cos(')
              .replace(/tan\(/g, 'Math.tan(')
              .replace(/sqrt\(/g, 'Math.sqrt(')
              .replace(/log\(/g, 'Math.log10(')
              .replace(/ln\(/g, 'Math.log(')
              .replace(/exp\(/g, 'Math.exp(')
              .replace(/abs\(/g, 'Math.abs(')
              .replace(/\^/g, '**');
            
            // Verificar divisiones por cero
            if (expr.includes('/0') || expr.match(/\/\s*0/)) {
              throw new Error("División por cero");
            }
            
            // Verificar logaritmos de no positivos
            if ((expr.includes('log(') || expr.includes('Math.log10(')) && x <= 0) {
              throw new Error("Logaritmo de número no positivo");
            }
            
            if ((expr.includes('ln(') || expr.includes('Math.log(')) && x <= 0) {
              throw new Error("Logaritmo natural de número no positivo");
            }
            
            const result = eval(expr);
            
            // Verificar resultados especiales
            if (!isFinite(result)) {
              if (result === Infinity || result === -Infinity) {
                throw new Error("Resultado infinito");
              }
              throw new Error("Resultado no finito");
            }
            
            if (isNaN(result)) {
              throw new Error("Resultado indefinido (NaN)");
            }
            
            return result;
          } catch (error) {
            // Para puntos problemáticos, devolver NaN
            return NaN;
          }
        };
        
        let integralSum = 0;
        let validPoints = 0;
        
        for (let x = graphRange.min; x <= graphRange.max; x += graphRange.step) {
          const y = safeFunc(x);
          
          if (!isNaN(y) && isFinite(y)) {
            points.push({ x, y });
            validPoints++;
            
            // Derivada numérica (método de diferencia central)
            if (showDerivative) {
              const h = 0.0001;
              const yPrev = safeFunc(x - h);
              const yNext = safeFunc(x + h);
              
              if (!isNaN(yPrev) && !isNaN(yNext) && isFinite(yPrev) && isFinite(yNext)) {
                const derivative = (yNext - yPrev) / (2 * h);
                if (isFinite(derivative)) {
                  derivativePoints.push({ x, y: derivative });
                }
              }
            }
            
            // Integral numérica (regla del trapecio)
            if (showIntegral && x > graphRange.min) {
              const prevX = x - graphRange.step;
              const prevY = safeFunc(prevX);
              
              if (!isNaN(prevY) && isFinite(prevY)) {
                integralSum += (y + prevY) * graphRange.step / 2;
                integralPoints.push({ x, y: integralSum });
              }
            }
          }
        }
        
        if (validPoints === 0) {
          setGraphError("No se pudieron calcular puntos válidos para la función. Verifique dominio y posibles divisiones por cero.");
          setGraphData(null);
        } else {
          const yValues = points.map(p => p.y).filter(y => isFinite(y));
          const minY = yValues.length > 0 ? Math.min(...yValues) : -10;
          const maxY = yValues.length > 0 ? Math.max(...yValues) : 10;
          
          setGraphData({
            points,
            domain: [graphRange.min, graphRange.max],
            range: [minY, maxY],
            derivativePoints: showDerivative && derivativePoints.length > 0 ? derivativePoints : undefined,
            integralPoints: showIntegral && integralPoints.length > 0 ? integralPoints : undefined
          });
          
          addToHistory("graph", `f(x) = ${functionInput}`, `Dominio: [${graphRange.min}, ${graphRange.max}]`);
        }
      } catch (error) {
        setGraphError("Error al generar gráfica: " + (error as Error).message);
        setGraphData(null);
      }
      setIsLoading(false);
    }, 400);
  };

  const calculateBasic = () => {
    try {
      const { result, error } = safeEval(basicInput);
      
      if (error) {
        setBasicResult(error);
        return;
      }
      
      const steps: StepDetail[] = [];
      
      // Análisis de la expresión
      steps.push({
        step: 1,
        title: "Análisis de la expresión",
        description: "Se analiza la expresión matemática ingresada",
        formula: basicInput,
        calculation: "",
        result: "Expresión válida",
        explanation: "La expresión ha sido validada y está lista para ser evaluada."
      });
      
      // Evaluación paso a paso
      let currentExpr = basicInput;
      
      // Reemplazar constantes
      if (basicInput.includes('π') || basicInput.includes('pi')) {
        steps.push({
          step: 2,
          title: "Sustitución de constantes",
          description: "Reemplazar π por su valor numérico",
          formula: "π ≈ 3.141592653589793",
          calculation: currentExpr + " → " + currentExpr.replace(/π|pi/g, '3.141592653589793'),
          result: "Constantes sustituidas",
          explanation: "La constante π ha sido reemplazada por su valor aproximado 3.141592653589793"
        });
        currentExpr = currentExpr.replace(/π/g, '3.141592653589793').replace(/pi/g, '3.141592653589793');
      }
      
      if (basicInput.includes('e')) {
        steps.push({
          step: steps.length + 1,
          title: "Sustitución de constantes",
          description: "Reemplazar e por su valor numérico",
          formula: "e ≈ 2.718281828459045",
          calculation: currentExpr + " → " + currentExpr.replace(/e/g, '2.718281828459045'),
          result: "Constantes sustituidas",
          explanation: "La constante e (Euler) ha sido reemplazada por su valor aproximado 2.718281828459045"
        });
        currentExpr = currentExpr.replace(/e/g, '2.718281828459045');
      }
      
      // Paso final de evaluación
      steps.push({
        step: steps.length + 1,
        title: "Evaluación numérica",
        description: "Calcular el resultado final",
        formula: currentExpr,
        calculation: `= ${result}`,
        result: result.toFixed(precision),
        explanation: "La expresión ha sido evaluada numéricamente obteniendo el resultado mostrado."
      });
      
      setBasicSteps(steps);
      setBasicResult(result.toFixed(precision));
      addToHistory("basic", basicInput, result.toString());
    } catch (error) {
      setBasicResult("Error de sintaxis");
      setBasicSteps([]);
    }
  };

  const solveEquation = () => {
    try {
      const eq = equation.toLowerCase().replace(/\s/g, '');
      const results: string[] = [];
      const steps: StepDetail[] = [];
      let stepCounter = 1;
      
      if (equationType === "quadratic" && eq.includes('x^2')) {
        const parts = eq.split('=');
        const left = parts[0];
        const right = parts[1] || '0';
        
        // Paso 1: Forma estándar
        steps.push({
          step: stepCounter++,
          title: "Forma estándar",
          description: "Llevar la ecuación a la forma estándar ax² + bx + c = 0",
          formula: "ax² + bx + c = 0",
          calculation: `${left} = ${right}`,
          result: `(${left}) - (${right}) = 0`,
          explanation: "Se mueven todos los términos al lado izquierdo para obtener la forma estándar."
        });
        
        // Coeficientes
        const match = left.match(/(-?\d*\.?\d*)x\^2\s*([+-]\s*\d*\.?\d*)x?\s*([+-]\s*\d*\.?\d*)?/);
        
        if (match) {
          let a = match[1] === '' || match[1] === '-' ? (match[1] === '-' ? -1 : 1) : parseFloat(match[1]);
          let b = match[2] ? parseFloat(match[2].replace(/\s/g, '')) : 0;
          let c = match[3] ? parseFloat(match[3].replace(/\s/g, '')) : 0;
          
          const constant = parseFloat(right) || 0;
          c -= constant;
          
          steps.push({
            step: stepCounter++,
            title: "Identificación de coeficientes",
            description: "Identificar los coeficientes a, b y c",
            formula: "a = coeficiente de x², b = coeficiente de x, c = término constante",
            calculation: `De la ecuación obtenemos: a = ${a}, b = ${b}, c = ${c}`,
            result: `a=${a}, b=${b}, c=${c}`,
            explanation: "Los coeficientes han sido extraídos de la ecuación en forma estándar."
          });
          
          const discriminant = b * b - 4 * a * c;
          
          steps.push({
            step: stepCounter++,
            title: "Cálculo del discriminante",
            description: "Calcular el discriminante Δ = b² - 4ac",
            formula: "Δ = b² - 4ac",
            calculation: `Δ = ${b}² - 4·${a}·${c} = ${b*b} - ${4*a*c}`,
            result: `Δ = ${discriminant}`,
            explanation: "El discriminante determina la naturaleza de las raíces de la ecuación cuadrática."
          });
          
          if (discriminant > 0) {
            steps.push({
              step: stepCounter++,
              title: "Raíces reales y distintas",
              description: "El discriminante es positivo, existen dos raíces reales distintas",
              formula: "x = [-b ± √Δ] / (2a)",
              calculation: `x = [${-b} ± √${discriminant}] / (2·${a})`,
              result: "Dos soluciones reales",
              explanation: "Cuando Δ > 0, la ecuación tiene dos soluciones reales diferentes."
            });
            
            const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            
            steps.push({
              step: stepCounter++,
              title: "Primera solución",
              description: "Calcular x₁ usando el signo positivo",
              formula: "x₁ = (-b + √Δ) / (2a)",
              calculation: `x₁ = (${-b} + √${discriminant}) / ${2*a}`,
              result: `x₁ = ${x1.toFixed(precision)}`,
              explanation: "Primera raíz de la ecuación cuadrática."
            });
            
            steps.push({
              step: stepCounter++,
              title: "Segunda solución",
              description: "Calcular x₂ usando el signo negativo",
              formula: "x₂ = (-b - √Δ) / (2a)",
              calculation: `x₂ = (${-b} - √${discriminant}) / ${2*a}`,
              result: `x₂ = ${x2.toFixed(precision)}`,
              explanation: "Segunda raíz de la ecuación cuadrática."
            });
            
            results.push(`x₁ = ${x1.toFixed(precision)}`, `x₂ = ${x2.toFixed(precision)}`);
            results.push(`Discriminante: ${discriminant.toFixed(precision)} (positivo)`);
          } else if (discriminant === 0) {
            steps.push({
              step: stepCounter++,
              title: "Raíz real doble",
              description: "El discriminante es cero, existe una raíz real doble",
              formula: "x = -b / (2a)",
              calculation: `x = ${-b} / (2·${a})`,
              result: "Solución única",
              explanation: "Cuando Δ = 0, la ecuación tiene una única solución real (raíz doble)."
            });
            
            const x = -b / (2 * a);
            results.push(`x = ${x.toFixed(precision)} (raíz doble)`);
            results.push(`Discriminante: 0`);
          } else {
            steps.push({
              step: stepCounter++,
              title: "Raíces complejas conjugadas",
              description: "El discriminante es negativo, existen dos raíces complejas conjugadas",
              formula: "x = [-b ± i√|Δ|] / (2a)",
              calculation: `x = [${-b} ± i√${-discriminant}] / (2·${a})`,
              result: "Dos soluciones complejas",
              explanation: "Cuando Δ < 0, la ecuación tiene dos soluciones complejas conjugadas."
            });
            
            const real = -b / (2 * a);
            const imag = Math.sqrt(-discriminant) / (2 * a);
            
            steps.push({
              step: stepCounter++,
              title: "Solución compleja 1",
              description: "Primera solución compleja",
              formula: "x₁ = α + βi",
              calculation: `x₁ = ${real} + ${imag}i`,
              result: `x₁ = ${real.toFixed(precision)} + ${imag.toFixed(precision)}i`,
              explanation: "Parte real e imaginaria de la primera solución compleja."
            });
            
            steps.push({
              step: stepCounter++,
              title: "Solución compleja 2",
              description: "Segunda solución compleja (conjugada)",
              formula: "x₂ = α - βi",
              calculation: `x₂ = ${real} - ${imag}i`,
              result: `x₂ = ${real.toFixed(precision)} - ${imag.toFixed(precision)}i`,
              explanation: "Parte real e imaginaria de la segunda solución compleja (conjugada de la primera)."
            });
            
            results.push(`x₁ = ${real.toFixed(precision)} + ${imag.toFixed(precision)}i`, 
                         `x₂ = ${real.toFixed(precision)} - ${imag.toFixed(precision)}i`);
            results.push(`Discriminante: ${discriminant.toFixed(precision)} (negativo)`);
          }
        }
      } else if (equationType === "linear" && eq.includes('x')) {
        const parts = eq.split('=');
        const left = parts[0];
        const right = parts[1] || '0';
        
        steps.push({
          step: stepCounter++,
          title: "Forma estándar",
          description: "Llevar la ecuación a la forma ax + b = 0",
          formula: "ax + b = 0",
          calculation: `${left} = ${right}`,
          result: `(${left}) - (${right}) = 0`,
          explanation: "Se mueven todos los términos al lado izquierdo para aislar la variable."
        });
        
        const xMatch = left.match(/(-?\d*\.?\d*)x/);
        const constantMatch = left.match(/([+-]\s*\d*\.?\d*)(?![\d*x])/);
        
        let a = xMatch ? (xMatch[1] === '' || xMatch[1] === '-' ? (xMatch[1] === '-' ? -1 : 1) : parseFloat(xMatch[1])) : 0;
        let b = constantMatch ? parseFloat(constantMatch[1].replace(/\s/g, '')) : 0;
        const c = parseFloat(right) || 0;
        
        b -= c;
        
        steps.push({
          step: stepCounter++,
          title: "Identificación de coeficientes",
          description: "Identificar a y b en la ecuación lineal",
          formula: "a = coeficiente de x, b = término constante",
          calculation: `De la ecuación obtenemos: a = ${a}, b = ${b}`,
          result: `a=${a}, b=${b}`,
          explanation: "Los coeficientes han sido extraídos de la ecuación lineal."
        });
        
        if (a !== 0) {
          steps.push({
            step: stepCounter++,
            title: "Despejar x",
            description: "Aislar la variable x",
            formula: "x = -b / a",
            calculation: `x = ${-b} / ${a}`,
            result: "x = " + (-b / a).toFixed(precision),
            explanation: "Se divide ambos lados entre el coeficiente a para despejar x."
          });
          
          const x = -b / a;
          results.push(`x = ${x.toFixed(precision)}`);
        } else if (b === 0) {
          results.push(`Ecuación indeterminada (infinitas soluciones)`);
          steps.push({
            step: stepCounter++,
            title: "Ecuación indeterminada",
            description: "La ecuación tiene infinitas soluciones",
            formula: "0·x + 0 = 0",
            calculation: "0 = 0",
            result: "Verdadero para todo x",
            explanation: "La ecuación se reduce a 0=0, lo cual es verdadero para cualquier valor de x."
          });
        } else {
          results.push(`Ecuación sin solución (contradicción)`);
          steps.push({
            step: stepCounter++,
            title: "Ecuación sin solución",
            description: "La ecuación es una contradicción",
            formula: "0·x + b = 0, con b ≠ 0",
            calculation: `${b} = 0`,
            result: "Falso para todo x",
            explanation: "La ecuación se reduce a b=0 donde b≠0, lo cual es falso para cualquier valor de x."
          });
        }
      }
      
      setAlgebraSteps(steps);
      setAlgebraResult(results);
      if (results.length > 0) {
        addToHistory("algebra", equation, results[0]);
      }
    } catch (error) {
      setAlgebraResult(["Error al resolver la ecuación"]);
      setAlgebraSteps([]);
    }
  };

  const calculateCalculus = () => {
    try {
      const f = calculusFunction;
      const point = parseFloat(atPoint) || 0;
      const steps: StepDetail[] = [];
      let stepCounter = 1;
      
      steps.push({
        step: stepCounter++,
        title: "Función dada",
        description: "Analizar la función a derivar/integrar",
        formula: `f(x) = ${f}`,
        calculation: "",
        result: "Función identificada",
        explanation: "La función ha sido analizada para aplicar las reglas de cálculo correspondientes."
      });
      
      if (calculusType === "derivative") {
        steps.push({
          step: stepCounter++,
          title: "Reglas de derivación",
          description: "Aplicar reglas de derivación correspondientes",
          formula: "",
          calculation: "",
          result: "Aplicando reglas...",
          explanation: "Se aplican reglas como: d/dx(xⁿ) = n·xⁿ⁻¹, d/dx(sin x) = cos x, d/dx(cos x) = -sin x, etc."
        });
        
        if (f.includes('x^')) {
          const match = f.match(/(-?\d*\.?\d*)x\^(\d*\.?\d*)/);
          if (match) {
            const coef = match[1] === '' || match[1] === '-' ? (match[1] === '-' ? -1 : 1) : parseFloat(match[1]);
            const power = parseFloat(match[2]);
            
            steps.push({
              step: stepCounter++,
              title: "Regla de la potencia",
              description: "Derivar usando la regla de la potencia",
              formula: "d/dx(xⁿ) = n·xⁿ⁻¹",
              calculation: `d/dx(${coef}x^${power}) = ${coef}·${power}·x^(${power}-1)`,
              result: `f'(x) = ${(coef * power).toFixed(precision)}x^${(power - 1).toFixed(precision)}`,
              explanation: "La regla de la potencia establece que la derivada de xⁿ es n·xⁿ⁻¹."
            });
            
            if (!isNaN(point)) {
              steps.push({
                step: stepCounter++,
                title: "Evaluación en punto",
                description: "Evaluar la derivada en el punto dado",
                formula: `f'(${point})`,
                calculation: `${(coef * power).toFixed(precision)}·${point}^${(power - 1).toFixed(precision)}`,
                result: `f'(${point}) = ${(coef * power * Math.pow(point, power - 1)).toFixed(precision)}`,
                explanation: "Se sustituye x por el valor dado para obtener la pendiente de la tangente en ese punto."
              });
            }
          }
        } else if (f.includes('sin(x)')) {
          steps.push({
            step: stepCounter++,
            title: "Derivada de seno",
            description: "Derivar la función seno",
            formula: "d/dx(sin x) = cos x",
            calculation: "d/dx(sin x) = cos x",
            result: "f'(x) = cos(x)",
            explanation: "La derivada de sen(x) es cos(x)."
          });
        } else if (f.includes('cos(x)')) {
          steps.push({
            step: stepCounter++,
            title: "Derivada de coseno",
            description: "Derivar la función coseno",
            formula: "d/dx(cos x) = -sin x",
            calculation: "d/dx(cos x) = -sin x",
            result: "f'(x) = -sin(x)",
            explanation: "La derivada de cos(x) es -sin(x)."
          });
        }
      }
      
      setCalculusSteps(steps);
      
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
      setCalculusSteps([]);
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
        verified: Math.abs(sin * sin + cos * cos - 1) < 0.0001,
        explanation: "Esta identidad proviene del teorema de Pitágoras aplicado al círculo unitario. Representa que para cualquier ángulo θ, el punto (cos θ, sin θ) está en el círculo unitario x² + y² = 1."
      },
      {
        name: "Tangente",
        formula: "tan(θ) = sin(θ) / cos(θ)",
        result: `tan(${ang}°) = ${sin.toFixed(precision)} / ${cos.toFixed(precision)} = ${(sin / cos).toFixed(precision)}`,
        verified: Math.abs(tan - (sin / cos)) < 0.0001,
        explanation: "La tangente se define como el cociente entre el seno y el coseno. Representa la pendiente del radio que forma el ángulo θ con el eje positivo x."
      },
      {
        name: "Recíprocas",
        formula: "sin(θ) · csc(θ) = 1",
        result: `${sin.toFixed(precision)} × ${(1/sin).toFixed(precision)} = ${(sin * (1/sin)).toFixed(precision)}`,
        verified: Math.abs(sin * (1/sin) - 1) < 0.0001,
        explanation: "La cosecante es la función recíproca del seno. Esta identidad muestra que son funciones inversas multiplicativas."
      },
      {
        name: "Cofunción",
        formula: "sin(90° - θ) = cos(θ)",
        result: `sin(${90-ang}°) = cos(${ang}°) = ${cos.toFixed(precision)}`,
        verified: Math.abs(Math.sin((90-ang) * Math.PI / 180) - cos) < 0.0001,
        explanation: "Esta identidad muestra la relación entre seno y coseno como cofunciones. Un ángulo y su complemento tienen estas funciones intercambiadas."
      }
    ];
    
    const advancedIdents = [
      {
        name: "Ángulo doble (seno)",
        formula: "sin(2θ) = 2·sin(θ)·cos(θ)",
        result: `sin(${2*ang}°) = 2 × ${sin.toFixed(precision)} × ${cos.toFixed(precision)} = ${(2 * sin * cos).toFixed(precision)}`,
        verified: Math.abs(Math.sin(2*rad) - (2 * sin * cos)) < 0.0001,
        explanation: "Esta fórmula permite calcular el seno del doble de un ángulo en términos del seno y coseno del ángulo original. Se deriva de la fórmula de suma de ángulos."
      },
      {
        name: "Ángulo doble (coseno)",
        formula: "cos(2θ) = cos²(θ) - sin²(θ)",
        result: `cos(${2*ang}°) = ${(cos*cos).toFixed(precision)} - ${(sin*sin).toFixed(precision)} = ${(cos*cos - sin*sin).toFixed(precision)}`,
        verified: Math.abs(Math.cos(2*rad) - (cos*cos - sin*sin)) < 0.0001,
        explanation: "Esta identidad tiene tres formas equivalentes: cos²θ - sin²θ, 2cos²θ - 1, o 1 - 2sin²θ. Es útil para simplificar expresiones con ángulos dobles."
      }
    ];
    
    const inverseIdents = [
      {
        name: "Arcoseno",
        formula: "sin(arcsin(x)) = x",
        result: `sin(arcsin(${sin.toFixed(2)})) = ${Math.sin(Math.asin(sin)).toFixed(precision)}`,
        verified: Math.abs(Math.sin(Math.asin(sin)) - sin) < 0.0001,
        explanation: "Esta es la propiedad fundamental de las funciones inversas: aplicar una función y luego su inversa devuelve el valor original (dentro del dominio adecuado)."
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

  // Componente para mostrar pasos detallados
  const StepDetailComponent = ({ step, isLast }: { step: StepDetail; isLast: boolean }) => (
    <div className={`p-4 ${isLast ? '' : 'border-b'} border-gray-200 dark:border-gray-700`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-1">
          <span className="font-bold text-blue-700 dark:text-blue-300">{step.step}</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{step.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{step.description}</p>
          
          {step.formula && (
            <div className="mb-2">
              <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Fórmula:</div>
              <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
                {step.formula}
              </div>
            </div>
          )}
          
          {step.calculation && (
            <div className="mb-2">
              <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Cálculo:</div>
              <div className="font-mono bg-blue-50 dark:bg-blue-900/30 p-2 rounded text-sm">
                {step.calculation}
              </div>
            </div>
          )}
          
          {step.result && (
            <div className="mb-2">
              <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Resultado:</div>
              <div className="font-mono bg-green-50 dark:bg-green-900/30 p-2 rounded text-sm font-bold">
                {step.result}
              </div>
            </div>
          )}
          
          {step.explanation && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-500 mb-1 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Explicación:
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{step.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Componente de teclado numérico para móvil
  const MobileNumberPad = () => (
    <div className="md:hidden">
      <div className="grid grid-cols-4 gap-2 mb-3">
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
      
      <div className="grid grid-cols-5 gap-2 mb-4">
        {['C', '(', ')', '^', '√'].map((op) => (
          <Button 
            key={op}
            variant="secondary"
            size="sm"
            className="h-10"
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
  );

  // Renderizado condicional para móvil vs escritorio
  const renderTabsList = () => (
    <TabsList className={`w-full rounded-xl mb-6 ${mobileView ? 'flex overflow-x-auto p-1' : 'grid grid-cols-2 md:grid-cols-7 gap-2 p-1'} bg-gray-100 dark:bg-gray-800`}>
      <TabsTrigger value="basic" className={`rounded-lg gap-2 ${mobileView ? 'flex-shrink-0 px-4' : ''}`}>
        <Calculator className="h-4 w-4" />
        <span className={mobileView ? '' : 'hidden md:inline'}>Básica</span>
      </TabsTrigger>
      <TabsTrigger value="trig" className={`rounded-lg gap-2 ${mobileView ? 'flex-shrink-0 px-4' : ''}`}>
        <PieChart className="h-4 w-4" />
        <span className={mobileView ? '' : 'hidden md:inline'}>Trigonometría</span>
      </TabsTrigger>
      <TabsTrigger value="triangle" className={`rounded-lg gap-2 ${mobileView ? 'flex-shrink-0 px-4' : ''}`}>
        <Triangle className="h-4 w-4" />
        <span className={mobileView ? '' : 'hidden md:inline'}>Triángulos</span>
      </TabsTrigger>
      <TabsTrigger value="algebra" className={`rounded-lg gap-2 ${mobileView ? 'flex-shrink-0 px-4' : ''}`}>
        <Code className="h-4 w-4" />
        <span className={mobileView ? '' : 'hidden md:inline'}>Álgebra</span>
      </TabsTrigger>
      <TabsTrigger value="calculus" className={`rounded-lg gap-2 ${mobileView ? 'flex-shrink-0 px-4' : ''}`}>
        <Sigma className="h-4 w-4" />
        <span className={mobileView ? '' : 'hidden md:inline'}>Cálculo</span>
      </TabsTrigger>
      <TabsTrigger value="graph" className={`rounded-lg gap-2 ${mobileView ? 'flex-shrink-0 px-4' : ''}`}>
        <LineChart className="h-4 w-4" />
        <span className={mobileView ? '' : 'hidden md:inline'}>Gráficas</span>
      </TabsTrigger>
      <TabsTrigger value="identity" className={`rounded-lg gap-2 ${mobileView ? 'flex-shrink-0 px-4' : ''}`}>
        <Grid3x3 className="h-4 w-4" />
        <span className={mobileView ? '' : 'hidden md:inline'}>Identidades</span>
      </TabsTrigger>
    </TabsList>
  );

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"} transition-colors duration-200`}>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Header optimizado para móvil */}
        <Card className="p-4 sm:p-6 rounded-2xl border-l-4 shadow-lg mb-6" style={{ borderLeftColor: "hsl(var(--matematicas))" }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={`${mobileView ? 'w-12 h-12' : 'w-14 h-14'} rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg`}>
                <Sigma className={`${mobileView ? 'h-6 w-6' : 'h-7 w-7'} text-white`} />
              </div>
              <div>
                <h1 className={`${mobileView ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                  {mobileView ? 'Calc. Matemática' : 'Calculadora Matemática Profesional'}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-1 sm:gap-2">
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Check className="h-2 w-2" /> Trig
                  </Badge>
                  <ChevronRight className="h-3 w-3" />
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <ChevronRight className="h-2 w-2" /> Álg
                  </Badge>
                  <ChevronRight className="h-3 w-3" />
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <ChevronRight className="h-2 w-2" /> Calc
                  </Badge>
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Label className="text-xs sm:text-sm whitespace-nowrap">Prec.:</Label>
                <Select value={precision.toString()} onValueChange={(v) => setPrecision(parseInt(v))}>
                  <SelectTrigger className={`${mobileView ? 'w-20' : 'w-28'}`}>
                    <SelectValue>{precision} dec</SelectValue>
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
                size={mobileView ? "sm" : "icon"}
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="rounded-full"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {mobileView && <span className="ml-2">Tema</span>}
              </Button>
            </div>
          </div>

          {/* Tabs optimizados para móvil */}
          <Tabs value={calcType} onValueChange={(v) => setCalcType(v as typeof calcType)} className="w-full">
            {renderTabsList()}

            {/* Contenido de pestañas optimizado para móvil */}
            
            {/* Calculadora Básica */}
            <TabsContent value="basic" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="p-4 sm:p-6">
                    <div className="mb-6">
                      <div className="text-right p-3 sm:p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
                        <div className="text-xs sm:text-sm text-muted-foreground text-left">Expresión:</div>
                        <div className="text-base sm:text-xl font-mono break-all min-h-6 sm:min-h-8 overflow-x-auto">{basicInput || "0"}</div>
                        <div className={`${mobileView ? 'text-2xl' : 'text-3xl'} font-bold text-primary mt-2`}>{basicResult}</div>
                      </div>
                      
                      {/* Teclado para móvil */}
                      {mobileView && <MobileNumberPad />}
                      
                      {/* Teclado para escritorio */}
                      {!mobileView && (
                        <>
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
                          
                          <div className="grid grid-cols-5 gap-2 mb-4">
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
                        </>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">Funciones matemáticas</Label>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'exp(', 'abs(', 'π', 'e'].map((func) => (
                            <Badge
                              key={func}
                              variant="outline"
                              className="cursor-pointer px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
                              onClick={() => handleOperationClick(func)}
                            >
                              {func}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                          value={basicInput}
                          onChange={(e) => setBasicInput(e.target.value)}
                          placeholder="Ej: 2+3*sin(π/4)+sqrt(9)"
                          className="flex-1 h-12 text-base sm:text-lg"
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
                  
                  {/* Pasos detallados para cálculo básico */}
                  {showDetailedSteps && basicSteps.length > 0 && (
                    <Card className="p-4 sm:p-6 mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Pasos Detallados
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDetailedSteps(!showDetailedSteps)}
                        >
                          {showDetailedSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {basicSteps.map((step, idx) => (
                          <StepDetailComponent key={idx} step={step} isLast={idx === basicSteps.length - 1} />
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
                
                <div className="space-y-6">
                  <Card className="p-4 sm:p-6">
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
                  
                  <Card className="p-4 sm:p-6">
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

            {/* Trigonometría - Optimizado para móvil */}
            <TabsContent value="trig" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-4 sm:p-6">
                  <h3 className="font-bold text-xl mb-6">Calculadora Trigonométrica</h3>
                  <div className="space-y-6">
                    <div>
                      <Label className="mb-2 block">Unidad angular</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['deg', 'rad', 'grad'] as const).map(unit => (
                          <Button
                            key={unit}
                            variant={angleUnit === unit ? "default" : "outline"}
                            onClick={() => setAngleUnit(unit)}
                            className={`h-10 sm:h-12 ${mobileView ? 'text-xs' : ''}`}
                          >
                            {unit === 'deg' ? 'Grados' : unit === 'rad' ? 'Radianes' : 'Gradianes'}
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
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {notableAngles.slice(0, mobileView ? 8 : notableAngles.length).map((a) => (
                          <Badge
                            key={a}
                            variant="outline"
                            className="cursor-pointer px-2 sm:px-3 py-1 sm:py-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => setAngle(a.toString())}
                          >
                            {a}°
                          </Badge>
                        ))}
                        {mobileView && notableAngles.length > 8 && (
                          <Badge variant="outline" className="px-3 py-2">
                            +{notableAngles.length - 8} más
                          </Badge>
                        )}
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
                  <Card className="p-4 sm:p-6">
                    <h3 className="font-bold text-xl mb-6">
                      Resultados para {trigResult.angle}{angleUnit === "deg" ? "°" : angleUnit === "rad" ? " rad" : " grad"}
                    </h3>
                    <div className="space-y-6">
                      <div className={`grid ${mobileView ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'} gap-3 sm:gap-4`}>
                        {[
                          { name: "Seno", value: trigResult.sin, abbr: "sin", exact: trigResult.exactValues?.sin },
                          { name: "Coseno", value: trigResult.cos, abbr: "cos", exact: trigResult.exactValues?.cos },
                          { name: "Tangente", value: trigResult.tan, abbr: "tan", exact: trigResult.exactValues?.tan },
                          { name: "Cotangente", value: trigResult.cot, abbr: "cot" },
                          { name: "Secante", value: trigResult.sec, abbr: "sec" },
                          { name: "Cosecante", value: trigResult.csc, abbr: "csc" }
                        ].map((item) => (
                          <div key={item.abbr} className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="text-xs sm:text-sm text-muted-foreground">{item.name}</div>
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
                            <div className={`${mobileView ? 'text-xl' : 'text-2xl'} font-bold text-primary my-2`}>
                              {isNaN(item.value) ? "∞" : item.value.toFixed(precision)}
                            </div>
                            {item.exact && (
                              <div className="text-xs sm:text-sm font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-1 sm:p-2 rounded">
                                {item.exact}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Información adicional</h4>
                        <div className={`grid ${mobileView ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-2 sm:gap-3 text-xs sm:text-sm`}>
                          <div>
                            <div className="text-muted-foreground">Cuadrante</div>
                            <div className="font-semibold">
                              {trigResult.angle % 360 <= 90 ? "I" : 
                               trigResult.angle % 360 <= 180 ? "II" : 
                               trigResult.angle % 360 <= 270 ? "III" : "IV"}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Ref.</div>
                            <div className="font-semibold">{(trigResult.angle % 90).toFixed(1)}°</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Rad</div>
                            <div className="font-semibold">{(trigResult.angle * Math.PI / 180).toFixed(precision)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Grad</div>
                            <div className="font-semibold">{(trigResult.angle * 200 / 180).toFixed(precision)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Triángulos - Optimizado para móvil */}
            <TabsContent value="triangle" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-4 sm:p-6">
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
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                              <Label>Lado a</Label>
                              <Input
                                type="number"
                                value={sideA}
                                onChange={(e) => setSideA(e.target.value)}
                                placeholder="5"
                                className="h-10 sm:h-12"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Lado b</Label>
                              <Input
                                type="number"
                                value={sideB}
                                onChange={(e) => setSideB(e.target.value)}
                                placeholder="7"
                                className="h-10 sm:h-12"
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
                              className="h-10 sm:h-12"
                            />
                          </div>
                        </>
                      )}
                      
                      {triangleType === "SSS" && (
                        <div className="grid grid-cols-3 gap-3 sm:gap-4">
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
                                className="h-10 sm:h-12"
                              />
                            </div>
                          ))}
                        </div>
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
                    
                    {mobileView && triangleResult && (
                      <div className="mt-6">
                        <h4 className="font-bold text-lg mb-3">Resultados</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="text-xs text-muted-foreground">Área</div>
                            <div className="text-lg font-bold text-purple-600">{triangleResult.area.toFixed(4)}</div>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="text-xs text-muted-foreground">Perímetro</div>
                            <div className="text-lg font-bold text-purple-600">{triangleResult.perimeter.toFixed(4)}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {triangleResult && (
                  <div className="space-y-6">
                    {!mobileView && (
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
                    )}
                    
                    {/* Pasos detallados */}
                    {showDetailedSteps && triangleResult.steps.length > 0 && (
                      <Card className="p-4 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-lg flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Procedimiento Paso a Paso
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDetailedSteps(!showDetailedSteps)}
                          >
                            {showDetailedSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {triangleResult.steps.map((step, idx) => {
                            const stepDetail: StepDetail = {
                              step: step.step,
                              title: `Paso ${step.step}`,
                              description: step.description,
                              formula: step.formula || "",
                              calculation: step.calculation || "",
                              result: step.result || "",
                              explanation: step.description // Usamos la descripción como explicación
                            };
                            return <StepDetailComponent key={idx} step={stepDetail} isLast={idx === triangleResult.steps.length - 1} />;
                          })}
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* El resto de las pestañas siguen el mismo patrón de optimización... */}
            {/* Por limitaciones de espacio, se mantiene la estructura pero adaptada para móvil */}
            
            {/* Algebra - Versión móvil simplificada */}
            <TabsContent value="algebra" className="space-y-6 animate-fade-in">
              <Card className="p-4 sm:p-6">
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
                            className="cursor-pointer text-xs sm:text-sm"
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
                            className="cursor-pointer text-xs sm:text-sm"
                            onClick={() => setEquation(eq)}
                          >
                            {eq}
                          </Badge>
                        ))}
                      </>
                    )}
                  </div>

                  <Button onClick={solveEquation} className="w-full h-12 gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                    <Code className="h-4 w-4" />
                    Resolver Ecuación
                  </Button>
                </div>
              </Card>

              {algebraResult.length > 0 && (
                <>
                  <Card className="p-4 sm:p-6">
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
                          <div className={`font-mono ${mobileView ? 'text-base' : 'text-lg'} font-bold ${
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
                  
                  {/* Pasos detallados para álgebra */}
                  {showDetailedSteps && algebraSteps.length > 0 && (
                    <Card className="p-4 sm:p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Pasos de Solución
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDetailedSteps(!showDetailedSteps)}
                        >
                          {showDetailedSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {algebraSteps.map((step, idx) => (
                          <StepDetailComponent key={idx} step={step} isLast={idx === algebraSteps.length - 1} />
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* Cálculo - Versión móvil simplificada */}
            <TabsContent value="calculus" className="space-y-6 animate-fade-in">
              <Card className="p-4 sm:p-6">
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
                        className="cursor-pointer text-xs sm:text-sm"
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
                <>
                  <Card className="p-4 sm:p-6">
                    <h3 className="font-bold text-xl mb-6">Resultados</h3>
                    <div className="space-y-6">
                      {calculusType === "derivative" && calculusResult.derivative && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                          <div className="text-sm text-muted-foreground mb-2">Derivada</div>
                          <div className={`font-mono ${mobileView ? 'text-xl' : 'text-2xl'} font-bold text-blue-700 dark:text-blue-300`}>
                            {calculusResult.derivative}
                          </div>
                        </div>
                      )}
                      
                      {/* Pasos detallados para cálculo */}
                      {showDetailedSteps && calculusSteps.length > 0 && (
                        <Card className="p-4 sm:p-6 mt-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                              <BookOpen className="h-5 w-5" />
                              Desarrollo
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDetailedSteps(!showDetailedSteps)}
                            >
                              {showDetailedSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {calculusSteps.map((step, idx) => (
                              <StepDetailComponent key={idx} step={step} isLast={idx === calculusSteps.length - 1} />
                            ))}
                          </div>
                        </Card>
                      )}
                    </div>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Gráficas - Versión móvil simplificada */}
            <TabsContent value="graph" className="space-y-6 animate-fade-in">
              <Card className="p-4 sm:p-6">
                <div className={`${mobileView ? 'h-[300px]' : 'h-[400px]'}`}>
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Generando gráfica...</p>
                      </div>
                    </div>
                  ) : graphError ? (
                    <div className="h-full flex items-center justify-center">
                      <Alert variant="destructive" className="max-w-md">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{graphError}</AlertDescription>
                      </Alert>
                    </div>
                  ) : graphData ? (
                    renderGraph()
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                        <p>Ingresa una función para ver la gráfica</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-4 sm:p-6 lg:col-span-2">
                  <h3 className="font-bold text-lg mb-4">Configuración</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Función f(x)</Label>
                      <Input
                        value={functionInput}
                        onChange={(e) => setFunctionInput(e.target.value)}
                        placeholder="sin(x)"
                        className="h-10 sm:h-12"
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
                      <Label>Precisión (paso): {graphRange.step.toFixed(2)}</Label>
                      <Slider
                        value={[graphRange.step]}
                        onValueChange={([value]) => setGraphRange(prev => ({ ...prev, step: value }))}
                        min={0.01}
                        max={1}
                        step={0.01}
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {['sin(x)', 'cos(x)', 'x^2', 'sqrt(x)', 'log(x)', '1/x'].map((func) => (
                        <Badge
                          key={func}
                          variant="secondary"
                          className="cursor-pointer text-xs sm:text-sm"
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
                    
                    {graphError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{graphError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </Card>
                
                <Card className="p-4 sm:p-6">
                  <h3 className="font-bold text-lg mb-4">Opciones</h3>
                  <div className="space-y-4">
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
                      <div className="flex flex-wrap gap-2">
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
                          <Label htmlFor="derivative-switch" className="text-sm">Derivada f'(x)</Label>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={showIntegral}
                            onCheckedChange={setShowIntegral}
                            id="integral-switch"
                          />
                          <Label htmlFor="integral-switch" className="text-sm">Integral ∫f(x)dx</Label>
                        </div>
                      </div>
                    </div>
                    
                    {graphData && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="text-xs text-muted-foreground">Puntos calculados</div>
                        <div className="font-bold">{graphData.points.length}</div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Identidades - Versión móvil simplificada */}
            <TabsContent value="identity" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-4 sm:p-6">
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
                  <Card className="p-4 sm:p-6">
                    <h3 className="font-bold text-xl mb-6">
                      Identidades {identityType === 'basic' ? 'Básicas' : identityType === 'advanced' ? 'Avanzadas' : 'Inversas'} para θ = {identityAngle}°
                    </h3>
                    <div className="space-y-4">
                      {identities.map((id, idx) => (
                        <div key={idx} className="p-4 border rounded-xl hover:border-primary transition-colors bg-white dark:bg-gray-800">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                            <div className="flex-1">
                              <div className="font-semibold text-primary text-lg">{id.name}</div>
                              <div className="font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded text-sm mt-2">
                                {id.formula}
                              </div>
                            </div>
                            {id.verified && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 self-start">
                                <Check className="h-3 w-3 mr-1" /> Verificada
                              </Badge>
                            )}
                          </div>
                          <div className="font-mono text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded mb-3">
                            {id.result}
                          </div>
                          {id.explanation && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                              {id.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Historial optimizado para móvil */}
        {history.length > 0 && (
          <Card className="p-4 sm:p-6 rounded-2xl shadow-lg mt-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="font-bold text-lg sm:text-xl flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(history.map(h => `${h.input} = ${h.result}`).join('\n'))}
                  className="gap-1"
                >
                  <Copy className="h-3 w-3" />
                  {!mobileView && "Copiar"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearHistory}
                  className="gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  {!mobileView && "Limpiar"}
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {history.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {item.type.substring(0, 3)}
                        </Badge>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="font-medium text-sm truncate">{item.input}</div>
                      <div className="font-bold text-primary mt-1 truncate">{item.result}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 flex-shrink-0 ml-2"
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

        {/* Guía optimizada para móvil */}
        <Card className="p-4 sm:p-8 rounded-2xl shadow-lg mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-start gap-3 sm:gap-4">
            <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-lg sm:text-2xl mb-3 sm:mb-4">Guía Completa de Uso</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="font-semibold text-base sm:text-lg text-primary">🧮 Calculadora Básica</div>
                  <ul className="text-muted-foreground space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <li>• Operaciones aritméticas</li>
                    <li>• Funciones: sin, cos, tan</li>
                    <li>• Constantes: π, e</li>
                    <li>• Exponentes: ^</li>
                  </ul>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="font-semibold text-base sm:text-lg text-primary">📐 Trigonometría</div>
                  <ul className="text-muted-foreground space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <li>• 6 funciones trigonométricas</li>
                    <li>• Grados, radianes, gradianes</li>
                    <li>• Valores exactos</li>
                    <li>• Información de cuadrantes</li>
                  </ul>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="font-semibold text-base sm:text-lg text-primary">📊 Gráficas</div>
                  <ul className="text-muted-foreground space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <li>• Funciones matemáticas</li>
                    <li>• Derivadas e integrales</li>
                    <li>• Ajuste de dominio</li>
                    <li>• Tipos: línea, área, barras</li>
                  </ul>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="font-semibold text-base sm:text-lg text-primary">🔢 Álgebra & Cálculo</div>
                  <ul className="text-muted-foreground space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <li>• Ecuaciones lineales/cuadráticas</li>
                    <li>• Derivadas e integrales</li>
                    <li>• Procedimientos paso a paso</li>
                    <li>• Evaluación en puntos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Botones de acción optimizados para móvil */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t">
          {mobileView ? (
            <>
              <Button variant="outline" size="sm" className="gap-1 flex-1 min-w-[120px]">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" className="gap-1 flex-1 min-w-[120px]">
                <Save className="h-4 w-4" />
                Guardar
              </Button>
              <Button className="gap-1 flex-1 min-w-[120px] bg-gradient-to-r from-blue-600 to-purple-600">
                <Calculator className="h-4 w-4" />
                Nueva
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className="text-center text-xs sm:text-sm text-muted-foreground mt-6 sm:mt-8 pt-4 border-t">
          <p>© 2024 Calculadora Matemática Profesional • Para todos los niveles educativos</p>
          <p className="mt-1 sm:mt-2">Precisión: {precision} decimales • {theme === "light" ? "Tema claro" : "Tema oscuro"}</p>
        </div>
      </div>
    </div>
  );
}