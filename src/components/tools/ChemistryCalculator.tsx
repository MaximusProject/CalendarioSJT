import { useState, useEffect, useReducer, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  FlaskConical, 
  Calculator, 
  Droplets, 
  Zap, 
  Thermometer, 
  Scale, 
  Beaker, 
  Atom, 
  TrendingUp,
  BarChart3,
  RefreshCw,
  Info,
  AlertCircle,
  Download,
  Share2,
  Smartphone,
  Monitor
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// ============ TIPOS E INTERFACES ============
export type CalcType = "ph" | "dilution" | "molarity" | "conversion" | "stoichiometry" | "gas" | "thermo";
export type AcidBaseType = "acid" | "base";
export type StrengthType = "strong" | "weak";
export type SolveForType = "c2" | "v2" | "c1" | "v1";
export type HeatType = "reaction" | "calorimetry";
export type GasLawType = "ideal" | "boyle" | "charles" | "avogadro";
export type ChartType = 'line' | 'bar' | 'pie' | 'scatter';

interface PHSDataPoint {
  ph: number;
  value: number;
  color: string;
  label?: string;
}

interface BarChartDataPoint {
  name: string;
  value: number;
  fill?: string;
  type?: string;
}

interface PieChartDataPoint {
  name: string;
  value: number;
  color: string;
}

type ChartData = PHSDataPoint[] | BarChartDataPoint[] | PieChartDataPoint[];

interface ChemResult {
  title: string;
  steps: { label: string; formula: string; result: string; explanation?: string }[];
  finalValue: string;
  unit: string;
  classification?: string;
  warning?: string;
  chartData?: ChartData;
  chartType?: ChartType;
}

interface ChemicalCompound {
  id: string;
  name: string;
  formula: string;
  molarMass: number;
  density?: number;
  type: 'acid' | 'base' | 'salt' | 'organic' | 'inorganic';
  strength?: 'strong' | 'weak';
  pKa?: number;
  color?: string;
  solubility?: string;
}

interface CalculatorState {
  // Configuración general
  calcType: CalcType;
  precision: number;
  showAdvanced: boolean;
  
  // pH Calculator
  pHState: {
    concentration: string;
    acidOrBase: AcidBaseType;
    compoundType: StrengthType;
    pKa: string;
    temperature: string;
    useActivityCoefficient: boolean;
    ionicStrength: string;
  };
  
  // Dilution Calculator
  dilutionState: {
    c1: string;
    v1: string;
    c2: string;
    v2: string;
    solveFor: SolveForType;
    units: { c: string; v: string };
  };
  
  // Molarity Calculator
  molarityState: {
    mass: string;
    molarMass: string;
    volume: string;
    density: string;
    percentPurity: string;
    compoundId?: string;
  };
  
  // Conversion Calculator
  conversionState: {
    fromUnit: string;
    toUnit: string;
    fromValue: string;
    molarMassConv: string;
  };
  
  // Gas Laws Calculator
  gasState: {
    gasLaw: GasLawType;
    pressure: string;
    tempKelvin: string;
    moles: string;
    volume: string;
    gasConstant: string;
  };
  
  // Thermochemistry Calculator
  thermoState: {
    enthalpy: string;
    specificHeat: string;
    tempChange: string;
    massThermo: string;
    heatType: HeatType;
  };
  
  // Resultado actual
  result: ChemResult | null;
  history: ChemResult[];
  isLoading: boolean;
}

type CalculatorAction =
  | { type: 'SET_CALC_TYPE'; payload: CalcType }
  | { type: 'SET_PRECISION'; payload: number }
  | { type: 'TOGGLE_ADVANCED' }
  | { type: 'UPDATE_PH_STATE'; payload: Partial<CalculatorState['pHState']> }
  | { type: 'UPDATE_DILUTION_STATE'; payload: Partial<CalculatorState['dilutionState']> }
  | { type: 'UPDATE_MOLARITY_STATE'; payload: Partial<CalculatorState['molarityState']> }
  | { type: 'UPDATE_CONVERSION_STATE'; payload: Partial<CalculatorState['conversionState']> }
  | { type: 'UPDATE_GAS_STATE'; payload: Partial<CalculatorState['gasState']> }
  | { type: 'UPDATE_THERMO_STATE'; payload: Partial<CalculatorState['thermoState']> }
  | { type: 'SET_RESULT'; payload: ChemResult }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_LOADING'; payload: boolean };

// ============ REDUCER ============
const initialState: CalculatorState = {
  calcType: "ph",
  precision: 4,
  showAdvanced: false,
  
  pHState: {
    concentration: "0.001",
    acidOrBase: "acid",
    compoundType: "strong",
    pKa: "4.75",
    temperature: "25",
    useActivityCoefficient: false,
    ionicStrength: "0",
  },
  
  dilutionState: {
    c1: "1.0",
    v1: "100",
    c2: "0.1",
    v2: "",
    solveFor: "v2",
    units: { c: "M", v: "mL" }
  },
  
  molarityState: {
    mass: "5.85",
    molarMass: "58.44",
    volume: "100",
    density: "1.0",
    percentPurity: "100",
  },
  
  conversionState: {
    fromUnit: "M",
    toUnit: "g/L",
    fromValue: "1.0",
    molarMassConv: "58.44",
  },
  
  gasState: {
    gasLaw: "ideal",
    pressure: "1.0",
    tempKelvin: "298",
    moles: "1.0",
    volume: "",
    gasConstant: "0.0821",
  },
  
  thermoState: {
    enthalpy: "-285.8",
    specificHeat: "4.184",
    tempChange: "10",
    massThermo: "100",
    heatType: "reaction",
  },
  
  result: null,
  history: [],
  isLoading: false,
};

function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'SET_CALC_TYPE':
      return { ...state, calcType: action.payload };
      
    case 'SET_PRECISION':
      return { ...state, precision: action.payload };
      
    case 'TOGGLE_ADVANCED':
      return { ...state, showAdvanced: !state.showAdvanced };
      
    case 'UPDATE_PH_STATE':
      return { ...state, pHState: { ...state.pHState, ...action.payload } };
      
    case 'UPDATE_DILUTION_STATE':
      return { ...state, dilutionState: { ...state.dilutionState, ...action.payload } };
      
    case 'UPDATE_MOLARITY_STATE':
      return { ...state, molarityState: { ...state.molarityState, ...action.payload } };
      
    case 'UPDATE_CONVERSION_STATE':
      return { ...state, conversionState: { ...state.conversionState, ...action.payload } };
      
    case 'UPDATE_GAS_STATE':
      return { ...state, gasState: { ...state.gasState, ...action.payload } };
      
    case 'UPDATE_THERMO_STATE':
      return { ...state, thermoState: { ...state.thermoState, ...action.payload } };
      
    case 'SET_RESULT':
      return {
        ...state,
        result: action.payload,
        history: [action.payload, ...state.history.slice(0, 9)],
        isLoading: false
      };
      
    case 'CLEAR_ALL':
      return {
        ...state,
        pHState: initialState.pHState,
        dilutionState: initialState.dilutionState,
        molarityState: initialState.molarityState,
        conversionState: initialState.conversionState,
        gasState: initialState.gasState,
        thermoState: initialState.thermoState,
        result: null,
        isLoading: false
      };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    default:
      return state;
  }
}

