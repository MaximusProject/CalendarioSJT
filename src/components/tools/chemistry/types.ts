// ============ TIPOS E INTERFACES QUÍMICA ============

export type CalcType = 
  | "solutions" 
  | "conversions" 
  | "stoichiometry" 
  | "gases" 
  | "thermo" 
  | "ph" 
  | "normality";

export type SolutionCalcType = 
  | "molarity" 
  | "molality" 
  | "molarFraction" 
  | "percentMass" 
  | "percentVolume" 
  | "percentMassVolume" 
  | "ppm" 
  | "dilution"
  | "normality";

export type ConversionType = 
  | "massToMoles" 
  | "molesToMass" 
  | "concentration" 
  | "temperature" 
  | "pressure" 
  | "volume";

export type GasLawType = 
  | "ideal" 
  | "boyle" 
  | "charles" 
  | "gayLussac" 
  | "combined" 
  | "dalton";

export type ThermoCalcType = 
  | "specificHeat" 
  | "reactionEnthalpy" 
  | "hess" 
  | "calorimetry";

export type AcidBaseType = "acid" | "base";
export type StrengthType = "strong" | "weak";
export type NormalityType = "acidBase" | "redox";
export type ChartType = 'line' | 'bar' | 'pie' | 'scatter';

// Paso de cálculo para procedimiento detallado
export interface CalculationStep {
  label: string;
  formula: string;
  substitution?: string;
  result: string;
  explanation?: string;
  isHighlight?: boolean;
}

// Resultado de cualquier cálculo
export interface ChemResult {
  title: string;
  steps: CalculationStep[];
  finalValue: string;
  unit: string;
  additionalResults?: { label: string; value: string; unit: string }[];
  classification?: string;
  warning?: string;
  tip?: string;
  chartData?: ChartDataPoint[];
  chartType?: ChartType;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
  color?: string;
}

// Elemento de la tabla periódica
export interface Element {
  symbol: string;
  name: string;
  nameEs: string;
  atomicNumber: number;
  atomicMass: number;
  category: string;
  oxidationStates: number[];
}

// Compuesto químico
export interface ChemicalCompound {
  id: string;
  name: string;
  formula: string;
  molarMass: number;
  density?: number;
  type: 'acid' | 'base' | 'salt' | 'organic' | 'inorganic' | 'gas';
  strength?: 'strong' | 'weak';
  pKa?: number[];
  pKb?: number[];
  nH?: number; // Número de H+ disociables
  nOH?: number; // Número de OH- disociables
  nE?: number; // Número de electrones en redox
  specificHeat?: number; // J/(g·°C)
  enthalpyFormation?: number; // kJ/mol
  color?: string;
  solubility?: string;
}

// Estado del formulario de soluciones
export interface SolutionFormState {
  calcType: SolutionCalcType;
  // Datos comunes
  mass: string;
  molarMass: string;
  volume: string;
  volumeUnit: 'L' | 'mL';
  density: string;
  purity: string;
  // Para dilución
  c1: string;
  v1: string;
  c2: string;
  v2: string;
  solveFor: 'c1' | 'v1' | 'c2' | 'v2';
  concentrationUnit: 'M' | 'N' | 'mM' | 'µM';
  // Para fracción molar
  massSolute: string;
  massSolvent: string;
  molarMassSolute: string;
  molarMassSolvent: string;
  // Para normalidad
  normalityType: NormalityType;
  equivalentFactor: string;
  // Compuesto seleccionado
  compoundId?: string;
}

// Estado del formulario de conversiones
export interface ConversionFormState {
  conversionType: ConversionType;
  fromValue: string;
  fromUnit: string;
  toUnit: string;
  molarMass: string;
  density: string;
}

// Estado del formulario de estequiometría
export interface StoichiometryFormState {
  reactants: { formula: string; moles: string; mass: string; coefficient: string }[];
  products: { formula: string; coefficient: string }[];
  givenReactant: number;
  givenAmount: string;
  givenUnit: 'g' | 'mol';
  purity: string;
  yield: string;
}

// Estado del formulario de gases
export interface GasFormState {
  gasLaw: GasLawType;
  // Estado 1
  p1: string;
  v1: string;
  t1: string;
  n1: string;
  // Estado 2 (para leyes combinadas)
  p2: string;
  v2: string;
  t2: string;
  // Para Dalton
  partialPressures: { gas: string; pressure: string }[];
  moleFractions: { gas: string; fraction: string }[];
  totalPressure: string;
  // Unidades
  pressureUnit: 'atm' | 'kPa' | 'mmHg' | 'bar';
  volumeUnit: 'L' | 'mL' | 'm³';
  temperatureUnit: 'K' | '°C';
  solveFor: 'P' | 'V' | 'T' | 'n';
}

// Estado del formulario de termoquímica
export interface ThermoFormState {
  calcType: ThermoCalcType;
  // Calorimetría
  mass: string;
  specificHeat: string;
  deltaT: string;
  ti: string;
  tf: string;
  // Entalpía
  enthalpyReaction: string;
  molesReacted: string;
  // Hess
  reactions: { equation: string; enthalpy: string; multiplier: string }[];
  // Datos de tabla
  useTableData: boolean;
  compoundId?: string;
}

// Estado del formulario de pH
export interface PHFormState {
  type: AcidBaseType;
  strength: StrengthType;
  concentration: string;
  pKa: string;
  temperature: string;
  useActivity: boolean;
  ionicStrength: string;
  compoundId?: string;
}
