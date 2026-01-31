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
  Atom, Calculator, ArrowUp, ArrowRight, RotateCw, Zap, 
  Thermometer, Scale, Waves, Gauge, Target, Globe, 
  Battery, Lightbulb, Sparkles, Braces, LineChart,
  Download, Share2, Info, History, BookOpen,
  Play, Pause, RefreshCw, Maximize2, Minimize2
} from "lucide-react";

// Tipos de datos
interface CalculationStep {
  formula: string;
  substitution: string;
  result: string;
  explanation: string;
}

interface PhysicsResult {
  title: string;
  steps: CalculationStep[];
  finalResults: { label: string; value: string; unit: string; description?: string }[];
  graphs?: GraphData[];
  warnings?: string[];
  assumptions?: string[];
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

// Constantes físicas
const PHYSICAL_CONSTANTS = {
  g: 9.80665, // gravedad estándar (m/s²)
  G: 6.67430e-11, // constante gravitacional (m³/kg·s²)
  c: 299792458, // velocidad de la luz (m/s)
  h: 6.62607015e-34, // constante de Planck (J·s)
  k: 1.380649e-23, // constante de Boltzmann (J/K)
  e: 1.602176634e-19, // carga del electrón (C)
  ε0: 8.854187817e-12, // permitividad del vacío (F/m)
  μ0: 1.25663706212e-6, // permeabilidad del vacío (N/A²)
  R: 8.314462618, // constante de los gases (J/mol·K)
  σ: 5.670374419e-8, // constante de Stefan-Boltzmann (W/m²·K⁴)
  NA: 6.02214076e23, // número de Avogadro (mol⁻¹)
};

// Opciones de unidades
const UNIT_OPTIONS = {
  length: ["m", "km", "cm", "mm", "ft", "in"],
  time: ["s", "min", "h", "ms", "μs"],
  mass: ["kg", "g", "mg", "lb", "oz"],
  velocity: ["m/s", "km/h", "mph", "ft/s"],
  angle: ["°", "rad", "grad"],
  force: ["N", "kN", "lbf", "dyn"],
  energy: ["J", "kJ", "cal", "kWh", "eV"],
  power: ["W", "kW", "hp", "BTU/h"],
  pressure: ["Pa", "kPa", "bar", "atm", "psi", "mmHg"],
  temperature: ["K", "°C", "°F"],
  charge: ["C", "μC", "mC", "e"],
  voltage: ["V", "kV", "mV"],
  resistance: ["Ω", "kΩ", "MΩ"],
  capacitance: ["F", "μF", "pF", "nF"],
  frequency: ["Hz", "kHz", "MHz", "GHz"],
};

export function PhysicsCalculator() {
  // Estados principales
  const [category, setCategory] = useState<"cinematica" | "dinamica" | "energia" | "electricidad" | "termodinamica" | "opticas">("cinematica");
  const [calcType, setCalcType] = useState<"vertical" | "horizontal" | "inclinado" | "mru" | "mrua" | "caida_libre">("vertical");
  const [units, setUnits] = useState({
    length: "m",
    time: "s",
    velocity: "m/s",
    angle: "°",
    mass: "kg",
    force: "N",
    energy: "J",
    temperature: "°C"
  });
  const [showSteps, setShowSteps] = useState(true);
  const [showGraphs, setShowGraphs] = useState(true);
  const [useStandardGravity, setUseStandardGravity] = useState(true);
  const [customGravity, setCustomGravity] = useState("9.80665");
  const [decimalPlaces, setDecimalPlaces] = useState(3);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Historial de cálculos
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Estados para cada tipo de cálculo
  // Cinemática
  const [v0, setV0] = useState("20");
  const [height, setHeight] = useState("");
  const [time, setTime] = useState("");
  const [vx, setVx] = useState("15");
  const [hHeight, setHHeight] = useState("45");
  const [iV0, setIV0] = useState("25");
  const [angle, setAngle] = useState("45");
  const [acceleration, setAcceleration] = useState("");
  const [distance, setDistance] = useState("");
  const [finalVelocity, setFinalVelocity] = useState("");
  const [initialVelocity, setInitialVelocity] = useState("");
  
  // Dinámica
  const [mass, setMass] = useState("5");
  const [force, setForce] = useState("");
  const [frictionCoeff, setFrictionCoeff] = useState("0.3");
  const [normalForce, setNormalForce] = useState("");
  
  // Energía
  const [kineticMass, setKineticMass] = useState("2");
  const [kineticVelocity, setKineticVelocity] = useState("10");
  const [potentialMass, setPotentialMass] = useState("2");
  const [potentialHeight, setPotentialHeight] = useState("5");
  const [springConstant, setSpringConstant] = useState("100");
  const [springDisplacement, setSpringDisplacement] = useState("0.1");
  
  // Electricidad
  const [voltage, setVoltage] = useState("12");
  const [current, setCurrent] = useState("2");
  const [resistance, setResistance] = useState("6");
  const [capacitance, setCapacitance] = useState("1000");
  const [charge, setCharge] = useState("");
  
  // Resultados
  const [result, setResult] = useState<PhysicsResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Referencias para gráficos
  const graphRef = useRef<HTMLDivElement>(null);
  
  // Gravedad actual
  const g = useStandardGravity ? PHYSICAL_CONSTANTS.g : parseFloat(customGravity) || PHYSICAL_CONSTANTS.g;
  
  // Conversión de unidades
  const convertValue = (value: number, fromUnit: string, toUnit: string, type: keyof typeof UNIT_OPTIONS) => {
    const conversions: Record<string, Record<string, number>> = {
      length: {
        m: 1,
        km: 1000,
        cm: 0.01,
        mm: 0.001,
        ft: 0.3048,
        in: 0.0254
      },
      time: {
        s: 1,
        min: 60,
        h: 3600,
        ms: 0.001,
        μs: 1e-6
      },
      velocity: {
        "m/s": 1,
        "km/h": 0.277778,
        mph: 0.44704,
        "ft/s": 0.3048
      },
      angle: {
        "°": 1,
        rad: 57.2958,
        grad: 0.9
      }
    };
    
    if (conversions[type] && conversions[type][fromUnit] && conversions[type][toUnit]) {
      return value * conversions[type][fromUnit] / conversions[type][toUnit];
    }
    return value;
  };
  
  // Formatear número con decimales configurados
  const formatNumber = (num: number): string => {
    return num.toFixed(decimalPlaces);
  };
  
  // Guardar en historial
  const saveToHistory = (inputs: Record<string, any>, results: PhysicsResult) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: `${category} - ${calcType}`,
      inputs,
      results
    };
    