// ============ BASE DE DATOS DINÁMICA ============
const CHEMICAL_DATABASE: ChemicalCompound[] = [
  // Ácidos fuertes
  { id: 'hcl', name: 'Ácido clorhídrico', formula: 'HCl', molarMass: 36.46, type: 'acid', strength: 'strong' },
  { id: 'h2so4', name: 'Ácido sulfúrico', formula: 'H₂SO₄', molarMass: 98.08, type: 'acid', strength: 'strong', density: 1.84 },
  { id: 'hno3', name: 'Ácido nítrico', formula: 'HNO₃', molarMass: 63.01, type: 'acid', strength: 'strong', density: 1.41 },
  
  // Ácidos débiles
  { id: 'ch3cooh', name: 'Ácido acético', formula: 'CH₃COOH', molarMass: 60.05, type: 'acid', strength: 'weak', pKa: 4.76, density: 1.05 },
  { id: 'h3po4', name: 'Ácido fosfórico', formula: 'H₃PO₄', molarMass: 97.99, type: 'acid', strength: 'weak', pKa: 2.14, density: 1.88 },
  { id: 'h2co3', name: 'Ácido carbónico', formula: 'H₂CO₃', molarMass: 62.03, type: 'acid', strength: 'weak', pKa: 6.35 },
  
  // Bases fuertes
  { id: 'naoh', name: 'Hidróxido de sodio', formula: 'NaOH', molarMass: 40.00, type: 'base', strength: 'strong', density: 2.13 },
  { id: 'koh', name: 'Hidróxido de potasio', formula: 'KOH', molarMass: 56.11, type: 'base', strength: 'strong', density: 2.04 },
  { id: 'caoh2', name: 'Hidróxido de calcio', formula: 'Ca(OH)₂', molarMass: 74.09, type: 'base', strength: 'strong' },
  
  // Bases débiles
  { id: 'nh3', name: 'Amoníaco', formula: 'NH₃', molarMass: 17.03, type: 'base', strength: 'weak', pKa: 9.25 },
  { id: 'ch3nh2', name: 'Metilamina', formula: 'CH₃NH₂', molarMass: 31.06, type: 'base', strength: 'weak', pKa: 10.64 },
  
  // Sales comunes
  { id: 'nacl', name: 'Cloruro de sodio', formula: 'NaCl', molarMass: 58.44, type: 'salt', density: 2.16, solubility: 'Soluble' },
  { id: 'cuso4', name: 'Sulfato de cobre', formula: 'CuSO₄', molarMass: 159.61, type: 'salt', density: 3.60, solubility: 'Soluble' },
  { id: 'caco3', name: 'Carbonato de calcio', formula: 'CaCO₃', molarMass: 100.09, type: 'salt', density: 2.71, solubility: 'Insoluble' },
  
  // Orgánicos
  { id: 'c6h12o6', name: 'Glucosa', formula: 'C₆H₁₂O₆', molarMass: 180.16, type: 'organic' },
  { id: 'c2h5oh', name: 'Etanol', formula: 'C₂H₅OH', molarMass: 46.07, type: 'organic', density: 0.789 },
  { id: 'c12h22o11', name: 'Sacarosa', formula: 'C₁₂H₂₂O₁₁', molarMass: 342.30, type: 'organic', density: 1.59 },
  
  // Inorgánicos
  { id: 'h2o', name: 'Agua', formula: 'H₂O', molarMass: 18.02, type: 'inorganic', density: 1.00 },
  { id: 'co2', name: 'Dióxido de carbono', formula: 'CO₂', molarMass: 44.01, type: 'inorganic' },
  { id: 'o2', name: 'Oxígeno', formula: 'O₂', molarMass: 32.00, type: 'inorganic' },
];

// ============ CONSTANTES Y UTILIDADES ============
const PH_SCALE_COLORS = [
  { ph: 0, color: "#ff0000", label: "Ácido fuerte" },
  { ph: 2, color: "#ff3300", label: "Muy ácido" },
  { ph: 4, color: "#ff6600", label: "Moderadamente ácido" },
  { ph: 6, color: "#ffcc00", label: "Ligeramente ácido" },
  { ph: 7, color: "#00cc00", label: "Neutro" },
  { ph: 8, color: "#66ccff", label: "Ligeramente básico" },
  { ph: 10, color: "#0066ff", label: "Moderadamente básico" },
  { ph: 12, color: "#0000ff", label: "Muy básico" },
  { ph: 14, color: "#330066", label: "Base fuerte" },
];

const UNITS_CONVERSION = {
  M: { factor: 1, name: 'Molar' },
  mM: { factor: 1000, name: 'Milimolar' },
  µM: { factor: 1000000, name: 'Micromolar' },
  nM: { factor: 1000000000, name: 'Nanomolar' },
  gL: { factor: 1, name: 'gramos/Litro' },
  mgmL: { factor: 1, name: 'mg/mL' },
  percent: { factor: 1, name: 'Porcentaje' },
  ppm: { factor: 1000000, name: 'Partes por millón' },
};

// ============ FUNCIONES DE CÁLCULO ============
class ChemistryCalculatorService {
  // Constantes fundamentales
  static readonly R = 0.08205736608096; // L·atm·mol⁻¹·K⁻¹
  static readonly Kw_25 = 1.0e-14;
  static readonly Avogadro = 6.02214076e23;
  
  // Cálculo de actividad iónica (Davies equation)
  static calculateActivityCoefficient(ionicStrength: number, charge: number = 1, temperature: number = 25): number {
    if (ionicStrength <= 0) return 1;
    
    const A = 0.509; // Constante para agua a 25°C
    const sqrtI = Math.sqrt(ionicStrength);
    
    // Ecuación de Davies extendida
    const logGamma = -A * Math.pow(charge, 2) * (
      sqrtI / (1 + sqrtI) - 0.3 * ionicStrength
    );
    
    return Math.pow(10, logGamma);
  }
  
  // Cálculo de fuerza iónica
  static calculateIonicStrength(concentrations: number[], charges: number[]): number {
    return 0.5 * concentrations.reduce((sum, ci, i) => 
      sum + ci * Math.pow(charges[i], 2), 0);
  }
  
