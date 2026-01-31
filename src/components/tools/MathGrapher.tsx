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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Sigma, Calculator, Triangle, PieChart, 
  LineChart, Grid3x3, History,
  Zap, RotateCw, Download, Share2,
  ChevronRight, Info, HelpCircle,
  Check, X, Minus, Divide, Plus,
  Save, Copy, Trash2, Moon, Sun,
  Code, Variable, Square, Braces,
  AlertCircle, BookOpen, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Thermometer, Percent,
  Hash, DollarSign, Target, ZoomIn,
  ZoomOut, RefreshCw, Clock, BarChart3,
  TrendingUp, Compass, Ruler, Layers,
  Shield, Lock, Unlock, Globe,
  Smartphone, Monitor, Tablet, Wifi,
  Battery, Bluetooth, Radio, WifiOff,
  Settings as SettingsIcon
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Area, AreaChart, Scatter, ScatterChart } from 'recharts';

// ==================== INTERFACES Y TIPOS ====================
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
  valid: boolean;
  sides: { a: number; b: number; c: number };
  angles?: { A: number; B: number; C: number };
  area?: number;
  perimeter?: number;
  type?: string;
  steps: Array<{
    step: number;
    description: string;
    formula?: string;
    calculation?: string;
    result?: string;
  }>;
  height?: number;
  inscribedRadius?: number;
  circumscribedRadius?: number;
  errors?: string[];
  sumArithmetic?: number;
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
  steps: StepDetail[];
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

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}

interface AlgebraResult {
  solutions: string[];
  discriminant?: number;
  nature?: string;
  steps: StepDetail[];
}

interface BasicOperation {
  type: string;
  value: string;
}

// ==================== CONSTANTES Y DATOS ====================
const NOTABLE_ANGLES = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];

const EXACT_VALUES: Record<number, { sin: string; cos: string; tan: string }> = {
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
};

const GRAPH_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
];

const TEST_CASES_SSS = [
  { name: "Válido (3,4,5)", a: 3, b: 4, c: 5, expected: "Triángulo rectángulo escaleno" },
  { name: "Equilátero (10,10,10)", a: 10, b: 10, c: 10, expected: "Triángulo equilátero" },
  { name: "Inválido (50,7,40)", a: 50, b: 7, c: 40, expected: "Error de desigualdad" },
  { name: "Inválido (5,0,5)", a: 5, b: 0, c: 5, expected: "Error lado ≤ 0" },
  { name: "Inválido (3,4,-5)", a: 3, b: 4, c: -5, expected: "Error lado ≤ 0" },
  { name: "Límite válido (1,1,1.9999)", a: 1, b: 1, c: 1.9999, expected: "Triángulo isósceles" },
  { name: "Límite inválido (1,1,2)", a: 1, b: 1, c: 2, expected: "Error de desigualdad" },
];

const BASIC_OPERATIONS = [
  { type: "number", value: "7" }, { type: "number", value: "8" }, { type: "number", value: "9" }, { type: "operator", value: "/" },
  { type: "number", value: "4" }, { type: "number", value: "5" }, { type: "number", value: "6" }, { type: "operator", value: "*" },
  { type: "number", value: "1" }, { type: "number", value: "2" }, { type: "number", value: "3" }, { type: "operator", value: "-" },
  { type: "number", value: "0" }, { type: "number", value: "." }, { type: "operator", value: "=" }, { type: "operator", value: "+" }
];

const ADVANCED_OPERATIONS = [
  { type: "function", value: "sqrt(", display: "√" },
  { type: "function", value: "sin(", display: "sin" },
  { type: "function", value: "cos(", display: "cos" },
  { type: "function", value: "tan(", display: "tan" },
  { type: "function", value: "log(", display: "log" },
  { type: "function", value: "ln(", display: "ln" },
  { type: "constant", value: "π", display: "π" },
  { type: "constant", value: "e", display: "e" },
  { type: "operator", value: "^", display: "^" },
  { type: "parenthesis", value: "(", display: "(" },
  { type: "parenthesis", value: ")", display: ")" },
  { type: "clear", value: "C", display: "C" }
];

