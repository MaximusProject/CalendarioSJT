import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Atom, Calculator, ArrowUp, ArrowRight, RotateCw, Zap, 
  Thermometer, Scale, Waves, Gauge, Target, Globe, 
  Battery, Lightbulb, Sparkles, Braces, LineChart,
  Download, Share2, Info, History, BookOpen,
  Play, Pause, RefreshCw, Maximize2, Minimize2,
  AlertCircle, CheckCircle, XCircle, ChevronRight,
  Smartphone, Monitor, Tablet, Moon, Sun,
  Clock, Move, TrendingUp, Rocket, Layers, Activity
} from "lucide-react";

// Tipos de datos
interface CalculationStep {
  formula: string;
  substitution: string;
  result: string;
  explanation: string;
  unitConversion?: string;
}

interface PhysicsResult {
  title: string;
  steps: CalculationStep[];
  finalResults: { label: string; value: string; unit: string; description?: string }[];
  graphs?: GraphData[];
  warnings?: string[];
  assumptions?: string[];
  unitConversions?: string[];
}

interface GraphData {
  title: string;
  type: "line" | "scatter" | "bar";
  data: { x: number; y: number }[];
  xLabel: string;
  yLabel: string;
  color?: string;
}

interface HistoryItem {
  id: string;
  timestamp: Date;
  type: string;
  inputs: Record<string, any>;
  results: PhysicsResult;
}

// Sistema de unidades mejorado
const UNIT_SYSTEM = {
  // Longitud
  length: {
    m: { name: "Metros", base: "m", factor: 1, system: "SI" },
    km: { name: "Kilómetros", base: "m", factor: 1000, system: "SI" },
    cm: { name: "Centímetros", base: "m", factor: 0.01, system: "SI" },
    mm: { name: "Milímetros", base: "m", factor: 0.001, system: "SI" },
    ft: { name: "Pies", base: "m", factor: 0.3048, system: "Imperial" },
    in: { name: "Pulgadas", base: "m", factor: 0.0254, system: "Imperial" },
    yd: { name: "Yardas", base: "m", factor: 0.9144, system: "Imperial" },
    mi: { name: "Millas", base: "m", factor: 1609.344, system: "Imperial" },
  },
  
  // Tiempo
  time: {
    s: { name: "Segundos", base: "s", factor: 1, system: "SI" },
    min: { name: "Minutos", base: "s", factor: 60, system: "Other" },
    h: { name: "Horas", base: "s", factor: 3600, system: "Other" },
    ms: { name: "Milisegundos", base: "s", factor: 0.001, system: "SI" },
    μs: { name: "Microsegundos", base: "s", factor: 1e-6, system: "SI" },
    ns: { name: "Nanosegundos", base: "s", factor: 1e-9, system: "SI" },
  },
  
  // Masa
  mass: {
    kg: { name: "Kilogramos", base: "kg", factor: 1, system: "SI" },
    g: { name: "Gramos", base: "kg", factor: 0.001, system: "SI" },
    mg: { name: "Miligramos", base: "kg", factor: 1e-6, system: "SI" },
    lb: { name: "Libras", base: "kg", factor: 0.45359237, system: "Imperial" },
    oz: { name: "Onzas", base: "kg", factor: 0.0283495, system: "Imperial" },
    t: { name: "Toneladas", base: "kg", factor: 1000, system: "SI" },
  },
  
  // Velocidad
  velocity: {
    "m/s": { name: "Metros por segundo", base: "m/s", factor: 1, system: "SI" },
    "km/h": { name: "Kilómetros por hora", base: "m/s", factor: 0.277778, system: "Other" },
    mph: { name: "Millas por hora", base: "m/s", factor: 0.44704, system: "Imperial" },
    "ft/s": { name: "Pies por segundo", base: "m/s", factor: 0.3048, system: "Imperial" },
    knots: { name: "Nudos", base: "m/s", factor: 0.514444, system: "Other" },
  },
  
  // Aceleración
  acceleration: {
    "m/s²": { name: "Metros por segundo cuadrado", base: "m/s²", factor: 1, system: "SI" },
    "ft/s²": { name: "Pies por segundo cuadrado", base: "m/s²", factor: 0.3048, system: "Imperial" },
    g: { name: "Gravedad terrestre", base: "m/s²", factor: 9.80665, system: "Other" },
  },
  
  // Ángulo
  angle: {
    "°": { name: "Grados", base: "rad", factor: Math.PI/180, system: "Other" },
    rad: { name: "Radianes", base: "rad", factor: 1, system: "SI" },
    grad: { name: "Grados centesimales", base: "rad", factor: Math.PI/200, system: "Other" },
  },
  
  // Fuerza
  force: {
    N: { name: "Newtons", base: "N", factor: 1, system: "SI" },
    kN: { name: "Kilonewtons", base: "N", factor: 1000, system: "SI" },
    lbf: { name: "Libras-fuerza", base: "N", factor: 4.44822, system: "Imperial" },
    dyn: { name: "Dinas", base: "N", factor: 1e-5, system: "CGS" },
  },
  
  // Energía
  energy: {
    J: { name: "Joules", base: "J", factor: 1, system: "SI" },
    kJ: { name: "Kilojoules", base: "J", factor: 1000, system: "SI" },
    cal: { name: "Calorías", base: "J", factor: 4.184, system: "Other" },
    kWh: { name: "Kilovatios-hora", base: "J", factor: 3.6e6, system: "Other" },
    eV: { name: "Electronvoltios", base: "J", factor: 1.602176634e-19, system: "Other" },
  },
};

// Validación precisa de entrada numérica
const parseScientificInput = (value: string): number | null => {
  if (value === null || value === undefined || value.trim() === '') {
    return null;
  }
  
  // Limpiar el valor (quitar espacios, comas)
  const cleanValue = value.trim().replace(/,/g, '');
  
  // Verificar si es un número válido
  const num = Number(cleanValue);
  
  // Verificar si es NaN o infinito
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  return num;
};

// Formatear número con notación científica si es necesario
const formatNumber = (num: number, decimalPlaces: number): string => {
  if (num === null || isNaN(num)) return "N/A";
  
  // Para números enteros, no mostrar decimales innecesarios
  if (Number.isInteger(num) && decimalPlaces > 0) {
    return num.toString();
  }
  
  // Para números muy grandes o pequeños, usar notación científica
  if (Math.abs(num) > 1e6 || (Math.abs(num) < 1e-4 && num !== 0)) {
    return num.toExponential(decimalPlaces);
  }
  
  // Para números en rango normal
  return num.toFixed(decimalPlaces);
};