  // Cálculo de pH con coeficientes de actividad
  static calculatePHWithActivity(
    concentration: number, 
    isAcid: boolean, 
    isStrong: boolean,
    pKa: number = 4.75,
    temperature: number = 25
  ): { pH: number; pOH: number; gamma: number; ionicStrength: number } {
    
    // Constante de autoionización del agua ajustada por temperatura
    const Kw = this.Kw_25 * Math.exp((-5590.5 / 8.314) * (1/(temperature + 273.15) - 1/298.15));
    
    let pH, pOH;
    let ionicStrength = 0;
    
    if (isStrong) {
      if (isAcid) {
        // Ácido fuerte: HA → H⁺ + A⁻
        ionicStrength = concentration; // Para carga ±1
        const gamma = this.calculateActivityCoefficient(ionicStrength, 1, temperature);
        const activity = gamma * concentration;
        pH = -Math.log10(activity);
        pOH = -Math.log10(Kw / activity);
      } else {
        // Base fuerte: BOH → B⁺ + OH⁻
        ionicStrength = concentration;
        const gamma = this.calculateActivityCoefficient(ionicStrength, 1, temperature);
        const activity = gamma * concentration;
        pOH = -Math.log10(activity);
        pH = -Math.log10(Kw / activity);
      }
    } else {
      // Ácido/Base débil - cálculo simplificado sin coeficientes
      if (isAcid) {
        pH = 0.5 * (pKa - Math.log10(concentration));
      } else {
        const pKb = 14 - pKa;
        pOH = 0.5 * (pKb - Math.log10(concentration));
        pH = 14 - pOH;
      }
    }
    
    return {
      pH: pH || 7,
      pOH: pOH || 7,
      gamma: this.calculateActivityCoefficient(ionicStrength, 1, temperature),
      ionicStrength
    };
  }
  
  // Cálculo de dilución con verificación
  static calculateDilution(
    c1: number, v1: number, c2: number, v2: number, solveFor: SolveForType
  ): { value: number; dilutionFactor: number; isValid: boolean; error?: string } {
    
    let value = 0;
    let isValid = true;
    let error = "";
    
    switch (solveFor) {
      case 'v2':
        if (c2 <= 0) {
          isValid = false;
          error = "C₂ debe ser mayor que 0";
        } else {
          value = (c1 * v1) / c2;
        }
        break;
        
      case 'c2':
        if (v2 <= 0) {
          isValid = false;
          error = "V₂ debe ser mayor que 0";
        } else {
          value = (c1 * v1) / v2;
        }
        break;
        
      case 'c1':
        if (v1 <= 0) {
          isValid = false;
          error = "V₁ debe ser mayor que 0";
        } else {
          value = (c2 * v2) / v1;
        }
        break;
        
      case 'v1':
        if (c1 <= 0) {
          isValid = false;
          error = "C₁ debe ser mayor que 0";
        } else {
          value = (c2 * v2) / c1;
        }
        break;
    }
    
    const dilutionFactor = solveFor === 'v2' ? value / v1 : c1 / value;
    
    return { value, dilutionFactor, isValid, error };
  }
  
  // Cálculo de molaridad completo
  static calculateMolarity(
    mass: number, molarMass: number, volume: number, 
    density: number = 1, purity: number = 100
  ): {
    molarity: number;
    molality: number;
    percentMassVol: number;
    moles: number;
    massSolution: number;
  } {
    const realMass = mass * (purity / 100);
    const moles = realMass / molarMass;
    const volumeL = volume / 1000;
    const molarity = moles / volumeL;
    
    const massSolution = volume * density;
    const massSolvent = massSolution - realMass;
    const molality = moles / (massSolvent / 1000);
    
    const percentMassVol = (realMass / volume) * 100;
    
    return { molarity, molality, percentMassVol, moles, massSolution };
  }
  
  // Conversión de unidades
  static convertConcentration(
    value: number, fromUnit: string, toUnit: string, molarMass: number
  ): number {
    // Convertir todo a M (mol/L) primero
    let valueInM = value;
    
    switch (fromUnit) {
      case 'mM': valueInM = value / 1000; break;
      case 'µM': valueInM = value / 1e6; break;
      case 'nM': valueInM = value / 1e9; break;
      case 'gL': valueInM = value / molarMass; break;
      case 'mgmL': valueInM = (value * 1000) / molarMass; break;
      case 'percent': valueInM = (value * 10) / molarMass; break;
      case 'ppm': valueInM = (value / molarMass) / 1000; break;
    }
    
    // Convertir de M a la unidad destino
    switch (toUnit) {
      case 'M': return valueInM;
      case 'mM': return valueInM * 1000;
      case 'µM': return valueInM * 1e6;
      case 'nM': return valueInM * 1e9;
      case 'gL': return valueInM * molarMass;
      case 'mgmL': return (valueInM * molarMass) / 1000;
      case 'percent': return (valueInM * molarMass) / 10;
      case 'ppm': return valueInM * molarMass * 1000;
      default: return valueInM;
    }
  }
}

