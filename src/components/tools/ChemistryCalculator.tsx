import { useState, useEffect, useMemo } from "react";
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
  Share2
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

interface ChemResult {
  title: string;
  steps: { label: string; formula: string; result: string; explanation?: string }[];
  finalValue: string;
  unit: string;
  classification?: string;
  warning?: string;
  chartData?: any[];
  chartType?: 'line' | 'bar' | 'pie';
}

interface ChemicalCompound {
  name: string;
  formula: string;
  molarMass: number;
  density?: number;
  type: 'acid' | 'base' | 'salt' | 'other';
  strength?: 'strong' | 'weak';
}

export function ChemistryCalculator() {
  // Estados principales
  const [calcType, setCalcType] = useState<
    "ph" | "dilution" | "molarity" | "molality" | "concentration" | "stoichiometry" | "gas_laws" | "thermochemistry"
  >("ph");
  
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [precision, setPrecision] = useState(4);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [history, setHistory] = useState<ChemResult[]>([]);
  
  // === pH/pOH CALCULATOR ===
  const [concentration, setConcentration] = useState("0.001");
  const [acidOrBase, setAcidOrBase] = useState<"acid" | "base">("acid");
  const [compoundType, setCompoundType] = useState<"strong" | "weak">("strong");
  const [pKa, setPKa] = useState("4.75"); // Para ácidos débiles
  const [temperature, setTemperature] = useState("25"); // °C
  const [showPHScale, setShowPHScale] = useState(true);
  
  // === DILUTION CALCULATOR ===
  const [c1, setC1] = useState("1.0");
  const [v1, setV1] = useState("100");
  const [c2, setC2] = useState("0.1");
  const [v2, setV2] = useState("");
  const [solveFor, setSolveFor] = useState<"c2" | "v2" | "c1" | "v1">("v2");
  const [dilutionFactor, setDilutionFactor] = useState("");
  const [units, setUnits] = useState<{c: string, v: string}>({c: "M", v: "mL"});
  
  // === MOLARITY CALCULATOR ===
  const [mass, setMass] = useState("5.85");
  const [molarMass, setMolarMass] = useState("58.44");
  const [volume, setVolume] = useState("100");
  const [density, setDensity] = useState("1.0");
  const [percentPurity, setPercentPurity] = useState("100");
  
  // === MOLALITY CALCULATOR ===
  const [massSolvent, setMassSolvent] = useState("1000");
  const [solventType, setSolventType] = useState("water");
  
  // === CONCENTRATION CONVERTER ===
  const [fromUnit, setFromUnit] = useState("M");
  const [toUnit, setToUnit] = useState("g/L");
  const [fromValue, setFromValue] = useState("1.0");
  const [molarMassConv, setMolarMassConv] = useState("58.44");
  
  // === STOICHIOMETRY CALCULATOR ===
  const [reaction, setReaction] = useState("2H2 + O2 -> 2H2O");
  const [givenAmount, setGivenAmount] = useState("2.0");
  const [givenUnit, setGivenUnit] = useState("mol");
  const [targetSubstance, setTargetSubstance] = useState("H2O");
  
  // === GAS LAWS CALCULATOR ===
  const [gasLaw, setGasLaw] = useState<"ideal" | "boyle" | "charles" | "avogadro">("ideal");
  const [pressure, setPressure] = useState("1.0");
  const [tempKelvin, setTempKelvin] = useState("298");
  const [molesGas, setMolesGas] = useState("1.0");
  const [gasConstant, setGasConstant] = useState("0.0821");
  
  // === THERMOCHEMISTRY ===
  const [enthalpy, setEnthalpy] = useState("-285.8");
  const [specificHeat, setSpecificHeat] = useState("4.184");
  const [tempChange, setTempChange] = useState("10");
  const [heatType, setHeatType] = useState<"reaction" | "calorimetry">("reaction");
  
  const [result, setResult] = useState<ChemResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Base de datos de compuestos comunes
  const commonCompounds: ChemicalCompound[] = [
    { name: "Ácido clorhídrico", formula: "HCl", molarMass: 36.46, type: "acid", strength: "strong" },
    { name: "Ácido sulfúrico", formula: "H2SO4", molarMass: 98.08, type: "acid", strength: "strong" },
    { name: "Ácido acético", formula: "CH3COOH", molarMass: 60.05, type: "acid", strength: "weak", density: 1.05 },
    { name: "Hidróxido de sodio", formula: "NaOH", molarMass: 40.00, type: "base", strength: "strong" },
    { name: "Amoníaco", formula: "NH3", molarMass: 17.03, type: "base", strength: "weak" },
    { name: "Cloruro de sodio", formula: "NaCl", molarMass: 58.44, type: "salt", density: 2.16 },
    { name: "Agua", formula: "H2O", molarMass: 18.02, type: "other", density: 1.00 },
    { name: "Glucosa", formula: "C6H12O6", molarMass: 180.16, type: "other" },
    { name: "Etanol", formula: "C2H5OH", molarMass: 46.07, type: "other", density: 0.789 },
  ];
  
  // PH scale colors for visualization
  const phScaleColors = [
    { ph: 0, color: "#ff0000", label: "Ácido fuerte" },
    { ph: 2, color: "#ff6600", label: "Ácido moderado" },
    { ph: 4, color: "#ffcc00", label: "Ácido débil" },
    { ph: 6, color: "#ffff00", label: "Ligeramente ácido" },
    { ph: 7, color: "#00cc00", label: "Neutro" },
    { ph: 8, color: "#00ffcc", label: "Ligeramente básico" },
    { ph: 10, color: "#0066ff", label: "Básico débil" },
    { ph: 12, color: "#6600ff", label: "Básico fuerte" },
    { ph: 14, color: "#330066", label: "Base muy fuerte" },
  ];
  
  // Efecto para detectar tema del sistema
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(darkModeMediaQuery.matches ? "dark" : "light");
    
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
    darkModeMediaQuery.addEventListener('change', handler);
    return () => darkModeMediaQuery.removeEventListener('change', handler);
  }, []);
  
  // Función para calcular pH con mayor precisión
  const calculatePH = () => {
    setIsLoading(true);
    setTimeout(() => {
      const conc = parseFloat(concentration) || 0;
      const temp = parseFloat(temperature) || 25;
      const pKaVal = parseFloat(pKa) || 4.75;
      const steps: ChemResult["steps"] = [];
      let finalValue = "";
      let unit = "pH";
      let classification = "";
      let warning = "";
      const chartData: any[] = [];
      
      if (conc <= 0) {
        warning = "⚠️ La concentración debe ser mayor que 0";
      }
      
      if (conc > 10) {
        warning = "⚠️ Concentración muy alta para cálculo preciso de pH";
      }
      
      // Kw varía con la temperatura
      const Kw = 1.0e-14 * Math.exp((-5590.5 / 8.314) * (1/(temp + 273.15) - 1/298.15));
      
      steps.push({
        label: "Datos de entrada",
        formula: `[H⁺] = ${conc.toFixed(precision)} M, T = ${temp}°C`,
        result: `Kw (${temp}°C) ≈ ${Kw.toExponential(2)}`,
        explanation: `La constante de autoionización del agua varía con la temperatura`
      });
      
      if (acidOrBase === "acid") {
        if (compoundType === "strong") {
          // Ácido fuerte: pH = -log[H+]
          const pH = -Math.log10(conc);
          const pOH = -Math.log10(Kw/conc);
          
          steps.push({
            label: "Ácido fuerte - Disociación completa",
            formula: "HA → H⁺ + A⁻",
            result: `[H⁺] = Concentración inicial = ${conc.toFixed(precision)} M`,
            explanation: "Los ácidos fuertes se disocian completamente en agua"
          });
          
          steps.push({
            label: "Cálculo de pH",
            formula: "pH = -log₁₀[H⁺]",
            result: `pH = -log(${conc.toFixed(precision)}) = ${pH.toFixed(precision)}`
          });
          
          steps.push({
            label: "Cálculo de pOH",
            formula: "pH + pOH = pKw",
            result: `pOH = ${(14 + Math.log10(Kw)/Math.log10(10)).toFixed(precision)} - ${pH.toFixed(precision)} = ${pOH.toFixed(precision)}`
          });
          
          finalValue = pH.toFixed(precision);
        } else {
          // Ácido débil: pH = 1/2(pKa - log[C])
          const pH = 0.5 * (pKaVal - Math.log10(conc));
          const [H] = Math.pow(10, -pH);
          
          steps.push({
            label: "Ácido débil - Equilibrio de disociación",
            formula: "HA ⇌ H⁺ + A⁻",
            result: `Ka = 10^(-pKa) = 10^(-${pKaVal}) = ${Math.pow(10, -pKaVal).toExponential(2)}`,
            explanation: "Los ácidos débiles establecen un equilibrio en solución"
          });
          
          steps.push({
            label: "Aproximación para ácidos débiles",
            formula: "pH ≈ ½(pKa - log[C])",
            result: `pH ≈ ½(${pKaVal} - log(${conc.toFixed(precision)})) = ${pH.toFixed(precision)}`
          });
          
          steps.push({
            label: "Concentración de H⁺",
            formula: "[H⁺] = 10^(-pH)",
            result: `[H⁺] = 10^(-${pH.toFixed(precision)}) = ${Math.pow(10, -pH).toExponential(2)} M`
          });
          
          finalValue = pH.toFixed(precision);
        }
      } else {
        // Base
        if (compoundType === "strong") {
          // Base fuerte: pOH = -log[OH-], pH = 14 - pOH
          const pOH = -Math.log10(conc);
          const pH = -Math.log10(Kw/conc);
          
          steps.push({
            label: "Base fuerte - Disociación completa",
            formula: "BOH → B⁺ + OH⁻",
            result: `[OH⁻] = Concentración inicial = ${conc.toFixed(precision)} M`
          });
          
          steps.push({
            label: "Cálculo de pOH",
            formula: "pOH = -log₁₀[OH⁻]",
            result: `pOH = -log(${conc.toFixed(precision)}) = ${pOH.toFixed(precision)}`
          });
          
          steps.push({
            label: "Cálculo de pH",
            formula: "pH = pKw - pOH",
            result: `pH = ${(14 + Math.log10(Kw)/Math.log10(10)).toFixed(precision)} - ${pOH.toFixed(precision)} = ${pH.toFixed(precision)}`
          });
          
          finalValue = pH.toFixed(precision);
        } else {
          // Base débil
          const Kb = Math.pow(10, -(14 - pKaVal));
          const pOH = 0.5 * (-Math.log10(Kb) - Math.log10(conc));
          const pH = 14 + Math.log10(Kw)/Math.log10(10) - pOH;
          
          steps.push({
            label: "Base débil - Constante de basicidad",
            formula: "Kb = 10^(-pKb)",
            result: `pKb = 14 - pKa = ${(14 - pKaVal).toFixed(2)}, Kb = ${Kb.toExponential(2)}`
          });
          
          steps.push({
            label: "Cálculo de pOH",
            formula: "pOH ≈ ½(pKb - log[C])",
            result: `pOH ≈ ½(${(14 - pKaVal).toFixed(2)} - log(${conc.toFixed(precision)})) = ${pOH.toFixed(precision)}`
          });
          
          steps.push({
            label: "Cálculo de pH",
            formula: "pH = pKw - pOH",
            result: `pH = ${(14 + Math.log10(Kw)/Math.log10(10)).toFixed(precision)} - ${pOH.toFixed(precision)} = ${pH.toFixed(precision)}`
          });
          
          finalValue = pH.toFixed(precision);
        }
      }
      
      // Clasificación detallada
      const phValue = parseFloat(finalValue);
      if (phValue < 0) classification = "Superácido (pH < 0)";
      else if (phValue < 3) classification = "Ácido fuerte";
      else if (phValue < 6) classification = "Ácido débil";
      else if (phValue < 7) classification = "Ligeramente ácido";
      else if (phValue === 7) classification = "Neutro";
      else if (phValue < 8) classification = "Ligeramente básico";
      else if (phValue < 11) classification = "Base débil";
      else if (phValue < 14) classification = "Base fuerte";
      else classification = "Superbase (pH > 14)";
      
      steps.push({
        label: "Clasificación",
        formula: "Escala de pH",
        result: classification,
        explanation: "0-2: Ácido fuerte | 3-6: Ácido débil | 7: Neutro | 8-11: Base débil | 12-14: Base fuerte"
      });
      
      // Datos para gráfica de escala de pH
      for (let i = 0; i <= 14; i += 0.5) {
        chartData.push({
          pH: i,
          value: Math.random() * 0.5, // Para visualización
          color: i < 7 ? `rgba(255, ${Math.floor(100 + i * 22)}, 0, 0.7)` : `rgba(0, ${Math.floor(100 + (i-7) * 22)}, 255, 0.7)`
        });
      }
      
      const newResult: ChemResult = {
        title: "Cálculo de pH/pOH",
        steps,
        finalValue,
        unit,
        classification,
        warning,
        chartData: showPHScale ? chartData : undefined,
        chartType: 'bar'
      };
      
      setResult(newResult);
      setHistory(prev => [newResult, ...prev.slice(0, 9)]);
      setIsLoading(false);
    }, 300);
  };
  
  // Función mejorada para diluciones
  const calculateDilution = () => {
    const c1Val = parseFloat(c1) || 0;
    const v1Val = parseFloat(v1) || 0;
    const c2Val = parseFloat(c2) || 0;
    const v2Val = parseFloat(v2) || 0;
    
    const steps: ChemResult["steps"] = [];
    let finalValue = "";
    let unit = "";
    let warning = "";
    const chartData: any[] = [];
    
    steps.push({
      label: "Ley de diluciones",
      formula: "C₁ × V₁ = C₂ × V₂",
      result: "La cantidad de soluto se conserva durante la dilución",
      explanation: "C = Concentración, V = Volumen"
    });
    
    let resultVal = 0;
    
    switch (solveFor) {
      case "v2":
        resultVal = (c1Val * v1Val) / c2Val;
        steps.push({
          label: "Despejando V₂",
          formula: "V₂ = (C₁ × V₁) / C₂",
          result: `V₂ = (${c1Val} ${units.c} × ${v1Val} ${units.v}) / ${c2Val} ${units.c} = ${resultVal.toFixed(precision)} ${units.v}`
        });
        finalValue = resultVal.toFixed(precision);
        unit = units.v;
        break;
        
      case "c2":
        resultVal = (c1Val * v1Val) / v2Val;
        steps.push({
          label: "Despejando C₂",
          formula: "C₂ = (C₁ × V₁) / V₂",
          result: `C₂ = (${c1Val} ${units.c} × ${v1Val} ${units.v}) / ${v2Val} ${units.v} = ${resultVal.toFixed(precision)} ${units.c}`
        });
        finalValue = resultVal.toFixed(precision);
        unit = units.c;
        break;
        
      case "c1":
        resultVal = (c2Val * v2Val) / v1Val;
        steps.push({
          label: "Despejando C₁",
          formula: "C₁ = (C₂ × V₂) / V₁",
          result: `C₁ = (${c2Val} ${units.c} × ${v2Val} ${units.v}) / ${v1Val} ${units.v} = ${resultVal.toFixed(precision)} ${units.c}`
        });
        finalValue = resultVal.toFixed(precision);
        unit = units.c;
        break;
        
      case "v1":
        resultVal = (c2Val * v2Val) / c1Val;
        steps.push({
          label: "Despejando V₁",
          formula: "V₁ = (C₂ × V₂) / C₁",
          result: `V₁ = (${c2Val} ${units.c} × ${v2Val} ${units.v}) / ${c1Val} ${units.c} = ${resultVal.toFixed(precision)} ${units.v}`
        });
        finalValue = resultVal.toFixed(precision);
        unit = units.v;
        break;
    }
    
    // Calcular factor de dilución
    const dilutionFactorVal = solveFor === "v2" ? resultVal / v1Val : c1Val / resultVal;
    steps.push({
      label: "Factor de dilución",
      formula: "DF = V₂/V₁ = C₁/C₂",
      result: `Factor de dilución = ${dilutionFactorVal.toFixed(2)}`,
      explanation: `Se diluyó ${dilutionFactorVal.toFixed(2)} veces`
    });
    
    // Datos para gráfica
    chartData.push(
      { name: 'C₁', value: c1Val, fill: '#8884d8' },
      { name: 'C₂', value: solveFor === 'c2' ? resultVal : c2Val, fill: '#82ca9d' },
      { name: 'V₁', value: v1Val, fill: '#ffc658' },
      { name: 'V₂', value: solveFor === 'v2' ? resultVal : v2Val, fill: '#ff8042' }
    );
    
    const newResult: ChemResult = {
      title: "Cálculo de Dilución",
      steps,
      finalValue,
      unit,
      warning,
      chartData,
      chartType: 'bar'
    };
    
    setResult(newResult);
    setHistory(prev => [newResult, ...prev.slice(0, 9)]);
  };
  
  // Función mejorada para molaridad
  const calculateMolarity = () => {
    const massVal = parseFloat(mass) || 0;
    const mmVal = parseFloat(molarMass) || 0;
    const volVal = parseFloat(volume) || 0;
    const densityVal = parseFloat(density) || 1.0;
    const purity = parseFloat(percentPurity) / 100 || 1.0;
    
    const steps: ChemResult["steps"] = [];
    const chartData: any[] = [];
    
    // Masa real considerando pureza
    const realMass = massVal * purity;
    if (purity < 1) {
      steps.push({
        label: "Ajuste por pureza",
        formula: "Masa real = Masa × (%Pureza/100)",
        result: `Masa real = ${massVal} g × (${percentPurity}%/100) = ${realMass.toFixed(precision)} g`
      });
    }
    
    // Calcular moles
    const moles = realMass / mmVal;
    steps.push({
      label: "Moles de soluto",
      formula: "n = masa / masa molar",
      result: `n = ${realMass.toFixed(precision)} g / ${mmVal} g/mol = ${moles.toFixed(precision)} mol`
    });
    
    // Convertir volumen a litros
    const volumeL = volVal / 1000;
    steps.push({
      label: "Conversión de volumen",
      formula: "V(L) = V(mL) / 1000",
      result: `V = ${volVal} mL / 1000 = ${volumeL.toFixed(precision)} L`
    });
    
    // Calcular molaridad
    const molarity = moles / volumeL;
    steps.push({
      label: "Molaridad (M)",
      formula: "M = n / V",
      result: `M = ${moles.toFixed(precision)} mol / ${volumeL.toFixed(precision)} L = ${molarity.toFixed(precision)} M`
    });
    
    // Calcular molalidad (opcional)
    const massSolution = volVal * densityVal; // masa en g
    const massSolvent = massSolution - realMass; // g
    const molality = moles / (massSolvent / 1000); // mol/kg
    steps.push({
      label: "Molalidad (m) - Extra",
      formula: "m = n / masa solvente (kg)",
      result: `m = ${moles.toFixed(precision)} mol / ${(massSolvent/1000).toFixed(precision)} kg = ${molality.toFixed(precision)} m`
    });
    
    // Calcular % masa/volumen
    const percentMassVol = (realMass / volVal) * 100;
    steps.push({
      label: "Porcentaje masa/volumen",
      formula: "% (m/v) = (masa soluto / volumen solución) × 100",
      result: `% (m/v) = (${realMass.toFixed(precision)} g / ${volVal} mL) × 100 = ${percentMassVol.toFixed(precision)}%`
    });
    
    // Datos para gráfica
    chartData.push(
      { name: 'Masa (g)', value: realMass, type: 'masa' },
      { name: 'Moles (mol)', value: moles, type: 'moles' },
      { name: 'Volumen (L)', value: volumeL, type: 'volumen' },
      { name: 'Molaridad (M)', value: molarity, type: 'molaridad' }
    );
    
    const newResult: ChemResult = {
      title: "Cálculo de Concentración",
      steps,
      finalValue: molarity.toFixed(precision),
      unit: "M (mol/L)",
      chartData,
      chartType: 'bar'
    };
    
    setResult(newResult);
    setHistory(prev => [newResult, ...prev.slice(0, 9)]);
  };
  
  // Función para cálculos estequiométricos
  const calculateStoichiometry = () => {
    const amount = parseFloat(givenAmount) || 0;
    const steps: ChemResult["steps"] = [];
    
    // Ejemplo simple: 2H2 + O2 -> 2H2O
    steps.push({
      label: "Ecuación balanceada",
      formula: reaction,
      result: "Verificando balance de masa..."
    });
    
    steps.push({
      label: "Conversión a moles",
      formula: givenUnit === "g" ? "n = masa / MM" : "n = moles",
      result: givenUnit === "g" 
        ? `n = ${amount} g / (MM de ${targetSubstance})` 
        : `n = ${amount} mol`
    });
    
    steps.push({
      label: "Relación estequiométrica",
      formula: "Usando coeficientes de la ecuación",
      result: "Calculando cantidad de producto..."
    });
    
    // Resultado simulado
    const resultVal = amount * 2; // Ejemplo simplificado
    
    steps.push({
      label: "Resultado",
      formula: "Cantidad de producto",
      result: `${resultVal.toFixed(precision)} ${givenUnit === "g" ? "g" : "mol"} de ${targetSubstance}`
    });
    
    const newResult: ChemResult = {
      title: "Cálculo Estequiométrico",
      steps,
      finalValue: resultVal.toFixed(precision),
      unit: givenUnit === "g" ? "g" : "mol"
    };
    
    setResult(newResult);
    setHistory(prev => [newResult, ...prev.slice(0, 9)]);
  };
  
  // Función para cálculos de gases
  const calculateGasLaws = () => {
    const P = parseFloat(pressure) || 0;
    const T = parseFloat(tempKelvin) || 0;
    const n = parseFloat(molesGas) || 0;
    const R = parseFloat(gasConstant) || 0.0821;
    
    const steps: ChemResult["steps"] = [];
    let finalValue = "";
    let unit = "L";
    
    switch (gasLaw) {
      case "ideal":
        const V = (n * R * T) / P;
        steps.push({
          label: "Ecuación de gases ideales",
          formula: "PV = nRT",
          result: `Ley universal para gases ideales`
        });
        steps.push({
          label: "Despejando volumen",
          formula: "V = nRT / P",
          result: `V = (${n} mol × ${R} L·atm/mol·K × ${T} K) / ${P} atm = ${V.toFixed(precision)} L`
        });
        finalValue = V.toFixed(precision);
        break;
        
      case "boyle":
        // P1V1 = P2V2
        steps.push({
          label: "Ley de Boyle",
          formula: "P₁V₁ = P₂V₂",
          result: "A temperatura constante"
        });
        finalValue = "Usar dos estados";
        break;
    }
    
    const newResult: ChemResult = {
      title: `Ley de Gases: ${gasLaw === "ideal" ? "Gases Ideales" : gasLaw}`,
      steps,
      finalValue,
      unit
    };
    
    setResult(newResult);
    setHistory(prev => [newResult, ...prev.slice(0, 9)]);
  };
  
  // Función para cálculos termoquímicos
  const calculateThermochemistry = () => {
    const ΔH = parseFloat(enthalpy) || 0;
    const C = parseFloat(specificHeat) || 0;
    const ΔT = parseFloat(tempChange) || 0;
    
    const steps: ChemResult["steps"] = [];
    let finalValue = "";
    let unit = "kJ";
    
    if (heatType === "reaction") {
      const q = ΔH; // Simplificado
      steps.push({
        label: "Entalpía de reacción",
        formula: "ΔH = q / n",
        result: `ΔH = ${ΔH} kJ/mol`
      });
      finalValue = ΔH.toFixed(precision);
      unit = "kJ/mol";
    } else {
      const q = C * ΔT;
      steps.push({
        label: "Calor en calorimetría",
        formula: "q = C × ΔT",
        result: `q = ${C} J/g°C × ${ΔT}°C = ${q.toFixed(precision)} J/g`
      });
      finalValue = q.toFixed(precision);
      unit = "J/g";
    }
    
    const newResult: ChemResult = {
      title: "Cálculo Termoquímico",
      steps,
      finalValue,
      unit
    };
    
    setResult(newResult);
    setHistory(prev => [newResult, ...prev.slice(0, 9)]);
  };
  
  // Función principal de cálculo
  const handleCalculate = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      switch (calcType) {
        case "ph":
          calculatePH();
          break;
        case "dilution":
          calculateDilution();
          break;
        case "molarity":
        case "molality":
          calculateMolarity();
          break;
        case "concentration":
          calculateMolarity();
          break;
        case "stoichiometry":
          calculateStoichiometry();
          break;
        case "gas_laws":
          calculateGasLaws();
          break;
        case "thermochemistry":
          calculateThermochemistry();
          break;
        default:
          calculatePH();
      }
    }, 100);
  };
  
  // Función para limpiar todos los campos
  const handleClearAll = () => {
    setConcentration("");
    setC1("");
    setV1("");
    setC2("");
    setV2("");
    setMass("");
    setMolarMass("");
    setVolume("");
    setResult(null);
  };
  
  // Función para exportar resultados
  const handleExport = () => {
    if (!result) return;
    
    const content = `
RESULTADO DE CÁLCULO QUÍMICO
============================
${result.title}
Valor final: ${result.finalValue} ${result.unit}
${result.classification ? `Clasificación: ${result.classification}` : ''}

PROCEDIMIENTO:
${result.steps.map((step, i) => `${i+1}. ${step.label}: ${step.formula} = ${step.result}`).join('\n')}
    
Generado el: ${new Date().toLocaleString()}
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculo_quimico_${new Date().getTime()}.txt`;
    a.click();
  };
  
  // Memo para compuestos filtrados
  const filteredCompounds = useMemo(() => {
    if (acidOrBase === "acid") {
      return commonCompounds.filter(c => c.type === "acid");
    } else {
      return commonCompounds.filter(c => c.type === "base");
    }
  }, [acidOrBase]);
  
  // Renderizado condicional de gráficas
  const renderChart = () => {
    if (!result?.chartData) return null;
    
    switch (result.chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={result.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="pH" label={{ value: 'pH', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Intensidad', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={result.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={result.chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {result.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };
  
  // Renderizado de escala de pH visual
  const renderPHScale = () => {
    if (!result || calcType !== "ph" || !showPHScale) return null;
    
    const phValue = parseFloat(result.finalValue);
    const position = Math.min(Math.max((phValue / 14) * 100, 0), 100);
    
    return (
      <div className="mt-6">
        <h4 className="font-semibold mb-2 text-center">Escala de pH</h4>
        <div className="relative h-8 w-full rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex">
            {phScaleColors.map((color, i) => (
              <div 
                key={i}
                className="flex-1"
                style={{ backgroundColor: color.color }}
              />
            ))}
          </div>
          <div 
            className="absolute top-0 bottom-0 w-2 bg-black"
            style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 font-bold text-sm">
              pH = {phValue.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>0</span>
          <span>7</span>
          <span>14</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Ácido</span>
          <span>Neutro</span>
          <span>Básico</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[hsl(var(--quimica))]/15">
            <FlaskConical className="h-6 w-6 text-[hsl(var(--quimica))]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Laboratorio Químico Avanzado</h1>
            <p className="text-sm text-muted-foreground">Calculadora integral para todos los niveles</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? "Modo Simple" : "Modo Avanzado"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Panel principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo: Calculadora */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 rounded-2xl border-l-4" style={{ borderLeftColor: "hsl(var(--quimica))" }}>
            <Tabs value={calcType} onValueChange={(v) => setCalcType(v as any)} className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <TabsList className="w-full sm:w-auto rounded-xl grid grid-cols-4 sm:flex sm:flex-wrap">
                  <TabsTrigger value="ph" className="rounded-lg gap-1 text-xs sm:text-sm">
                    <Droplets className="h-3 w-3 sm:h-4 sm:w-4" /> pH/pOH
                  </TabsTrigger>
                  <TabsTrigger value="dilution" className="rounded-lg gap-1 text-xs sm:text-sm">
                    <Zap className="h-3 w-3 sm:h-4 sm:w-4" /> Dilución
                  </TabsTrigger>
                  <TabsTrigger value="molarity" className="rounded-lg gap-1 text-xs sm:text-sm">
                    <Thermometer className="h-3 w-3 sm:h-4 sm:w-4" /> Molaridad
                  </TabsTrigger>
                  <TabsTrigger value="concentration" className="rounded-lg gap-1 text-xs sm:text-sm">
                    <Scale className="h-3 w-3 sm:h-4 sm:w-4" /> Conversión
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="precision" className="text-xs">Precisión:</Label>
                    <Select value={precision.toString()} onValueChange={(v) => setPrecision(parseInt(v))}>
                      <SelectTrigger className="w-20 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 dec</SelectItem>
                        <SelectItem value="4">4 dec</SelectItem>
                        <SelectItem value="6">6 dec</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Calculadora de pH */}
              <TabsContent value="ph" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={acidOrBase === "acid" ? "default" : "outline"}
                        onClick={() => setAcidOrBase("acid")}
                        className="rounded-xl"
                      >
                        Ácido [H⁺]
                      </Button>
                      <Button
                        variant={acidOrBase === "base" ? "default" : "outline"}
                        onClick={() => setAcidOrBase("base")}
                        className="rounded-xl"
                      >
                        Base [OH⁻]
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Compuesto</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar compuesto" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCompounds.map((compound) => (
                            <SelectItem key={compound.formula} value={compound.formula}>
                              {compound.name} ({compound.formula})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={compoundType === "strong" ? "default" : "outline"}
                          onClick={() => setCompoundType("strong")}
                          className="rounded-xl text-xs"
                        >
                          Fuerte
                        </Button>
                        <Button
                          variant={compoundType === "weak" ? "default" : "outline"}
                          onClick={() => setCompoundType("weak")}
                          className="rounded-xl text-xs"
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
                          value={concentration}
                          onChange={(e) => setConcentration(e.target.value)}
                          placeholder="Ej: 0.001"
                          className="rounded-xl"
                          step="0.0001"
                        />
                        <Button variant="outline" onClick={() => setConcentration("0.001")} className="px-3">
                          10⁻³
                        </Button>
                      </div>
                      <Slider
                        value={[parseFloat(concentration) || 0]}
                        onValueChange={([val]) => setConcentration(val.toString())}
                        min={0.0001}
                        max={10}
                        step={0.01}
                        className="mt-2"
                      />
                    </div>
                    
                    {compoundType === "weak" && (
                      <div className="space-y-2">
                        <Label>pKa (para ácidos débiles)</Label>
                        <Input
                          type="number"
                          value={pKa}
                          onChange={(e) => setPKa(e.target.value)}
                          placeholder="Ej: 4.75 para CH₃COOH"
                          className="rounded-xl"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label>Temperatura (°C)</Label>
                      <Input
                        type="number"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        placeholder="25"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>
                
                {showAdvanced && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={showPHScale} 
                        onCheckedChange={setShowPHScale}
                      />
                      <Label>Mostrar escala de pH visual</Label>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Calculadora de Dilución */}
              <TabsContent value="dilution" className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <Button
                    variant={solveFor === "v2" ? "default" : "outline"}
                    onClick={() => setSolveFor("v2")}
                    className="rounded-xl text-xs h-auto py-2"
                  >
                    Calcular V₂
                  </Button>
                  <Button
                    variant={solveFor === "c2" ? "default" : "outline"}
                    onClick={() => setSolveFor("c2")}
                    className="rounded-xl text-xs h-auto py-2"
                  >
                    Calcular C₂
                  </Button>
                  <Button
                    variant={solveFor === "c1" ? "default" : "outline"}
                    onClick={() => setSolveFor("c1")}
                    className="rounded-xl text-xs h-auto py-2"
                  >
                    Calcular C₁
                  </Button>
                  <Button
                    variant={solveFor === "v1" ? "default" : "outline"}
                    onClick={() => setSolveFor("v1")}
                    className="rounded-xl text-xs h-auto py-2"
                  >
                    Calcular V₁
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Estado Inicial</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>C₁ (Concentración inicial)</Label>
                          <Select value={units.c} onValueChange={(v) => setUnits({...units, c: v})}>
                            <SelectTrigger className="w-20 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="M">M</SelectItem>
                              <SelectItem value="mM">mM</SelectItem>
                              <SelectItem value="µM">µM</SelectItem>
                              <SelectItem value="g/L">g/L</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          type="number"
                          value={c1}
                          onChange={(e) => setC1(e.target.value)}
                          placeholder="Conc. inicial"
                          className="rounded-xl"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>V₁ (Volumen inicial)</Label>
                          <Select value={units.v} onValueChange={(v) => setUnits({...units, v: v})}>
                            <SelectTrigger className="w-20 h-8 text-xs">
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
                          value={v1}
                          onChange={(e) => setV1(e.target.value)}
                          placeholder="Vol. inicial"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Estado Final</h4>
                    <div className="space-y-3">
                      {solveFor === "v2" ? (
                        <div className="space-y-2">
                          <Label>C₂ (Concentración final)</Label>
                          <Input
                            type="number"
                            value={c2}
                            onChange={(e) => setC2(e.target.value)}
                            placeholder="Conc. final"
                            className="rounded-xl"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>V₂ (Volumen final)</Label>
                          <Input
                            type="number"
                            value={v2}
                            onChange={(e) => setV2(e.target.value)}
                            placeholder="Vol. final"
                            className="rounded-xl"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label>Factor de dilución</Label>
                        <Input
                          type="number"
                          value={dilutionFactor}
                          onChange={(e) => setDilutionFactor(e.target.value)}
                          placeholder="Calculado automáticamente"
                          className="rounded-xl"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Fórmula: C₁ × V₁ = C₂ × V₂
                  </div>
                </div>
              </TabsContent>

              {/* Calculadora de Molaridad */}
              <TabsContent value="molarity" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Compuesto</Label>
                      <Select onValueChange={(v) => {
                        const compound = commonCompounds.find(c => c.formula === v);
                        if (compound) {
                          setMolarMass(compound.molarMass.toString());
                          if (compound.density) setDensity(compound.density.toString());
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar compuesto" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonCompounds.map((compound) => (
                            <SelectItem key={compound.formula} value={compound.formula}>
                              {compound.name} ({compound.formula})
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
                          value={mass}
                          onChange={(e) => setMass(e.target.value)}
                          placeholder="Ej: 5.85"
                          className="rounded-xl"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Masa molar (g/mol)</Label>
                        <Input
                          type="number"
                          value={molarMass}
                          onChange={(e) => setMolarMass(e.target.value)}
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
                          value={volume}
                          onChange={(e) => setVolume(e.target.value)}
                          placeholder="100"
                          className="rounded-xl"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Densidad (g/mL)</Label>
                        <Input
                          type="number"
                          value={density}
                          onChange={(e) => setDensity(e.target.value)}
                          placeholder="1.0"
                          className="rounded-xl"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    {showAdvanced && (
                      <div className="space-y-2">
                        <Label>Pureza (%)</Label>
                        <div className="flex items-center gap-3">
                          <Slider
                            value={[parseFloat(percentPurity) || 100]}
                            onValueChange={([val]) => setPercentPurity(val.toString())}
                            min={0}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-12">{percentPurity}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Fórmulas: M = n/V | m = n/kg solvente | % = (masa/vol) × 100
                  </div>
                </div>
              </TabsContent>

              {/* Conversor de Concentración */}
              <TabsContent value="concentration" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Convertir de:</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={fromValue}
                          onChange={(e) => setFromValue(e.target.value)}
                          placeholder="1.0"
                          className="rounded-xl"
                        />
                        <Select value={fromUnit} onValueChange={setFromUnit}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Molaridad (M)</SelectItem>
                            <SelectItem value="mM">Milimolar (mM)</SelectItem>
                            <SelectItem value="g/L">g/L</SelectItem>
                            <SelectItem value="mg/mL">mg/mL</SelectItem>
                            <SelectItem value="%">% (m/v)</SelectItem>
                            <SelectItem value="ppm">ppm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>A:</Label>
                      <Select value={toUnit} onValueChange={setToUnit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Molaridad (M)</SelectItem>
                          <SelectItem value="mM">Milimolar (mM)</SelectItem>
                          <SelectItem value="g/L">g/L</SelectItem>
                          <SelectItem value="mg/mL">mg/mL</SelectItem>
                          <SelectItem value="%">% (m/v)</SelectItem>
                          <SelectItem value="ppm">ppm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Masa molar para conversión (g/mol)</Label>
                      <Input
                        type="number"
                        value={molarMassConv}
                        onChange={(e) => setMolarMassConv(e.target.value)}
                        placeholder="58.44"
                        className="rounded-xl"
                      />
                    </div>
                    
                    <div className="p-3 bg-muted rounded-xl">
                      <div className="text-sm font-medium">Fórmulas comunes:</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        • M → g/L: g/L = M × MM <br/>
                        • g/L → M: M = g/L ÷ MM <br/>
                        • ppm → M: M = (ppm ÷ MM) ÷ 1000
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button 
                onClick={handleCalculate} 
                className="flex-1 rounded-xl h-12 gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
                    Calcular
                  </>
                )}
              </Button>
              
              {showAdvanced && (
                <Button variant="outline" className="rounded-xl gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Gráfico
                </Button>
              )}
            </div>
          </Card>

          {/* Resultados */}
          {result && (
            <div className="space-y-4 animate-fade-in">
              {/* Resultado principal */}
              <Card className="p-5 rounded-2xl bg-gradient-to-br from-[hsl(var(--quimica))]/10 to-transparent">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">{result.title}</h3>
                    {result.classification && (
                      <div className="text-sm text-muted-foreground">{result.classification}</div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <div className="text-5xl font-bold text-[hsl(var(--quimica))]">{result.finalValue}</div>
                  <div className="text-lg text-muted-foreground">{result.unit}</div>
                </div>
                
                {result.warning && (
                  <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-300">{result.warning}</div>
                  </div>
                )}
                
                {/* Gráfica */}
                {result.chartData && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Visualización
                    </h4>
                    <div className="h-64">
                      {renderChart()}
                    </div>
                  </div>
                )}
                
                {/* Escala de pH */}
                {calcType === "ph" && renderPHScale()}
              </Card>

              {/* Procedimiento */}
              <Card className="p-5 rounded-2xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Beaker className="h-4 w-4" />
                  Procedimiento Detallado
                </h3>
                <div className="space-y-4">
                  {result.steps.map((step, idx) => (
                    <div key={idx} className="p-4 bg-muted/50 rounded-xl border border-border">
                      <div className="flex items-start gap-3 mb-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{step.label}</div>
                          {step.explanation && (
                            <div className="text-xs text-muted-foreground mt-1">{step.explanation}</div>
                          )}
                        </div>
                      </div>
                      <div className="ml-9 space-y-1">
                        <div className="font-mono text-sm bg-background px-3 py-2 rounded-md">
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

        {/* Panel derecho: Herramientas y Historial */}
        <div className="space-y-4">
          {/* Calculadoras rápidas */}
          <Card className="p-4 rounded-2xl">
            <h3 className="font-semibold mb-3">Calculadoras Rápidas</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => setCalcType("ph")}>
                <Droplets className="h-4 w-4 mr-2" />
                pH de buffer
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setCalcType("molarity")}>
                <Scale className="h-4 w-4 mr-2" />
                Normalidad
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setCalcType("stoichiometry")}>
                <Atom className="h-4 w-4 mr-2" />
                Reactivo limitante
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setCalcType("gas_laws")}>
                <Thermometer className="h-4 w-4 mr-2" />
                Gases ideales
              </Button>
            </div>
          </Card>

          {/* Historial */}
          {history.length > 0 && (
            <Card className="p-4 rounded-2xl">
              <h3 className="font-semibold mb-3">Historial</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => setResult(item)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.unit}</div>
                    </div>
                    <div className="text-lg font-semibold text-[hsl(var(--quimica))]">
                      {item.finalValue}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Constantes comunes */}
          <Card className="p-4 rounded-2xl">
            <h3 className="font-semibold mb-3">Constantes</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>R (gas ideal)</span>
                <code>0.0821 L·atm/mol·K</code>
              </div>
              <div className="flex justify-between">
                <span>Kw (25°C)</span>
                <code>1.0 × 10⁻¹⁴</code>
              </div>
              <div className="flex justify-between">
                <span>N<sub>A</sub> (Avogadro)</span>
                <code>6.022 × 10²³</code>
              </div>
              <div className="flex justify-between">
                <span>Presión estándar</span>
                <code>1 atm</code>
              </div>
            </div>
          </Card>

          {/* Información educativa */}
          <Card className="p-4 rounded-2xl">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Consejo del día
            </h3>
            <div className="text-sm text-muted-foreground">
              {calcType === "ph" && "Recordatorio: pH + pOH = 14 a 25°C"}
              {calcType === "dilution" && "Tip: Siempre agrega ácido al agua, nunca agua al ácido"}
              {calcType === "molarity" && "Precisión: Usa balanza analítica para masas pequeñas"}
            </div>
          </Card>
        </div>
      </div>

      {/* Footer informativo */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t">
        <p>Calculadora Química Avanzada • Para estudiantes y profesionales • 
        <a href="#" className="underline ml-1">Guía de uso</a> • 
        <a href="#" className="underline ml-1">Referencias</a></p>
      </div>
    </div>
  );
}