export function PhysicsCalculator() {
  // Estados principales
  const [category, setCategory] = useState<"cinematica" | "dinamica" | "energia" | "electricidad" | "termodinamica" | "opticas">("cinematica");
  const [calcType, setCalcType] = useState<"vertical" | "horizontal" | "inclinado" | "mru" | "mrua" | "caida_libre">("vertical");
  
  // Sistema de unidades
  const [unitSystem, setUnitSystem] = useState<"SI" | "Imperial" | "Auto">("SI");
  const [units, setUnits] = useState({
    length: "m",
    time: "s",
    velocity: "m/s",
    angle: "°",
    mass: "kg",
    acceleration: "m/s²",
    force: "N",
    energy: "J",
  });
  
  // Configuración de visualización
  const [showSteps, setShowSteps] = useState(true);
  const [showGraphs, setShowGraphs] = useState(true);
  const [useStandardGravity, setUseStandardGravity] = useState(true);
  const [customGravity, setCustomGravity] = useState("9.80665");
  const [decimalPlaces, setDecimalPlaces] = useState(3);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoConvertUnits, setAutoConvertUnits] = useState(true);
  const [showUnitWarnings, setShowUnitWarnings] = useState(true);
  
  // Modo responsive
  const [isMobile, setIsMobile] = useState(false);
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">("desktop");
  
  // Historial de cálculos
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Estados para cada tipo de cálculo - CINEMÁTICA
  // Lanzamiento Vertical
  const [v0, setV0] = useState("20");
  
  // Lanzamiento Horizontal
  const [vx, setVx] = useState("15");
  const [hHeight, setHHeight] = useState("45");
  
  // Lanzamiento Inclinado
  const [iV0, setIV0] = useState("25");
  const [angle, setAngle] = useState("45");
  
  // MRU
  const [mruVelocity, setMruVelocity] = useState("10");
  const [mruTime, setMruTime] = useState("5");
  const [mruDistance, setMruDistance] = useState("");
  
  // MRUA
  const [mruaV0, setMruaV0] = useState("0");
  const [mruaVf, setMruaVf] = useState("20");
  const [mruaAcceleration, setMruaAcceleration] = useState("");
  const [mruaTime, setMruaTime] = useState("");
  const [mruaDistance, setMruaDistance] = useState("");
  
  // Caída Libre
  const [freefallHeight, setFreefallHeight] = useState("50");
  const [freefallTime, setFreefallTime] = useState("");
  const [freefallV0, setFreefallV0] = useState("0");
  
  // Estados para otras categorías (mantenidos para futura expansión)
  const [mass, setMass] = useState("5");
  const [force, setForce] = useState("");
  const [frictionCoeff, setFrictionCoeff] = useState("0.3");
  const [kineticMass, setKineticMass] = useState("2");
  const [kineticVelocity, setKineticVelocity] = useState("10");
  const [potentialHeight, setPotentialHeight] = useState("5");
  const [voltage, setVoltage] = useState("12");
  const [current, setCurrent] = useState("2");
  const [resistance, setResistance] = useState("6");
  
  // Resultados
  const [result, setResult] = useState<PhysicsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [unitWarnings, setUnitWarnings] = useState<string[]>([]);
  
  // Referencia para detectar tamaño de pantalla
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setIsMobile(true);
        setDeviceType("mobile");
      } else if (width < 1024) {
        setIsMobile(true);
        setDeviceType("tablet");
      } else {
        setIsMobile(false);
        setDeviceType("desktop");
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Gravedad actual
  const g = useStandardGravity ? 9.80665 : parseScientificInput(customGravity) || 9.80665;
  
  // Actualizar unidades según el sistema seleccionado
  useEffect(() => {
    if (unitSystem === "SI") {
      setUnits({
        length: "m",
        time: "s",
        velocity: "m/s",
        angle: "°",
        mass: "kg",
        acceleration: "m/s²",
        force: "N",
        energy: "J",
      });
    } else if (unitSystem === "Imperial") {
      setUnits({
        length: "ft",
        time: "s",
        velocity: "ft/s",
        angle: "°",
        mass: "lb",
        acceleration: "ft/s²",
        force: "lbf",
        energy: "J",
      });
    }
  }, [unitSystem]);
  
  // Función de conversión de unidades
  const convertUnit = (value: number, fromUnit: string, toUnit: string, category: keyof typeof UNIT_SYSTEM): number => {
    try {
      const unitMap = UNIT_SYSTEM[category];
      if (unitMap) {
        const fromInfo = unitMap[fromUnit as keyof typeof unitMap];
        const toInfo = unitMap[toUnit as keyof typeof unitMap];
        
        if (fromInfo && toInfo) {
          // Convertir a unidades base primero
          const baseValue = value * fromInfo.factor;
          // Convertir de base a destino
          return baseValue / toInfo.factor;
        }
      }
      
      console.warn(`No se pudo convertir ${fromUnit} a ${toUnit} en categoría ${category}`);
      return value;
    } catch (error) {
      console.error('Error en conversión de unidad:', error);
      return value;
    }
  };
  
  // Auto-convertir unidades cuando sea necesario
  const autoConvertIfNeeded = (
    value: number | null, 
    currentUnit: string, 
    targetUnit: string,
    category: keyof typeof UNIT_SYSTEM
  ): {value: number, converted: boolean, message?: string} => {
    if (value === null) return {value: 0, converted: false};
    
    if (currentUnit !== targetUnit && autoConvertUnits) {
      const convertedValue = convertUnit(value, currentUnit, targetUnit, category);
      return {
        value: convertedValue,
        converted: true,
        message: `Convertido de ${formatNumber(value, decimalPlaces)} ${currentUnit} a ${formatNumber(convertedValue, decimalPlaces)} ${targetUnit}`
      };
    }
    
    return {value, converted: false};
  };
  
  // Formatear número con decimales configurados
  const formatNum = (num: number): string => {
    return formatNumber(num, decimalPlaces);
  };
  
  // Guardar en historial
  const saveToHistory = (inputs: Record<string, any>, results: PhysicsResult) => {
    const newItem: HistoryItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type: `${category} - ${calcType}`,
      inputs,
      results
    };
    
    setHistory(prev => [newItem, ...prev.slice(0, 9)]);
  };
  
  // 1. CÁLCULO DE LANZAMIENTO VERTICAL (Completo)
  const calculateVertical = () => {
    const v0Num = parseScientificInput(v0);
    const steps: CalculationStep[] = [];
    const graphs: GraphData[] = [];
    const conversions: string[] = [];
    const warnings: string[] = [];
    
    // Verificar unidad de entrada
    if (v0Num === null) {
      setResult({
        title: "Error en Lanzamiento Vertical",
        steps: [],
        finalResults: [],
        warnings: ["Por favor ingresa una velocidad inicial válida"]
      });
      return;
    }
    
    // Auto-conversión si es necesario
    const v0Converted = autoConvertIfNeeded(v0Num, units.velocity, "m/s", "velocity");
    if (v0Converted.converted && v0Converted.message) {
      conversions.push(v0Converted.message);
      steps.push({
        formula: "Conversión de unidades",
        substitution: `v₀ = ${formatNum(v0Num)} ${units.velocity} → ${formatNum(v0Converted.value)} m/s`,
        result: `v₀ = ${formatNum(v0Converted.value)} m/s`,
        explanation: "Conversión a unidades del SI para cálculo"
      });
    }
    
    const v0Value = v0Converted.value;
    
    // Altura máxima
    const hMax = (v0Value * v0Value) / (2 * g);
    steps.push({
      formula: "h_max = v₀² / (2g)",
      substitution: `h_max = (${formatNum(v0Value)})² / (2 × ${formatNum(g)})`,
      result: `h_max = ${formatNum(hMax)} m`,
      explanation: "La altura máxima se alcanza cuando la velocidad vertical es cero"
    });

    // Tiempo de subida
    const tSubida = v0Value / g;
    steps.push({
      formula: "t_subida = v₀ / g",
      substitution: `t_subida = ${formatNum(v0Value)} / ${formatNum(g)}`,
      result: `t_subida = ${formatNum(tSubida)} s`,
      explanation: "Tiempo que tarda en alcanzar la altura máxima"
    });

    // Tiempo total (ida y vuelta)
    const tTotal = 2 * tSubida;
    steps.push({
      formula: "t_total = 2 × t_subida",
      substitution: `t_total = 2 × ${formatNum(tSubida)}`,
      result: `t_total = ${formatNum(tTotal)} s`,
      explanation: "Tiempo total de vuelo (subida + bajada)"
    });

    // Velocidad final al caer
    const vFinal = v0Value; // misma magnitud
    steps.push({
      formula: "v_final = v₀ (misma magnitud)",
      substitution: `v_final = ${formatNum(v0Value)}`,
      result: `v_final = ${formatNum(vFinal)} m/s (hacia abajo)`,
      explanation: "La velocidad final tiene la misma magnitud que la inicial (conservación de energía)"
    });
    
    // Generar datos para gráfico de posición vs tiempo
    const timeData = [];
    const velocityData = [];
    
    for (let t = 0; t <= tTotal * 1.1; t += tTotal / 20) {
      const y = v0Value * t - 0.5 * g * t * t;
      const v = v0Value - g * t;
      timeData.push({ x: t, y });
      velocityData.push({ x: t, y: v });
    }
    
    graphs.push({
      title: "Posición vs Tiempo",
      type: "line",
      data: timeData,
      xLabel: "Tiempo (s)",
      yLabel: "Altura (m)",
      color: "#3b82f6"
    });
    
    graphs.push({
      title: "Velocidad vs Tiempo",
      type: "line",
      data: velocityData,
      xLabel: "Tiempo (s)",
      yLabel: "Velocidad (m/s)",
      color: "#ef4444"
    });

    const finalResult: PhysicsResult = {
      title: "Lanzamiento Vertical",
      steps,
      finalResults: [
        { label: "Altura máxima", value: formatNum(hMax), unit: "m", description: "Máxima altura alcanzada" },
        { label: "Tiempo de subida", value: formatNum(tSubida), unit: "s", description: "Tiempo hasta altura máxima" },
        { label: "Tiempo total", value: formatNum(tTotal), unit: "s", description: "Tiempo total de vuelo" },
        { label: "Velocidad final", value: formatNum(vFinal), unit: "m/s", description: "Velocidad al regresar al punto inicial" }
      ],
      graphs: showGraphs ? graphs : undefined,
      unitConversions: conversions.length > 0 ? conversions : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      assumptions: [
        "Se desprecia la resistencia del aire",
        `Gravedad: ${formatNum(g)} m/s²`,
        "Movimiento en línea recta vertical",
        "Aceleración constante"
      ]
    };
    
    setResult(finalResult);
    setUnitWarnings(warnings);
    saveToHistory({ v0: v0Num, g }, finalResult);
  };

  // 2. CÁLCULO DE LANZAMIENTO HORIZONTAL (Completo)
  const calculateHorizontal = () => {
    const vxNum = parseScientificInput(vx);
    const hNum = parseScientificInput(hHeight);
    const steps: CalculationStep[] = [];
    const graphs: GraphData[] = [];
    const conversions: string[] = [];
    const warnings: string[] = [];
    
    // Validar entradas
    if (vxNum === null || hNum === null) {
      setResult({
        title: "Error en Lanzamiento Horizontal",
        steps: [],
        finalResults: [],
        warnings: ["Por favor ingresa valores válidos para velocidad y altura"]
      });
      return;
    }
    
    // Auto-conversión de unidades
    const vxConverted = autoConvertIfNeeded(vxNum, units.velocity, "m/s", "velocity");
    const hConverted = autoConvertIfNeeded(hNum, units.length, "m", "length");
    
    if (vxConverted.converted && vxConverted.message) {
      conversions.push(vxConverted.message);
      steps.push({
        formula: "Conversión de velocidad",
        substitution: `v₀ = ${formatNum(vxNum)} ${units.velocity} → ${formatNum(vxConverted.value)} m/s`,
        result: `v₀ = ${formatNum(vxConverted.value)} m/s`,
        explanation: "Conversión a unidades del SI"
      });
    }
    
    if (hConverted.converted && hConverted.message) {
      conversions.push(hConverted.message);
      steps.push({
        formula: "Conversión de altura",
        substitution: `h = ${formatNum(hNum)} ${units.length} → ${formatNum(hConverted.value)} m`,
        result: `h = ${formatNum(hConverted.value)} m`,
        explanation: "Conversión a unidades del SI"
      });
    }
    
    const vxValue = vxConverted.value;
    const hValue = hConverted.value;
    
    // Tiempo de caída
    const tCaida = Math.sqrt((2 * hValue) / g);
    steps.push({
      formula: "t = √(2h / g)",
      substitution: `t = √(2 × ${formatNum(hValue)} / ${formatNum(g)})`,
      result: `t = ${formatNum(tCaida)} s`,
      explanation: "Tiempo que tarda en caer desde la altura h"
    });

    // Alcance horizontal
    const alcance = vxValue * tCaida;
    steps.push({
      formula: "x = v₀ × t",
      substitution: `x = ${formatNum(vxValue)} × ${formatNum(tCaida)}`,
      result: `x = ${formatNum(alcance)} m`,
      explanation: "Distancia horizontal recorrida durante la caída"
    });

    // Velocidad vertical al caer
    const vy = g * tCaida;
    steps.push({
      formula: "v_y = g × t",
      substitution: `v_y = ${formatNum(g)} × ${formatNum(tCaida)}`,
      result: `v_y = ${formatNum(vy)} m/s`,
      explanation: "Componente vertical de la velocidad al impactar"
    });

    // Velocidad resultante
    const vResultante = Math.sqrt(vxValue * vxValue + vy * vy);
    steps.push({
      formula: "v = √(v_x² + v_y²)",
      substitution: `v = √(${formatNum(vxValue)}² + ${formatNum(vy)}²)`,
      result: `v = ${formatNum(vResultante)} m/s`,
      explanation: "Velocidad total (magnitud) al momento del impacto"
    });
    
    // Ángulo de impacto
    const impactAngle = Math.atan(vy / vxValue) * 180 / Math.PI;
    steps.push({
      formula: "θ = arctan(v_y / v_x)",
      substitution: `θ = arctan(${formatNum(vy)} / ${formatNum(vxValue)})`,
      result: `θ = ${formatNum(impactAngle)}°`,
      explanation: "Ángulo con respecto a la horizontal al impactar"
    });
    
    // Generar datos para gráfico de trayectoria
    const trajectoryData = [];
    for (let t = 0; t <= tCaida * 1.1; t += tCaida / 20) {
      const x = vxValue * t;
      const y = hValue - 0.5 * g * t * t;
      if (y >= 0) {
        trajectoryData.push({ x, y });
      }
    }
    
    graphs.push({
      title: "Trayectoria Parabólica",
      type: "scatter",
      data: trajectoryData,
      xLabel: "Distancia horizontal (m)",
      yLabel: "Altura (m)",
      color: "#10b981"
    });

    const finalResult: PhysicsResult = {
      title: "Lanzamiento Horizontal",
      steps,
      finalResults: [
        { label: "Tiempo de caída", value: formatNum(tCaida), unit: "s", description: "Duración del movimiento" },
        { label: "Alcance horizontal", value: formatNum(alcance), unit: "m", description: "Distancia horizontal recorrida" },
        { label: "Velocidad vertical", value: formatNum(vy), unit: "m/s", description: "Componente vertical final" },
        { label: "Velocidad final", value: formatNum(vResultante), unit: "m/s", description: "Magnitud de la velocidad final" },
        { label: "Ángulo de impacto", value: formatNum(impactAngle), unit: "°", description: "Ángulo respecto a la horizontal" }
      ],
      graphs: showGraphs ? graphs : undefined,
      unitConversions: conversions.length > 0 ? conversions : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      assumptions: [
        "Se desprecia la resistencia del aire",
        `Gravedad: ${formatNum(g)} m/s²`,
        "Velocidad horizontal constante",
        "Superficie plana",
        "Aceleración vertical constante"
      ]
    };
    
    setResult(finalResult);
    setUnitWarnings(warnings);
    saveToHistory({ vx: vxNum, h: hNum, g }, finalResult);
  };

  // 3. CÁLCULO DE LANZAMIENTO INCLINADO (Completo)
  const calculateInclined = () => {
    const v0Num = parseScientificInput(iV0);
    const angleNum = parseScientificInput(angle);
    const steps: CalculationStep[] = [];
    const graphs: GraphData[] = [];
    const conversions: string[] = [];
    const warnings: string[] = [];
    
    // Validar entradas
    if (v0Num === null || angleNum === null) {
      setResult({
        title: "Error en Lanzamiento Inclinado",
        steps: [],
        finalResults: [],
        warnings: ["Por favor ingresa valores válidos para velocidad y ángulo"]
      });
      return;
    }
    
    // Auto-conversión de unidades
    const v0Converted = autoConvertIfNeeded(v0Num, units.velocity, "m/s", "velocity");
    
    if (v0Converted.converted && v0Converted.message) {
      conversions.push(v0Converted.message);
      steps.push({
        formula: "Conversión de velocidad",
        substitution: `v₀ = ${formatNum(v0Num)} ${units.velocity} → ${formatNum(v0Converted.value)} m/s`,
        result: `v₀ = ${formatNum(v0Converted.value)} m/s`,
        explanation: "Conversión a unidades del SI"
      });
    }
    
    // Convertir ángulo a radianes si está en grados
    let angleRad = angleNum * Math.PI / 180;
    if (units.angle === "°") {
      steps.push({
        formula: "θ (radianes) = θ (°) × π / 180",
        substitution: `θ = ${formatNum(angleNum)}° × π / 180`,
        result: `θ = ${formatNum(angleRad)} rad`,
        explanation: "Conversión de grados a radianes para cálculos trigonométricos"
      });
    }
    
    const v0Value = v0Converted.value;
    
    // Componentes de velocidad
    const v0x = v0Value * Math.cos(angleRad);
    const v0y = v0Value * Math.sin(angleRad);
    steps.push({
      formula: "v₀x = v₀ × cos(θ) ; v₀y = v₀ × sin(θ)",
      substitution: `v₀x = ${formatNum(v0Value)} × cos(${formatNum(angleRad)}) ; v₀y = ${formatNum(v0Value)} × sin(${formatNum(angleRad)})`,
      result: `v₀x = ${formatNum(v0x)} m/s ; v₀y = ${formatNum(v0y)} m/s`,
      explanation: "Descomposición de la velocidad inicial en componentes horizontal y vertical"
    });

    // Altura máxima
    const hMax = (v0y * v0y) / (2 * g);
    steps.push({
      formula: "h_max = v₀y² / (2g)",
      substitution: `h_max = (${formatNum(v0y)})² / (2 × ${formatNum(g)})`,
      result: `h_max = ${formatNum(hMax)} m`,
      explanation: "Altura máxima alcanzada por el proyectil"
    });

    // Tiempo total de vuelo
    const tTotal = (2 * v0y) / g;
    steps.push({
      formula: "t_total = (2 × v₀y) / g",
      substitution: `t_total = (2 × ${formatNum(v0y)}) / ${formatNum(g)}`,
      result: `t_total = ${formatNum(tTotal)} s`,
      explanation: "Tiempo total de vuelo (subida + bajada)"
    });

    // Alcance máximo
    const alcance = v0x * tTotal;
    steps.push({
      formula: "R = v₀x × t_total",
      substitution: `R = ${formatNum(v0x)} × ${formatNum(tTotal)}`,
      result: `R = ${formatNum(alcance)} m`,
      explanation: "Alcance horizontal máximo (distancia recorrida)"
    });
    
    // Generar datos para gráfico de trayectoria
    const trajectoryData = [];
    for (let t = 0; t <= tTotal * 1.1; t += tTotal / 20) {
      const x = v0x * t;
      const y = v0y * t - 0.5 * g * t * t;
      if (y >= 0) {
        trajectoryData.push({ x, y });
      }
    }
    
    graphs.push({
      title: "Trayectoria Parabólica",
      type: "scatter",
      data: trajectoryData,
      xLabel: "Alcance (m)",
      yLabel: "Altura (m)",
      color: "#8b5cf6"
    });

    const finalResult: PhysicsResult = {
      title: "Lanzamiento Inclinado",
      steps,
      finalResults: [
        { label: "Velocidad horizontal", value: formatNum(v0x), unit: "m/s", description: "Componente horizontal constante" },
        { label: "Velocidad vertical inicial", value: formatNum(v0y), unit: "m/s", description: "Componente vertical inicial" },
        { label: "Altura máxima", value: formatNum(hMax), unit: "m", description: "Punto más alto de la trayectoria" },
        { label: "Tiempo de vuelo", value: formatNum(tTotal), unit: "s", description: "Duración total del movimiento" },
        { label: "Alcance máximo", value: formatNum(alcance), unit: "m", description: "Distancia horizontal total" }
      ],
      graphs: showGraphs ? graphs : undefined,
      unitConversions: conversions.length > 0 ? conversions : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      assumptions: [
        "Se desprecia la resistencia del aire",
        `Gravedad: ${formatNum(g)} m/s²`,
        `Ángulo de lanzamiento: ${formatNum(angleNum)}°`,
        "Superficie plana y nivelada",
        "Aceleración constante"
      ]
    };
    
    setResult(finalResult);
    setUnitWarnings(warnings);
    saveToHistory({ v0: v0Num, angle: angleNum, g }, finalResult);
  };
  
  // 4. CÁLCULO DE MRU (Movimiento Rectilíneo Uniforme)
  const calculateMRU = () => {
    const velocityNum = parseScientificInput(mruVelocity);
    const timeNum = parseScientificInput(mruTime);
    const distanceNum = parseScientificInput(mruDistance);
    
    const steps: CalculationStep[] = [];
    const graphs: GraphData[] = [];
    const conversions: string[] = [];
    const warnings: string[] = [];
    
    // Validar que al menos dos valores estén presentes
    const inputs = [velocityNum, timeNum, distanceNum];
    const inputCount = inputs.filter(v => v !== null).length;
    
    if (inputCount < 2) {
      setResult({
        title: "Error en MRU",
        steps: [],
        finalResults: [],
        warnings: ["Por favor ingresa al menos dos valores para calcular el tercero"]
      });
      return;
    }
    
    let calculatedVelocity = velocityNum;
    let calculatedTime = timeNum;
    let calculatedDistance = distanceNum;
    
    // Conversión de unidades
    if (velocityNum !== null) {
      const vConverted = autoConvertIfNeeded(velocityNum, units.velocity, "m/s", "velocity");
      if (vConverted.converted && vConverted.message) {
        conversions.push(vConverted.message);
        calculatedVelocity = vConverted.value;
      } else {
        calculatedVelocity = velocityNum;
      }
    }
    
    if (timeNum !== null) {
      const tConverted = autoConvertIfNeeded(timeNum, units.time, "s", "time");
      if (tConverted.converted && tConverted.message) {
        conversions.push(tConverted.message);
        calculatedTime = tConverted.value;
      } else {
        calculatedTime = timeNum;
      }
    }
    
    // Cálculos
    if (velocityNum !== null && timeNum !== null) {
      // Calcular distancia
      calculatedDistance = calculatedVelocity! * calculatedTime!;
      steps.push({
        formula: "d = v × t",
        substitution: `d = ${formatNum(calculatedVelocity!)} × ${formatNum(calculatedTime!)}`,
        result: `d = ${formatNum(calculatedDistance)} m`,
        explanation: "Distancia recorrida con velocidad constante"
      });
    } else if (distanceNum !== null && timeNum !== null) {
      // Calcular velocidad
      const dConverted = autoConvertIfNeeded(distanceNum, units.length, "m", "length");
      calculatedDistance = dConverted.value;
      if (dConverted.converted && dConverted.message) {
        conversions.push(dConverted.message);
      }
      
      calculatedVelocity = calculatedDistance / calculatedTime!;
      steps.push({
        formula: "v = d / t",
        substitution: `v = ${formatNum(calculatedDistance)} / ${formatNum(calculatedTime!)}`,
        result: `v = ${formatNum(calculatedVelocity)} m/s`,
        explanation: "Velocidad constante calculada"
      });
    } else if (distanceNum !== null && velocityNum !== null) {
      // Calcular tiempo
      const dConverted = autoConvertIfNeeded(distanceNum, units.length, "m", "length");
      calculatedDistance = dConverted.value;
      if (dConverted.converted && dConverted.message) {
        conversions.push(dConverted.message);
      }
      
      calculatedTime = calculatedDistance / calculatedVelocity!;
      steps.push({
        formula: "t = d / v",
        substitution: `t = ${formatNum(calculatedDistance)} / ${formatNum(calculatedVelocity!)}`,
        result: `t = ${formatNum(calculatedTime)} s`,
        explanation: "Tiempo requerido para recorrer la distancia"
      });
    }
    
    // Generar datos para gráfico de posición vs tiempo
    const timeData = [];
    const maxTime = calculatedTime || 10;
    for (let t = 0; t <= maxTime; t += maxTime / 20) {
      const d = calculatedVelocity! * t;
      timeData.push({ x: t, y: d });
    }
    
    graphs.push({
      title: "Posición vs Tiempo (MRU)",
      type: "line",
      data: timeData,
      xLabel: "Tiempo (s)",
      yLabel: "Posición (m)",
      color: "#3b82f6"
    });

    const finalResult: PhysicsResult = {
      title: "Movimiento Rectilíneo Uniforme (MRU)",
      steps,
      finalResults: [
        { label: "Velocidad", value: formatNum(calculatedVelocity || 0), unit: "m/s", description: "Velocidad constante" },
        { label: "Tiempo", value: formatNum(calculatedTime || 0), unit: "s", description: "Duración del movimiento" },
        { label: "Distancia", value: formatNum(calculatedDistance || 0), unit: "m", description: "Distancia recorrida" }
      ],
      graphs: showGraphs ? graphs : undefined,
      unitConversions: conversions.length > 0 ? conversions : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      assumptions: [
        "Velocidad constante",
        "Movimiento en línea recta",
        "Aceleración nula",
        "Sin fuerzas externas netas"
      ]
    };
    
    setResult(finalResult);
    setUnitWarnings(warnings);
    saveToHistory({ velocity: velocityNum, time: timeNum, distance: distanceNum }, finalResult);
  };
  
  // 5. CÁLCULO DE MRUA (Movimiento Rectilíneo Uniformemente Acelerado)
  const calculateMRUA = () => {
    const v0Num = parseScientificInput(mruaV0);
    const vfNum = parseScientificInput(mruaVf);
    const accelNum = parseScientificInput(mruaAcceleration);
    const timeNum = parseScientificInput(mruaTime);
    const distanceNum = parseScientificInput(mruaDistance);
    
    const steps: CalculationStep[] = [];
    const graphs: GraphData[] = [];
    const conversions: string[] = [];
    const warnings: string[] = [];
    
    // Contar valores proporcionados
    const inputs = [v0Num, vfNum, accelNum, timeNum, distanceNum];
    const inputCount = inputs.filter(v => v !== null).length;
    
    if (inputCount < 3) {
      setResult({
        title: "Error en MRUA",
        steps: [],
        finalResults: [],
        warnings: ["Por favor ingresa al menos tres valores para calcular los demás"]
      });
      return;
    }
    
    // Conversión de unidades
    let v0 = v0Num !== null ? v0Num : 0;
    let vf = vfNum;
    let a = accelNum;
    let t = timeNum;
    let d = distanceNum;
    
    // Auto-conversiones
    if (v0Num !== null) {
      const v0Converted = autoConvertIfNeeded(v0Num, units.velocity, "m/s", "velocity");
      v0 = v0Converted.value;
      if (v0Converted.converted && v0Converted.message) {
        conversions.push(v0Converted.message);
      }
    }
    
    if (vfNum !== null) {
      const vfConverted = autoConvertIfNeeded(vfNum, units.velocity, "m/s", "velocity");
      vf = vfConverted.value;
      if (vfConverted.converted && vfConverted.message) {
        conversions.push(vfConverted.message);
      }
    }
    
    if (accelNum !== null) {
      const aConverted = autoConvertIfNeeded(accelNum, units.acceleration, "m/s²", "acceleration");
      a = aConverted.value;
      if (aConverted.converted && aConverted.message) {
        conversions.push(aConverted.message);
      }
    }
    
    // Calcular valores faltantes
    if (v0 !== null && vf !== null && t !== null) {
      // Calcular aceleración
      a = (vf! - v0) / t!;
      steps.push({
        formula: "a = (v_f - v₀) / t",
        substitution: `a = (${formatNum(vf!)} - ${formatNum(v0)}) / ${formatNum(t!)}`,
        result: `a = ${formatNum(a)} m/s²`,
        explanation: "Aceleración constante calculada"
      });
      
      // Calcular distancia
      d = v0 * t! + 0.5 * a * t! * t!;
      steps.push({
        formula: "d = v₀·t + ½·a·t²",
        substitution: `d = ${formatNum(v0)}·${formatNum(t!)} + ½·${formatNum(a)}·${formatNum(t!)}²`,
        result: `d = ${formatNum(d)} m`,
        explanation: "Distancia recorrida con aceleración constante"
      });
    } else if (v0 !== null && vf !== null && a !== null) {
      // Calcular tiempo
      t = (vf! - v0) / a!;
      steps.push({
        formula: "t = (v_f - v₀) / a",
        substitution: `t = (${formatNum(vf!)} - ${formatNum(v0)}) / ${formatNum(a!)}`,
        result: `t = ${formatNum(t)} s`,
        explanation: "Tiempo para cambiar de velocidad"
      });
      
      // Calcular distancia
      d = (vf! * vf! - v0 * v0) / (2 * a!);
      steps.push({
        formula: "d = (v_f² - v₀²) / (2a)",
        substitution: `d = (${formatNum(vf!)}² - ${formatNum(v0)}²) / (2 × ${formatNum(a!)})`,
        result: `d = ${formatNum(d)} m`,
        explanation: "Distancia calculada con la ecuación de Torricelli"
      });
    }
    
    // Generar datos para gráficos
    const timeData = [];
    const velocityData = [];
    const totalTime = t || 5;
    
    for (let time = 0; time <= totalTime; time += totalTime / 20) {
      const position = v0 * time + 0.5 * (a || 0) * time * time;
      const velocity = v0 + (a || 0) * time;
      
      timeData.push({ x: time, y: position });
      velocityData.push({ x: time, y: velocity });
    }
    
    graphs.push({
      title: "Posición vs Tiempo (MRUA)",
      type: "line",
      data: timeData,
      xLabel: "Tiempo (s)",
      yLabel: "Posición (m)",
      color: "#8b5cf6"
    });
    
    graphs.push({
      title: "Velocidad vs Tiempo (MRUA)",
      type: "line",
      data: velocityData,
      xLabel: "Tiempo (s)",
      yLabel: "Velocidad (m/s)",
      color: "#10b981"
    });

    const finalResult: PhysicsResult = {
      title: "Movimiento Rectilíneo Uniformemente Acelerado (MRUA)",
      steps,
      finalResults: [
        { label: "Velocidad inicial", value: formatNum(v0), unit: "m/s", description: "Velocidad al inicio" },
        { label: "Velocidad final", value: formatNum(vf || 0), unit: "m/s", description: "Velocidad al final" },
        { label: "Aceleración", value: formatNum(a || 0), unit: "m/s²", description: "Aceleración constante" },
        { label: "Tiempo", value: formatNum(t || 0), unit: "s", description: "Duración del movimiento" },
        { label: "Distancia", value: formatNum(d || 0), unit: "m", description: "Distancia recorrida" }
      ],
      graphs: showGraphs ? graphs : undefined,
      unitConversions: conversions.length > 0 ? conversions : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      assumptions: [
        "Aceleración constante",
        "Movimiento en línea recta",
        "Sin resistencia del aire",
        "Fuerza neta constante"
      ]
    };
    
    setResult(finalResult);
    setUnitWarnings(warnings);
    saveToHistory({ v0: v0Num, vf: vfNum, acceleration: accelNum, time: timeNum, distance: distanceNum }, finalResult);
  };
  
  // 6. CÁLCULO DE CAÍDA LIBRE
  const calculateFreeFall = () => {
    const heightNum = parseScientificInput(freefallHeight);
    const timeNum = parseScientificInput(freefallTime);
    const v0Num = parseScientificInput(freefallV0);
    
    const steps: CalculationStep[] = [];
    const graphs: GraphData[] = [];
    const conversions: string[] = [];
    const warnings: string[] = [];
    
    // Validar entrada principal (altura)
    if (heightNum === null) {
      setResult({
        title: "Error en Caída Libre",
        steps: [],
        finalResults: [],
        warnings: ["Por favor ingresa una altura válida"]
      });
      return;
    }
    
    // Conversión de unidades
    const hConverted = autoConvertIfNeeded(heightNum, units.length, "m", "length");
    const heightValue = hConverted.value;
    if (hConverted.converted && hConverted.message) {
      conversions.push(hConverted.message);
      steps.push({
        formula: "Conversión de altura",
        substitution: `h = ${formatNum(heightNum)} ${units.length} → ${formatNum(heightValue)} m`,
        result: `h = ${formatNum(heightValue)} m`,
        explanation: "Conversión a unidades del SI"
      });
    }
    
    let v0Value = 0;
    if (v0Num !== null) {
      const v0Converted = autoConvertIfNeeded(v0Num, units.velocity, "m/s", "velocity");
      v0Value = v0Converted.value;
      if (v0Converted.converted && v0Converted.message) {
        conversions.push(v0Converted.message);
      }
      
      if (v0Value > 0) {
        steps.push({
          formula: "Lanzamiento hacia abajo",
          substitution: `v₀ = ${formatNum(v0Value)} m/s`,
          result: `Velocidad inicial hacia abajo: ${formatNum(v0Value)} m/s`,
          explanation: "El objeto se lanza hacia abajo con velocidad inicial"
        });
      }
    }
    
    // Calcular tiempo de caída
    let timeValue = timeNum;
    if (timeNum === null) {
      // Resolver ecuación cuadrática: h = v0*t + 0.5*g*t²
      // 0.5*g*t² + v0*t - h = 0
      const a = 0.5 * g;
      const b = v0Value;
      const c = -heightValue;
      
      // Discriminante
      const discriminant = b * b - 4 * a * c;
      
      if (discriminant >= 0) {
        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        
        // Tomar la solución positiva
        timeValue = Math.max(t1, t2);
        
        steps.push({
          formula: "h = v₀·t + ½·g·t² → t = [-v₀ ± √(v₀² + 2gh)] / g",
          substitution: `t = [-${formatNum(v0Value)} ± √(${formatNum(v0Value)}² + 2×${formatNum(g)}×${formatNum(heightValue)})] / ${formatNum(g)}`,
          result: `t = ${formatNum(timeValue)} s`,
          explanation: "Tiempo de caída calculado resolviendo la ecuación cuadrática"
        });
      } else {
        warnings.push("No hay solución real para el tiempo de caída con los valores dados");
      }
    } else {
      // El usuario proporcionó el tiempo
      const tConverted = autoConvertIfNeeded(timeNum, units.time, "s", "time");
      timeValue = tConverted.value;
      if (tConverted.converted && tConverted.message) {
        conversions.push(tConverted.message);
      }
    }
    
    // Calcular velocidad final
    let vfValue = 0;
    if (timeValue !== null && timeValue > 0) {
      vfValue = v0Value + g * timeValue;
      steps.push({
        formula: "v_f = v₀ + g·t",
        substitution: `v_f = ${formatNum(v0Value)} + ${formatNum(g)} × ${formatNum(timeValue!)}`,
        result: `v_f = ${formatNum(vfValue)} m/s`,
        explanation: "Velocidad final al tocar el suelo"
      });
    }
    
    // Generar datos para gráficos
    const timeData = [];
    const velocityData = [];
    const totalTime = timeValue || 5;
    
    for (let t = 0; t <= totalTime; t += totalTime / 20) {
      const h = heightValue - (v0Value * t + 0.5 * g * t * t);
      const v = v0Value + g * t;
      
      if (h >= 0) {
        timeData.push({ x: t, y: h });
        velocityData.push({ x: t, y: v });
      }
    }
    
    graphs.push({
      title: "Altura vs Tiempo (Caída Libre)",
      type: "line",
      data: timeData,
      xLabel: "Tiempo (s)",
      yLabel: "Altura (m)",
      color: "#ef4444"
    });
    
    graphs.push({
      title: "Velocidad vs Tiempo (Caída Libre)",
      type: "line",
      data: velocityData,
      xLabel: "Tiempo (s)",
      yLabel: "Velocidad (m/s)",
      color: "#f59e0b"
    });

    const finalResult: PhysicsResult = {
      title: v0Value > 0 ? "Caída Libre con Velocidad Inicial" : "Caída Libre desde Reposo",
      steps,
      finalResults: [
        { label: "Altura inicial", value: formatNum(heightValue), unit: "m", description: "Altura desde la que cae" },
        { label: "Tiempo de caída", value: formatNum(timeValue || 0), unit: "s", description: "Tiempo hasta tocar el suelo" },
        { label: "Velocidad inicial", value: formatNum(v0Value), unit: "m/s", description: "Velocidad al inicio de la caída" },
        { label: "Velocidad final", value: formatNum(vfValue), unit: "m/s", description: "Velocidad al impactar" },
        { label: "Aceleración", value: formatNum(g), unit: "m/s²", description: "Aceleración gravitatoria" }
      ],
      graphs: showGraphs ? graphs : undefined,
      unitConversions: conversions.length > 0 ? conversions : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      assumptions: [
        "Se desprecia la resistencia del aire",
        `Gravedad: ${formatNum(g)} m/s²`,
        "Aceleración constante",
        "Movimiento vertical rectilíneo"
      ]
    };
    
    setResult(finalResult);
    setUnitWarnings(warnings);
    saveToHistory({ height: heightNum, time: timeNum, v0: v0Num, g }, finalResult);
  };
  
  // Función principal de cálculo
  const handleCalculate = () => {
    setLoading(true);
    setUnitWarnings([]);
    
    setTimeout(() => {
      try {
        if (category === "cinematica") {
          switch (calcType) {
            case "vertical": calculateVertical(); break;
            case "horizontal": calculateHorizontal(); break;
            case "inclinado": calculateInclined(); break;
            case "mru": calculateMRU(); break;
            case "mrua": calculateMRUA(); break;
            case "caida_libre": calculateFreeFall(); break;
            default: 
              setResult({
                title: "Cálculo no implementado",
                steps: [],
                finalResults: [],
                warnings: ["Esta funcionalidad está en desarrollo"]
              });
              break;
          }
        } else {
          // Para otras categorías (dinámica, energía, etc.) - mensaje de desarrollo
          setResult({
            title: "Categoría en desarrollo",
            steps: [],
            finalResults: [],
            warnings: ["Esta categoría de cálculos está en desarrollo. Por ahora, enfócate en la cinemática que tiene todos los tipos originales."]
          });
        }
      } catch (error) {
        console.error("Error en cálculo:", error);
        setResult({
          title: "Error en el cálculo",
          steps: [],
          finalResults: [],
          warnings: ["Ha ocurrido un error durante el cálculo. Verifica los valores ingresados."]
        });
      }
      
      setLoading(false);
    }, 300);
  };

  // Limpiar todos los campos
  const handleClear = () => {
    // Campos de cinemática
    setV0("");
    setVx("");
    setHHeight("");
    setIV0("");
    setAngle("");
    setMruVelocity("");
    setMruTime("");
    setMruDistance("");
    setMruaV0("");
    setMruaVf("");
    setMruaAcceleration("");
    setMruaTime("");
    setMruaDistance("");
    setFreefallHeight("");
    setFreefallTime("");
    setFreefallV0("");
    
    // Otros campos
    setMass("");
    setForce("");
    setFrictionCoeff("0.3");
    setKineticMass("");
    setKineticVelocity("");
    setPotentialHeight("");
    setVoltage("");
    setCurrent("");
    setResistance("");
    
    setResult(null);
    setUnitWarnings([]);
  };

  // Renderizar gráficos para móvil y escritorio
  const renderGraph = (graph: GraphData) => {
    if (!graph.data || graph.data.length === 0) return null;
    
    // Ajustar tamaño según dispositivo
    const width = isMobile ? 280 : 400;
    const height = isMobile ? 200 : 250;
    
    // Encontrar máximos y mínimos para escalar
    const xValues = graph.data.map(d => d.x);
    const yValues = graph.data.map(d => d.y);
    
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    
    // Puntos escalados para SVG
    const scaleX = (width - 40) / rangeX;
    const scaleY = (height - 40) / rangeY;
    
    const points = graph.data.map(d => 
      `${20 + ((d.x - minX) * scaleX)},${height - 20 - ((d.y - minY) * scaleY)}`
    ).join(" ");
    
    return (
      <div className={`p-3 ${isMobile ? 'w-full' : ''}`}>
        <h4 className="font-medium mb-2 text-sm truncate">{graph.title}</h4>
        <div className="relative bg-muted/20 rounded-lg p-2 overflow-hidden">
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            {/* Ejes */}
            <line x1="20" y1="20" x2="20" y2={height - 20} stroke="#64748b" strokeWidth="1.5" />
            <line x1="20" y1={height - 20} x2={width - 20} y2={height - 20} stroke="#64748b" strokeWidth="1.5" />
            
            {/* Etiquetas de ejes */}
            <text x="10" y={height/2} fill="#64748b" fontSize={isMobile ? "10" : "12"} textAnchor="middle" transform={`rotate(-90,10,${height/2})`}>
              {graph.yLabel}
            </text>
            <text x={width/2} y={height - 5} fill="#64748b" fontSize={isMobile ? "10" : "12"} textAnchor="middle">
              {graph.xLabel}
            </text>
            
            {/* Línea de gráfico */}
            {graph.type === "line" && (
              <polyline
                points={points}
                fill="none"
                stroke={graph.color || "#3b82f6"}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            
            {graph.type === "scatter" && (
              <>
                <polyline
                  points={points}
                  fill="none"
                  stroke={graph.color || "#3b82f6"}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  strokeLinecap="round"
                />
                {graph.data.map((d, i) => (
                  <circle
                    key={i}
                    cx={20 + ((d.x - minX) * scaleX)}
                    cy={height - 20 - ((d.y - minY) * scaleY)}
                    r="3.5"
                    fill={graph.color || "#3b82f6"}
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                ))}
              </>
            )}
            
            {/* Puntos clave */}
            {graph.data.length > 0 && (
              <>
                {/* Punto inicial */}
                <circle
                  cx={20 + ((graph.data[0].x - minX) * scaleX)}
                  cy={height - 20 - ((graph.data[0].y - minY) * scaleY)}
                  r="4"
                  fill="#10b981"
                  stroke="#fff"
                  strokeWidth="2"
                />
                
                {/* Punto final */}
                {graph.data.length > 1 && (
                  <circle
                    cx={20 + ((graph.data[graph.data.length - 1].x - minX) * scaleX)}
                    cy={height - 20 - ((graph.data[graph.data.length - 1].y - minY) * scaleY)}
                    r="4"
                    fill="#ef4444"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                )}
              </>
            )}
          </svg>
        </div>
      </div>
    );
  };

  // Componente para mostrar advertencias de unidades
  const UnitWarningsDisplay = () => {
    if (unitWarnings.length === 0) return null;
    
    return (
      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 mb-2">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium text-sm">Advertencias de Unidades</span>
        </div>
        <ul className="space-y-1">
          {unitWarnings.map((warning, idx) => (
            <li key={idx} className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
              {warning}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Renderizar campos de entrada según el tipo de cálculo
  const renderInputFields = () => {
    switch (calcType) {
      case "vertical":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="v0" className="text-sm">Velocidad inicial (v₀)</Label>
                <span className="text-xs text-muted-foreground">{units.velocity}</span>
              </div>
              <div className="flex gap-2">
                <Input
                  id="v0"
                  type="number"
                  value={v0}
                  onChange={(e) => setV0(e.target.value)}
                  placeholder="Ej: 20"
                  className="flex-1 rounded-lg"
                  step="any"
                />
                <Select value={units.velocity} onValueChange={(v) => setUnits({...units, velocity: v})}>
                  <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(UNIT_SYSTEM.velocity).map(([key, info]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        {info.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">Velocidad inicial hacia arriba</p>
            </div>
          </div>
        );
      
      case "horizontal":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="vx" className="text-sm">Velocidad horizontal (v₀)</Label>
                <span className="text-xs text-muted-foreground">{units.velocity}</span>
              </div>
              <div className="flex gap-2">
                <Input
                  id="vx"
                  type="number"
                  value={vx}
                  onChange={(e) => setVx(e.target.value)}
                  placeholder="Ej: 15"
                  className="flex-1 rounded-lg"
                  step="any"
                />
                <Select value={units.velocity} onValueChange={(v) => setUnits({...units, velocity: v})}>
                  <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(UNIT_SYSTEM.velocity).map(([key, info]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        {info.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="hHeight" className="text-sm">Altura inicial (h)</Label>
                <span className="text-xs text-muted-foreground">{units.length}</span>
              </div>
              <div className="flex gap-2">
                <Input
                  id="hHeight"
                  type="number"
                  value={hHeight}
                  onChange={(e) => setHHeight(e.target.value)}
                  placeholder="Ej: 45"
                  className="flex-1 rounded-lg"
                  step="any"
                />
                <Select value={units.length} onValueChange={(v) => setUnits({...units, length: v})}>
                  <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(UNIT_SYSTEM.length).map(([key, info]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        {info.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      
      case "inclinado":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="iV0" className="text-sm">Velocidad inicial (v₀)</Label>
                <span className="text-xs text-muted-foreground">{units.velocity}</span>
              </div>
              <div className="flex gap-2">
                <Input
                  id="iV0"
                  type="number"
                  value={iV0}
                  onChange={(e) => setIV0(e.target.value)}
                  placeholder="Ej: 25"
                  className="flex-1 rounded-lg"
                  step="any"
                />
                <Select value={units.velocity} onValueChange={(v) => setUnits({...units, velocity: v})}>
                  <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(UNIT_SYSTEM.velocity).map(([key, info]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        {info.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="angle" className="text-sm">Ángulo de lanzamiento</Label>
                <span className="text-xs text-muted-foreground">{units.angle}</span>
              </div>
              <div className="flex gap-2">
                <Input
                  id="angle"
                  type="number"
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                  placeholder="Ej: 45"
                  className="flex-1 rounded-lg"
                  step="any"
                  min="0"
                  max="90"
                />
                <Select value={units.angle} onValueChange={(v) => setUnits({...units, angle: v})}>
                  <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(UNIT_SYSTEM.angle).map(([key, info]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        {info.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      
      case "mru":
        return (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground mb-2">
              Ingresa dos valores cualesquiera para calcular el tercero
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="mruVelocity" className="text-sm">Velocidad (v)</Label>
                <div className="flex gap-2">
                  <Input
                    id="mruVelocity"
                    type="number"
                    value={mruVelocity}
                    onChange={(e) => setMruVelocity(e.target.value)}
                    placeholder="m/s"
                    className="flex-1 rounded-lg"
                    step="any"
                  />
                  <Select value={units.velocity} onValueChange={(v) => setUnits({...units, velocity: v})}>
                    <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(UNIT_SYSTEM.velocity).map(([key, info]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mruTime" className="text-sm">Tiempo (t)</Label>
                <div className="flex gap-2">
                  <Input
                    id="mruTime"
                    type="number"
                    value={mruTime}
                    onChange={(e) => setMruTime(e.target.value)}
                    placeholder="s"
                    className="flex-1 rounded-lg"
                    step="any"
                  />
                  <Select value={units.time} onValueChange={(v) => setUnits({...units, time: v})}>
                    <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(UNIT_SYSTEM.time).map(([key, info]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mruDistance" className="text-sm">Distancia (d)</Label>
                <div className="flex gap-2">
                  <Input
                    id="mruDistance"
                    type="number"
                    value={mruDistance}
                    onChange={(e) => setMruDistance(e.target.value)}
                    placeholder="m"
                    className="flex-1 rounded-lg"
                    step="any"
                  />
                  <Select value={units.length} onValueChange={(v) => setUnits({...units, length: v})}>
                    <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(UNIT_SYSTEM.length).map(([key, info]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "mrua":
        return (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground mb-2">
              Ingresa al menos tres valores para calcular los demás
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="mruaV0" className="text-sm">Velocidad inicial (v₀)</Label>
                <div className="flex gap-2">
                  <Input
                    id="mruaV0"
                    type="number"
                    value={mruaV0}
                    onChange={(e) => setMruaV0(e.target.value)}
                    placeholder="m/s"
                    className="flex-1 rounded-lg"
                    step="any"
                  />
                  <Select value={units.velocity} onValueChange={(v) => setUnits({...units, velocity: v})}>
                    <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(UNIT_SYSTEM.velocity).map(([key, info]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mruaVf" className="text-sm">Velocidad final (v_f)</Label>
                <div className="flex gap-2">
                  <Input
                    id="mruaVf"
                    type="number"
                    value={mruaVf}
                    onChange={(e) => setMruaVf(e.target.value)}
                    placeholder="m/s"
                    className="flex-1 rounded-lg"
                    step="any"
                  />
                  <Select value={units.velocity} onValueChange={(v) => setUnits({...units, velocity: v})}>
                    <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(UNIT_SYSTEM.velocity).map(([key, info]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mruaAcceleration" className="text-sm">Aceleración (a)</Label>
                <div className="flex gap-2">
                  <Input
                    id="mruaAcceleration"
                    type="number"
                    value={mruaAcceleration}
                    onChange={(e) => setMruaAcceleration(e.target.value)}
                    placeholder="m/s²"
                    className="flex-1 rounded-lg"
                    step="any"
                  />
                  <Select value={units.acceleration} onValueChange={(v) => setUnits({...units, acceleration: v})}>
                    <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(UNIT_SYSTEM.acceleration).map(([key, info]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mruaTime" className="text-sm">Tiempo (t)</Label>
                <div className="flex gap-2">
                  <Input
                    id="mruaTime"
                    type="number"
                    value={mruaTime}
                    onChange={(e) => setMruaTime(e.target.value)}
                    placeholder="s"
                    className="flex-1 rounded-lg"
                    step="any"
                  />
                  <Select value={units.time} onValueChange={(v) => setUnits({...units, time: v})}>
                    <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(UNIT_SYSTEM.time).map(([key, info]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mruaDistance" className="text-sm">Distancia (d)</Label>
                <div className="flex gap-2">
                  <Input
                    id="mruaDistance"
                    type="number"
                    value={mruaDistance}
                    onChange={(e) => setMruaDistance(e.target.value)}
                    placeholder="m"
                    className="flex-1 rounded-lg"
                    step="any"
                  />
                  <Select value={units.length} onValueChange={(v) => setUnits({...units, length: v})}>
                    <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(UNIT_SYSTEM.length).map(([key, info]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "caida_libre":
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="freefallHeight" className="text-sm">Altura (h)</Label>
                <div className="flex gap-2">
                  <Input
                    id="freefallHeight"
                    type="number"
                    value={freefallHeight}
                    onChange={(e) => setFreefallHeight(e.target.value)}
                    placeholder="m"
                    className="flex-1 rounded-lg"
                    step="any"
                  />
                  <Select value={units.length} onValueChange={(v) => setUnits({...units, length: v})}>
                    <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(UNIT_SYSTEM.length).map(([key, info]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="freefallTime" className="text-sm">Tiempo (t) - Opcional</Label>
                <div className="flex gap-2">
                  <Input
                    id="freefallTime"
                    type="number"
                    value={freefallTime}
                    onChange={(e) => setFreefallTime(e.target.value)}
                    placeholder="s"
                    className="flex-1 rounded-lg"
                    step="any"
                  />
                  <Select value={units.time} onValueChange={(v) => setUnits({...units, time: v})}>
                    <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(UNIT_SYSTEM.time).map(([key, info]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">Si no se proporciona, se calculará</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="freefallV0" className="text-sm">Velocidad inicial (v₀) - Opcional</Label>
                <div className="flex gap-2">
                  <Input
                    id="freefallV0"
                    type="number"
                    value={freefallV0}
                    onChange={(e) => setFreefallV0(e.target.value)}
                    placeholder="m/s"
                    className="flex-1 rounded-lg"
                    step="any"
                  />
                  <Select value={units.velocity} onValueChange={(v) => setUnits({...units, velocity: v})}>
                    <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(UNIT_SYSTEM.velocity).map(([key, info]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">Para caída libre con velocidad inicial</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-4 bg-muted/30 rounded-xl">
            <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm">Selecciona un tipo de cálculo para comenzar</p>
          </div>
        );
    }
  };

  return (
    <div ref={containerRef} className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Indicador de dispositivo */}
      <div className="flex items-center justify-end mb-2 md:hidden">
        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
          {deviceType === "mobile" && <Smartphone className="h-3 w-3" />}
          {deviceType === "tablet" && <Tablet className="h-3 w-3" />}
          {deviceType === "desktop" && <Monitor className="h-3 w-3" />}
          <span className="capitalize">{deviceType}</span>
        </div>
      </div>
      
      {/* Tarjeta principal - Diseño completamente responsive */}
      <Card className="p-4 md:p-6 rounded-xl md:rounded-2xl border-l-4 shadow-sm md:shadow-lg" style={{ borderLeftColor: "hsl(var(--fisica))" }}>
        {/* Encabezado responsivo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className={`${isMobile ? 'w-10 h-10' : 'w-14 h-14'} rounded-lg md:rounded-xl flex items-center justify-center bg-gradient-to-br from-[hsl(var(--fisica))]/20 to-[hsl(var(--fisica))]/5`}>
              <Atom className={`${isMobile ? 'h-5 w-5' : 'h-7 w-7'} text-[hsl(var(--fisica))]`} />
            </div>
            <div>
              <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>Calculadora de Física</h1>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                Cinemática: Vertical, Horizontal, Inclinado, MRU, MRUA, Caída Libre
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              className="rounded-lg gap-1 text-xs"
              onClick={handleClear}
            >
              <RefreshCw className="h-3 w-3" />
              {isMobile ? "Limpiar" : "Limpiar todo"}
            </Button>
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              className="rounded-lg gap-1 text-xs"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-3 w-3" />
              {isMobile ? "Hist." : "Historial"}
            </Button>
          </div>
        </div>

        {/* Selector de sistema de unidades - Responsive */}
        <div className="mb-4 md:mb-6">
          <Label className="text-sm font-medium mb-2 block">Sistema de Unidades</Label>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Select value={unitSystem} onValueChange={(v: any) => setUnitSystem(v)}>
                <SelectTrigger className={`w-full ${isMobile ? 'h-9 text-sm' : ''}`}>
                  <SelectValue placeholder="Sistema de unidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SI">Sistema Internacional (SI)</SelectItem>
                  <SelectItem value="Imperial">Sistema Imperial</SelectItem>
                  <SelectItem value="Auto">Conversión Automática</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch 
                  id="auto-convert" 
                  checked={autoConvertUnits}
                  onCheckedChange={setAutoConvertUnits}
                  className="scale-90"
                />
                <Label htmlFor="auto-convert" className="text-xs cursor-pointer">
                  Auto-convertir
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch 
                  id="unit-warnings" 
                  checked={showUnitWarnings}
                  onCheckedChange={setShowUnitWarnings}
                  className="scale-90"
                />
                <Label htmlFor="unit-warnings" className="text-xs cursor-pointer">
                  Advertencias
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Selector de tipo de cálculo - Responsive con los 6 tipos originales */}
        <div className="mb-4 md:mb-6">
          <Label className="text-sm font-medium mb-2 block">Tipo de Cálculo en Cinemática</Label>
          {category === "cinematica" && (
            <Tabs value={calcType} onValueChange={(v) => setCalcType(v as any)}>
              <TabsList className={`w-full ${isMobile ? 'h-10' : 'h-12'} rounded-lg md:rounded-xl mb-3 grid grid-cols-3 md:grid-cols-6 gap-1 p-1`}>
                <TabsTrigger value="vertical" className={`rounded-md md:rounded-lg gap-1 ${isMobile ? 'text-xs' : 'text-sm'} py-1 md:py-2`}>
                  <ArrowUp className="h-3 w-3 md:h-4 md:w-4" />
                  {isMobile ? "Vert." : "Vertical"}
                </TabsTrigger>
                <TabsTrigger value="horizontal" className={`rounded-md md:rounded-lg gap-1 ${isMobile ? 'text-xs' : 'text-sm'} py-1 md:py-2`}>
                  <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                  {isMobile ? "Horiz." : "Horizontal"}
                </TabsTrigger>
                <TabsTrigger value="inclinado" className={`rounded-md md:rounded-lg gap-1 ${isMobile ? 'text-xs' : 'text-sm'} py-1 md:py-2`}>
                  <RotateCw className="h-3 w-3 md:h-4 md:w-4" />
                  {isMobile ? "Inclin." : "Inclinado"}
                </TabsTrigger>
                <TabsTrigger value="mru" className={`rounded-md md:rounded-lg gap-1 ${isMobile ? 'text-xs' : 'text-sm'} py-1 md:py-2`}>
                  <Move className="h-3 w-3 md:h-4 md:w-4" />
                  MRU
                </TabsTrigger>
                <TabsTrigger value="mrua" className={`rounded-md md:rounded-lg gap-1 ${isMobile ? 'text-xs' : 'text-sm'} py-1 md:py-2`}>
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                  MRUA
                </TabsTrigger>
                <TabsTrigger value="caida_libre" className={`rounded-md md:rounded-lg gap-1 ${isMobile ? 'text-xs' : 'text-sm'} py-1 md:py-2`}>
                  <Rocket className="h-3 w-3 md:h-4 md:w-4" />
                  {isMobile ? "Caída" : "Caída Libre"}
                </TabsTrigger>
              </TabsList>
              
              {/* Campos de entrada para cada tipo */}
              <TabsContent value={calcType} className="mt-4">
                {renderInputFields()}
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Configuración avanzada - Responsive y colapsable */}
        <div className="mb-4 md:mb-6">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none p-2 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Configuración Avanzada
              </span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            
            <div className="mt-3 p-3 bg-muted/20 rounded-lg space-y-3">
              {/* Gravedad */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Gravedad (g)</Label>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={useStandardGravity} 
                      onCheckedChange={setUseStandardGravity} 
                      className="scale-75 md:scale-90"
                    />
                    <span className="text-xs">
                      {useStandardGravity ? `Estándar: ${formatNum(9.80665)} m/s²` : "Personalizada"}
                    </span>
                  </div>
                </div>
                {!useStandardGravity && (
                  <Input
                    type="number"
                    value={customGravity}
                    onChange={(e) => setCustomGravity(e.target.value)}
                    placeholder="Ej: 9.8"
                    className="h-8 text-xs"
                    step="0.1"
                  />
                )}
              </div>
              
              {/* Decimales */}
              <div className="space-y-2">
                <Label className="text-xs">Precisión: {decimalPlaces} decimal{decimalPlaces !== 1 ? 'es' : ''}</Label>
                <Slider
                  value={[decimalPlaces]}
                  onValueChange={(vals) => setDecimalPlaces(vals[0])}
                  min={0}
                  max={8}
                  step={1}
                  className="h-2"
                />
              </div>
              
              {/* Opciones de visualización */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Mostrar pasos</Label>
                  <Switch checked={showSteps} onCheckedChange={setShowSteps} className="scale-75 md:scale-90" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Mostrar gráficos</Label>
                  <Switch checked={showGraphs} onCheckedChange={setShowGraphs} className="scale-75 md:scale-90" />
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* Botones de acción - Responsive */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleCalculate} 
            className={`flex-1 rounded-lg ${isMobile ? 'h-10' : 'h-12'} gap-2 ${isMobile ? 'text-sm' : 'text-base'}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4" />
                Calcular
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Advertencias de unidades */}
      <UnitWarningsDisplay />

      {/* Resultados - Responsive */}
      {result && (
        <div className="space-y-4 md:space-y-6 animate-fade-in">
          {/* Resultados finales */}
          <Card className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-[hsl(var(--fisica))]/10 to-transparent border-l-4" style={{ borderLeftColor: "hsl(var(--fisica))" }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 mb-3 md:mb-4">
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>{result.title} - Resultados</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" /> g = {formatNum(g)} m/s²
                </span>
              </div>
            </div>
            
            {/* Conversiones de unidades */}
            {result.unitConversions && result.unitConversions.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium text-sm">Conversiones aplicadas</span>
                </div>
                <ul className="space-y-1">
                  {result.unitConversions.map((conversion, idx) => (
                    <li key={idx} className="text-xs text-blue-600 dark:text-blue-400">
                      • {conversion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4'}`}>
              {result.finalResults.map((r, idx) => (
                <div key={idx} className={`p-3 ${isMobile ? 'p-2' : 'p-4'} bg-background rounded-lg md:rounded-xl border text-center`}>
                  <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-[hsl(var(--fisica))]`}>{r.value}</div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}>{r.unit}</div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium mt-2`}>{r.label}</div>
                  {r.description && !isMobile && (
                    <div className="text-xs text-muted-foreground mt-1">{r.description}</div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Suposiciones y advertencias */}
            {(result.assumptions || result.warnings) && (
              <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t">
                {result.assumptions && result.assumptions.length > 0 && (
                  <>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <BookOpen className="h-3 w-3" /> Suposiciones del modelo
                    </h4>
                    <div className={`flex flex-wrap ${isMobile ? 'gap-1' : 'gap-2'}`}>
                      {result.assumptions?.map((assumption, idx) => (
                        <span key={idx} className={`${isMobile ? 'text-xs px-2 py-1' : 'text-xs px-3 py-1'} bg-muted rounded-full`}>
                          {assumption}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                
                {result.warnings && result.warnings.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2 text-amber-600 dark:text-amber-400">Advertencias</h4>
                    <ul className={`${isMobile ? 'space-y-0.5' : 'space-y-1'}`}>
                      {result.warnings.map((warning, idx) => (
                        <li key={idx} className={`${isMobile ? 'text-xs' : 'text-sm'} text-amber-600 dark:text-amber-400`}>
                          • {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Gráficos - Responsive */}
          {showGraphs && result.graphs && result.graphs.length > 0 && (
            <Card className="p-4 md:p-6 rounded-xl md:rounded-2xl">
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-3 md:mb-4 flex items-center gap-2`}>
                <LineChart className="h-4 w-4" /> Visualización Gráfica
              </h3>
              <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
                {result.graphs.map((graph, idx) => (
                  <div key={idx}>
                    {renderGraph(graph)}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Procedimiento paso a paso - Responsive */}
          {showSteps && (
            <Card className="p-4 md:p-6 rounded-xl md:rounded-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3 md:mb-4">
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold flex items-center gap-2`}>
                  <Braces className="h-4 w-4" /> Procedimiento Paso a Paso
                </h3>
                <span className="text-xs text-muted-foreground">{result.steps.length} pasos</span>
              </div>
              
              <div className="space-y-3 md:space-y-4">
                {result.steps.map((step, idx) => (
                  <div key={idx} className="p-3 md:p-4 bg-muted/30 rounded-lg md:rounded-xl space-y-2 md:space-y-3 border-l-4 border-[hsl(var(--fisica))]">
                    <div className="flex items-start gap-2 md:gap-3">
                      <span className={`${isMobile ? 'w-6 h-6 text-xs' : 'w-7 h-7 text-sm'} rounded-full bg-[hsl(var(--fisica))] text-white flex items-center justify-center font-bold shrink-0`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mb-2`}>{step.explanation}</div>
                        <div className={`font-mono ${isMobile ? 'text-xs p-2' : 'text-sm p-3'} bg-background rounded-lg border`}>
                          <div className="text-muted-foreground text-xs mb-1">Fórmula:</div>
                          <div className={`mb-2 ${isMobile ? 'text-xs' : ''}`}>{step.formula}</div>
                          <div className="text-muted-foreground text-xs mb-1">Sustitución:</div>
                          <div className={`mb-2 ${isMobile ? 'text-xs' : ''}`}>{step.substitution}</div>
                          <div className="text-muted-foreground text-xs mb-1">Resultado:</div>
                          <div className={`text-primary font-bold ${isMobile ? 'text-sm' : ''}`}>{step.result}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Historial de cálculos - Modal responsivo */}
      {showHistory && history.length > 0 && (
        <AlertDialog open={showHistory} onOpenChange={setShowHistory}>
          <AlertDialogContent className={`${isMobile ? 'w-[90vw] max-w-[90vw]' : ''}`}>
            <AlertDialogHeader>
              <AlertDialogTitle>Historial de Cálculos</AlertDialogTitle>
              <AlertDialogDescription>
                {history.length} cálculos recientes
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="max-h-[60vh] overflow-y-auto space-y-2">
              {history.map((item) => (
                <div key={item.id} className="p-3 bg-muted/30 rounded-lg text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium truncate">{item.results.title}</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setResult(item.results);
                        setShowHistory(false);
                      }}
                      className="h-6 text-xs"
                    >
                      Cargar
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.timestamp.toLocaleString()}
                  </div>
                  <div className="text-xs mt-1 truncate">
                    {Object.entries(item.inputs).map(([key, value]) => (
                      <span key={key} className="mr-2">
                        {key}: {typeof value === 'number' ? formatNum(value) : value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowHistory(false)}>
                Cerrar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}