    setHistory(prev => [newItem, ...prev.slice(0, 9)]); // Mantener solo los últimos 10
  };
  
  // Cálculos de cinemática
  const calculateVertical = () => {
    const v0Num = parseFloat(v0) || 0;
    const steps: CalculationStep[] = [];
    const graphs: GraphData[] = [];
    
    // Conversión de unidades si es necesario
    const v0Converted = convertValue(v0Num, units.velocity, "m/s", "velocity");
    
    // Altura máxima
    const hMax = (v0Converted * v0Converted) / (2 * g);
    steps.push({
      formula: "h_max = v₀² / (2g)",
      substitution: `h_max = (${formatNumber(v0Converted)})² / (2 × ${formatNumber(g)})`,
      result: `h_max = ${formatNumber(hMax)} m`,
      explanation: "La altura máxima se alcanza cuando la velocidad vertical es cero"
    });

    // Tiempo de subida
    const tSubida = v0Converted / g;
    steps.push({
      formula: "t_subida = v₀ / g",
      substitution: `t_subida = ${formatNumber(v0Converted)} / ${formatNumber(g)}`,
      result: `t_subida = ${formatNumber(tSubida)} s`,
      explanation: "Tiempo que tarda en alcanzar la altura máxima"
    });

    // Tiempo total (ida y vuelta)
    const tTotal = 2 * tSubida;
    steps.push({
      formula: "t_total = 2 × t_subida",
      substitution: `t_total = 2 × ${formatNumber(tSubida)}`,
      result: `t_total = ${formatNumber(tTotal)} s`,
      explanation: "Tiempo total de vuelo (subida + bajada)"
    });

    // Velocidad final al caer
    const vFinal = v0Converted; // misma magnitud
    steps.push({
      formula: "v_final = v₀ (misma magnitud)",
      substitution: `v_final = ${formatNumber(v0Converted)}`,
      result: `v_final = ${formatNumber(vFinal)} m/s (hacia abajo)`,
      explanation: "La velocidad final tiene la misma magnitud que la inicial (conservación de energía)"
    });
    
    // Generar datos para gráfico de posición vs tiempo
    const timeData = [];
    const positionData = [];
    const velocityData = [];
    
    for (let t = 0; t <= tTotal * 1.1; t += tTotal / 20) {
      const y = v0Converted * t - 0.5 * g * t * t;
      const v = v0Converted - g * t;
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
        { label: "Altura máxima", value: formatNumber(hMax), unit: "m", description: "Máxima altura alcanzada" },
        { label: "Tiempo de subida", value: formatNumber(tSubida), unit: "s", description: "Tiempo hasta altura máxima" },
        { label: "Tiempo total", value: formatNumber(tTotal), unit: "s", description: "Tiempo total de vuelo" },
        { label: "Velocidad final", value: formatNumber(vFinal), unit: "m/s", description: "Velocidad al regresar al punto inicial" }
      ],
      graphs: showGraphs ? graphs : undefined,
      assumptions: [
        "Se desprecia la resistencia del aire",
        `Gravedad: ${formatNumber(g)} m/s²`,
        "Movimiento en línea recta vertical"
      ]
    };
    
    setResult(finalResult);
    saveToHistory({ v0: v0Num, g }, finalResult);
  };

  const calculateHorizontal = () => {
    const vxNum = parseFloat(vx) || 0;
    const hNum = parseFloat(hHeight) || 0;
    const steps: CalculationStep[] = [];
    const graphs: GraphData[] = [];
    
    // Conversión de unidades
    const vxConverted = convertValue(vxNum, units.velocity, "m/s", "velocity");
    const hConverted = convertValue(hNum, units.length, "m", "length");

    // Tiempo de caída
    const tCaida = Math.sqrt((2 * hConverted) / g);
    steps.push({
      formula: "t = √(2h / g)",
      substitution: `t = √(2 × ${formatNumber(hConverted)} / ${formatNumber(g)})`,
      result: `t = ${formatNumber(tCaida)} s`,
      explanation: "Tiempo que tarda en caer desde la altura h"
    });

    // Alcance horizontal
    const alcance = vxConverted * tCaida;
    steps.push({
      formula: "x = v₀ × t",
      substitution: `x = ${formatNumber(vxConverted)} × ${formatNumber(tCaida)}`,
      result: `x = ${formatNumber(alcance)} m`,
      explanation: "Distancia horizontal recorrida durante la caída"
    });

    // Velocidad vertical al caer
    const vy = g * tCaida;
    steps.push({
      formula: "v_y = g × t",
      substitution: `v_y = ${formatNumber(g)} × ${formatNumber(tCaida)}`,
      result: `v_y = ${formatNumber(vy)} m/s`,
      explanation: "Componente vertical de la velocidad al impactar"
    });

    // Velocidad resultante
    const vResultante = Math.sqrt(vxConverted * vxConverted + vy * vy);
    steps.push({
      formula: "v = √(v_x² + v_y²)",
      substitution: `v = √(${formatNumber(vxConverted)}² + ${formatNumber(vy)}²)`,
      result: `v = ${formatNumber(vResultante)} m/s`,
      explanation: "Velocidad total (magnitud) al momento del impacto"
    });
    
    // Ángulo de impacto
    const impactAngle = Math.atan(vy / vxConverted) * 180 / Math.PI;
    steps.push({
      formula: "θ = arctan(v_y / v_x)",
      substitution: `θ = arctan(${formatNumber(vy)} / ${formatNumber(vxConverted)})`,
      result: `θ = ${formatNumber(impactAngle)}°`,
      explanation: "Ángulo con respecto a la horizontal al impactar"
    });
    
    // Generar datos para gráfico de trayectoria
    const trajectoryData = [];
    for (let t = 0; t <= tCaida * 1.1; t += tCaida / 20) {
      const x = vxConverted * t;
      const y = hConverted - 0.5 * g * t * t;
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
        { label: "Tiempo de caída", value: formatNumber(tCaida), unit: "s", description: "Duración del movimiento" },
        { label: "Alcance horizontal", value: formatNumber(alcance), unit: "m", description: "Distancia horizontal recorrida" },
        { label: "Velocidad vertical", value: formatNumber(vy), unit: "m/s", description: "Componente vertical final" },
        { label: "Velocidad final", value: formatNumber(vResultante), unit: "m/s", description: "Magnitud de la velocidad final" },
        { label: "Ángulo de impacto", value: formatNumber(impactAngle), unit: "°", description: "Ángulo respecto a la horizontal" }
      ],
      graphs: showGraphs ? graphs : undefined,
      assumptions: [
        "Se desprecia la resistencia del aire",
        `Gravedad: ${formatNumber(g)} m/s²`,
        "Velocidad horizontal constante",
        "Superficie plana"
      ]
    };
    
    setResult(finalResult);
    saveToHistory({ vx: vxNum, h: hNum, g }, finalResult);
  };

  const calculateInclined = () => {
    const v0Num = parseFloat(iV0) || 0;
    const angleNum = parseFloat(angle) || 45;
    const steps: CalculationStep[] = [];
    const graphs: GraphData[] = [];
    
    // Conversión de unidades
    const v0Converted = convertValue(v0Num, units.velocity, "m/s", "velocity");
    const angleConverted = convertValue(angleNum, units.angle, "°", "angle");
    const angleRad = (angleConverted * Math.PI) / 180;

    // Componentes de velocidad
    const v0x = v0Converted * Math.cos(angleRad);
    const v0y = v0Converted * Math.sin(angleRad);
    steps.push({
      formula: "v₀x = v₀ × cos(θ) ; v₀y = v₀ × sin(θ)",
      substitution: `v₀x = ${formatNumber(v0Converted)} × cos(${formatNumber(angleConverted)}°) ; v₀y = ${formatNumber(v0Converted)} × sin(${formatNumber(angleConverted)}°)`,
      result: `v₀x = ${formatNumber(v0x)} m/s ; v₀y = ${formatNumber(v0y)} m/s`,
      explanation: "Descomposición de la velocidad inicial en componentes horizontal y vertical"
    });

    // Altura máxima
    const hMax = (v0y * v0y) / (2 * g);
    steps.push({
      formula: "h_max = v₀y² / (2g)",
      substitution: `h_max = (${formatNumber(v0y)})² / (2 × ${formatNumber(g)})`,
      result: `h_max = ${formatNumber(hMax)} m`,
      explanation: "Altura máxima alcanzada por el proyectil"
    });

    // Tiempo total de vuelo
    const tTotal = (2 * v0y) / g;
    steps.push({
      formula: "t_total = (2 × v₀y) / g",
      substitution: `t_total = (2 × ${formatNumber(v0y)}) / ${formatNumber(g)}`,
      result: `t_total = ${formatNumber(tTotal)} s`,
      explanation: "Tiempo total de vuelo (subida + bajada)"
    });

    // Alcance máximo
    const alcance = v0x * tTotal;
    steps.push({
      formula: "R = v₀x × t_total",
      substitution: `R = ${formatNumber(v0x)} × ${formatNumber(tTotal)}`,
      result: `R = ${formatNumber(alcance)} m`,
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
    
    // Datos para componentes de velocidad vs tiempo
    const vxData = [];
    const vyData = [];
    for (let t = 0; t <= tTotal; t += tTotal / 20) {
      vxData.push({ x: t, y: v0x });
      vyData.push({ x: t, y: v0y - g * t });
    }
    
    graphs.push({
      title: "Componentes de Velocidad vs Tiempo",
      type: "line",
      data: [...vxData.map(d => ({ ...d, color: "#3b82f6" })), ...vyData.map(d => ({ ...d, color: "#ef4444" }))],
      xLabel: "Tiempo (s)",
      yLabel: "Velocidad (m/s)",
      color: "multi"
    });

    const finalResult: PhysicsResult = {
      title: "Lanzamiento Inclinado",
      steps,
      finalResults: [
        { label: "Velocidad horizontal", value: formatNumber(v0x), unit: "m/s", description: "Componente horizontal constante" },
        { label: "Velocidad vertical inicial", value: formatNumber(v0y), unit: "m/s", description: "Componente vertical inicial" },
        { label: "Altura máxima", value: formatNumber(hMax), unit: "m", description: "Punto más alto de la trayectoria" },
        { label: "Tiempo de vuelo", value: formatNumber(tTotal), unit: "s", description: "Duración total del movimiento" },
        { label: "Alcance máximo", value: formatNumber(alcance), unit: "m", description: "Distancia horizontal total" }
      ],
      graphs: showGraphs ? graphs : undefined,
      assumptions: [
        "Se desprecia la resistencia del aire",
        `Gravedad: ${formatNumber(g)} m/s²`,
        "Ángulo de lanzamiento: " + angleConverted + "°",
        "Superficie plana y nivelada"
      ]
    };
    
    setResult(finalResult);
    saveToHistory({ v0: v0Num, angle: angleNum, g }, finalResult);
  };
  
  // Cálculo de MRU (Movimiento Rectilíneo Uniforme)
  const calculateMRU = () => {
    const vel = parseFloat(v0) || 0;
    const timeVal = parseFloat(time) || 0;
    const dist = parseFloat(distance) || 0;
    
    const steps: CalculationStep[] = [];
    let calculatedDistance = 0;
    let calculatedTime = 0;
    let calculatedVelocity = 0;
    
    if (vel && timeVal) {
      calculatedDistance = vel * timeVal;
      steps.push({
        formula: "d = v × t",
        substitution: `d = ${formatNumber(vel)} × ${formatNumber(timeVal)}`,
        result: `d = ${formatNumber(calculatedDistance)} m`,
        explanation: "Distancia recorrida con velocidad constante"
      });
    } else if (dist && timeVal) {
      calculatedVelocity = dist / timeVal;
      steps.push({
        formula: "v = d / t",
        substitution: `v = ${formatNumber(dist)} / ${formatNumber(timeVal)}`,
        result: `v = ${formatNumber(calculatedVelocity)} m/s`,
        explanation: "Velocidad constante calculada"
      });
    } else if (dist && vel) {
      calculatedTime = dist / vel;
      steps.push({
        formula: "t = d / v",
        substitution: `t = ${formatNumber(dist)} / ${formatNumber(vel)}`,
        result: `t = ${formatNumber(calculatedTime)} s`,
        explanation: "Tiempo requerido para recorrer la distancia"
      });
    }
    
    const finalResult: PhysicsResult = {
      title: "Movimiento Rectilíneo Uniforme (MRU)",
      steps,
      finalResults: [
        { label: "Velocidad", value: formatNumber(vel || calculatedVelocity), unit: "m/s", description: "Velocidad constante" },
        { label: "Tiempo", value: formatNumber(timeVal || calculatedTime), unit: "s", description: "Duración del movimiento" },
        { label: "Distancia", value: formatNumber(dist || calculatedDistance), unit: "m", description: "Distancia recorrida" }
      ],
      assumptions: ["Velocidad constante", "Movimiento en línea recta", "Aceleración nula"]
    };
    
    setResult(finalResult);
    saveToHistory({ velocity: vel, time: timeVal, distance: dist }, finalResult);
  };
  
  // Cálculo de MRUA (Movimiento Rectilíneo Uniformemente Acelerado)
  const calculateMRUA = () => {
    const v0Val = parseFloat(initialVelocity) || 0;
    const vfVal = parseFloat(finalVelocity) || 0;
    const accel = parseFloat(acceleration) || 0;
    const timeVal = parseFloat(time) || 0;
    const dist = parseFloat(distance) || 0;
    
    const steps: CalculationStep[] = [];
    const graphs: GraphData[] = [];
    
    // Determinar qué calcular basado en los valores proporcionados
    let calculatedAcceleration = 0;
    let calculatedTime = 0;
    let calculatedDistance = 0;
    let calculatedFinalVelocity = 0;
    
    if (v0Val && vfVal && timeVal) {
      calculatedAcceleration = (vfVal - v0Val) / timeVal;
      calculatedDistance = v0Val * timeVal + 0.5 * calculatedAcceleration * timeVal * timeVal;
      
      steps.push({
        formula: "a = (v_f - v₀) / t",
        substitution: `a = (${formatNumber(vfVal)} - ${formatNumber(v0Val)}) / ${formatNumber(timeVal)}`,
        result: `a = ${formatNumber(calculatedAcceleration)} m/s²`,
        explanation: "Aceleración constante"
      });
    }
    
    if (calculatedAcceleration && timeVal) {
      steps.push({
        formula: "d = v₀·t + ½·a·t²",
        substitution: `d = ${formatNumber(v0Val)}·${formatNumber(timeVal)} + ½·${formatNumber(calculatedAcceleration)}·${formatNumber(timeVal)}²`,
        result: `d = ${formatNumber(calculatedDistance)} m`,
        explanation: "Distancia recorrida con aceleración constante"
      });
    }
    
    // Generar datos para gráficos
    const timeData = [];
    const velocityData = [];
    const accelerationData = [];
    
    const totalTime = timeVal || 5;
    for (let t = 0; t <= totalTime; t += totalTime / 20) {
      const v = v0Val + (calculatedAcceleration || accel) * t;
      const d = v0Val * t + 0.5 * (calculatedAcceleration || accel) * t * t;
      
      timeData.push({ x: t, y: d });
      velocityData.push({ x: t, y: v });
      accelerationData.push({ x: t, y: calculatedAcceleration || accel });
    }
    
    graphs.push({
      title: "Posición vs Tiempo",
      type: "line",
      data: timeData,
      xLabel: "Tiempo (s)",
      yLabel: "Posición (m)",
      color: "#3b82f6"
    });
    
    graphs.push({
      title: "Velocidad vs Tiempo",
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
        { label: "Velocidad inicial", value: formatNumber(v0Val), unit: "m/s", description: "Velocidad al inicio" },
        { label: "Velocidad final", value: formatNumber(vfVal || calculatedFinalVelocity), unit: "m/s", description: "Velocidad al final" },
        { label: "Aceleración", value: formatNumber(accel || calculatedAcceleration), unit: "m/s²", description: "Aceleración constante" },
        { label: "Tiempo", value: formatNumber(timeVal || calculatedTime), unit: "s", description: "Duración del movimiento" },
        { label: "Distancia", value: formatNumber(dist || calculatedDistance), unit: "m", description: "Distancia recorrida" }
      ],
      graphs: showGraphs ? graphs : undefined,
      assumptions: ["Aceleración constante", "Movimiento en línea recta"]
    };
    
    setResult(finalResult);
    saveToHistory({ v0: v0Val, vf: vfVal, acceleration: accel, time: timeVal, distance: dist }, finalResult);
  };
  
  // Cálculo de caída libre
  const calculateFreeFall = () => {
    const heightVal = parseFloat(height) || 0;
    const timeVal = parseFloat(time) || 0;
    const v0Val = parseFloat(v0) || 0;
    
    const steps: CalculationStep[] = [];
    const graphs: GraphData[] = [];
    
    let calculatedTime = 0;
    let calculatedHeight = 0;
    let finalVelocity = 0;
    
    if (heightVal && !v0Val) {
      // Caída desde reposo
      calculatedTime = Math.sqrt(2 * heightVal / g);
      finalVelocity = g * calculatedTime;
      
      steps.push({
        formula: "t = √(2h / g)",
        substitution: `t = √(2 × ${formatNumber(heightVal)} / ${formatNumber(g)})`,
        result: `t = ${formatNumber(calculatedTime)} s`,
        explanation: "Tiempo de caída desde la altura h"
      });
      
      steps.push({
        formula: "v_f = g × t",
        substitution: `v_f = ${formatNumber(g)} × ${formatNumber(calculatedTime)}`,
        result: `v_f = ${formatNumber(finalVelocity)} m/s`,
        explanation: "Velocidad final al tocar el suelo"
      });
    }
    
    // Generar datos para gráficos
    const timeData = [];
    const velocityData = [];
    
    const totalTime = timeVal || calculatedTime || 5;
    for (let t = 0; t <= totalTime; t += totalTime / 20) {
      const h = heightVal - 0.5 * g * t * t;
      const v = g * t;
      
      if (h >= 0) {
        timeData.push({ x: t, y: h });
        velocityData.push({ x: t, y: v });
      }
    }
    
    graphs.push({
      title: "Altura vs Tiempo",
      type: "line",
      data: timeData,
      xLabel: "Tiempo (s)",
      yLabel: "Altura (m)",
      color: "#8b5cf6"
    });

    const finalResult: PhysicsResult = {
      title: "Caída Libre",
      steps,
      finalResults: [
        { label: "Altura inicial", value: formatNumber(heightVal), unit: "m", description: "Altura desde la que cae" },
        { label: "Tiempo de caída", value: formatNumber(timeVal || calculatedTime), unit: "s", description: "Tiempo hasta tocar el suelo" },
        { label: "Velocidad final", value: formatNumber(finalVelocity), unit: "m/s", description: "Velocidad al impactar" },
        { label: "Aceleración", value: formatNumber(g), unit: "m/s²", description: "Aceleración gravitatoria" }
      ],
      graphs: showGraphs ? graphs : undefined,
      assumptions: [
        "Se desprecia la resistencia del aire",
        `Gravedad: ${formatNumber(g)} m/s²`,
        v0Val ? "Con velocidad inicial" : "Desde reposo"
      ]
    };
    
    setResult(finalResult);
    saveToHistory({ height: heightVal, time: timeVal, v0: v0Val, g }, finalResult);
  };
  
  // Cálculos de dinámica
  const calculateForce = () => {
    const massVal = parseFloat(mass) || 0;
    const forceVal = parseFloat(force) || 0;
    const accelVal = parseFloat(acceleration) || 0;
    
    const steps: CalculationStep[] = [];
    
    let calculatedForce = 0;
    let calculatedMass = 0;
    let calculatedAcceleration = 0;
    
    if (massVal && accelVal) {
      calculatedForce = massVal * accelVal;
      steps.push({
        formula: "F = m × a",
        substitution: `F = ${formatNumber(massVal)} × ${formatNumber(accelVal)}`,
        result: `F = ${formatNumber(calculatedForce)} N`,
        explanation: "Segunda ley de Newton: fuerza es masa por aceleración"
      });
    } else if (forceVal && massVal) {
      calculatedAcceleration = forceVal / massVal;
      steps.push({
        formula: "a = F / m",
        substitution: `a = ${formatNumber(forceVal)} / ${formatNumber(massVal)}`,
        result: `a = ${formatNumber(calculatedAcceleration)} m/s²`,
        explanation: "Aceleración producida por la fuerza sobre la masa"
      });
    } else if (forceVal && accelVal) {
      calculatedMass = forceVal / accelVal;
      steps.push({
        formula: "m = F / a",
        substitution: `m = ${formatNumber(forceVal)} / ${formatNumber(accelVal)}`,
        result: `m = ${formatNumber(calculatedMass)} kg`,
        explanation: "Masa calculada a partir de fuerza y aceleración"
      });
    }
    
    // Fricción
    const frictionForce = massVal * g * parseFloat(frictionCoeff);
    if (frictionCoeff && massVal) {
      steps.push({
        formula: "F_fricción = μ × m × g",
        substitution: `F_fricción = ${frictionCoeff} × ${formatNumber(massVal)} × ${formatNumber(g)}`,
        result: `F_fricción = ${formatNumber(frictionForce)} N`,
        explanation: "Fuerza de fricción cinética (μ = coeficiente de fricción)"
      });
    }

    const finalResult: PhysicsResult = {
      title: "Dinámica - Leyes de Newton",
      steps,
      finalResults: [
        { label: "Masa", value: formatNumber(massVal || calculatedMass), unit: "kg", description: "Masa del objeto" },
        { label: "Fuerza", value: formatNumber(forceVal || calculatedForce), unit: "N", description: "Fuerza neta aplicada" },
        { label: "Aceleración", value: formatNumber(accelVal || calculatedAcceleration), unit: "m/s²", description: "Aceleración resultante" },
        { label: "Fuerza de fricción", value: formatNumber(frictionForce), unit: "N", description: `Coeficiente: ${frictionCoeff}` }
      ],
      assumptions: [
        "Fuerza neta constante",
        "Masa constante",
        `Gravedad: ${formatNumber(g)} m/s²`,
        "Superficie horizontal para cálculo de fricción"
      ]
    };
    
    setResult(finalResult);
    saveToHistory({ mass: massVal, force: forceVal, acceleration: accelVal, frictionCoeff, g }, finalResult);
  };
  
  // Cálculos de energía
  const calculateEnergy = () => {
    const massVal = parseFloat(kineticMass) || 0;
    const velocityVal = parseFloat(kineticVelocity) || 0;
    const heightVal = parseFloat(potentialHeight) || 0;
    const kVal = parseFloat(springConstant) || 0;
    const xVal = parseFloat(springDisplacement) || 0;
    
    const steps: CalculationStep[] = [];
    
    // Energía cinética
    const kineticEnergy = 0.5 * massVal * velocityVal * velocityVal;
    if (massVal && velocityVal) {
      steps.push({
        formula: "E_c = ½ × m × v²",
        substitution: `E_c = ½ × ${formatNumber(massVal)} × ${formatNumber(velocityVal)}²`,
        result: `E_c = ${formatNumber(kineticEnergy)} J`,
        explanation: "Energía cinética del objeto en movimiento"
      });
    }
    
    // Energía potencial gravitatoria
    const potentialEnergy = massVal * g * heightVal;
    if (massVal && heightVal) {
      steps.push({
        formula: "E_p = m × g × h",
        substitution: `E_p = ${formatNumber(massVal)} × ${formatNumber(g)} × ${formatNumber(heightVal)}`,
        result: `E_p = ${formatNumber(potentialEnergy)} J`,
        explanation: "Energía potencial gravitatoria"
      });
    }
    
    // Energía potencial elástica
    const springEnergy = 0.5 * kVal * xVal * xVal;
    if (kVal && xVal) {
      steps.push({
        formula: "E_elástica = ½ × k × x²",
        substitution: `E_elástica = ½ × ${formatNumber(kVal)} × ${formatNumber(xVal)}²`,
        result: `E_elástica = ${formatNumber(springEnergy)} J`,
        explanation: "Energía almacenada en un resorte comprimido/estirado"
      });
    }
    
    // Energía mecánica total
    const totalEnergy = kineticEnergy + potentialEnergy + springEnergy;

    const finalResult: PhysicsResult = {
      title: "Energía Mecánica",
      steps,
      finalResults: [
        { label: "Energía cinética", value: formatNumber(kineticEnergy), unit: "J", description: "Energía por movimiento" },
        { label: "Energía potencial", value: formatNumber(potentialEnergy), unit: "J", description: "Energía por altura" },
        { label: "Energía elástica", value: formatNumber(springEnergy), unit: "J", description: "Energía en resorte" },
        { label: "Energía total", value: formatNumber(totalEnergy), unit: "J", description: "Suma de todas las energías" },
        { label: "Masa", value: formatNumber(massVal), unit: "kg", description: "Masa del objeto" }
      ],
      assumptions: [
        `Gravedad: ${formatNumber(g)} m/s²`,
        "Sistema conservativo (sin fricción)",
        "Resorte ideal (obedece la ley de Hooke)"
      ]
    };
    
    setResult(finalResult);
    saveToHistory({ mass: massVal, velocity: velocityVal, height: heightVal, springConstant: kVal, displacement: xVal, g }, finalResult);
  };
  
  // Cálculos de electricidad
  const calculateElectricity = () => {
    const voltageVal = parseFloat(voltage) || 0;
    const currentVal = parseFloat(current) || 0;
    const resistanceVal = parseFloat(resistance) || 0;
    const capacitanceVal = parseFloat(capacitance) || 0;
    
    const steps: CalculationStep[] = [];
    
    let calculatedVoltage = 0;
    let calculatedCurrent = 0;
    let calculatedResistance = 0;
    let calculatedPower = 0;
    
    // Ley de Ohm
    if (voltageVal && currentVal) {
      calculatedResistance = voltageVal / currentVal;
      calculatedPower = voltageVal * currentVal;
      
      steps.push({
        formula: "R = V / I",
        substitution: `R = ${formatNumber(voltageVal)} / ${formatNumber(currentVal)}`,
        result: `R = ${formatNumber(calculatedResistance)} Ω`,
        explanation: "Resistencia calculada con la ley de Ohm"
      });
      
      steps.push({
        formula: "P = V × I",
        substitution: `P = ${formatNumber(voltageVal)} × ${formatNumber(currentVal)}`,
        result: `P = ${formatNumber(calculatedPower)} W`,
        explanation: "Potencia eléctrica disipada"
      });
    } else if (voltageVal && resistanceVal) {
      calculatedCurrent = voltageVal / resistanceVal;
      calculatedPower = voltageVal * calculatedCurrent;
      
      steps.push({
        formula: "I = V / R",
        substitution: `I = ${formatNumber(voltageVal)} / ${formatNumber(resistanceVal)}`,
        result: `I = ${formatNumber(calculatedCurrent)} A`,
        explanation: "Corriente calculada con la ley de Ohm"
      });
    } else if (currentVal && resistanceVal) {
      calculatedVoltage = currentVal * resistanceVal;
      calculatedPower = calculatedVoltage * currentVal;
      
      steps.push({
        formula: "V = I × R",
        substitution: `V = ${formatNumber(currentVal)} × ${formatNumber(resistanceVal)}`,
        result: `V = ${formatNumber(calculatedVoltage)} V`,
        explanation: "Voltaje calculado con la ley de Ohm"
      });
    }
    
    // Energía almacenada en capacitor
    const capacitorEnergy = 0.5 * capacitanceVal * 1e-6 * voltageVal * voltageVal;
    if (capacitanceVal && voltageVal) {
      steps.push({
        formula: "E = ½ × C × V²",
        substitution: `E = ½ × ${formatNumber(capacitanceVal)}μF × ${formatNumber(voltageVal)}²`,
        result: `E = ${formatNumber(capacitorEnergy)} J`,
        explanation: "Energía almacenada en el capacitor"
      });
    }

    const finalResult: PhysicsResult = {
      title: "Circuitos Eléctricos",
      steps,
      finalResults: [
        { label: "Voltaje", value: formatNumber(voltageVal || calculatedVoltage), unit: "V", description: "Diferencia de potencial" },
        { label: "Corriente", value: formatNumber(currentVal || calculatedCurrent), unit: "A", description: "Flujo de carga" },
        { label: "Resistencia", value: formatNumber(resistanceVal || calculatedResistance), unit: "Ω", description: "Oposición al flujo" },
        { label: "Potencia", value: formatNumber(calculatedPower), unit: "W", description: "Tasa de consumo de energía" },
        { label: "Energía en capacitor", value: formatNumber(capacitorEnergy), unit: "J", description: "Energía almacenada" }
      ],
      assumptions: [
        "Circuito resistivo puro (sin reactancia)",
        "Componentes ideales",
        "Corriente continua (DC)"
      ]
    };
    
    setResult(finalResult);
    saveToHistory({ voltage: voltageVal, current: currentVal, resistance: resistanceVal, capacitance: capacitanceVal }, finalResult);
  };

  // Función principal de cálculo
  const handleCalculate = () => {
    setLoading(true);
    
    // Pequeño delay para mostrar estado de carga
    setTimeout(() => {
      if (category === "cinematica") {
        switch (calcType) {
          case "vertical": calculateVertical(); break;
          case "horizontal": calculateHorizontal(); break;
          case "inclinado": calculateInclined(); break;
          case "mru": calculateMRU(); break;
          case "mrua": calculateMRUA(); break;
          case "caida_libre": calculateFreeFall(); break;
        }
      } else if (category === "dinamica") {
        calculateForce();
      } else if (category === "energia") {
        calculateEnergy();
      } else if (category === "electricidad") {
        calculateElectricity();
      }
      
      setLoading(false);
    }, 300);
  };

  // Limpiar todos los campos
  const handleClear = () => {
    setV0("");
    setHeight("");
    setTime("");
    setVx("");
    setHHeight("");
    setIV0("");
    setAngle("");
    setAcceleration("");
    setDistance("");
    setFinalVelocity("");
    setInitialVelocity("");
    setMass("");
    setForce("");
    setFrictionCoeff("0.3");
    setNormalForce("");
    setKineticMass("");
    setKineticVelocity("");
    setPotentialMass("");
    setPotentialHeight("");
    setSpringConstant("");
    setSpringDisplacement("");
    setVoltage("");
    setCurrent("");
    setResistance("");
    setCapacitance("");
    setCharge("");
    setResult(null);
  };

  // Copiar resultados al portapapeles
  const handleCopyResults = () => {
    if (!result) return;
    
    const text = `Física - ${result.title}\n\n` +
      result.finalResults.map(r => `${r.label}: ${r.value} ${r.unit}`).join('\n') +
      `\n\nCalculado con g = ${formatNumber(g)} m/s²`;
    
    navigator.clipboard.writeText(text);
    // Aquí podrías añadir un toast de confirmación
  };

  // Reiniciar configuración
  const handleResetSettings = () => {
    setUnits({
      length: "m",
      time: "s",
      velocity: "m/s",
      angle: "°",
      mass: "kg",
      force: "N",
      energy: "J",
      temperature: "°C"
    });
    setShowSteps(true);
    setShowGraphs(true);
    setUseStandardGravity(true);
    setCustomGravity("9.80665");
    setDecimalPlaces(3);
    setAnimationSpeed(1);
  };

  // Renderizar gráficos simples (sin librerías externas)
  const renderGraph = (graph: GraphData) => {
    if (!graph.data || graph.data.length === 0) return null;
    
    // Encontrar máximos y mínimos para escalar
    const xValues = graph.data.map(d => d.x);
    const yValues = graph.data.map(d => d.y);
    
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    
    // Puntos escalados para SVG (200x150)
    const scaleX = 200 / rangeX;
    const scaleY = 150 / rangeY;
    
    const points = graph.data.map(d => 
      `${((d.x - minX) * scaleX)},${150 - ((d.y - minY) * scaleY)}`
    ).join(" ");
    
    return (
      <div className="p-4 bg-background rounded-xl">
        <h4 className="font-medium mb-2 text-sm">{graph.title}</h4>
        <div className="relative h-48 bg-muted/30 rounded-lg p-2">
          <svg width="100%" height="100%" viewBox="0 0 220 170" className="overflow-visible">
            {/* Ejes */}
            <line x1="20" y1="10" x2="20" y2="160" stroke="#64748b" strokeWidth="1" />
            <line x1="20" y1="160" x2="210" y2="160" stroke="#64748b" strokeWidth="1" />
            
            {/* Etiquetas de ejes */}
            <text x="10" y="85" fill="#64748b" fontSize="10" textAnchor="middle" transform="rotate(-90,10,85)">
              {graph.yLabel}
            </text>
            <text x="115" y="170" fill="#64748b" fontSize="10" textAnchor="middle">
              {graph.xLabel}
            </text>
            
            {/* Línea de gráfico */}
            {graph.type === "line" && (
              <polyline
                points={points}
                fill="none"
                stroke={graph.color || "#3b82f6"}
                strokeWidth="2"
                strokeLinejoin="round"
              />
            )}
            
            {graph.type === "scatter" && (
              <>
                <polyline
                  points={points}
                  fill="none"
                  stroke={graph.color || "#3b82f6"}
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                {graph.data.map((d, i) => (
                  <circle
                    key={i}
                    cx={((d.x - minX) * scaleX)}
                    cy={150 - ((d.y - minY) * scaleY)}
                    r="2.5"
                    fill={graph.color || "#3b82f6"}
                  />
                ))}
              </>
            )}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta principal */}
      <Card className="p-6 rounded-2xl border-l-4 shadow-lg" style={{ borderLeftColor: "hsl(var(--fisica))" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[hsl(var(--fisica))]/20 to-[hsl(var(--fisica))]/5">
              <Atom className="h-7 w-7 text-[hsl(var(--fisica))]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Calculadora de Física Avanzada</h1>
              <p className="text-sm text-muted-foreground">
                Herramienta completa para cinemática, dinámica, energía, electricidad y más
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-lg gap-1" onClick={handleClear}>
              <RefreshCw className="h-3 w-3" /> Limpiar
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg gap-1" onClick={handleCopyResults} disabled={!result}>
              <Share2 className="h-3 w-3" /> Compartir
            </Button>
          </div>
        </div>

        {/* Selector de categoría */}
        <Tabs value={category} onValueChange={(v) => setCategory(v as any)} className="mb-6">
          <TabsList className="w-full rounded-xl mb-4 grid grid-cols-2 md:grid-cols-6 gap-1">
            <TabsTrigger value="cinematica" className="rounded-lg gap-2 text-xs py-2">
              <ArrowUp className="h-3 w-3" /> Cinemática
            </TabsTrigger>
            <TabsTrigger value="dinamica" className="rounded-lg gap-2 text-xs py-2">
              <Scale className="h-3 w-3" /> Dinámica
            </TabsTrigger>
            <TabsTrigger value="energia" className="rounded-lg gap-2 text-xs py-2">
              <Zap className="h-3 w-3" /> Energía
            </TabsTrigger>
            <TabsTrigger value="electricidad" className="rounded-lg gap-2 text-xs py-2">
              <Battery className="h-3 w-3" /> Electricidad
            </TabsTrigger>
            <TabsTrigger value="termodinamica" className="rounded-lg gap-2 text-xs py-2">
              <Thermometer className="h-3 w-3" /> Termodinámica
            </TabsTrigger>
            <TabsTrigger value="opticas" className="rounded-lg gap-2 text-xs py-2">
              <Waves className="h-3 w-3" /> Óptica
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Selector de tipo de cálculo dentro de la categoría */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-2 block">Tipo de Cálculo</Label>
          {category === "cinematica" && (
            <Tabs value={calcType} onValueChange={(v) => setCalcType(v as any)}>
              <TabsList className="w-full rounded-xl grid grid-cols-2 md:grid-cols-6 gap-1">
                <TabsTrigger value="vertical" className="rounded-lg gap-1 text-xs py-2">
                  <ArrowUp className="h-3 w-3" /> Vertical
                </TabsTrigger>
                <TabsTrigger value="horizontal" className="rounded-lg gap-1 text-xs py-2">
                  <ArrowRight className="h-3 w-3" /> Horizontal
                </TabsTrigger>
                <TabsTrigger value="inclinado" className="rounded-lg gap-1 text-xs py-2">
                  <RotateCw className="h-3 w-3" /> Inclinado
                </TabsTrigger>
                <TabsTrigger value="mru" className="rounded-lg gap-1 text-xs py-2">
                  <Gauge className="h-3 w-3" /> MRU
                </TabsTrigger>
                <TabsTrigger value="mrua" className="rounded-lg gap-1 text-xs py-2">
                  <Target className="h-3 w-3" /> MRUA
                </TabsTrigger>
                <TabsTrigger value="caida_libre" className="rounded-lg gap-1 text-xs py-2">
                  <Globe className="h-3 w-3" /> Caída Libre
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          
          {category === "dinamica" && (
            <div className="text-center py-4 bg-muted/30 rounded-xl">
              <Scale className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm">Leyes de Newton - Fuerza, Masa y Aceleración</p>
            </div>
          )}
          
          {category === "energia" && (
            <div className="text-center py-4 bg-muted/30 rounded-xl">
              <Zap className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm">Energía Cinética, Potencial y Mecánica</p>
            </div>
          )}
          
          {category === "electricidad" && (
            <div className="text-center py-4 bg-muted/30 rounded-xl">
              <Battery className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm">Ley de Ohm y Circuitos Eléctricos</p>
            </div>
          )}
        </div>

        {/* Configuración avanzada */}
        <div className="mb-6 p-4 bg-muted/20 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-3 w-3" /> Configuración Avanzada
            </Label>
            <Button variant="ghost" size="sm" onClick={handleResetSettings} className="h-7 text-xs">
              Reiniciar
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Gravedad */}
            <div className="space-y-2">
              <Label className="text-xs">Gravedad (g)</Label>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={useStandardGravity} 
                  onCheckedChange={setUseStandardGravity} 
                  className="scale-90"
                />
                <span className="text-xs">
                  {useStandardGravity ? `Estándar: ${formatNumber(PHYSICAL_CONSTANTS.g)} m/s²` : "Personalizada"}
                </span>
              </div>
              {!useStandardGravity && (
                <Input
                  type="number"
                  value={customGravity}
                  onChange={(e) => setCustomGravity(e.target.value)}
                  placeholder="Ej: 9.8"
                  className="h-8 text-xs"
                />
              )}
            </div>
            
            {/* Decimales */}
            <div className="space-y-2">
              <Label className="text-xs">Decimales: {decimalPlaces}</Label>
              <Slider
                value={[decimalPlaces]}
                onValueChange={(vals) => setDecimalPlaces(vals[0])}
                min={0}
                max={6}
                step={1}
                className="h-2"
              />
            </div>
            
            {/* Opciones de visualización */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Mostrar pasos</Label>
                <Switch checked={showSteps} onCheckedChange={setShowSteps} className="scale-90" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Mostrar gráficos</Label>
                <Switch checked={showGraphs} onCheckedChange={setShowGraphs} className="scale-90" />
              </div>
            </div>
            
            {/* Unidades */}
            <div className="space-y-2">
              <Label className="text-xs">Unidades de longitud</Label>
              <Select value={units.length} onValueChange={(v) => setUnits({...units, length: v})}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Unidad" />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.length.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Campos de entrada según categoría y tipo */}
        <div className="space-y-4 mb-6">
          {category === "cinematica" && (
            <>
              {calcType === "vertical" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Velocidad inicial (v₀)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={v0}
                        onChange={(e) => setV0(e.target.value)}
                        placeholder="Ej: 20"
                        className="rounded-xl"
                      />
                      <Select value={units.velocity} onValueChange={(v) => setUnits({...units, velocity: v})}>
                        <SelectTrigger className="w-24 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_OPTIONS.velocity.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">Velocidad inicial hacia arriba</p>
                  </div>
                </div>
              )}
              
              {calcType === "horizontal" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Velocidad horizontal (v₀)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={vx}
                        onChange={(e) => setVx(e.target.value)}
                        placeholder="Ej: 15"
                        className="rounded-xl"
                      />
                      <Select value={units.velocity} onValueChange={(v) => setUnits({...units, velocity: v})}>
                        <SelectTrigger className="w-24 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_OPTIONS.velocity.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Altura inicial (h)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={hHeight}
                        onChange={(e) => setHHeight(e.target.value)}
                        placeholder="Ej: 45"
                        className="rounded-xl"
                      />
                      <Select value={units.length} onValueChange={(v) => setUnits({...units, length: v})}>
                        <SelectTrigger className="w-24 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_OPTIONS.length.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              
              {calcType === "inclinado" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Velocidad inicial (v₀)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={iV0}
                        onChange={(e) => setIV0(e.target.value)}
                        placeholder="Ej: 25"
                        className="rounded-xl"
                      />
                      <Select value={units.velocity} onValueChange={(v) => setUnits({...units, velocity: v})}>
                        <SelectTrigger className="w-24 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_OPTIONS.velocity.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Ángulo de lanzamiento</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={angle}
                        onChange={(e) => setAngle(e.target.value)}
                        placeholder="Ej: 45"
                        className="rounded-xl"
                      />
                      <Select value={units.angle} onValueChange={(v) => setUnits({...units, angle: v})}>
                        <SelectTrigger className="w-24 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_OPTIONS.angle.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              
              {calcType === "mru" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Velocidad (v)</Label>
                    <Input
                      type="number"
                      value={v0}
                      onChange={(e) => setV0(e.target.value)}
                      placeholder="m/s"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tiempo (t)</Label>
                    <Input
                      type="number"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="s"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Distancia (d)</Label>
                    <Input
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      placeholder="m"
                      className="rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground col-span-full">
                    Introduce dos valores cualesquiera para calcular el tercero
                  </p>
                </div>
              )}
              
              {calcType === "mrua" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Velocidad inicial (v₀)</Label>
                    <Input
                      type="number"
                      value={initialVelocity}
                      onChange={(e) => setInitialVelocity(e.target.value)}
                      placeholder="m/s"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Velocidad final (v_f)</Label>
                    <Input
                      type="number"
                      value={finalVelocity}
                      onChange={(e) => setFinalVelocity(e.target.value)}
                      placeholder="m/s"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Aceleración (a)</Label>
                    <Input
                      type="number"
                      value={acceleration}
                      onChange={(e) => setAcceleration(e.target.value)}
                      placeholder="m/s²"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tiempo (t)</Label>
                    <Input
                      type="number"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="s"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Distancia (d)</Label>
                    <Input
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      placeholder="m"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              )}
              
              {calcType === "caida_libre" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Altura (h)</Label>
                    <Input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="m"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tiempo (t)</Label>
                    <Input
                      type="number"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="s"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Velocidad inicial (v₀)</Label>
                    <Input
                      type="number"
                      value={v0}
                      onChange={(e) => setV0(e.target.value)}
                      placeholder="m/s"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              )}
            </>
          )}
          
          {category === "dinamica" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Masa (m)</Label>
                <Input
                  type="number"
                  value={mass}
                  onChange={(e) => setMass(e.target.value)}
                  placeholder="kg"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Fuerza (F)</Label>
                <Input
                  type="number"
                  value={force}
                  onChange={(e) => setForce(e.target.value)}
                  placeholder="N"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Aceleración (a)</Label>
                <Input
                  type="number"
                  value={acceleration}
                  onChange={(e) => setAcceleration(e.target.value)}
                  placeholder="m/s²"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2 col-span-full md:col-span-2">
                <Label>Coeficiente de fricción (μ)</Label>
                <Input
                  type="number"
                  value={frictionCoeff}
                  onChange={(e) => setFrictionCoeff(e.target.value)}
                  placeholder="0.0 - 1.0"
                  className="rounded-xl"
                  step="0.01"
                  min="0"
                  max="1"
                />
                <p className="text-xs text-muted-foreground">Para calcular fuerza de fricción</p>
              </div>
            </div>
          )}
          
          {category === "energia" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Masa (m)</Label>
                <Input
                  type="number"
                  value={kineticMass}
                  onChange={(e) => setKineticMass(e.target.value)}
                  placeholder="kg"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Velocidad (v)</Label>
                <Input
                  type="number"
                  value={kineticVelocity}
                  onChange={(e) => setKineticVelocity(e.target.value)}
                  placeholder="m/s"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Altura (h)</Label>
                <Input
                  type="number"
                  value={potentialHeight}
                  onChange={(e) => setPotentialHeight(e.target.value)}
                  placeholder="m"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Constante del resorte (k)</Label>
                <Input
                  type="number"
                  value={springConstant}
                  onChange={(e) => setSpringConstant(e.target.value)}
                  placeholder="N/m"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Desplazamiento (x)</Label>
                <Input
                  type="number"
                  value={springDisplacement}
                  onChange={(e) => setSpringDisplacement(e.target.value)}
                  placeholder="m"
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
          
          {category === "electricidad" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Voltaje (V)</Label>
                <Input
                  type="number"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  placeholder="V"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Corriente (I)</Label>
                <Input
                  type="number"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="A"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Resistencia (R)</Label>
                <Input
                  type="number"
                  value={resistance}
                  onChange={(e) => setResistance(e.target.value)}
                  placeholder="Ω"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Capacitancia (C)</Label>
                <Input
                  type="number"
                  value={capacitance}
                  onChange={(e) => setCapacitance(e.target.value)}
                  placeholder="μF"
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
        </div>

        {/* Botón de cálculo */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleCalculate} 
            className="flex-1 rounded-xl h-12 gap-2 text-base"
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
          
          <Button 
            variant="outline" 
            className="rounded-xl h-12 gap-2"
            onClick={() => setIsAnimating(!isAnimating)}
          >
            {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isAnimating ? "Pausar" : "Simular"}
          </Button>
        </div>
      </Card>

      {/* Resultados */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Resultados finales */}
          <Card className="p-6 rounded-2xl bg-gradient-to-br from-[hsl(var(--fisica))]/10 to-transparent border-l-4" style={{ borderLeftColor: "hsl(var(--fisica))" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{result.title} - Resultados</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" /> g = {formatNumber(g)} m/s²
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {result.finalResults.map((r, idx) => (
                <div key={idx} className="p-4 bg-background rounded-xl border text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--fisica))]">{r.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{r.unit}</div>
                  <div className="text-sm font-medium mt-2">{r.label}</div>
                  {r.description && (
                    <div className="text-xs text-muted-foreground mt-1">{r.description}</div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Suposiciones y advertencias */}
            {(result.assumptions || result.warnings) && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <BookOpen className="h-3 w-3" /> Suposiciones del modelo
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.assumptions?.map((assumption, idx) => (
                    <span key={idx} className="text-xs bg-muted px-3 py-1 rounded-full">
                      {assumption}
                    </span>
                  ))}
                </div>
                
                {result.warnings && result.warnings.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2 text-amber-600">Advertencias</h4>
                    <ul className="text-xs text-amber-600 space-y-1">
                      {result.warnings.map((warning, idx) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Gráficos */}
          {showGraphs && result.graphs && result.graphs.length > 0 && (
            <Card className="p-6 rounded-2xl">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <LineChart className="h-4 w-4" /> Visualización Gráfica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" ref={graphRef}>
                {result.graphs.map((graph, idx) => (
                  <div key={idx}>
                    {renderGraph(graph)}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Procedimiento paso a paso */}
          {showSteps && (
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Braces className="h-4 w-4" /> Procedimiento Paso a Paso
                </h3>
                <span className="text-xs text-muted-foreground">{result.steps.length} pasos</span>
              </div>
              
              <div className="space-y-4">
                {result.steps.map((step, idx) => (
                  <div key={idx} className="p-4 bg-muted/30 rounded-xl space-y-3 border-l-4 border-[hsl(var(--fisica))]">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-[hsl(var(--fisica))] text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-2">{step.explanation}</div>
                        <div className="font-mono text-sm bg-background p-3 rounded-lg border">
                          <div className="text-muted-foreground text-xs mb-1">Fórmula:</div>
                          <div className="mb-2">{step.formula}</div>
                          <div className="text-muted-foreground text-xs mb-1">Sustitución:</div>
                          <div className="mb-2">{step.substitution}</div>
                          <div className="text-muted-foreground text-xs mb-1">Resultado:</div>
                          <div className="text-primary font-bold">{step.result}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Historial de cálculos (solo mostrar si hay historial) */}
          {history.length > 0 && (
            <Card className="p-6 rounded-2xl">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <History className="h-4 w-4" /> Historial Reciente
              </h3>
              <div className="space-y-2">
                {history.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 bg-muted/30 rounded-lg text-sm flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.results.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setResult(item.results)}
                      className="h-7 text-xs"
                    >
                      Ver
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
      
      {/* Información sobre constantes físicas */}
      <Card className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-transparent">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> Constantes Físicas Utilizadas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="p-3 bg-background rounded-lg">
            <div className="font-mono">g = {PHYSICAL_CONSTANTS.g} m/s²</div>
            <div className="text-xs text-muted-foreground">Gravedad terrestre</div>
          </div>
          <div className="p-3 bg-background rounded-lg">
            <div className="font-mono">c = {PHYSICAL_CONSTANTS.c.toExponential(2)} m/s</div>
            <div className="text-xs text-muted-foreground">Velocidad de la luz</div>
          </div>
          <div className="p-3 bg-background rounded-lg">
            <div className="font-mono">G = {PHYSICAL_CONSTANTS.G.toExponential(2)} m³/kg·s²</div>
            <div className="text-xs text-muted-foreground">Constante gravitacional</div>
          </div>
          <div className="p-3 bg-background rounded-lg">
            <div className="font-mono">h = {PHYSICAL_CONSTANTS.h.toExponential(2)} J·s</div>
            <div className="text-xs text-muted-foreground">Constante de Planck</div>
          </div>
        </div>
      </Card>
    </div>
  );
}