// ============ COMPONENTE PRINCIPAL ============
export function ChemistryCalculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar dispositivo
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Filtrar compuestos según tipo
  const filteredCompounds = useMemo(() => {
    if (state.calcType === 'ph') {
      return CHEMICAL_DATABASE.filter(c => 
        state.pHState.acidOrBase === 'acid' ? c.type === 'acid' : c.type === 'base'
      );
    }
    return CHEMICAL_DATABASE;
  }, [state.calcType, state.pHState.acidOrBase]);
  
  // Cálculo principal
  const handleCalculate = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Simular cálculo asíncrono
    setTimeout(() => {
      try {
        let result: ChemResult;
        
        switch (state.calcType) {
          case 'ph':
            result = calculatePH();
            break;
          case 'dilution':
            result = calculateDilution();
            break;
          case 'molarity':
            result = calculateMolarity();
            break;
          case 'conversion':
            result = calculateConversion();
            break;
          default:
            result = calculatePH();
        }
        
        dispatch({ type: 'SET_RESULT', payload: result });
      } catch (error) {
        const errorResult: ChemResult = {
          title: "Error en cálculo",
          steps: [{ label: "Error", formula: "Error", result: String(error) }],
          finalValue: "Error",
          unit: "",
          warning: "Ocurrió un error durante el cálculo"
        };
        dispatch({ type: 'SET_RESULT', payload: errorResult });
      }
    }, 300);
  }, [state]);
  
  // Función para calcular pH
  const calculatePH = (): ChemResult => {
    const { concentration, acidOrBase, compoundType, pKa, temperature, useActivityCoefficient } = state.pHState;
    const conc = parseFloat(concentration) || 0;
    const temp = parseFloat(temperature) || 25;
    const pKaVal = parseFloat(pKa) || 4.75;
    
    const steps: ChemResult['steps'] = [];
    const chartData: PHSDataPoint[] = [];
    
    // Calcular con coeficiente de actividad si está activado
    const useActivity = useActivityCoefficient && compoundType === 'strong';
    
    let pH: number, pOH: number, gamma: number = 1, ionicStrength: number = 0;
    
    if (useActivity) {
      const result = ChemistryCalculatorService.calculatePHWithActivity(
        conc, acidOrBase === 'acid', compoundType === 'strong', pKaVal, temp
      );
      pH = result.pH;
      pOH = result.pOH;
      gamma = result.gamma;
      ionicStrength = result.ionicStrength;
      
      steps.push({
        label: "Cálculo con coeficiente de actividad",
        formula: "Ecuación de Davies",
        result: `γ = ${gamma.toFixed(4)}, I = ${ionicStrength.toFixed(4)} M`,
        explanation: "Considera interacciones iónicas en solución concentrada"
      });
    } else {
      // Cálculo tradicional
      if (acidOrBase === 'acid') {
        if (compoundType === 'strong') {
          pH = -Math.log10(conc);
          pOH = 14 - pH;
        } else {
          pH = 0.5 * (pKaVal - Math.log10(conc));
          pOH = 14 - pH;
        }
      } else {
        if (compoundType === 'strong') {
          pOH = -Math.log10(conc);
          pH = 14 - pOH;
        } else {
          const pKb = 14 - pKaVal;
          pOH = 0.5 * (pKb - Math.log10(conc));
          pH = 14 - pOH;
        }
      }
    }
    
    // Pasos del cálculo
    steps.push({
      label: "Datos iniciales",
      formula: `[${acidOrBase === 'acid' ? 'H⁺' : 'OH⁻'}] = ${conc.toFixed(state.precision)} M`,
      result: `Temperatura: ${temp}°C, ${compoundType === 'strong' ? 'Fuerte' : 'Débil'}`
    });
    
    if (acidOrBase === 'acid') {
      steps.push({
        label: "Cálculo de pH",
        formula: useActivity ? "pH = -log(γ[H⁺])" : "pH = -log[H⁺]",
        result: `pH = ${pH.toFixed(state.precision)}`
      });
      steps.push({
        label: "Cálculo de pOH",
        formula: "pOH = 14 - pH",
        result: `pOH = ${pOH.toFixed(state.precision)}`
      });
    } else {
      steps.push({
        label: "Cálculo de pOH",
        formula: useActivity ? "pOH = -log(γ[OH⁻])" : "pOH = -log[OH⁻]",
        result: `pOH = ${pOH.toFixed(state.precision)}`
      });
      steps.push({
        label: "Cálculo de pH",
        formula: "pH = 14 - pOH",
        result: `pH = ${pH.toFixed(state.precision)}`
      });
    }
    
    // Clasificación
    let classification = "";
    if (pH < 0) classification = "Superácido";
    else if (pH < 3) classification = "Ácido fuerte";
    else if (pH < 6) classification = "Ácido débil";
    else if (pH < 7) classification = "Ligeramente ácido";
    else if (pH === 7) classification = "Neutro";
    else if (pH < 8) classification = "Ligeramente básico";
    else if (pH < 11) classification = "Base débil";
    else if (pH < 14) classification = "Base fuerte";
    else classification = "Superbase";
    
    steps.push({
      label: "Clasificación",
      formula: "Escala de pH estándar",
      result: classification
    });
    
    // Generar datos para gráfico
    for (let i = 0; i <= 14; i += 0.5) {
      const colorIndex = PH_SCALE_COLORS.findIndex(c => c.ph >= i) || 0;
      chartData.push({
        ph: i,
        value: Math.random() * 0.3 + 0.1, // Valor para visualización
        color: PH_SCALE_COLORS[colorIndex]?.color || '#8884d8',
        label: i === 7 ? 'Neutro' : i < 7 ? 'Ácido' : 'Básico'
      });
    }
    
    return {
      title: "Cálculo de pH/pOH",
      steps,
      finalValue: pH.toFixed(state.precision),
      unit: "pH",
      classification,
      chartData,
      chartType: 'line'
    };
  };
  
  // Función para calcular dilución
  const calculateDilution = (): ChemResult => {
    const { c1, v1, c2, v2, solveFor, units } = state.dilutionState;
    
    const c1Val = parseFloat(c1) || 0;
    const v1Val = parseFloat(v1) || 0;
    const c2Val = parseFloat(c2) || 0;
    const v2Val = parseFloat(v2) || 0;
    
    const steps: ChemResult['steps'] = [];
    const chartData: BarChartDataPoint[] = [];
    
    const result = ChemistryCalculatorService.calculateDilution(
      c1Val, v1Val, c2Val, v2Val, solveFor
    );
    
    if (!result.isValid) {
      return {
        title: "Error en dilución",
        steps: [{ label: "Error", formula: "", result: result.error || "Datos inválidos" }],
        finalValue: "Error",
        unit: "",
        warning: result.error
      };
    }
    
    steps.push({
      label: "Fórmula de dilución",
      formula: "C₁ × V₁ = C₂ × V₂",
      result: "Conservación de soluto durante la dilución"
    });
    
    let finalValue = result.value.toFixed(state.precision);
    let unit = solveFor.includes('v') ? units.v : units.c;
    
    switch (solveFor) {
      case 'v2':
        steps.push({
          label: "Despejando V₂",
          formula: "V₂ = (C₁ × V₁) / C₂",
          result: `V₂ = (${c1Val} ${units.c} × ${v1Val} ${units.v}) / ${c2Val} ${units.c} = ${finalValue} ${units.v}`
        });
        break;
        
      case 'c2':
        steps.push({
          label: "Despejando C₂",
          formula: "C₂ = (C₁ × V₁) / V₂",
          result: `C₂ = (${c1Val} ${units.c} × ${v1Val} ${units.v}) / ${v2Val} ${units.v} = ${finalValue} ${units.c}`
        });
        break;
    }
    
    steps.push({
      label: "Factor de dilución",
      formula: "DF = V₂/V₁ = C₁/C₂",
      result: `Factor = ${result.dilutionFactor.toFixed(2)} (${result.dilutionFactor > 1 ? 'Dilución' : 'Concentración'})`
    });
    
    // Datos para gráfico
    chartData.push(
      { name: 'C₁', value: c1Val, fill: '#8884d8' },
      { name: solveFor === 'c2' ? 'C₂' : 'C₂', value: solveFor === 'c2' ? result.value : c2Val, fill: '#82ca9d' },
      { name: 'V₁', value: v1Val, fill: '#ffc658' },
      { name: solveFor === 'v2' ? 'V₂' : 'V₂', value: solveFor === 'v2' ? result.value : v2Val, fill: '#ff8042' }
    );
    
    return {
      title: "Cálculo de Dilución",
      steps,
      finalValue,
      unit,
      chartData,
      chartType: 'bar'
    };
  };
  
  // Función para calcular molaridad
  const calculateMolarity = (): ChemResult => {
    const { mass, molarMass, volume, density, percentPurity } = state.molarityState;
    
    const massVal = parseFloat(mass) || 0;
    const mmVal = parseFloat(molarMass) || 0;
    const volVal = parseFloat(volume) || 0;
    const densityVal = parseFloat(density) || 1;
    const purity = parseFloat(percentPurity) || 100;
    
    const steps: ChemResult['steps'] = [];
    const chartData: PieChartDataPoint[] = [];
    
    const result = ChemistryCalculatorService.calculateMolarity(
      massVal, mmVal, volVal, densityVal, purity
    );
    
    // Pasos detallados
    if (purity < 100) {
      steps.push({
        label: "Ajuste por pureza",
        formula: "Masa efectiva = Masa × (%Pureza/100)",
        result: `${massVal} g × ${purity}% = ${(massVal * purity / 100).toFixed(state.precision)} g`
      });
    }
    
    steps.push({
      label: "Cálculo de moles",
      formula: "n = masa / masa molar",
      result: `n = ${massVal} g / ${mmVal} g/mol = ${result.moles.toFixed(state.precision)} mol`
    });
    
    steps.push({
      label: "Conversión de volumen",
      formula: "V(L) = V(mL) / 1000",
      result: `V = ${volVal} mL / 1000 = ${(volVal/1000).toFixed(state.precision)} L`
    });
    
    steps.push({
      label: "Molaridad (M)",
      formula: "M = n / V(L)",
      result: `M = ${result.moles.toFixed(state.precision)} mol / ${(volVal/1000).toFixed(state.precision)} L = ${result.molarity.toFixed(state.precision)} M`
    });
    
    steps.push({
      label: "Molalidad (m)",
      formula: "m = n / masa solvente (kg)",
      result: `m = ${result.moles.toFixed(state.precision)} mol / ${(result.massSolution/1000).toFixed(state.precision)} kg = ${result.molality.toFixed(state.precision)} m`
    });
    
    steps.push({
      label: "% masa/volumen",
      formula: "% (m/v) = (masa soluto / volumen) × 100",
      result: `% = (${massVal} g / ${volVal} mL) × 100 = ${result.percentMassVol.toFixed(state.precision)}%`
    });
    
    // Datos para gráfico
    chartData.push(
      { name: 'Soluto', value: massVal, color: '#8884d8' },
      { name: 'Solvente', value: result.massSolution - massVal, color: '#82ca9d' },
      { name: 'Moles', value: result.moles, color: '#ffc658' },
      { name: 'Concentración', value: result.molarity * 10, color: '#ff8042' }
    );
    
    return {
      title: "Cálculo de Concentración",
      steps,
      finalValue: result.molarity.toFixed(state.precision),
      unit: "M (mol/L)",
      chartData,
      chartType: 'pie'
    };
  };
  
  // Función para conversión de unidades
  const calculateConversion = (): ChemResult => {
    const { fromUnit, toUnit, fromValue, molarMassConv } = state.conversionState;
    
    const value = parseFloat(fromValue) || 0;
    const mm = parseFloat(molarMassConv) || 1;
    
    const steps: ChemResult['steps'] = [];
    const convertedValue = ChemistryCalculatorService.convertConcentration(
      value, fromUnit, toUnit, mm
    );
    
    steps.push({
      label: "Conversión de unidades",
      formula: `${value} ${fromUnit} → ${toUnit}`,
      result: `Usando masa molar: ${mm} g/mol`
    });
    
    steps.push({
      label: "Cálculo",
      formula: getConversionFormula(fromUnit, toUnit, mm),
      result: `${value} ${fromUnit} = ${convertedValue.toFixed(state.precision)} ${toUnit}`
    });
    
    return {
      title: "Conversión de Concentración",
      steps,
      finalValue: convertedValue.toFixed(state.precision),
      unit: toUnit
    };
  };
  
  // Función auxiliar para fórmulas de conversión
  const getConversionFormula = (from: string, to: string, mm: number): string => {
    if (from === 'M' && to === 'gL') return `g/L = M × MM = M × ${mm}`;
    if (from === 'gL' && to === 'M') return `M = g/L ÷ MM = g/L ÷ ${mm}`;
    return `Factor de conversión basado en masa molar`;
  };
  
  // Renderizado condicional de gráficas con tipos estrictos
  const renderChart = () => {
    if (!state.result?.chartData) return null;
    
    const { chartData, chartType } = state.result;
    
    switch (chartType) {
      case 'line':
        const lineData = chartData as PHSDataPoint[];
        return (
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="ph" 
                label={{ value: 'pH', position: 'insideBottom', offset: -5 }} 
                domain={[0, 14]}
                ticks={[0, 2, 4, 6, 7, 8, 10, 12, 14]}
              />
              <YAxis label={{ value: 'Intensidad', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}`, 'Valor']}
                labelFormatter={(label) => `pH: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        const barData = chartData as BarChartDataPoint[];
        return (
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(state.precision)}`, 'Valor']}
              />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        const pieData = chartData as PieChartDataPoint[];
        return (
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={isMobile ? 70 : 80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value.toFixed(state.precision)}`, 'Valor']} />
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };
  
  // Escala de pH visual
  const renderPHScale = () => {
    if (!state.result || state.calcType !== 'ph') return null;
    
    const phValue = parseFloat(state.result.finalValue);
    const position = Math.min(Math.max((phValue / 14) * 100, 0), 100);
    
    return (
      <div className="mt-6">
        <h4 className="font-semibold mb-2 text-center">Escala de pH</h4>
        <div className="relative h-6 w-full rounded-lg overflow-hidden border">
          <div className="absolute inset-0 flex">
            {PH_SCALE_COLORS.map((color, i, arr) => {
              const nextColor = arr[i + 1];
              const width = nextColor ? ((nextColor.ph - color.ph) / 14) * 100 : (100 - (color.ph / 14) * 100);
              return (
                <div 
                  key={i}
                  style={{ 
                    width: `${width}%`,
                    background: `linear-gradient(to right, ${color.color}, ${nextColor?.color || color.color})`
                  }}
                />
              );
            })}
          </div>
          <div 
            className="absolute top-0 bottom-0 w-1 bg-black shadow-lg"
            style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 font-bold text-sm bg-background px-2 py-1 rounded-md shadow-sm">
              {phValue.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs mt-2 px-1">
          <span className="text-red-600 font-semibold">0 Ácido</span>
          <span className="text-green-600 font-semibold">7 Neutro</span>
          <span className="text-blue-600 font-semibold">14 Básico</span>
        </div>
      </div>
    );
  };
  
  // Limpiar todos los campos
  const handleClearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };
  
  // Exportar resultados
  const handleExport = () => {
    if (!state.result) return;
    
    const content = `
RESULTADO DE CÁLCULO QUÍMICO
============================
${state.result.title}
Fecha: ${new Date().toLocaleDateString()}
Hora: ${new Date().toLocaleTimeString()}

VALOR FINAL: ${state.result.finalValue} ${state.result.unit}
${state.result.classification ? `Clasificación: ${state.result.classification}` : ''}
${state.result.warning ? `⚠️ Advertencia: ${state.result.warning}` : ''}

PROCEDIMIENTO DETALLADO:
${state.result.steps.map((step, i) => 
`${i+1}. ${step.label}
   Fórmula: ${step.formula}
   Resultado: ${step.result}
   ${step.explanation ? `Explicación: ${step.explanation}` : ''}`
).join('\n\n')}

---
Generado con Calculadora Química Avanzada
Precisión: ${state.precision} decimales
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculo_quimico_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-4 p-3 md:p-4">
      {/* Header responsivo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl flex items-center justify-center bg-[hsl(var(--quimica))]/15`}>
            <FlaskConical className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-[hsl(var(--quimica))]`} />
          </div>
          <div>
            <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>Laboratorio Químico</h1>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              Calculadora avanzada con coeficientes de actividad
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {isMobile ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
            <span>{isMobile ? 'Móvil' : 'Escritorio'}</span>
          </div>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={() => dispatch({ type: 'TOGGLE_ADVANCED' })}
            className={isMobile ? "h-8 px-2" : ""}
          >
            {state.showAdvanced ? "Simple" : "Avanzado"}
          </Button>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={handleClearAll}
            className={isMobile ? "h-8 w-8 p-0" : ""}
          >
            <RefreshCw className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
        </div>
      </div>

      {/* Panel principal responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Panel izquierdo: Calculadora */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 md:p-5 rounded-2xl border-l-4" style={{ borderLeftColor: "hsl(var(--quimica))" }}>
            <Tabs 
              value={state.calcType} 
              onValueChange={(v) => dispatch({ type: 'SET_CALC_TYPE', payload: v as CalcType })}
              className="w-full"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <TabsList className={`w-full ${isMobile ? 'grid grid-cols-2' : 'flex'} gap-1 overflow-x-auto`}>
                  <TabsTrigger value="ph" className={`${isMobile ? 'text-xs px-2' : 'gap-1'} flex-1`}>
                    <Droplets className={isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />
                    pH/pOH
                  </TabsTrigger>
                  <TabsTrigger value="dilution" className={`${isMobile ? 'text-xs px-2' : 'gap-1'} flex-1`}>
                    <Zap className={isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />
                    Dilución
                  </TabsTrigger>
                  <TabsTrigger value="molarity" className={`${isMobile ? 'text-xs px-2' : 'gap-1'} flex-1`}>
                    <Thermometer className={isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />
                    Molaridad
                  </TabsTrigger>
                  <TabsTrigger value="conversion" className={`${isMobile ? 'text-xs px-2' : 'gap-1'} flex-1`}>
                    <Scale className={isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />
                    Conversión
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Label htmlFor="precision" className={`${isMobile ? 'text-xs' : 'text-sm'} whitespace-nowrap`}>
                    Precisión:
                  </Label>
                  <Select 
                    value={state.precision.toString()} 
                    onValueChange={(v) => dispatch({ type: 'SET_PRECISION', payload: parseInt(v) })}
                  >
                    <SelectTrigger className={`${isMobile ? 'h-8 w-20 text-xs' : 'h-9'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 decimales</SelectItem>
                      <SelectItem value="4">4 decimales</SelectItem>
                      <SelectItem value="6">6 decimales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Calculadora de pH */}
              <TabsContent value="ph" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={state.pHState.acidOrBase === "acid" ? "default" : "outline"}
                        onClick={() => dispatch({ type: 'UPDATE_PH_STATE', payload: { acidOrBase: "acid" } })}
                        className="rounded-xl text-xs h-9"
                      >
                        Ácido [H⁺]
                      </Button>
                      <Button
                        variant={state.pHState.acidOrBase === "base" ? "default" : "outline"}
                        onClick={() => dispatch({ type: 'UPDATE_PH_STATE', payload: { acidOrBase: "base" } })}
                        className="rounded-xl text-xs h-9"
                      >
                        Base [OH⁻]
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Compuesto</Label>
                      <Select
                        onValueChange={(id) => {
                          const compound = CHEMICAL_DATABASE.find(c => c.id === id);
                          if (compound) {
                            dispatch({ 
                              type: 'UPDATE_PH_STATE', 
                              payload: { 
                                compoundType: compound.strength || 'strong',
                                pKa: compound.pKa?.toString() || '4.75'
                              }
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar compuesto" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCompounds.map((compound) => (
                            <SelectItem key={compound.id} value={compound.id}>
                              <div className="flex items-center gap-2">
                                <span>{compound.formula}</span>
                                <span className="text-xs text-muted-foreground">({compound.name})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={state.pHState.compoundType === "strong" ? "default" : "outline"}
                          onClick={() => dispatch({ type: 'UPDATE_PH_STATE', payload: { compoundType: "strong" } })}
                          className="rounded-xl text-xs h-9"
                        >
                          Fuerte
                        </Button>
                        <Button
                          variant={state.pHState.compoundType === "weak" ? "default" : "outline"}
                          onClick={() => dispatch({ type: 'UPDATE_PH_STATE', payload: { compoundType: "weak" } })}
                          className="rounded-xl text-xs h-9"
                        >
                          Débil
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Concentración (M)</Label>
                        <span className="text-xs text-muted-foreground">mol/L</span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={state.pHState.concentration}
                          onChange={(e) => dispatch({ type: 'UPDATE_PH_STATE', payload: { concentration: e.target.value } })}
                          placeholder="Ej: 0.001"
                          className="rounded-xl"
                          step="0.0001"
                        />
                        {isMobile ? null : (
                          <Button 
                            variant="outline" 
                            onClick={() => dispatch({ type: 'UPDATE_PH_STATE', payload: { concentration: "0.001" } })}
                            className="px-3"
                          >
                            10⁻³
                          </Button>
                        )}
                      </div>
                      <Slider
                        value={[parseFloat(state.pHState.concentration) || 0]}
                        onValueChange={([val]) => dispatch({ type: 'UPDATE_PH_STATE', payload: { concentration: val.toString() } })}
                        min={0.0001}
                        max={10}
                        step={0.01}
                        className="mt-2"
                      />
                    </div>
                    
                    {state.pHState.compoundType === "weak" && (
                      <div className="space-y-2">
                        <Label>pKa (ácidos débiles)</Label>
                        <Input
                          type="number"
                          value={state.pHState.pKa}
                          onChange={(e) => dispatch({ type: 'UPDATE_PH_STATE', payload: { pKa: e.target.value } })}
                          placeholder="Ej: 4.75 para CH₃COOH"
                          className="rounded-xl"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label>Temperatura (°C)</Label>
                      <Input
                        type="number"
                        value={state.pHState.temperature}
                        onChange={(e) => dispatch({ type: 'UPDATE_PH_STATE', payload: { temperature: e.target.value } })}
                        placeholder="25"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>
                
                {state.showAdvanced && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={state.pHState.useActivityCoefficient} 
                        onCheckedChange={(checked) => 
                          dispatch({ type: 'UPDATE_PH_STATE', payload: { useActivityCoefficient: checked } })
                        }
                      />
                      <Label className="text-sm">Usar coeficientes de actividad (Ecuación de Davies)</Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-7">
                      Considera interacciones iónicas para concentraciones altas ({'>'}0.1M)
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Calculadora de Dilución */}
              <TabsContent value="dilution" className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {(['v2', 'c2', 'c1', 'v1'] as SolveForType[]).map((type) => (
                    <Button
                      key={type}
                      variant={state.dilutionState.solveFor === type ? "default" : "outline"}
                      onClick={() => dispatch({ type: 'UPDATE_DILUTION_STATE', payload: { solveFor: type } })}
                      className={`rounded-xl text-xs h-auto py-2 ${isMobile ? 'text-[10px]' : ''}`}
                    >
                      {type === 'v2' && 'Calcular V₂'}
                      {type === 'c2' && 'Calcular C₂'}
                      {type === 'c1' && 'Calcular C₁'}
                      {type === 'v1' && 'Calcular V₁'}
                    </Button>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Estado Inicial</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>C₁ (Conc. inicial)</Label>
                          <Select 
                            value={state.dilutionState.units.c} 
                            onValueChange={(v) => 
                              dispatch({ 
                                type: 'UPDATE_DILUTION_STATE', 
                                payload: { units: { ...state.dilutionState.units, c: v } }
                              })
                            }
                          >
                            <SelectTrigger className={`${isMobile ? 'h-8 w-16 text-xs' : 'h-8 w-20'}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="M">M</SelectItem>
                              <SelectItem value="mM">mM</SelectItem>
                              <SelectItem value="g/L">g/L</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          type="number"
                          value={state.dilutionState.c1}
                          onChange={(e) => dispatch({ type: 'UPDATE_DILUTION_STATE', payload: { c1: e.target.value } })}
                          placeholder="Conc. inicial"
                          className="rounded-xl"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>V₁ (Vol. inicial)</Label>
                          <Select 
                            value={state.dilutionState.units.v} 
                            onValueChange={(v) => 
                              dispatch({ 
                                type: 'UPDATE_DILUTION_STATE', 
                                payload: { units: { ...state.dilutionState.units, v: v } }
                              })
                            }
                          >
                            <SelectTrigger className={`${isMobile ? 'h-8 w-16 text-xs' : 'h-8 w-20'}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mL">mL</SelectItem>
                              <SelectItem value="L">L</SelectItem>
                              <SelectItem value="µL">µL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          type="number"
                          value={state.dilutionState.v1}
                          onChange={(e) => dispatch({ type: 'UPDATE_DILUTION_STATE', payload: { v1: e.target.value } })}
                          placeholder="Vol. inicial"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Estado Final</h4>
                    <div className="space-y-3">
                      {state.dilutionState.solveFor === "v2" ? (
                        <div className="space-y-2">
                          <Label>C₂ (Conc. final)</Label>
                          <Input
                            type="number"
                            value={state.dilutionState.c2}
                            onChange={(e) => dispatch({ type: 'UPDATE_DILUTION_STATE', payload: { c2: e.target.value } })}
                            placeholder="Conc. final"
                            className="rounded-xl"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>V₂ (Vol. final)</Label>
                          <Input
                            type="number"
                            value={state.dilutionState.v2}
                            onChange={(e) => dispatch({ type: 'UPDATE_DILUTION_STATE', payload: { v2: e.target.value } })}
                            placeholder="Vol. final"
                            className="rounded-xl"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    <span className={isMobile ? 'text-xs' : ''}>
                      Fórmula: C₁ × V₁ = C₂ × V₂ (Conservación de soluto)
                    </span>
                  </div>
                </div>
              </TabsContent>

              {/* Calculadora de Molaridad */}
              <TabsContent value="molarity" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Compuesto</Label>
                      <Select onValueChange={(id) => {
                        const compound = CHEMICAL_DATABASE.find(c => c.id === id);
                        if (compound) {
                          dispatch({ 
                            type: 'UPDATE_MOLARITY_STATE', 
                            payload: { 
                              molarMass: compound.molarMass.toString(),
                              density: compound.density?.toString() || "1.0"
                            }
                          });
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar compuesto" />
                        </SelectTrigger>
                        <SelectContent>
                          {CHEMICAL_DATABASE.map((compound) => (
                            <SelectItem key={compound.id} value={compound.id}>
                              <div className="flex items-center gap-2">
                                <span>{compound.formula}</span>
                                <span className="text-xs text-muted-foreground">
                                  {compound.name} ({compound.molarMass} g/mol)
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Masa (g)</Label>
                        <Input
                          type="number"
                          value={state.molarityState.mass}
                          onChange={(e) => dispatch({ type: 'UPDATE_MOLARITY_STATE', payload: { mass: e.target.value } })}
                          placeholder="5.85"
                          className="rounded-xl"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Masa molar (g/mol)</Label>
                        <Input
                          type="number"
                          value={state.molarityState.molarMass}
                          onChange={(e) => dispatch({ type: 'UPDATE_MOLARITY_STATE', payload: { molarMass: e.target.value } })}
                          placeholder="58.44"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Volumen (mL)</Label>
                        <Input
                          type="number"
                          value={state.molarityState.volume}
                          onChange={(e) => dispatch({ type: 'UPDATE_MOLARITY_STATE', payload: { volume: e.target.value } })}
                          placeholder="100"
                          className="rounded-xl"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Densidad (g/mL)</Label>
                        <Input
                          type="number"
                          value={state.molarityState.density}
                          onChange={(e) => dispatch({ type: 'UPDATE_MOLARITY_STATE', payload: { density: e.target.value } })}
                          placeholder="1.0"
                          className="rounded-xl"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    {state.showAdvanced && (
                      <div className="space-y-2">
                        <Label>Pureza (%)</Label>
                        <div className="flex items-center gap-3">
                          <Slider
                            value={[parseFloat(state.molarityState.percentPurity) || 100]}
                            onValueChange={([val]) => 
                              dispatch({ type: 'UPDATE_MOLARITY_STATE', payload: { percentPurity: val.toString() } })
                            }
                            min={0}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-12">
                            {state.molarityState.percentPurity}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Conversor de Concentración */}
              <TabsContent value="conversion" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Convertir de:</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={state.conversionState.fromValue}
                          onChange={(e) => dispatch({ type: 'UPDATE_CONVERSION_STATE', payload: { fromValue: e.target.value } })}
                          placeholder="1.0"
                          className="rounded-xl"
                        />
                        <Select 
                          value={state.conversionState.fromUnit} 
                          onValueChange={(v) => dispatch({ type: 'UPDATE_CONVERSION_STATE', payload: { fromUnit: v } })}
                        >
                          <SelectTrigger className={isMobile ? "w-28" : "w-32"}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Molar (M)</SelectItem>
                            <SelectItem value="mM">Milimolar (mM)</SelectItem>
                            <SelectItem value="µM">Micromolar (µM)</SelectItem>
                            <SelectItem value="gL">g/L</SelectItem>
                            <SelectItem value="mgmL">mg/mL</SelectItem>
                            <SelectItem value="percent">% (m/v)</SelectItem>
                            <SelectItem value="ppm">ppm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>A:</Label>
                      <Select 
                        value={state.conversionState.toUnit} 
                        onValueChange={(v) => dispatch({ type: 'UPDATE_CONVERSION_STATE', payload: { toUnit: v } })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Molar (M)</SelectItem>
                          <SelectItem value="mM">Milimolar (mM)</SelectItem>
                          <SelectItem value="µM">Micromolar (µM)</SelectItem>
                          <SelectItem value="gL">g/L</SelectItem>
                          <SelectItem value="mgmL">mg/mL</SelectItem>
                          <SelectItem value="percent">% (m/v)</SelectItem>
                          <SelectItem value="ppm">ppm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Masa molar (g/mol)</Label>
                      <Input
                        type="number"
                        value={state.conversionState.molarMassConv}
                        onChange={(e) => dispatch({ type: 'UPDATE_CONVERSION_STATE', payload: { molarMassConv: e.target.value } })}
                        placeholder="58.44"
                        className="rounded-xl"
                      />
                    </div>
                    
                    <div className="p-3 bg-muted rounded-xl">
                      <div className="text-sm font-medium">Fórmulas comunes:</div>
                      <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'} mt-1 space-y-1`}>
                        <div>• M → g/L: g/L = M × MM</div>
                        <div>• g/L → M: M = g/L ÷ MM</div>
                        <div>• ppm → M: M = (ppm ÷ MM) ÷ 1000</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 mt-6`}>
              <Button 
                onClick={handleCalculate} 
                className={`${isMobile ? 'h-11' : 'h-12'} gap-2 flex-1`}
                disabled={state.isLoading}
              >
                {state.isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Calculando...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
                    <span>Calcular</span>
                  </>
                )}
              </Button>
              
              {state.showAdvanced && !isMobile && (
                <Button variant="outline" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Gráfico Avanzado
                </Button>
              )}
            </div>
          </Card>

          {/* Resultados */}
          {state.result && (
            <div className="space-y-4 animate-fade-in">
              {/* Resultado principal */}
              <Card className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-[hsl(var(--quimica))]/10 to-transparent">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">{state.result.title}</h3>
                    {state.result.classification && (
                      <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                        {state.result.classification}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <Button 
                      variant="outline" 
                      size={isMobile ? "sm" : "default"}
                      onClick={handleExport}
                      className={isMobile ? "h-8 w-8 p-0" : ""}
                    >
                      {isMobile ? <Download className="h-3 w-3" /> : "Exportar"}
                    </Button>
                    {!isMobile && (
                      <Button variant="outline" size="default">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <div className={`${isMobile ? 'text-4xl' : 'text-5xl'} font-bold text-[hsl(var(--quimica))]`}>
                    {state.result.finalValue}
                  </div>
                  <div className={`${isMobile ? 'text-base' : 'text-lg'} text-muted-foreground`}>
                    {state.result.unit}
                  </div>
                </div>
                
                {state.result.warning && (
                  <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-300">
                      {state.result.warning}
                    </div>
                  </div>
                )}
                
                {/* Gráfica */}
                {state.result.chartData && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Visualización
                    </h4>
                    <div className={isMobile ? "h-48" : "h-64"}>
                      {renderChart()}
                    </div>
                  </div>
                )}
                
                {/* Escala de pH */}
                {state.calcType === 'ph' && renderPHScale()}
              </Card>

              {/* Procedimiento */}
              <Card className="p-4 md:p-5 rounded-2xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Beaker className="h-4 w-4" />
                  Procedimiento Detallado
                </h3>
                <div className="space-y-3 md:space-y-4">
                  {state.result.steps.map((step, idx) => (
                    <div key={idx} className="p-3 md:p-4 bg-muted/50 rounded-xl border border-border">
                      <div className="flex items-start gap-3 mb-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className={`${isMobile ? 'text-sm' : ''} font-medium`}>{step.label}</div>
                          {step.explanation && (
                            <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}>
                              {step.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-9 space-y-1">
                        <div className={`font-mono ${isMobile ? 'text-xs' : 'text-sm'} bg-background px-3 py-2 rounded-md`}>
                          <div className="text-muted-foreground">{step.formula}</div>
                          <div className="text-primary font-semibold mt-1">{step.result}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Panel derecho: Herramientas y Historial (oculto en móvil si no hay espacio) */}
        {(!isMobile || state.showAdvanced) && (
          <div className="space-y-4">
            {/* Calculadoras rápidas */}
            <Card className="p-4 rounded-2xl">
              <h3 className="font-semibold mb-3">Calculadoras Rápidas</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => dispatch({ type: 'SET_CALC_TYPE', payload: "ph" })}
                >
                  <Droplets className="h-4 w-4 mr-2" />
                  <span className={isMobile ? 'text-xs' : ''}>pH de buffer</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => dispatch({ type: 'SET_CALC_TYPE', payload: "molarity" })}
                >
                  <Scale className="h-4 w-4 mr-2" />
                  <span className={isMobile ? 'text-xs' : ''}>Normalidad</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => dispatch({ type: 'SET_CALC_TYPE', payload: "conversion" })}
                >
                  <Atom className="h-4 w-4 mr-2" />
                  <span className={isMobile ? 'text-xs' : ''}>Reactivo limitante</span>
                </Button>
              </div>
            </Card>

            {/* Historial */}
            {state.history.length > 0 && (
              <Card className="p-4 rounded-2xl">
                <h3 className="font-semibold mb-3">Historial</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {state.history.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => dispatch({ type: 'SET_RESULT', payload: item })}
                    >
                      <div className="flex justify-between items-center">
                        <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium truncate`}>
                          {item.title}
                        </div>
                        <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>
                          {item.unit}
                        </div>
                      </div>
                      <div className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-[hsl(var(--quimica))]`}>
                        {item.finalValue}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Constantes comunes */}
            <Card className="p-4 rounded-2xl">
              <h3 className="font-semibold mb-3">Constantes Químicas</h3>
              <div className={`${isMobile ? 'space-y-1 text-xs' : 'space-y-2 text-sm'}`}>
                <div className="flex justify-between">
                  <span>R (gas ideal)</span>
                  <code className="text-muted-foreground">0.0821 L·atm/mol·K</code>
                </div>
                <div className="flex justify-between">
                  <span>Kw (25°C)</span>
                  <code className="text-muted-foreground">1.0 × 10⁻¹⁴</code>
                </div>
                <div className="flex justify-between">
                  <span>N<sub>A</sub> (Avogadro)</span>
                  <code className="text-muted-foreground">6.022 × 10²³</code>
                </div>
                <div className="flex justify-between">
                  <span>Temperatura estándar</span>
                  <code className="text-muted-foreground">298 K (25°C)</code>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Footer informativo */}
      <div className={`text-center ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground pt-4 border-t`}>
        <p>
          Calculadora Química Avanzada • 
          <span className="mx-2">|</span>
          Coeficientes de actividad incluidos •
          <span className="mx-2">|</span>
          {isMobile ? '📱' : '💻'} {isMobile ? 'Modo móvil' : 'Modo escritorio'}
        </p>
      </div>
    </div>
  );
}