// ==================== COMPONENTE PRINCIPAL ====================
export function MathGrapher() {
  // ==================== ESTADOS PRINCIPALES ====================
  const [calcType, setCalcType] = useState<"trig" | "triangle" | "identity" | "graph" | "basic" | "algebra" | "calculus">("basic");
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");
  const [precision, setPrecision] = useState(6);
  const [history, setHistory] = useState<MathHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("mathgrapher_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convertir timestamps a Date
        return parsed.map((item: any) => ({
          ...item,
          timestamp: item.timestamp ? new Date(item.timestamp) : new Date()
        }));
      }
      return [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [graphType, setGraphType] = useState<"line" | "bar" | "area" | "scatter">("line");
  const [showDetailedSteps, setShowDetailedSteps] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1024,
    screenHeight: 768
  });
  const [advancedMode, setAdvancedMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(false);

  // ==================== ESTADOS DE CÁLCULO ====================
  const [angle, setAngle] = useState("45");
  const [angleUnit, setAngleUnit] = useState<"deg" | "rad" | "grad">("deg");
  const [trigResult, setTrigResult] = useState<TrigResult | null>(null);
  const [trigSteps, setTrigSteps] = useState<StepDetail[]>([]);

  const [triangleType, setTriangleType] = useState<"SSS" | "SAS" | "ASA" | "AAS">("SSS");
  const [sideA, setSideA] = useState("3");
  const [sideB, setSideB] = useState("4");
  const [sideC, setSideC] = useState("5");
  const [angleA, setAngleA] = useState("");
  const [angleB, setAngleB] = useState("");
  const [angleC, setAngleC] = useState("60");
  const [triangleResult, setTriangleResult] = useState<TriangleResult | null>(null);

  const [identityAngle, setIdentityAngle] = useState("30");
  const [identityType, setIdentityType] = useState<"basic" | "advanced" | "inverse">("basic");
  const [identityResult, setIdentityResult] = useState<string>("");
  const [identitySteps, setIdentitySteps] = useState<StepDetail[]>([]);

  const [functionInput, setFunctionInput] = useState("sin(x)");
  const [graphRange, setGraphRange] = useState({ min: -10, max: 10, step: 0.1 });
  const [graphData, setGraphData] = useState<FunctionData | null>(null);
  const [showDerivative, setShowDerivative] = useState(false);
  const [showIntegral, setShowIntegral] = useState(false);
  const [graphColor, setGraphColor] = useState(GRAPH_COLORS[0]);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [multipleFunctions, setMultipleFunctions] = useState<string[]>(["sin(x)"]);
  const [functionColors, setFunctionColors] = useState<string[]>([GRAPH_COLORS[0]]);

  const [basicInput, setBasicInput] = useState("3+4*2");
  const [basicResult, setBasicResult] = useState<string>("");
  const [basicSteps, setBasicSteps] = useState<StepDetail[]>([]);
  const [basicHistory, setBasicHistory] = useState<string[]>([]);

  const [equation, setEquation] = useState("2x + 3 = 7");
  const [algebraResult, setAlgebraResult] = useState<AlgebraResult>({ solutions: [], steps: [] });
  const [equationType, setEquationType] = useState<"linear" | "quadratic" | "system">("linear");
  const [algebraError, setAlgebraError] = useState<string>("");

  const [calculusFunction, setCalculusFunction] = useState("x^2");
  const [calculusType, setCalculusType] = useState<"derivative" | "integral" | "limit">("derivative");
  const [calculusResult, setCalculusResult] = useState<CalculusResult>({
    derivative: "",
    integral: "",
    limit: "",
    steps: []
  });
  const [calculusSteps, setCalculusSteps] = useState<StepDetail[]>([]);
  const [atPoint, setAtPoint] = useState("0");

  // ==================== CALCULAR TEMA ACTUAL ====================
  const currentTheme = useMemo(() => {
    if (theme === "auto") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  }, [theme]);

  // ==================== EFECTOS Y HOOKS ====================
  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height
      });
    };

    updateDeviceInfo();
    window.addEventListener("resize", updateDeviceInfo);
    return () => window.removeEventListener("resize", updateDeviceInfo);
  }, []);

  useEffect(() => {
    const savedHistory = localStorage.getItem("mathgrapher_history");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: item.timestamp ? new Date(item.timestamp) : new Date()
        })));
      } catch (error) {
        console.error("Error loading history:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mathgrapher_history", JSON.stringify(history));
  }, [history]);

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

  useEffect(() => {
    const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (theme === "auto") {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };

    darkModePreference.addEventListener("change", handleThemeChange);
    return () => darkModePreference.removeEventListener("change", handleThemeChange);
  }, [theme]);

  useEffect(() => {
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [currentTheme]);

  // ==================== FUNCIONES UTILITARIAS ====================
  const playSound = (type: "click" | "success" | "error" | "calculate") => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    let frequency = 440;
    switch (type) {
      case "click": frequency = 220; break;
      case "success": frequency = 523.25; break;
      case "error": frequency = 220; break;
      case "calculate": frequency = 659.25; break;
    }
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const vibrate = (pattern: number | number[]) => {
    if (hapticFeedback && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const addToHistory = (type: string, input: string, result: string) => {
    const newItem: MathHistoryItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      input,
      result: result.length > 100 ? result.substring(0, 100) + "..." : result,
      timestamp: new Date()
    };
    
    setHistory(prev => [newItem, ...prev.slice(0, 49)]);
    playSound("calculate");
    vibrate(50);
  };

  const safeEval = (expression: string): { result: any; error: string | null; steps: string[] } => {
    const steps: string[] = [];
    try {
      let processedExpr = expression
        .replace(/\s/g, '')
        .replace(/π/gi, 'Math.PI')
        .replace(/pi/gi, 'Math.PI')
        .replace(/e/gi, 'Math.E')
        .replace(/\^/g, '**')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/exp\(/g, 'Math.exp(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/floor\(/g, 'Math.floor(')
        .replace(/ceil\(/g, 'Math.ceil(')
        .replace(/round\(/g, 'Math.round(');

      steps.push(`Expresión procesada: ${processedExpr}`);

      const result = Function('"use strict"; return (' + processedExpr + ')')();
      
      if (typeof result === 'number') {
        if (isNaN(result)) {
          return { result: null, error: "Resultado indefinido (NaN)", steps };
        }
        if (!isFinite(result)) {
          return { result: null, error: "Resultado infinito", steps };
        }
      }
      
      return { result, error: null, steps };
    } catch (error: any) {
      return { result: null, error: `Error de sintaxis: ${error.message}`, steps };
    }
  };

  const parseEquation = (eq: string): { left: string; right: string; steps: string[] } => {
    const steps: string[] = [];
    const parts = eq.split('=');
    if (parts.length !== 2) {
      throw new Error("Ecuación inválida. Debe tener un signo =");
    }
    
    steps.push(`Ecuación original: ${eq}`);
    steps.push(`Lado izquierdo: ${parts[0]}`);
    steps.push(`Lado derecho: ${parts[1]}`);
    
    return { left: parts[0].trim(), right: parts[1].trim(), steps };
  };

  // ==================== SISTEMA SSS PERFECTO ====================
  const validateTriangleSSS = (a: number, b: number, c: number) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (a <= 0) errors.push(`Lado a = ${a} debe ser mayor que 0`);
    if (b <= 0) errors.push(`Lado b = ${b} debe ser mayor que 0`);
    if (c <= 0) errors.push(`Lado c = ${c} debe ser mayor que 0`);
    
    if (errors.length === 0) {
      if (a + b <= c) errors.push(`a + b = ${a + b} ≤ c = ${c} (viola a + b > c)`);
      if (a + c <= b) errors.push(`a + c = ${a + c} ≤ b = ${b} (viola a + c > b)`);
      if (b + c <= a) errors.push(`b + c = ${b + c} ≤ a = ${a} (viola b + c > a)`);
      
      if (a + b - c < 0.0001) warnings.push(`a + b ≈ c (casi degenerado)`);
      if (a + c - b < 0.0001) warnings.push(`a + c ≈ b (casi degenerado)`);
      if (b + c - a < 0.0001) warnings.push(`b + c ≈ a (casi degenerado)`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sumArithmetic: a + b + c
    };
  };

  const solveTriangleSSS = (a: number, b: number, c: number) => {
    const perimeter = a + b + c;
    const s = perimeter / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    
    const calculateAngle = (opp: number, adj1: number, adj2: number) => {
      const cos = (adj1 * adj1 + adj2 * adj2 - opp * opp) / (2 * adj1 * adj2);
      const clampedCos = Math.max(-1, Math.min(1, cos));
      return Math.acos(clampedCos) * 180 / Math.PI;
    };
    
    const angleA = calculateAngle(a, b, c);
    const angleB = calculateAngle(b, a, c);
    const angleC = 180 - angleA - angleB;
    
    let type = "Escaleno";
    if (Math.abs(a - b) < 1e-10 && Math.abs(b - c) < 1e-10) {
      type = "Equilátero";
    } else if (Math.abs(a - b) < 1e-10 || Math.abs(a - c) < 1e-10 || Math.abs(b - c) < 1e-10) {
      type = "Isósceles";
    }
    
    let angleType = "Acutángulo";
    const maxAngle = Math.max(angleA, angleB, angleC);
    if (Math.abs(maxAngle - 90) < 1e-5) {
      angleType = "Rectángulo";
    } else if (maxAngle > 90) {
      angleType = "Obtusángulo";
    }
    
    const height = (2 * area) / a;
    const inscribedRadius = area / s;
    const circumscribedRadius = (a * b * c) / (4 * area);
    
    return {
      perimeter,
      area,
      angles: { A: angleA, B: angleB, C: angleC, sum: angleA + angleB + angleC },
      type: `${type} ${angleType}`,
      semiperimeter: s,
      height,
      inscribedRadius,
      circumscribedRadius
    };
  };

  const generateSSSSteps = (a: number, b: number, c: number, validation: any, solution: any) => {
    const steps = [];
    let step = 1;
    
    if (!validation.isValid) {
      steps.push({
        step: step++,
        description: "Validación de entrada",
        formula: "Condiciones: a > 0, b > 0, c > 0, a + b > c, a + c > b, b + c > a",
        calculation: `a = ${a}, b = ${b}, c = ${c}`,
        result: "❌ TRIÁNGULO INVÁLIDO"
      });
      
      validation.errors.forEach((error: string) => {
        steps.push({
          step: step++,
          description: "Error de validación",
          formula: "",
          calculation: "",
          result: `✗ ${error}`
        });
      });
      
      steps.push({
        step: step++,
        description: "Suma aritmética (no perímetro)",
        formula: "suma = a + b + c",
        calculation: `${a} + ${b} + ${c}`,
        result: `Suma = ${validation.sumArithmetic}`
      });
      
      return steps;
    }
    
    steps.push({
      step: step++,
      description: "✓ Validación exitosa",
      formula: "a > 0, b > 0, c > 0, a + b > c, a + c > b, b + c > a",
      calculation: `${a} > 0 ✓, ${b} > 0 ✓, ${c} > 0 ✓\n${a}+${b}=${a+b}>${c} ✓\n${a}+${c}=${a+c}>${b} ✓\n${b}+${c}=${b+c}>${a} ✓`,
      result: "TODAS LAS CONDICIONES CUMPLIDAS"
    });
    
    if (validation.warnings.length > 0) {
      validation.warnings.forEach((warning: string) => {
        steps.push({
          step: step++,
          description: "Advertencia",
          formula: "",
          calculation: "",
          result: `⚠ ${warning}`
        });
      });
    }
    
    steps.push({
      step: step++,
      description: "Perímetro del triángulo",
      formula: "P = a + b + c",
      calculation: `P = ${a} + ${b} + ${c}`,
      result: `P = ${solution.perimeter.toFixed(4)}`
    });
    
    steps.push({
      step: step++,
      description: "Semiperímetro (para Fórmula de Herón)",
      formula: "s = P / 2",
      calculation: `s = ${solution.perimeter.toFixed(4)} / 2`,
      result: `s = ${solution.semiperimeter.toFixed(4)}`
    });
    
    steps.push({
      step: step++,
      description: "Área (Fórmula de Herón)",
      formula: "A = √[s(s-a)(s-b)(s-c)]",
      calculation: `A = √[${solution.semiperimeter.toFixed(4)}×(${solution.semiperimeter.toFixed(4)}-${a})×(${solution.semiperimeter.toFixed(4)}-${b})×(${solution.semiperimeter.toFixed(4)}-${c})]`,
      result: `A = ${solution.area.toFixed(4)}`
    });
    
    steps.push({
      step: step++,
      description: "Ángulo A (Ley de Cosenos)",
      formula: "cos(A) = (b² + c² - a²) / (2bc)",
      calculation: `cos(A) = (${b}² + ${c}² - ${a}²) / (2×${b}×${c})`,
      result: `A = ${solution.angles.A.toFixed(2)}°`
    });
    
    steps.push({
      step: step++,
      description: "Ángulo B (Ley de Cosenos)",
      formula: "cos(B) = (a² + c² - b²) / (2ac)",
      calculation: `cos(B) = (${a}² + ${c}² - ${b}²) / (2×${a}×${c})`,
      result: `B = ${solution.angles.B.toFixed(2)}°`
    });
    
    steps.push({
      step: step++,
      description: "Ángulo C (Suma de ángulos)",
      formula: "C = 180° - A - B",
      calculation: `C = 180° - ${solution.angles.A.toFixed(2)}° - ${solution.angles.B.toFixed(2)}°`,
      result: `C = ${solution.angles.C.toFixed(2)}° (Suma total: ${solution.angles.sum.toFixed(1)}°)`
    });
    
    steps.push({
      step: step++,
      description: "Clasificación del triángulo",
      formula: "Por lados: Escaleno, Isósceles, Equilátero\nPor ángulos: Acutángulo, Rectángulo, Obtusángulo",
      calculation: `Lados: ${a}, ${b}, ${c}\nÁngulos: ${solution.angles.A.toFixed(1)}°, ${solution.angles.B.toFixed(1)}°, ${solution.angles.C.toFixed(1)}°`,
      result: solution.type
    });
    
    steps.push({
      step: step++,
      description: "Altura relativa al lado a",
      formula: "hₐ = 2A / a",
      calculation: `hₐ = 2 × ${solution.area.toFixed(4)} / ${a}`,
      result: `hₐ = ${solution.height.toFixed(4)}`
    });
    
    steps.push({
      step: step++,
      description: "Radio del círculo inscrito (inradio)",
      formula: "r = A / s",
      calculation: `r = ${solution.area.toFixed(4)} / ${solution.semiperimeter.toFixed(4)}`,
      result: `r = ${solution.inscribedRadius.toFixed(4)}`
    });
    
    steps.push({
      step: step++,
      description: "Radio del círculo circunscrito (circunradio)",
      formula: "R = abc / (4A)",
      calculation: `R = (${a} × ${b} × ${c}) / (4 × ${solution.area.toFixed(4)})`,
      result: `R = ${solution.circumscribedRadius.toFixed(4)}`
    });
    
    return steps;
  };

  // ==================== FUNCIONES DE CÁLCULO ====================
  const calculateBasic = () => {
    if (!basicInput.trim()) {
      setBasicResult("Error: Expresión vacía");
      playSound("error");
      return;
    }

    vibrate(30);
    setIsLoading(true);
    
    setTimeout(() => {
      const { result, error, steps } = safeEval(basicInput);
      
      const calculationSteps: StepDetail[] = [
        {
          step: 1,
          title: "Análisis de expresión",
          description: "Validación y procesamiento de la expresión matemática",
          formula: basicInput,
          calculation: "Verificación de sintaxis y reemplazo de constantes",
          result: error ? "❌ Expresión inválida" : "✓ Expresión válida",
          explanation: error ? error : "La expresión ha sido validada y está lista para evaluación."
        }
      ];

      if (error) {
        setBasicResult(`Error: ${error}`);
        setBasicSteps(calculationSteps);
        playSound("error");
        setIsLoading(false);
        return;
      }
      
      calculationSteps.push({
        step: 2,
        title: "Evaluación paso a paso",
        description: "Cálculo del resultado numérico",
        formula: basicInput,
        calculation: steps.join(" → "),
        result: result.toFixed(precision),
        explanation: "La expresión ha sido evaluada usando el motor matemático de JavaScript."
      });

      setBasicResult(result.toFixed(precision));
      setBasicSteps(calculationSteps);
      setBasicHistory(prev => [basicInput + " = " + result.toFixed(precision), ...prev.slice(0, 9)]);
      
      addToHistory("basic", basicInput, result.toString());
      playSound("success");
      setIsLoading(false);
    }, 300);
  };

  const handleBasicButton = (value: string) => {
    vibrate(20);
    playSound("click");
    
    if (value === "=") {
      calculateBasic();
    } else if (value === "C") {
      setBasicInput("");
      setBasicResult("");
    } else if (value === "⌫") {
      setBasicInput(prev => prev.slice(0, -1));
    } else if (value === "sqrt(") {
      setBasicInput(prev => prev + "sqrt(");
    } else {
      setBasicInput(prev => prev + value);
    }
  };

  const calculateTrig = () => {
    if (!angle.trim()) {
      setTrigResult(null);
      playSound("error");
      return;
    }

    setIsLoading(true);
    vibrate(30);
    
    setTimeout(() => {
      try {
        let angleValue = parseFloat(angle) || 0;
        let angleRad = angleValue;
        
        const steps: StepDetail[] = [
          {
            step: 1,
            title: "Conversión de ángulo",
            description: "Convertir ángulo a radianes para cálculo",
            formula: angleUnit === "deg" ? "radianes = grados × π / 180" : 
                     angleUnit === "grad" ? "radianes = gradianes × π / 200" : 
                     "radianes = ángulo (ya en radianes)",
            calculation: angleUnit === "deg" ? `${angleValue}° × π / 180 = ${(angleValue * Math.PI / 180).toFixed(6)} rad` :
                         angleUnit === "grad" ? `${angleValue} grad × π / 200 = ${(angleValue * Math.PI / 200).toFixed(6)} rad` :
                         `${angleValue} rad`,
            result: `Ángulo en radianes: ${angleRad.toFixed(6)}`,
            explanation: "Las funciones trigonométricas en JavaScript usan radianes por defecto."
          }
        ];

        if (angleUnit === "deg") {
          angleRad = (angleValue * Math.PI) / 180;
        } else if (angleUnit === "grad") {
          angleRad = (angleValue * Math.PI) / 200;
        }
        
        const sinVal = Math.sin(angleRad);
        const cosVal = Math.cos(angleRad);
        const tanVal = Math.tan(angleRad);
        
        steps.push({
          step: 2,
          title: "Cálculo de funciones básicas",
          description: "Cálculo de seno, coseno y tangente",
          formula: "sin(θ) = cateto opuesto / hipotenusa\ncos(θ) = cateto adyacente / hipotenusa\ntan(θ) = sin(θ) / cos(θ)",
          calculation: `sin(${angleValue}${angleUnit === "deg" ? "°" : angleUnit === "rad" ? " rad" : " grad"}) = ${sinVal.toFixed(precision)}\n` +
                      `cos(${angleValue}${angleUnit === "deg" ? "°" : angleUnit === "rad" ? " rad" : " grad"}) = ${cosVal.toFixed(precision)}\n` +
                      `tan(${angleValue}${angleUnit === "deg" ? "°" : angleUnit === "rad" ? " rad" : " grad"}) = ${Math.abs(cosVal) > 1e-10 ? tanVal.toFixed(precision) : "∞"}`,
          result: `Funciones calculadas con precisión de ${precision} decimales`,
          explanation: "El seno y coseno son funciones periódicas entre -1 y 1. La tangente puede ser ±∞ cuando coseno = 0."
        });

        const result: TrigResult = {
          angle: angleValue,
          sin: sinVal,
          cos: cosVal,
          tan: Math.abs(cosVal) < 1e-10 ? NaN : tanVal,
          cot: Math.abs(sinVal) < 1e-10 ? NaN : 1 / tanVal,
          sec: Math.abs(cosVal) < 1e-10 ? NaN : 1 / cosVal,
          csc: Math.abs(sinVal) < 1e-10 ? NaN : 1 / sinVal
        };
        
        if (angleUnit === "deg") {
          const roundedAngle = Math.round(angleValue);
          if (EXACT_VALUES[roundedAngle]) {
            result.exactValues = EXACT_VALUES[roundedAngle];
            steps.push({
              step: 3,
              title: "Valores exactos notables",
              description: "Ángulos especiales con valores exactos",
              formula: "Valores exactos para ángulos notables",
              calculation: `Ángulo ${roundedAngle}° es un ángulo notable\nsin = ${result.exactValues.sin}\ncos = ${result.exactValues.cos}\ntan = ${result.exactValues.tan}`,
              result: "✓ Valores exactos encontrados",
              explanation: "Estos ángulos tienen representaciones exactas en términos de fracciones y raíces."
            });
          }
        }
        
        setTrigResult(result);
        setTrigSteps(steps);
        addToHistory("trig", `Ángulo: ${angleValue}${angleUnit === "deg" ? "°" : angleUnit === "rad" ? " rad" : " grad"}`, 
          `sin=${sinVal.toFixed(precision)}, cos=${cosVal.toFixed(precision)}`);
        
        playSound("success");
      } catch (error) {
        setTrigResult(null);
        setTrigSteps([{
          step: 1,
          title: "Error en cálculo",
          description: "No se pudo calcular las funciones trigonométricas",
          formula: "",
          calculation: "",
          result: "❌ Error de cálculo",
          explanation: "Verifique que el ángulo sea un número válido."
        }]);
        playSound("error");
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const calculateTriangle = () => {
    setIsLoading(true);
    vibrate(30);
    
    setTimeout(() => {
      try {
        if (triangleType === "SSS") {
          const a = parseFloat(sideA) || 0;
          const b = parseFloat(sideB) || 0;
          const c = parseFloat(sideC) || 0;
          
          const validation = validateTriangleSSS(a, b, c);
          
          if (!validation.isValid) {
            setTriangleResult({
              valid: false,
              sides: { a, b, c },
              steps: generateSSSSteps(a, b, c, validation, null),
              errors: validation.errors,
              sumArithmetic: validation.sumArithmetic
            });
            playSound("error");
            setIsLoading(false);
            return;
          }
          
          const solution = solveTriangleSSS(a, b, c);
          const steps = generateSSSSteps(a, b, c, validation, solution);
          
          setTriangleResult({
            valid: true,
            sides: { a, b, c },
            angles: solution.angles,
            area: solution.area,
            perimeter: solution.perimeter,
            type: solution.type,
            steps,
            height: solution.height,
            inscribedRadius: solution.inscribedRadius,
            circumscribedRadius: solution.circumscribedRadius
          });
          
          addToHistory("triangle", `SSS: ${a}, ${b}, ${c}`, `Área: ${solution.area.toFixed(2)}, Tipo: ${solution.type}`);
          playSound("success");
        } else {
          // Implementación para otros tipos de triángulos...
          setTriangleResult({
            valid: false,
            sides: { a: 0, b: 0, c: 0 },
            steps: [{
              step: 1,
              description: "Tipo no implementado",
              formula: "",
              calculation: "",
              result: "❌ Este tipo de triángulo aún no está implementado"
            }],
            errors: ["Solo SSS está implementado actualmente"]
          });
          playSound("error");
        }
      } catch (error) {
        setTriangleResult({
          valid: false,
          sides: { a: 0, b: 0, c: 0 },
          steps: [{
            step: 1,
            description: "Error en cálculo",
            formula: "",
            calculation: "",
            result: "❌ Error en el cálculo del triángulo"
          }],
          errors: ["Error inesperado en el cálculo"]
        });
        playSound("error");
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  const calculateAlgebra = () => {
    if (!equation.trim()) {
      setAlgebraError("Error: Ecuación vacía");
      playSound("error");
      return;
    }

    setIsLoading(true);
    vibrate(30);
    
    setTimeout(() => {
      try {
        const steps: StepDetail[] = [];
        
        if (equationType === "linear") {
          // Resolver ecuación lineal: ax + b = c
          const match = equation.match(/([-+]?\d*\.?\d*)x\s*([+-]\s*\d+\.?\d*)?\s*=\s*([-+]?\d+\.?\d*)/i);
          
          if (!match) {
            setAlgebraError("Formato inválido. Use: ax + b = c");
            playSound("error");
            setIsLoading(false);
            return;
          }
          
          const a = parseFloat(match[1] || "1");
          const b = parseFloat(match[2]?.replace(/\s/g, '') || "0");
          const c = parseFloat(match[3]);
          
          steps.push({
            step: 1,
            title: "Identificación de coeficientes",
            description: "Extraer coeficientes a, b y c de la ecuación",
            formula: "ax + b = c",
            calculation: `a = ${a}, b = ${b}, c = ${c}`,
            result: "✓ Coeficientes identificados",
            explanation: "En una ecuación lineal, 'a' es el coeficiente de x, 'b' es el término independiente izquierdo, 'c' es el término derecho."
          });
          
          steps.push({
            step: 2,
            title: "Aislar término con x",
            description: "Restar b de ambos lados",
            formula: "ax = c - b",
            calculation: `${a}x + ${b} = ${c} → ${a}x = ${c} - ${b} = ${c - b}`,
            result: "✓ Término con x aislado",
            explanation: "Para despejar x, primero movemos el término constante al otro lado."
          });
          
          steps.push({
            step: 3,
            title: "Despejar x",
            description: "Dividir ambos lados por a",
            formula: "x = (c - b) / a",
            calculation: `x = ${c - b} / ${a} = ${(c - b) / a}`,
            result: `Solución: x = ${((c - b) / a).toFixed(precision)}`,
            explanation: "Finalmente despejamos x dividiendo por el coeficiente."
          });
          
          setAlgebraResult({
            solutions: [((c - b) / a).toFixed(precision)],
            steps
          });
          addToHistory("algebra", `Ecuación lineal: ${equation}`, `x = ${((c - b) / a).toFixed(precision)}`);
          
        } else if (equationType === "quadratic") {
          // Resolver ecuación cuadrática: ax² + bx + c = 0
          const match = equation.match(/([-+]?\d*\.?\d*)x²\s*([+-]\s*\d+\.?\d*)x?\s*([+-]\s*\d+\.?\d*)?\s*=\s*0/i);
          
          if (!match) {
            setAlgebraError("Formato inválido. Use: ax² + bx + c = 0");
            playSound("error");
            setIsLoading(false);
            return;
          }
          
          const a = parseFloat(match[1] || "1");
          const b = parseFloat(match[2]?.replace(/\s/g, '') || "0");
          const c = parseFloat(match[3]?.replace(/\s/g, '') || "0");
          const discriminant = b * b - 4 * a * c;
          
          steps.push({
            step: 1,
            title: "Identificación de coeficientes",
            description: "Extraer coeficientes a, b y c",
            formula: "ax² + bx + c = 0",
            calculation: `a = ${a}, b = ${b}, c = ${c}`,
            result: "✓ Coeficientes identificados",
            explanation: "En una ecuación cuadrática, 'a' es el coeficiente cuadrático, 'b' es el coeficiente lineal, 'c' es el término constante."
          });
          
          steps.push({
            step: 2,
            title: "Cálculo del discriminante",
            description: "Calcular Δ = b² - 4ac",
            formula: "Δ = b² - 4ac",
            calculation: `Δ = (${b})² - 4 × ${a} × ${c} = ${b * b} - ${4 * a * c} = ${discriminant}`,
            result: `Discriminante: Δ = ${discriminant.toFixed(precision)}`,
            explanation: "El discriminante determina la naturaleza de las raíces: Δ > 0 (2 reales), Δ = 0 (1 real doble), Δ < 0 (complejas)."
          });
          
          let solutions: string[] = [];
          let nature = "";
          
          if (discriminant > 0) {
            nature = "Dos raíces reales distintas";
            const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            solutions = [x1.toFixed(precision), x2.toFixed(precision)];
            
            steps.push({
              step: 3,
              title: "Fórmula cuadrática",
              description: "Aplicar fórmula: x = (-b ± √Δ) / 2a",
              formula: "x = [-b ± √(b² - 4ac)] / 2a",
              calculation: `x₁ = [ -(${b}) + √${discriminant} ] / (2 × ${a}) = ${x1.toFixed(precision)}\n` +
                         `x₂ = [ -(${b}) - √${discriminant} ] / (2 × ${a}) = ${x2.toFixed(precision)}`,
              result: `Soluciones: x₁ = ${x1.toFixed(precision)}, x₂ = ${x2.toFixed(precision)}`,
              explanation: "La fórmula cuadrática proporciona las dos soluciones de la ecuación."
            });
            
          } else if (discriminant === 0) {
            nature = "Una raíz real doble";
            const x = -b / (2 * a);
            solutions = [x.toFixed(precision)];
            
            steps.push({
              step: 3,
              title: "Fórmula cuadrática (discriminante cero)",
              description: "Cuando Δ = 0, hay una solución doble: x = -b / 2a",
              formula: "x = -b / 2a",
              calculation: `x = -(${b}) / (2 × ${a}) = ${x.toFixed(precision)}`,
              result: `Solución doble: x = ${x.toFixed(precision)}`,
              explanation: "Cuando el discriminante es cero, la parábola toca el eje x en un solo punto."
            });
            
          } else {
            nature = "Dos raíces complejas conjugadas";
            const realPart = -b / (2 * a);
            const imagPart = Math.sqrt(-discriminant) / (2 * a);
            solutions = [
              `${realPart.toFixed(precision)} + ${imagPart.toFixed(precision)}i`,
              `${realPart.toFixed(precision)} - ${imagPart.toFixed(precision)}i`
            ];
            
            steps.push({
              step: 3,
              title: "Fórmula cuadrática (discriminante negativo)",
              description: "Cuando Δ < 0, las soluciones son complejas",
              formula: "x = [-b ± i√(-Δ)] / 2a",
              calculation: `Parte real = -(${b}) / (2 × ${a}) = ${realPart.toFixed(precision)}\n` +
                         `Parte imaginaria = √(${-discriminant}) / (2 × ${a}) = ${imagPart.toFixed(precision)}`,
              result: `Soluciones complejas: ${solutions[0]}, ${solutions[1]}`,
              explanation: "Cuando el discriminante es negativo, las soluciones son números complejos conjugados."
            });
          }
          
          setAlgebraResult({
            solutions,
            discriminant,
            nature,
            steps
          });
          addToHistory("algebra", `Ecuación cuadrática: ${equation}`, `Soluciones: ${solutions.join(", ")}`);
          
        } else if (equationType === "system") {
          // Sistema de ecuaciones lineales simples
          steps.push({
            step: 1,
            title: "Sistema de ecuaciones",
            description: "Resolución de sistemas 2x2",
            formula: "a₁x + b₁y = c₁\na₂x + b₂y = c₂",
            calculation: "Ingrese ecuaciones separadas por punto y coma",
            result: "❌ Sistema de ecuaciones no implementado completamente",
            explanation: "Esta funcionalidad requiere entrada de múltiples ecuaciones."
          });
          
          setAlgebraResult({
            solutions: ["No implementado completamente"],
            steps
          });
        }
        
        setAlgebraError("");
        playSound("success");
      } catch (error) {
        setAlgebraError("Error en el cálculo algebraico");
        setAlgebraResult({ solutions: [], steps: [] });
        playSound("error");
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const calculateCalculus = () => {
    if (!calculusFunction.trim()) {
      playSound("error");
      return;
    }

    setIsLoading(true);
    vibrate(30);
    
    setTimeout(() => {
      try {
        const steps: StepDetail[] = [];
        let result = "";
        
        if (calculusType === "derivative") {
          // Derivada simbólica simple
          const func = calculusFunction.toLowerCase();
          let derivative = "";
          
          steps.push({
            step: 1,
            title: "Identificación de función",
            description: "Analizar la función para derivación",
            formula: `f(x) = ${calculusFunction}`,
            calculation: "Identificar términos y potencias",
            result: "✓ Función analizada",
            explanation: "Preparando la función para aplicar reglas de derivación."
          });
          
          if (func.includes("x^") || func.includes("x**")) {
            // Derivada de potencia: d/dx(x^n) = nx^(n-1)
            const match = func.match(/x[\^\*\*](\d+(\.\d+)?)/);
            if (match) {
              const n = parseFloat(match[1]);
              derivative = `${n}x^${n-1}`;
              
              steps.push({
                step: 2,
                title: "Regla de la potencia",
                description: "Aplicar regla: d/dx(xⁿ) = nxⁿ⁻¹",
                formula: "d/dx(xⁿ) = n·xⁿ⁻¹",
                calculation: `d/dx(x^${n}) = ${n}·x^(${n}-1) = ${n}x^${n-1}`,
                result: `Derivada: f'(x) = ${derivative}`,
                explanation: "La regla de la potencia es fundamental para derivar funciones polinómicas."
              });
            }
          } else if (func.includes("sin(x)")) {
            derivative = "cos(x)";
            steps.push({
              step: 2,
              title: "Derivada de seno",
              description: "Aplicar regla: d/dx(sin x) = cos x",
              formula: "d/dx(sin x) = cos x",
              calculation: "d/dx(sin x) = cos x",
              result: `Derivada: f'(x) = cos(x)`,
              explanation: "La derivada del seno es el coseno."
            });
          } else if (func.includes("cos(x)")) {
            derivative = "-sin(x)";
            steps.push({
              step: 2,
              title: "Derivada de coseno",
              description: "Aplicar regla: d/dx(cos x) = -sin x",
              formula: "d/dx(cos x) = -sin x",
              calculation: "d/dx(cos x) = -sin x",
              result: `Derivada: f'(x) = -sin(x)`,
              explanation: "La derivada del coseno es el negativo del seno."
            });
          } else if (func.includes("e^x") || func.includes("exp(x)")) {
            derivative = "e^x";
            steps.push({
              step: 2,
              title: "Derivada exponencial",
              description: "Aplicar regla: d/dx(eˣ) = eˣ",
              formula: "d/dx(eˣ) = eˣ",
              calculation: "d/dx(eˣ) = eˣ",
              result: `Derivada: f'(x) = e^x`,
              explanation: "La función exponencial es su propia derivada."
            });
          } else if (func.includes("ln(x)") || func.includes("log(x)")) {
            derivative = "1/x";
            steps.push({
              step: 2,
              title: "Derivada logarítmica",
              description: "Aplicar regla: d/dx(ln x) = 1/x",
              formula: "d/dx(ln x) = 1/x",
              calculation: "d/dx(ln x) = 1/x",
              result: `Derivada: f'(x) = 1/x`,
              explanation: "La derivada del logaritmo natural es 1/x."
            });
          } else {
            derivative = "No reconocida (derivada numérica disponible en gráficos)";
            steps.push({
              step: 2,
              title: "Derivada no simbólica",
              description: "Función no reconocida para derivación simbólica",
              formula: "",
              calculation: "Use la pestaña de gráficos para derivada numérica",
              result: "❌ Derivada simbólica no disponible",
              explanation: "Para funciones complejas, use la derivada numérica en la pestaña de gráficos."
            });
          }
          
          result = derivative;
          setCalculusResult(prev => ({ ...prev, derivative, steps }));
          addToHistory("calculus", `Derivada de: ${calculusFunction}`, `f'(x) = ${derivative}`);
          
        } else if (calculusType === "integral") {
          // Integral simbólica simple
          steps.push({
            step: 1,
            title: "Integración de función",
            description: "Encontrar la integral indefinida",
            formula: `∫${calculusFunction} dx`,
            calculation: "Aplicando reglas de integración",
            result: "Use la pestaña de gráficos para integración numérica",
            explanation: "La integración simbólica completa requiere un sistema algebraico computacional."
          });
          
          result = "∫" + calculusFunction + " dx + C";
          setCalculusResult(prev => ({ ...prev, integral: result, steps }));
          addToHistory("calculus", `Integral de: ${calculusFunction}`, result);
          
        } else if (calculusType === "limit") {
          // Límite en un punto
          const point = parseFloat(atPoint) || 0;
          
          steps.push({
            step: 1,
            title: "Cálculo de límite",
            description: `Evaluar límite cuando x → ${point}`,
            formula: `lim(x→${point}) ${calculusFunction}`,
            calculation: "Sustitución directa o análisis",
            result: "Use evaluación numérica para límites precisos",
            explanation: "Los límites exactos requieren análisis algebraico. Para aproximaciones numéricas, evalúe cerca del punto."
          });
          
          result = `lim(x→${point}) ${calculusFunction}`;
          setCalculusResult(prev => ({ ...prev, limit: result, steps }));
          addToHistory("calculus", `Límite: ${calculusFunction} cuando x→${point}`, "Evaluación numérica disponible");
        }
        
        setCalculusSteps(steps);
        playSound("success");
      } catch (error) {
        setCalculusResult(prev => ({ ...prev, steps: [{
          step: 1,
          title: "Error en cálculo",
          description: "No se pudo realizar el cálculo",
          formula: "",
          calculation: "",
          result: "❌ Error en el cálculo",
          explanation: "Verifique la entrada y vuelva a intentar."
        }]}));
        playSound("error");
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const generateGraphData = () => {
    if (!functionInput.trim()) {
      setGraphError("Error: Función vacía");
      setGraphData(null);
      playSound("error");
      return;
    }

    setIsLoading(true);
    setGraphError(null);
    
    setTimeout(() => {
      try {
        const points: GraphPoint[] = [];
        const derivativePoints: GraphPoint[] = [];
        const integralPoints: GraphPoint[] = [];
        let integralAccumulator = 0;
        
        for (let x = graphRange.min; x <= graphRange.max; x += graphRange.step) {
          try {
            const expr = functionInput.replace(/x/g, `(${x})`);
            const { result: y, error } = safeEval(expr);
            
            if (!error && typeof y === 'number' && isFinite(y)) {
              points.push({ x, y });
              
              if (showDerivative && x > graphRange.min) {
                const prevX = x - graphRange.step;
                const prevExpr = functionInput.replace(/x/g, `(${prevX})`);
                const { result: prevY } = safeEval(prevExpr);
                if (typeof prevY === 'number' && isFinite(prevY)) {
                  const derivative = (y - prevY) / graphRange.step;
                  derivativePoints.push({ x, y: derivative });
                }
              }
              
              if (showIntegral && x > graphRange.min) {
                const prevX = x - graphRange.step;
                const prevExpr = functionInput.replace(/x/g, `(${prevX})`);
                const { result: prevY } = safeEval(prevExpr);
                if (typeof prevY === 'number' && isFinite(prevY)) {
                  const trapezoidArea = ((y + prevY) / 2) * graphRange.step;
                  integralAccumulator += trapezoidArea;
                  integralPoints.push({ x, y: integralAccumulator });
                }
              }
            }
          } catch (error) {
            continue;
          }
        }
        
        if (points.length === 0) {
          setGraphError("No se pudieron calcular puntos válidos para la función");
          setGraphData(null);
          playSound("error");
          setIsLoading(false);
          return;
        }
        
        const yValues = points.map(p => p.y);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);
        
        setGraphData({
          points,
          domain: [graphRange.min, graphRange.max],
          range: [minY, maxY],
          derivativePoints: showDerivative ? derivativePoints : undefined,
          integralPoints: showIntegral ? integralPoints : undefined
        });
        
        addToHistory("graph", `f(x) = ${functionInput}`, `Dominio: [${graphRange.min}, ${graphRange.max}], Rango: [${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);
        playSound("success");
      } catch (error) {
        setGraphError("Error al generar la gráfica");
        setGraphData(null);
        playSound("error");
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const calculateIdentity = () => {
    if (!identityAngle.trim()) {
      setIdentityResult("");
      playSound("error");
      return;
    }

    setIsLoading(true);
    vibrate(30);
    
    setTimeout(() => {
      try {
        const angleVal = parseFloat(identityAngle);
        const angleRad = angleVal * Math.PI / 180;
        
        const steps: StepDetail[] = [];
        let result = "";
        
        if (identityType === "basic") {
          // Verificar identidad básica: sin² + cos² = 1
          const sinVal = Math.sin(angleRad);
          const cosVal = Math.cos(angleRad);
          const leftSide = sinVal * sinVal + cosVal * cosVal;
          
          steps.push({
            step: 1,
            title: "Identidad pitagórica",
            description: "Verificar sin²θ + cos²θ = 1",
            formula: "sin²θ + cos²θ = 1",
            calculation: `sin(${angleVal}°) = ${sinVal.toFixed(precision)}\ncos(${angleVal}°) = ${cosVal.toFixed(precision)}\nsin² + cos² = ${(sinVal*sinVal).toFixed(precision)} + ${(cosVal*cosVal).toFixed(precision)} = ${leftSide.toFixed(precision)}`,
            result: Math.abs(leftSide - 1) < 0.0001 ? "✓ IDENTIDAD VERIFICADA" : "✗ NO CUMPLE LA IDENTIDAD",
            explanation: "Esta es la identidad trigonométrica fundamental que relaciona seno y coseno."
          });
          
          result = Math.abs(leftSide - 1) < 0.0001 ? 
            `sin²(${angleVal}°) + cos²(${angleVal}°) = 1 ✓` :
            `sin²(${angleVal}°) + cos²(${angleVal}°) ≈ ${leftSide.toFixed(precision)}`;
            
        } else if (identityType === "advanced") {
          // Verificar identidad: tan = sin/cos
          const sinVal = Math.sin(angleRad);
          const cosVal = Math.cos(angleRad);
          const tanVal = Math.tan(angleRad);
          const sinOverCos = sinVal / cosVal;
          
          steps.push({
            step: 1,
            title: "Identidad tangente",
            description: "Verificar tanθ = sinθ/cosθ",
            formula: "tanθ = sinθ / cosθ",
            calculation: `sin(${angleVal}°) = ${sinVal.toFixed(precision)}\ncos(${angleVal}°) = ${cosVal.toFixed(precision)}\ntan(${angleVal}°) = ${tanVal.toFixed(precision)}\nsin/cos = ${sinOverCos.toFixed(precision)}`,
            result: Math.abs(tanVal - sinOverCos) < 0.0001 ? "✓ IDENTIDAD VERIFICADA" : "✗ NO CUMPLE LA IDENTIDAD",
            explanation: "La tangente se define como el cociente entre seno y coseno."
          });
          
          result = Math.abs(tanVal - sinOverCos) < 0.0001 ?
            `tan(${angleVal}°) = sin(${angleVal}°)/cos(${angleVal}°) ✓` :
            `tan(${angleVal}°) ≈ ${tanVal.toFixed(precision)}, sin/cos ≈ ${sinOverCos.toFixed(precision)}`;
            
        } else if (identityType === "inverse") {
          // Verificar identidad: sin(arcsin(x)) = x
          const x = Math.sin(angleRad);
          const arcsinVal = Math.asin(x);
          const sinOfArcsin = Math.sin(arcsinVal);
          
          steps.push({
            step: 1,
            title: "Identidad inversa",
            description: "Verificar sin(arcsin(x)) = x",
            formula: "sin(arcsin(x)) = x",
            calculation: `x = sin(${angleVal}°) = ${x.toFixed(precision)}\narcsin(x) = ${arcsinVal.toFixed(precision)} rad\nsin(arcsin(x)) = ${sinOfArcsin.toFixed(precision)}`,
            result: Math.abs(sinOfArcsin - x) < 0.0001 ? "✓ IDENTIDAD VERIFICADA" : "✗ NO CUMPLE LA IDENTIDAD",
            explanation: "El arcoseno es la función inversa del seno en el intervalo [-π/2, π/2]."
          });
          
          result = Math.abs(sinOfArcsin - x) < 0.0001 ?
            `sin(arcsin(${x.toFixed(precision)})) = ${x.toFixed(precision)} ✓` :
            `sin(arcsin(${x.toFixed(precision)})) ≈ ${sinOfArcsin.toFixed(precision)}`;
        }
        
        setIdentityResult(result);
        setIdentitySteps(steps);
        addToHistory("identity", `${identityType}: ${identityAngle}°`, result);
        playSound("success");
      } catch (error) {
        setIdentityResult("Error en el cálculo de la identidad");
        setIdentitySteps([{
          step: 1,
          title: "Error en cálculo",
          description: "No se pudo verificar la identidad",
          formula: "",
          calculation: "",
          result: "❌ Error en el cálculo",
          explanation: "Verifique que el ángulo sea un número válido."
        }]);
        playSound("error");
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  // ==================== COMPONENTES RENDERIZADOS ====================
  const renderGraphComponent = () => {
    if (!graphData) return null;

    return (
      <div className="w-full h-96 sm:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          {graphType === "line" ? (
            <RechartsLineChart data={graphData.points}>
              <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === "dark" ? "#374151" : "#e5e7eb"} />
              <XAxis 
                dataKey="x" 
                label={{ value: 'x', position: 'insideBottom', offset: -5 }}
                stroke={currentTheme === "dark" ? "#9ca3af" : "#6b7280"}
              />
              <YAxis 
                label={{ value: 'f(x)', angle: -90, position: 'insideLeft' }}
                stroke={currentTheme === "dark" ? "#9ca3af" : "#6b7280"}
              />
              <Tooltip 
                formatter={(value: any) => [Number(value).toFixed(precision), 'f(x)']}
                labelFormatter={(label) => `x = ${Number(label).toFixed(precision)}`}
                contentStyle={{ 
                  backgroundColor: currentTheme === "dark" ? "#1f2937" : "#ffffff",
                  border: `1px solid ${currentTheme === "dark" ? "#374151" : "#e5e7eb"}`,
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="y"
                stroke={graphColor}
                strokeWidth={2}
                dot={false}
                name="f(x)"
                animationDuration={animationsEnabled ? 1000 : 0}
              />
              {showDerivative && graphData.derivativePoints && (
                <Line
                  type="monotone"
                  data={graphData.derivativePoints}
                  dataKey="y"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="f'(x)"
                  animationDuration={animationsEnabled ? 1000 : 0}
                />
              )}
              {showIntegral && graphData.integralPoints && (
                <Line
                  type="monotone"
                  data={graphData.integralPoints}
                  dataKey="y"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="∫f(x)dx"
                  animationDuration={animationsEnabled ? 1000 : 0}
                />
              )}
            </RechartsLineChart>
          ) : graphType === "area" ? (
            <AreaChart data={graphData.points}>
              <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === "dark" ? "#374151" : "#e5e7eb"} />
              <XAxis dataKey="x" stroke={currentTheme === "dark" ? "#9ca3af" : "#6b7280"} />
              <YAxis stroke={currentTheme === "dark" ? "#9ca3af" : "#6b7280"} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="y" 
                stroke={graphColor} 
                fill={`${graphColor}40`}
                animationDuration={animationsEnabled ? 1000 : 0}
              />
            </AreaChart>
          ) : graphType === "bar" ? (
            <BarChart data={graphData.points.slice(0, 50)}>
              <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === "dark" ? "#374151" : "#e5e7eb"} />
              <XAxis dataKey="x" stroke={currentTheme === "dark" ? "#9ca3af" : "#6b7280"} />
              <YAxis stroke={currentTheme === "dark" ? "#9ca3af" : "#6b7280"} />
              <Tooltip />
              <Bar 
                dataKey="y" 
                fill={graphColor}
                animationDuration={animationsEnabled ? 1000 : 0}
              />
            </BarChart>
          ) : (
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === "dark" ? "#374151" : "#e5e7eb"} />
              <XAxis dataKey="x" stroke={currentTheme === "dark" ? "#9ca3af" : "#6b7280"} />
              <YAxis dataKey="y" stroke={currentTheme === "dark" ? "#9ca3af" : "#6b7280"} />
              <Tooltip />
              <Scatter 
                data={graphData.points} 
                fill={graphColor}
                animationDuration={animationsEnabled ? 1000 : 0}
              />
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const StepDetailComponent = ({ step, isLast }: { step: StepDetail; isLast: boolean }) => (
    <div className={`p-4 ${isLast ? '' : 'border-b'} border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
          <span className="font-bold text-white text-sm">{step.step}</span>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">{step.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{step.description}</p>
          
          {step.formula && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Fórmula:</div>
              <div className="font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm border border-gray-200 dark:border-gray-700">
                {step.formula}
              </div>
            </div>
          )}
          
          {step.calculation && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Cálculo:</div>
              <div className="font-mono bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-sm border border-blue-200 dark:border-blue-800">
                {step.calculation}
              </div>
            </div>
          )}
          
          {step.result && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Resultado:</div>
              <div className={`font-mono p-3 rounded-lg text-sm font-bold border ${
                step.result.includes('✓') || step.result.includes('VERIFICADA') || step.result.includes('VÁLIDO')
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
                  : step.result.includes('❌') || step.result.includes('Error') || step.result.includes('NO CUMPLE')
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
              }`}>
                {step.result}
              </div>
            </div>
          )}
          
          {step.explanation && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-500 mb-2 flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Explicación Teórica:
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {step.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const MobileNumberPad = () => (
    <div className="md:hidden space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {BASIC_OPERATIONS.map((btn) => (
          <Button 
            key={btn.value}
            variant={btn.value === '=' ? "default" : "outline"}
            size="lg"
            className={`h-14 text-lg font-medium ${btn.value === '=' ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : ""}`}
            onClick={() => handleBasicButton(btn.value)}
          >
            {btn.value}
          </Button>
        ))}
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {ADVANCED_OPERATIONS.slice(0, 5).map((op) => (
          <Button 
            key={op.value}
            variant="secondary"
            size="sm"
            className="h-10"
            onClick={() => handleBasicButton(op.value)}
          >
            {op.display}
          </Button>
        ))}
      </div>
    </div>
  );

  const DesktopNumberPad = () => (
    <div className="hidden md:block space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {BASIC_OPERATIONS.map((btn) => (
          <Button 
            key={btn.value}
            variant={btn.value === '=' ? "default" : "outline"}
            size="lg"
            className={`h-16 text-xl font-medium ${btn.value === '=' ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            onClick={() => handleBasicButton(btn.value)}
          >
            {btn.value}
          </Button>
        ))}
      </div>
      
      <div className="grid grid-cols-6 gap-2">
        {ADVANCED_OPERATIONS.map((op) => (
          <Button 
            key={op.value}
            variant="secondary"
            size="sm"
            className="h-10"
            onClick={() => handleBasicButton(op.value)}
          >
            {op.display}
          </Button>
        ))}
        <Button 
          variant="secondary"
          size="sm"
          className="h-10"
          onClick={() => handleBasicButton("⌫")}
        >
          ⌫
        </Button>
      </div>
    </div>
  );

  // ==================== RENDER PRINCIPAL ====================
  return (
    <div className={`min-h-screen transition-all duration-300 ${currentTheme === "dark" ? "dark bg-gradient-to-br from-gray-900 to-gray-950" : "bg-gradient-to-br from-gray-50 to-blue-50"}`}>
      {/* Barra superior de estado del dispositivo */}
      {deviceInfo.isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white text-xs py-1 px-4 flex justify-between items-center z-50">
          <div className="flex items-center gap-2">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <Smartphone className="h-3 w-3" />
          </div>
          <div className="flex items-center gap-3">
            <Wifi className="h-3 w-3" />
            <Battery className="h-3 w-3" />
          </div>
        </div>
      )}

      <div className={`container mx-auto px-3 sm:px-4 py-3 sm:py-6 max-w-7xl ${deviceInfo.isMobile ? 'pt-8' : ''}`}>
        {/* Header principal */}
        <Card className={`p-4 sm:p-6 rounded-2xl border-0 shadow-xl mb-6 ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shadow-lg ${currentTheme === "dark" ? "bg-gradient-to-br from-blue-600 to-purple-700" : "bg-gradient-to-br from-blue-500 to-purple-600"}`}>
                <Sigma className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${deviceInfo.isMobile ? 'text-lg' : ''}`}>
                  {deviceInfo.isMobile ? "Math Pro" : "Calculadora Matemática Profesional"}
                </h1>
                <div className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-1 sm:gap-2">
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Check className="h-2 w-2" /> Trig
                  </Badge>
                  <ChevronRight className="h-3 w-3" />
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Triangle className="h-2 w-2" /> Geom
                  </Badge>
                  <ChevronRight className="h-3 w-3" />
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Code className="h-2 w-2" /> Calc
                  </Badge>
                  <ChevronRight className="h-3 w-3" />
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <LineChart className="h-2 w-2" /> Graph
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Label className="text-xs sm:text-sm whitespace-nowrap">Precisión:</Label>
                <Select value={precision.toString()} onValueChange={(v) => {
                  setPrecision(parseInt(v));
                  vibrate(10);
                }}>
                  <SelectTrigger className={`${deviceInfo.isMobile ? 'w-20' : 'w-28'}`}>
                    <SelectValue>{precision} dec</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 4, 6, 8, 10, 12, 16].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} decimales</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                size={deviceInfo.isMobile ? "sm" : "default"}
                onClick={() => {
                  setTheme(currentTheme === "dark" ? "light" : "dark");
                  vibrate(30);
                  playSound("click");
                }}
                className="rounded-full"
              >
                {currentTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {!deviceInfo.isMobile && <span className="ml-2">Tema</span>}
              </Button>
              
              <Button 
                variant="outline" 
                size={deviceInfo.isMobile ? "sm" : "default"}
                onClick={() => setAdvancedMode(!advancedMode)}
                className="rounded-full"
              >
                {advancedMode ? "Básico" : "Avanzado"}
              </Button>
            </div>
          </div>

          {/* Tabs principales */}
          <Tabs value={calcType} onValueChange={(v) => {
            setCalcType(v as any);
            vibrate(20);
            playSound("click");
          }} className="w-full">
            <TabsList className={`w-full rounded-xl mb-6 ${deviceInfo.isMobile ? 'flex overflow-x-auto p-1 gap-1' : 'grid grid-cols-2 md:grid-cols-7 gap-2 p-1'} ${currentTheme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
              <TabsTrigger value="basic" className={`rounded-lg gap-2 ${deviceInfo.isMobile ? 'flex-shrink-0 px-3' : ''} ${currentTheme === "dark" ? "data-[state=active]:bg-gray-700" : "data-[state=active]:bg-white"}`}>
                <Calculator className="h-4 w-4" />
                <span className={deviceInfo.isMobile ? '' : 'hidden md:inline'}>Básica</span>
              </TabsTrigger>
              <TabsTrigger value="trig" className={`rounded-lg gap-2 ${deviceInfo.isMobile ? 'flex-shrink-0 px-3' : ''} ${currentTheme === "dark" ? "data-[state=active]:bg-gray-700" : "data-[state=active]:bg-white"}`}>
                <PieChart className="h-4 w-4" />
                <span className={deviceInfo.isMobile ? '' : 'hidden md:inline'}>Trigonometría</span>
              </TabsTrigger>
              <TabsTrigger value="triangle" className={`rounded-lg gap-2 ${deviceInfo.isMobile ? 'flex-shrink-0 px-3' : ''} ${currentTheme === "dark" ? "data-[state=active]:bg-gray-700" : "data-[state=active]:bg-white"}`}>
                <Triangle className="h-4 w-4" />
                <span className={deviceInfo.isMobile ? '' : 'hidden md:inline'}>Triángulos</span>
              </TabsTrigger>
              <TabsTrigger value="algebra" className={`rounded-lg gap-2 ${deviceInfo.isMobile ? 'flex-shrink-0 px-3' : ''} ${currentTheme === "dark" ? "data-[state=active]:bg-gray-700" : "data-[state=active]:bg-white"}`}>
                <Code className="h-4 w-4" />
                <span className={deviceInfo.isMobile ? '' : 'hidden md:inline'}>Álgebra</span>
              </TabsTrigger>
              <TabsTrigger value="calculus" className={`rounded-lg gap-2 ${deviceInfo.isMobile ? 'flex-shrink-0 px-3' : ''} ${currentTheme === "dark" ? "data-[state=active]:bg-gray-700" : "data-[state=active]:bg-white"}`}>
                <Sigma className="h-4 w-4" />
                <span className={deviceInfo.isMobile ? '' : 'hidden md:inline'}>Cálculo</span>
              </TabsTrigger>
              <TabsTrigger value="graph" className={`rounded-lg gap-2 ${deviceInfo.isMobile ? 'flex-shrink-0 px-3' : ''} ${currentTheme === "dark" ? "data-[state=active]:bg-gray-700" : "data-[state=active]:bg-white"}`}>
                <LineChart className="h-4 w-4" />
                <span className={deviceInfo.isMobile ? '' : 'hidden md:inline'}>Gráficas</span>
              </TabsTrigger>
              <TabsTrigger value="identity" className={`rounded-lg gap-2 ${deviceInfo.isMobile ? 'flex-shrink-0 px-3' : ''} ${currentTheme === "dark" ? "data-[state=active]:bg-gray-700" : "data-[state=active]:bg-white"}`}>
                <Grid3x3 className="h-4 w-4" />
                <span className={deviceInfo.isMobile ? '' : 'hidden md:inline'}>Identidades</span>
              </TabsTrigger>
            </TabsList>

            {/* Contenido de las pestañas */}
            
            {/* ==================== CALCULADORA BÁSICA ==================== */}
            <TabsContent value="basic" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel izquierdo: Entrada y resultado */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className={`p-4 sm:p-6 rounded-2xl border-0 shadow-lg ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                      <Calculator className="h-6 w-6 text-blue-500" />
                      Calculadora Básica Avanzada
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Display de entrada y resultado */}
                      <div className={`p-4 rounded-xl ${currentTheme === "dark" ? "bg-gray-900 border-gray-700" : "bg-gray-100 border-gray-200"} border`}>
                        <div className="text-sm text-muted-foreground mb-1">Expresión:</div>
                        <div className="font-mono text-lg sm:text-xl break-all min-h-[24px]">
                          {basicInput || "0"}
                        </div>
                        <div className="h-px bg-gray-300 dark:bg-gray-700 my-2"></div>
                        <div className="text-sm text-muted-foreground mb-1">Resultado:</div>
                        <div className="font-mono text-2xl sm:text-3xl font-bold text-primary break-all min-h-[36px]">
                          {basicResult || "0"}
                        </div>
                      </div>
                      
                      {/* Teclado numérico */}
                      {deviceInfo.isMobile ? <MobileNumberPad /> : <DesktopNumberPad />}
                      
                      <Button 
                        onClick={calculateBasic} 
                        disabled={isLoading || !basicInput.trim()}
                        className="w-full h-12 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                      >
                        {isLoading ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Calculando...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Calcular Expresión
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                  
                  {/* Historial básico */}
                  {basicHistory.length > 0 && (
                    <Card className={`p-4 sm:p-6 rounded-2xl border-0 shadow-lg ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
                      <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Historial de Cálculos
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {basicHistory.map((item, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${currentTheme === "dark" ? "border-gray-700" : "border-gray-200"} border`}
                            onClick={() => {
                              const expr = item.split(' = ')[0];
                              setBasicInput(expr);
                              setTimeout(() => calculateBasic(), 100);
                              vibrate(20);
                            }}
                          >
                            <div className="font-mono text-sm">{item}</div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
                
                {/* Panel derecho: Pasos detallados */}
                <div>
                  <Card className={`p-4 sm:p-6 rounded-2xl border-0 shadow-lg h-full ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Pasos Detallados
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetailedSteps(!showDetailedSteps)}
                      >
                        {showDetailedSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {showDetailedSteps && basicSteps.length > 0 ? (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {basicSteps.map((step, idx) => (
                          <StepDetailComponent key={idx} step={step} isLast={idx === basicSteps.length - 1} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Realice un cálculo para ver los pasos detallados</p>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* ==================== TRIGONOMETRÍA ==================== */}
            <TabsContent value="trig" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel izquierdo: Entrada */}
                <Card className={`p-4 sm:p-6 rounded-2xl border-0 shadow-lg ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
                  <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                    <PieChart className="h-6 w-6 text-blue-500" />
                    Trigonometría
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ángulo</Label>
                        <Input
                          type="number"
                          value={angle}
                          onChange={(e) => setAngle(e.target.value)}
                          className="h-12"
                          placeholder="45"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Unidad</Label>
                        <Select value={angleUnit} onValueChange={(v: any) => setAngleUnit(v)}>
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deg">Grados (°)</SelectItem>
                            <SelectItem value="rad">Radianes</SelectItem>
                            <SelectItem value="grad">Gradianes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Ángulos notables:</Label>
                      <div className="flex flex-wrap gap-2">
                        {NOTABLE_ANGLES.slice(0, 8).map((ang) => (
                          <Badge
                            key={ang}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                            onClick={() => {
                              setAngle(ang.toString());
                              vibrate(10);
                            }}
                          >
                            {ang}°
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={calculateTrig} 
                      disabled={isLoading}
                      className="w-full h-12 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Calculando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Calcular Funciones Trigonométricas
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                {/* Panel derecho: Resultados */}
                <Card className={`p-4 sm:p-6 rounded-2xl border-0 shadow-lg ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
                  <div className="mb-6">
                    <h3 className="font-bold text-xl">
                      {trigResult ? (
                        <span className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="h-6 w-6" />
                          Resultados Trigonométricos
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <PieChart className="h-6 w-6" />
                          Resultados
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Precisión: {precision} decimales • Unidad: {angleUnit}
                    </p>
                  </div>

                  {trigResult ? (
                    <div className="space-y-6">
                      {/* Valores exactos si existen */}
                      {trigResult.exactValues && (
                        <Alert className={`${currentTheme === "dark" ? "bg-green-900/30 border-green-800" : "bg-green-50 border-green-200"}`}>
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>¡Ángulo notable encontrado!</AlertTitle>
                          <AlertDescription>
                            Valores exactos: sin = {trigResult.exactValues.sin}, cos = {trigResult.exactValues.cos}, tan = {trigResult.exactValues.tan}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Funciones básicas */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className={`p-3 rounded-xl text-center ${currentTheme === "dark" ? "bg-gradient-to-br from-blue-900/30 to-blue-800/30" : "bg-gradient-to-br from-blue-50 to-blue-100"}`}>
                          <div className="text-xs text-blue-600 dark:text-blue-400">Seno</div>
                          <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                            {trigResult.sin.toFixed(precision)}
                          </div>
                          <div className="text-xs mt-1">sin(θ)</div>
                        </div>
                        
                        <div className={`p-3 rounded-xl text-center ${currentTheme === "dark" ? "bg-gradient-to-br from-purple-900/30 to-purple-800/30" : "bg-gradient-to-br from-purple-50 to-purple-100"}`}>
                          <div className="text-xs text-purple-600 dark:text-purple-400">Coseno</div>
                          <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                            {trigResult.cos.toFixed(precision)}
                          </div>
                          <div className="text-xs mt-1">cos(θ)</div>
                        </div>
                        
                        <div className={`p-3 rounded-xl text-center ${currentTheme === "dark" ? "bg-gradient-to-br from-green-900/30 to-green-800/30" : "bg-gradient-to-br from-green-50 to-green-100"}`}>
                          <div className="text-xs text-green-600 dark:text-green-400">Tangente</div>
                          <div className="text-xl font-bold text-green-700 dark:text-green-300">
                            {isNaN(trigResult.tan) ? "∞" : trigResult.tan.toFixed(precision)}
                          </div>
                          <div className="text-xs mt-1">tan(θ)</div>
                        </div>
                      </div>

                      {/* Funciones recíprocas */}
                      <div className={`p-4 rounded-xl ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"}`}>
                        <h4 className="font-semibold mb-3">Funciones Recíprocas</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className={`text-center p-2 rounded ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                            <div className="text-xs text-muted-foreground">Cotangente</div>
                            <div className="font-bold">
                              {isNaN(trigResult.cot) ? "∞" : trigResult.cot.toFixed(precision)}
                            </div>
                          </div>
                          <div className={`text-center p-2 rounded ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                            <div className="text-xs text-muted-foreground">Secante</div>
                            <div className="font-bold">
                              {isNaN(trigResult.sec) ? "∞" : trigResult.sec.toFixed(precision)}
                            </div>
                          </div>
                          <div className={`text-center p-2 rounded ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                            <div className="text-xs text-muted-foreground">Cosecante</div>
                            <div className="font-bold">
                              {isNaN(trigResult.csc) ? "∞" : trigResult.csc.toFixed(precision)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pasos detallados */}
                      {showDetailedSteps && trigSteps.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                              <BookOpen className="h-5 w-5" />
                              Procedimiento Paso a Paso
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDetailedSteps(!showDetailedSteps)}
                            >
                              {showDetailedSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                          
                          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {trigSteps.map((step, idx) => (
                              <StepDetailComponent key={idx} step={step} isLast={idx === trigSteps.length - 1} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Ingrese un ángulo y calcule para ver los resultados</p>
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* ==================== TRIÁNGULOS (YA EXISTENTE) ==================== */}
            <TabsContent value="triangle" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel izquierdo: Entrada */}
                <Card className={`p-4 sm:p-6 rounded-2xl border-0 shadow-lg ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
                  <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                    <Triangle className="h-6 w-6 text-blue-500" />
                    Sistema SSS Perfeccionado
                  </h3>
                  
                  <div className="space-y-6">
                    <Alert className={`${currentTheme === "dark" ? "bg-blue-900/30 border-blue-800" : "bg-blue-50 border-blue-200"}`}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="font-bold">Validación Rigurosa</AlertTitle>
                      <AlertDescription>
                        El sistema valida completamente antes de cualquier cálculo. Sin NaN, sin errores.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <Label>Tipo de triángulo</Label>
                      <Select value={triangleType} onValueChange={(v) => {
                        setTriangleType(v as any);
                        vibrate(20);
                      }}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SSS">SSS - Lado Lado Lado (Perfeccionado)</SelectItem>
                          <SelectItem value="SAS">SAS - Lado Ángulo Lado</SelectItem>
                          <SelectItem value="ASA">ASA - Ángulo Lado Ángulo</SelectItem>
                          <SelectItem value="AAS">AAS - Ángulo Ángulo Lado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {triangleType === "SSS" && (
                      <>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Lado a", value: sideA, setter: setSideA },
                            { label: "Lado b", value: sideB, setter: setSideB },
                            { label: "Lado c", value: sideC, setter: setSideC }
                          ].map((side) => (
                            <div key={side.label} className="space-y-2">
                              <Label>{side.label}</Label>
                              <Input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={side.value}
                                onChange={(e) => side.setter(e.target.value)}
                                className="h-12 text-center"
                                placeholder="0.000"
                              />
                            </div>
                          ))}
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Casos de prueba:</Label>
                          <div className="flex flex-wrap gap-2">
                            {TEST_CASES_SSS.map((testCase, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                                onClick={() => {
                                  setSideA(testCase.a.toString());
                                  setSideB(testCase.b.toString());
                                  setSideC(testCase.c.toString());
                                  setTimeout(() => calculateTriangle(), 100);
                                  vibrate(10);
                                }}
                              >
                                {testCase.name.split('(')[0]}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <Button 
                          onClick={calculateTriangle} 
                          disabled={isLoading}
                          className="w-full h-12 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                        >
                          {isLoading ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Calculando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Resolver Triángulo SSS
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </Card>

                {/* Panel derecho: Resultados */}
                {triangleResult && (
                  <Card className={`p-4 sm:p-6 rounded-2xl border-0 shadow-lg ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-bold text-xl">
                          {triangleResult.valid ? (
                            <span className="flex items-center gap-2 text-green-500">
                              <CheckCircle className="h-6 w-6" />
                              ✓ TRIÁNGULO VÁLIDO
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-red-500">
                              <XCircle className="h-6 w-6" />
                              ✗ NO VÁLIDO
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Sistema SSS Perfeccionado • {deviceInfo.screenWidth}px
                        </p>
                      </div>
                      
                      {triangleResult.valid && triangleResult.type && (
                        <Badge className={`text-sm px-3 py-1 ${currentTheme === "dark" ? "bg-gradient-to-r from-blue-700 to-purple-700" : "bg-gradient-to-r from-blue-500 to-purple-500"}`}>
                          {triangleResult.type}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-6">
                      {triangleResult.valid ? (
                        <>
                          {/* Métricas principales */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className={`p-3 rounded-xl ${currentTheme === "dark" ? "bg-gradient-to-br from-blue-900/30 to-blue-800/30" : "bg-gradient-to-br from-blue-50 to-blue-100"}`}>
                              <div className="text-xs text-blue-600 dark:text-blue-400">Perímetro</div>
                              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                                {triangleResult.perimeter?.toFixed(4)}
                              </div>
                            </div>
                            
                            <div className={`p-3 rounded-xl ${currentTheme === "dark" ? "bg-gradient-to-br from-green-900/30 to-green-800/30" : "bg-gradient-to-br from-green-50 to-green-100"}`}>
                              <div className="text-xs text-green-600 dark:text-green-400">Área</div>
                              <div className="text-xl font-bold text-green-700 dark:text-green-300">
                                {triangleResult.area?.toFixed(4)}
                              </div>
                            </div>
                            
                            <div className={`p-3 rounded-xl ${currentTheme === "dark" ? "bg-gradient-to-br from-purple-900/30 to-purple-800/30" : "bg-gradient-to-br from-purple-50 to-purple-100"}`}>
                              <div className="text-xs text-purple-600 dark:text-purple-400">Semiper.</div>
                              <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                                {triangleResult.perimeter ? (triangleResult.perimeter / 2).toFixed(4) : "—"}
                              </div>
                            </div>
                            
                            <div className={`p-3 rounded-xl ${currentTheme === "dark" ? "bg-gradient-to-br from-orange-900/30 to-orange-800/30" : "bg-gradient-to-br from-orange-50 to-orange-100"}`}>
                              <div className="text-xs text-orange-600 dark:text-orange-400">Altura</div>
                              <div className="text-xl font-bold text-orange-700 dark:text-orange-300">
                                {triangleResult.height?.toFixed(4)}
                              </div>
                            </div>
                          </div>

                          {/* Ángulos */}
                          {triangleResult.angles && (
                            <div className={`p-4 rounded-xl ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"}`}>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Compass className="h-4 w-4" />
                                Ángulos Internos
                              </h4>
                              <div className="grid grid-cols-3 gap-3">
                                <div className={`text-center p-3 rounded ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                                  <div className="text-xs text-muted-foreground">Ángulo A</div>
                                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                    {triangleResult.angles.A.toFixed(2)}°
                                  </div>
                                </div>
                                <div className={`text-center p-3 rounded ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                                  <div className="text-xs text-muted-foreground">Ángulo B</div>
                                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                                    {triangleResult.angles.B.toFixed(2)}°
                                  </div>
                                </div>
                                <div className={`text-center p-3 rounded ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                                  <div className="text-xs text-muted-foreground">Ángulo C</div>
                                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                    {triangleResult.angles.C.toFixed(2)}°
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
                                <div className="text-xs text-muted-foreground">Suma verificación:</div>
                                <div className={`font-bold ${Math.abs((triangleResult.angles.A + triangleResult.angles.B + triangleResult.angles.C) - 180) < 0.1 ? 'text-green-600' : 'text-red-600'}`}>
                                  {triangleResult.angles.A.toFixed(2)}° + {triangleResult.angles.B.toFixed(2)}° + {triangleResult.angles.C.toFixed(2)}° = 
                                  {(triangleResult.angles.A + triangleResult.angles.B + triangleResult.angles.C).toFixed(1)}°
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Triángulo Inválido</AlertTitle>
                            <AlertDescription>
                              No se puede formar un triángulo con estos valores
                            </AlertDescription>
                          </Alert>
                          
                          <div className="space-y-3">
                            {triangleResult.errors?.map((error, idx) => (
                              <div key={idx} className={`p-3 rounded-lg ${currentTheme === "dark" ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"} border`}>
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                  <XCircle className="h-4 w-4" />
                                  <span className="font-medium">{error}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className={`p-4 rounded-xl ${currentTheme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-sm text-muted-foreground">Suma aritmética:</div>
                                <div className="text-xl font-bold">
                                  {triangleResult.sides.a} + {triangleResult.sides.b} + {triangleResult.sides.c} = 
                                  {(triangleResult.sides.a + triangleResult.sides.b + triangleResult.sides.c).toFixed(4)}
                                </div>
                              </div>
                              <AlertCircle className="h-5 w-5 text-amber-500" />
                            </div>
                            <div className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                              Nota: Esta suma no representa el perímetro de un triángulo geométrico válido.
                            </div>
                          </div>
                        </>
                      )}

                      {/* Pasos detallados */}
                      {showDetailedSteps && triangleResult.steps.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                              <BookOpen className="h-5 w-5" />
                              Procedimiento Paso a Paso
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDetailedSteps(!showDetailedSteps)}
                            >
                              {showDetailedSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                          
                          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {triangleResult.steps.map((step, idx) => {
                              const stepDetail: StepDetail = {
                                step: step.step,
                                title: step.description,
                                description: "",
                                formula: step.formula || "",
                                calculation: step.calculation || "",
                                result: step.result || "",
                                explanation: ""
                              };
                              return <StepDetailComponent key={idx} step={stepDetail} isLast={idx === triangleResult.steps.length - 1} />;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* ==================== ÁLGEBRA ==================== */}
            <TabsContent value="algebra" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel izquierdo: Entrada */}
                <Card className={`p-4 sm:p-6 rounded-2xl border-0 shadow-lg ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
                  <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                    <Code className="h-6 w-6 text-blue-500" />
                    Álgebra - Resolución de Ecuaciones
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Tipo de ecuación</Label>
                      <Select value={equationType} onValueChange={(v: any) => {
                        setEquationType(v);
                        setEquation(v === "linear" ? "2x + 3 = 7" : 
                                   v === "quadratic" ? "x² + 5x + 6 = 0" : 
                                   "2x + y = 5; x - y = 1");
                        vibrate(20);
                      }}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linear">Ecuación Lineal (ax + b = c)</SelectItem>
                          <SelectItem value="quadratic">Ecuación Cuadrática (ax² + bx + c = 0)</SelectItem>
                          <SelectItem value="system">Sistema de Ecuaciones (2x2)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>
                        {equationType === "linear" ? "Ecuación lineal:" : 
                         equationType === "quadratic" ? "Ecuación cuadrática:" : 
                         "Sistema de ecuaciones (separado por ;):"}
                      </Label>
                      <Input
                        value={equation}
                        onChange={(e) => setEquation(e.target.value)}
                        className="h-12"
                        placeholder={
                          equationType === "linear" ? "2x + 3 = 7" : 
                          equationType === "quadratic" ? "x² + 5x + 6 = 0" : 
                          "2x + y = 5; x - y = 1"
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Ejemplos:</Label>
                      <div className="flex flex-wrap gap-2">
                        {equationType === "linear" ? (
                          <>
                            <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setEquation("3x - 5 = 7")}>3x - 5 = 7</Badge>
                            <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setEquation("2x + 1 = 3x - 4")}>2x + 1 = 3x - 4</Badge>
                            <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setEquation("x/2 + 3 = 5")}>x/2 + 3 = 5</Badge>
                          </>
                        ) : equationType === "quadratic" ? (
                          <>
                            <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setEquation("x² - 5x + 6 = 0")}>x² - 5x + 6 = 0</Badge>
                            <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setEquation("2x² + 3x - 2 = 0")}>2x² + 3x - 2 = 0</Badge>
                            <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setEquation("x² + 4x + 4 = 0")}>x² + 4x + 4 = 0</Badge>
                          </>
                        ) : (
                          <>
                            <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setEquation("2x + y = 5; x - y = 1")}>2x + y = 5; x - y = 1</Badge>
                            <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setEquation("3x + 2y = 7; 2x - y = 4")}>3x + 2y = 7; 2x - y = 4</Badge>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={calculateAlgebra} 
                      disabled={isLoading}
                      className="w-full h-12 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Resolviendo...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Resolver Ecuación
                        </>
                      )}
                    </Button>
                    
                    {algebraError && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{algebraError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </Card>

                {/* Panel derecho: Resultados */}
                <Card className={`p-4 sm:p-6 rounded-2xl border-0 shadow-lg ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
                  <div className="mb-6">
                    <h3 className="font-bold text-xl">
                      {algebraResult.solutions.length > 0 ? (
                        <span className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="h-6 w-6" />
                          Solución Encontrada
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Code className="h-6 w-6" />
                          Solución
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tipo: {equationType} • Precisión: {precision} decimales
                    </p>
                  </div>

                  {algebraResult.solutions.length > 0 ? (
                    <div className="space-y-6">
                      {/* Resultados principales */}
                      <div className={`p-4 rounded-xl ${currentTheme === "dark" ? "bg-gradient-to-br from-blue-900/30 to-blue-800/30" : "bg-gradient-to-br from-blue-50 to-blue-100"}`}>
                        <h4 className="font-semibold mb-3">Soluciones:</h4>
                        <div className="space-y-2">
                          {algebraResult.solutions.map((sol, idx) => (
                            <div key={idx} className="text-lg font-bold font-mono p-2 bg-white dark:bg-gray-800 rounded">
                              {equationType === "system" ? `Solución ${idx + 1}: ${sol}` : `x${algebraResult.solutions.length > 1 ? idx + 1 : ''} = ${sol}`}
                            </div>
                          ))}
                        </div>
                        
                        {algebraResult.nature && (
                          <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800">
                            <div className="text-sm text-blue-600 dark:text-blue-400">Naturaleza:</div>
                            <div className="font-semibold">{algebraResult.nature}</div>
                          </div>
                        )}
                        
                        {algebraResult.discriminant !== undefined && (
                          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                            <div className="text-sm text-blue-600 dark:text-blue-400">Discriminante (Δ):</div>
                            <div className="font-bold">{algebraResult.discriminant.toFixed(precision)}</div>
                          </div>
                        )}
                      </div>

                      {/* Pasos detallados */}
                      {showDetailedSteps && algebraResult.steps.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                              <BookOpen className="h-5 w-5" />
                              Procedimiento Paso a Paso
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDetailedSteps(!showDetailedSteps)}
                            >
                              {showDetailedSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                          
                          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {algebraResult.steps.map((step, idx) => (
                              <StepDetailComponent key={idx} step={step} isLast={idx === algebraResult.steps.length - 1} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Code className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Ingrese una ecuación y resuelva para ver los resultados</p>
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* ==================== CÁLCULO ==================== */}
            <TabsContent value="calculus" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel izquierdo: Entrada */}
                <Card className={`p-4 sm:p-6 rounded-2xl border-0 shadow-lg ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
                  <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                    <Sigma className="h-6 w-6 text-blue-500" />
                    Cálculo Diferencial e Integral
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Tipo de cálculo</Label>
                      <Select value={calculusType} onValueChange={(v: any) => {
                        setCalculusType(v);
                        vibrate(20);
                      }}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="derivative">Derivada (simbólica)</SelectItem>
                          <SelectItem value="integral">Integral (indefinida)</SelectItem>
                          <SelectItem value="limit">Límite (en un punto)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Función f(x)</Label>
                      <Input
                        value={calculusFunction}
                        onChange={(e) => setCalculusFunction(e.target.value)}
                        className="h-12"
                        placeholder={
                          calculusType === "derivative" ? "x^2, sin(x), exp(x)" :
                          calculusType === "integral" ? "x^2, cos(x), 1/x" :
                          "x^2, sin(x)/x"
                        }
                      />
                    </div>
                    
                    {calculusType === "limit" && (
                      <div className="space-y-2">
                        <Label>Punto para el límite (x → a)</Label>
                        <Input
                          type="number"
                          value={atPoint}
                          onChange={(e) => setAtPoint(e.target.value)}
                          className="h-12"
                          placeholder="0"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Funciones comunes:</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setCalculusFunction("x^2")}>x²</Badge>
                        <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setCalculusFunction("x^3")}>x³</Badge>
                        <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setCalculusFunction("sin(x)")}>sin(x)</Badge>
                        <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setCalculusFunction("cos(x)")}>cos(x)</Badge>
                        <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setCalculusFunction("exp(x)")}>eˣ</Badge>
                        <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setCalculusFunction("ln(x)")}>ln(x)</Badge>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={calculateCalculus} 
                      disabled={isLoading}
                      className="w-full h-12 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Calculando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          {calculusType === "derivative" ? "Calcular Derivada" : 
                           calculusType === "integral" ? "Calcular Integral" : 
                           "Calcular Límite"}
                        </>
                      )}
                    </Button>
                    
                    <Alert className={`${currentTheme === "dark" ? "bg-blue-900/30 border-blue-800" : "bg-blue-50 border-blue-200"}`}>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Nota</AlertTitle>
                      <AlertDescription>
                        {calculusType === "derivative" ? 
                          "Para derivadas numéricas y gráficas, use la pestaña de Gráficas." :
                          calculusType === "integral" ?
                          "Para integrales definidas y área bajo la curva, use la pestaña de Gráficas." :
                          "Para límites numéricos precisos, evalúe la función cerca del punto."}
                      </AlertDescription>
                    </Alert>
                  </div>
                </Card>

                {/* Panel derecho: Resultados */}
                <Card className={`p-4 sm:p-6 rounded-2xl border-0 shadow-lg ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
                  <div className="mb-6">
                    <h3 className="font-bold text-xl">
                      {calculusResult.derivative || calculusResult.integral || calculusResult.limit ? (
                        <span className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="h-6 w-6" />
                          Resultado del Cálculo
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sigma className="h-6 w-6" />
                          Resultado
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tipo: {calculusType} • f(x) = {calculusFunction}
                    </p>
                  </div>

                  {calculusResult.derivative || calculusResult.integral || calculusResult.limit ? (
                    <div className="space-y-6">
                      {/* Resultado principal */}
                      <div className={`p-6 rounded-xl ${currentTheme === "dark" ? "bg-gradient-to-br from-purple-900/30 to-purple-800/30" : "bg-gradient-to-br from-purple-50 to-purple-100"}`}>
                        <div className="text-sm text-purple-600 dark:text-purple-400 mb-2">
                          {calculusType === "derivative" ? "Derivada encontrada:" :
                           calculusType === "integral" ? "Integral indefinida:" :
                           "Límite calculado:"}
                        </div>
                        <div className="text-2xl font-bold font-mono">
                          {calculusType === "derivative" ? `f'(x) = ${calculusResult.derivative}` :
                           calculusType === "integral" ? `∫ ${calculusFunction} dx = ${calculusResult.integral}` :
                           `lim(x→${atPoint}) ${calculusFunction} = ${calculusResult.limit}`}
                        </div>
                        
                        {calculusType === "integral" && (
                          <div className="mt-3 text-sm text-muted-foreground">
                            + C (constante de integración)
                          </div>
                        )}
                      </div>

                      {/* Pasos detallados */}
                      {showDetailedSteps && calculusSteps.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                              <BookOpen className="h-5 w-5" />
                              Procedimiento Paso a Paso
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDetailedSteps(!showDetailedSteps)}
                            >
                              {showDetailedSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                          
                          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {calculusSteps.map((step, idx) => (
                              <StepDetailComponent key={idx} step={step} isLast={idx === calculusSteps.length - 1} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Sigma className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Ingrese una función y calcule para ver los resultados</p>
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* ==================== GRÁFICAS ==================== */}
            <TabsContent value="graph" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel izquierdo: Controles */}
                <Card className={`p-4 sm:p-6 rounded-2xl border-0 shadow-lg ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
                  <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                    <LineChart className="h-6 w-6 text-blue-500" />
                    Graficador de Funciones
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Función f(x)</Label>
                      <Input
                        value={functionInput}
                        onChange={(e) => setFunctionInput(e.target.value)}
                        className="h-12 font-mono"
                        placeholder="sin(x), x^2, exp(x), log(x)"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Dominio mínimo</Label>
                        <Input
                          type="number"
                          value={graphRange.min}
                          onChange={(e) => setGraphRange({...graphRange, min: parseFloat(e.target.value) || -10})}
                          className="h-12"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Dominio máximo</Label>
                        <Input
                          type="number"
                          value={graphRange.max}
                          onChange={(e) => setGraphRange({...graphRange, max: parseFloat(e.target.value) || 10})}
                          className="h-12"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Paso (resolución)</Label>
                      <Select 
                        value={graphRange.step.toString()} 
                        onValueChange={(v) => setGraphRange({...graphRange, step: parseFloat(v)})}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.01">0.01 (alta resolución)</SelectItem>
                          <SelectItem value="0.1">0.1 (normal)</SelectItem>
                          <SelectItem value="0.5">0.5 (rápido)</SelectItem>
                          <SelectItem value="1">1 (baja resolución)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tipo de gráfica</Label>
                      <Select value={graphType} onValueChange={(v: any) => setGraphType(v)}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line">Línea</SelectItem>
                          <SelectItem value="area">Área</SelectItem>
                          <SelectItem value="bar">Barras</SelectItem>
                          <SelectItem value="scatter">Dispersión</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Color de la gráfica</Label>
                      <div className="flex flex-wrap gap-2">
                        {GRAPH_COLORS.map((color) => (
                          <button
                            key={color}
                            className={`w-8 h-8 rounded-full border-2 ${graphColor === color ? 'border-gray-800 dark:border-white' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setGraphColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="derivative" className="text-sm">Mostrar derivada f'(x)</Label>
                        <Switch
                          id="derivative"
                          checked={showDerivative}
                          onCheckedChange={setShowDerivative}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="integral" className="text-sm">Mostrar integral ∫f(x)dx</Label>
                        <Switch
                          id="integral"
                          checked={showIntegral}
                          onCheckedChange={setShowIntegral}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Funciones de ejemplo:</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setFunctionInput("sin(x)")}>sin(x)</Badge>
                        <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setFunctionInput("cos(x)")}>cos(x)</Badge>
                        <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setFunctionInput("x^2")}>x²</Badge>
                        <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setFunctionInput("exp(x)")}>eˣ</Badge>
                        <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setFunctionInput("log(x)")}>log(x)</Badge>
                        <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setFunctionInput("1/x")}>1/x</Badge>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={generateGraphData} 
                      disabled={isLoading}
                      className="w-full h-12 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Generando gráfica...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Generar Gráfica
                        </>
                      )}
                    </Button>
                    
                    {graphError && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Error en la gráfica</AlertTitle>
                        <AlertDescription>{graphError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </Card>

                {/* Panel derecho: Gráfica */}
                <Card className={`p-4 sm:p-6 rounded-2xl border-0 shadow-lg ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
                  <div className="mb-6">
                    <h3 className="font-bold text-xl">
                      {graphData ? (
                        <span className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="h-6 w-6" />
                          Gráfica Generada
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <LineChart className="h-6 w-6" />
                          Vista Previa de la Gráfica
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      f(x) = {functionInput} • Dominio: [{graphRange.min}, {graphRange.max}]
                    </p>
                  </div>

                  <div className={`rounded-xl overflow-hidden ${currentTheme === "dark" ? "bg-gray-900" : "bg-white"} border border-gray-200 dark:border-gray-700`}>
                    {graphData ? (
                      renderGraphComponent()
                    ) : (
                      <div className="h-96 sm:h-[500px] flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <LineChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p>Genere una gráfica para verla aquí</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {graphData && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className={`p-2 rounded ${currentTheme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <div className="text-xs text-muted-foreground">Puntos</div>
                        <div className="font-bold">{graphData.points.length}</div>
                      </div>
                      <div className={`p-2 rounded ${currentTheme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <div className="text-xs text-muted-foreground">Dominio</div>
                        <div className="font-bold">[{graphData.domain[0]}, {graphData.domain[1]}]</div>
                      </div>
                      <div className={`p-2 rounded ${currentTheme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <div className="text-xs text-muted-foreground">Rango</div>
                        <div className="font-bold">[{graphData.range[0].toFixed(2)}, {graphData.range[1].toFixed(2)}]</div>
                      </div>
                      <div className={`p-2 rounded ${currentTheme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <div className="text-xs text-muted-foreground">Resolución</div>
                        <div className="font-bold">Δx = {graphRange.step}</div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* ==================== IDENTIDADES ==================== */}
            <TabsContent value="identity" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel izquierdo: Entrada */}
                <Card className={`p-4 sm:p-6 rounded-2xl border-0 shadow-lg ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
                  <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                    <Grid3x3 className="h-6 w-6 text-blue-500" />
                    Verificación de Identidades Trigonométricas
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Tipo de identidad</Label>
                      <Select value={identityType} onValueChange={(v: any) => {
                        setIdentityType(v);
                        vibrate(20);
                      }}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Identidad Pitagórica (sin²θ + cos²θ = 1)</SelectItem>
                          <SelectItem value="advanced">Identidad Tangente (tanθ = sinθ/cosθ)</SelectItem>
                          <SelectItem value="inverse">Identidad Inversa (sin(arcsin(x)) = x)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Ángulo θ (en grados)</Label>
                      <Input
                        type="number"
                        value={identityAngle}
                        onChange={(e) => setIdentityAngle(e.target.value)}
                        className="h-12"
                        placeholder="30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Descripción:</Label>
                      <div className={`p-3 rounded ${currentTheme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <p className="text-sm">
                          {identityType === "basic" ? "Verificar que sin²θ + cos²θ = 1 para cualquier ángulo θ" :
                           identityType === "advanced" ? "Verificar que tanθ = sinθ/cosθ (donde cosθ ≠ 0)" :
                           "Verificar que sin(arcsin(x)) = x para x = sin(θ)"}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={calculateIdentity} 
                      disabled={isLoading}
                      className="w-full h-12 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Verificando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Verificar Identidad
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                {/* Panel derecho: Resultados */}
                <Card className={`p-4 sm:p-6 rounded-2xl border-0 shadow-lg ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
                  <div className="mb-6">
                    <h3 className="font-bold text-xl">
                      {identityResult ? (
                        identityResult.includes('✓') ? (
                          <span className="flex items-center gap-2 text-green-500">
                            <CheckCircle className="h-6 w-6" />
                            Identidad Verificada ✓
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-red-500">
                            <XCircle className="h-6 w-6" />
                            Identidad No Cumple ✗
                          </span>
                        )
                      ) : (
                        <span className="flex items-center gap-2">
                          <Grid3x3 className="h-6 w-6" />
                          Verificación de Identidad
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tipo: {identityType} • Ángulo: {identityAngle}°
                    </p>
                  </div>

                  {identityResult ? (
                    <div className="space-y-6">
                      {/* Resultado principal */}
                      <div className={`p-6 rounded-xl ${identityResult.includes('✓') ? 
                        (currentTheme === "dark" ? "bg-gradient-to-br from-green-900/30 to-green-800/30" : "bg-gradient-to-br from-green-50 to-green-100") :
                        (currentTheme === "dark" ? "bg-gradient-to-br from-red-900/30 to-red-800/30" : "bg-gradient-to-br from-red-50 to-red-100")
                      }`}>
                        <div className="text-2xl font-bold text-center">
                          {identityResult}
                        </div>
                        
                        <div className="mt-4 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-gray-800">
                            {identityResult.includes('✓') ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">IDENTIDAD VÁLIDA</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium text-red-600 dark:text-red-400">NO CUMPLE LA IDENTIDAD</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pasos detallados */}
                      {showDetailedSteps && identitySteps.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                              <BookOpen className="h-5 w-5" />
                              Procedimiento Paso a Paso
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDetailedSteps(!showDetailedSteps)}
                            >
                              {showDetailedSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                          
                          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {identitySteps.map((step, idx) => (
                              <StepDetailComponent key={idx} step={step} isLast={idx === identitySteps.length - 1} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Grid3x3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Seleccione una identidad y verifíquela</p>
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Historial */}
        {history.length > 0 && (
          <Card className={`p-4 sm:p-6 rounded-2xl shadow-lg mt-6 ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial ({history.length})
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      history.map(h => `${h.type}: ${h.input} = ${h.result}`).join('\n')
                    );
                    vibrate(50);
                    playSound("success");
                  }}
                  className="gap-1"
                >
                  <Copy className="h-3 w-3" />
                  {!deviceInfo.isMobile && "Copiar"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHistory([]);
                    vibrate(100);
                    playSound("click");
                  }}
                  className="gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  {!deviceInfo.isMobile && "Limpiar"}
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.map((item) => (
                <div 
                  key={item.id}
                  className={`p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer ${currentTheme === "dark" ? "border-gray-700" : "border-gray-200"} border`}
                  onClick={() => {
                    if (calcType === "basic") {
                      setBasicInput(item.input);
                      setTimeout(() => calculateBasic(), 100);
                    } else if (calcType === "trig") {
                      const angleMatch = item.input.match(/Ángulo: ([\d.]+)/);
                      if (angleMatch) {
                        setAngle(angleMatch[1]);
                        setTimeout(() => calculateTrig(), 100);
                      }
                    } else if (calcType === "algebra") {
                      setEquation(item.input.replace(/.*: /, ''));
                      setTimeout(() => calculateAlgebra(), 100);
                    } else if (calcType === "calculus") {
                      const funcMatch = item.input.match(/(?:Derivada|Integral|Límite) de: (.+)/);
                      if (funcMatch) {
                        setCalculusFunction(funcMatch[1]);
                        setTimeout(() => calculateCalculus(), 100);
                      }
                    } else if (calcType === "graph") {
                      const funcMatch = item.input.match(/f\(x\) = (.+)/);
                      if (funcMatch) {
                        setFunctionInput(funcMatch[1]);
                        setTimeout(() => generateGraphData(), 100);
                      }
                    }
                    vibrate(20);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.type.substring(0, 3)}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp instanceof Date ? item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </div>
                      </div>
                      <div className="text-sm font-medium truncate">{item.input}</div>
                      <div className="text-primary font-bold truncate">{item.result}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                    >
                      <RotateCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Configuración avanzada */}
        {advancedMode && (
          <Card className={`p-4 sm:p-6 rounded-2xl shadow-lg mt-6 ${currentTheme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-blue-50"}`}>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Configuración Avanzada
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Tema</Label>
                <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automático</SelectItem>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Precisión: {precision} dec</Label>
                <Slider
                  value={[precision]}
                  onValueChange={([value]) => setPrecision(value)}
                  min={2}
                  max={16}
                  step={1}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="animations" className="text-sm">Animaciones</Label>
                  <Switch
                    id="animations"
                    checked={animationsEnabled}
                    onCheckedChange={setAnimationsEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound" className="text-sm">Sonido</Label>
                  <Switch
                    id="sound"
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="haptic" className="text-sm">Vibración</Label>
                  <Switch
                    id="haptic"
                    checked={hapticFeedback}
                    onCheckedChange={setHapticFeedback}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => {
                    setAdvancedMode(false);
                    setAnimationsEnabled(true);
                    setSoundEnabled(false);
                    setHapticFeedback(false);
                    setPrecision(6);
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Restaurar por defecto
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => setHistory([])}
                >
                  <Trash2 className="h-4 w-4" />
                  Limpiar historial
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Pie de página */}
        <div className="text-center text-xs sm:text-sm text-muted-foreground mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="mb-2">© 2026 Calculadora Matemática Profesional • v2.0 • {deviceInfo.screenWidth}×{deviceInfo.screenHeight}px</p>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <Thermometer className="h-3 w-3" />
              Precisión: {precision} decimales
            </span>
            <span className="flex items-center gap-1">
              {currentTheme === "dark" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
              Tema: {theme === "auto" ? "Automático" : theme === "dark" ? "Oscuro" : "Claro"}
            </span>
            <span className="flex items-center gap-1">
              {deviceInfo.isMobile ? <Smartphone className="h-3 w-3" /> : 
               deviceInfo.isTablet ? <Tablet className="h-3 w-3" /> : 
               <Monitor className="h-3 w-3" />}
              {deviceInfo.isMobile ? "Móvil" : deviceInfo.isTablet ? "Tablet" : "Escritorio"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}