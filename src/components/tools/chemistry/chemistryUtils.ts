import { 
  ChemResult, 
  CalculationStep, 
  SolutionFormState, 
  ConversionFormState,
  GasFormState,
  ThermoFormState,
  PHFormState,
  ChemicalCompound
} from './types';
import { 
  CONSTANTS, 
  COMPOUNDS, 
  ELEMENTS,
  TEMPERATURE_CONVERSIONS,
  PRESSURE_CONVERSIONS,
  VOLUME_CONVERSIONS,
  PH_SCALE
} from './constants';

// ============ UTILIDADES GENERALES ============

export function formatNumber(num: number, precision: number = 4): string {
  if (Math.abs(num) < 0.0001 || Math.abs(num) >= 1e6) {
    return num.toExponential(precision);
  }
  return num.toFixed(precision);
}

export function parseFormula(formula: string): Record<string, number> {
  const elements: Record<string, number> = {};
  // Simplified formula parsing
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match;
  while ((match = regex.exec(formula)) !== null) {
    const symbol = match[1];
    const count = match[2] ? parseInt(match[2]) : 1;
    elements[symbol] = (elements[symbol] || 0) + count;
  }
  return elements;
}

export function calculateMolarMass(formula: string): number {
  const elements = parseFormula(formula);
  let mass = 0;
  for (const [symbol, count] of Object.entries(elements)) {
    const element = ELEMENTS.find(e => e.symbol === symbol);
    if (element) {
      mass += element.atomicMass * count;
    }
  }
  return mass;
}

export function getCompound(id: string): ChemicalCompound | undefined {
  return COMPOUNDS.find(c => c.id === id);
}

export function searchCompounds(query: string, type?: string): ChemicalCompound[] {
  const q = query.toLowerCase();
  return COMPOUNDS.filter(c => {
    const matchesQuery = c.name.toLowerCase().includes(q) || 
                         c.formula.toLowerCase().includes(q) ||
                         c.id.includes(q);
    const matchesType = !type || c.type === type;
    return matchesQuery && matchesType;
  });
}

// ============ CÁLCULOS DE SOLUCIONES ============

export function calculateMolarity(
  mass: number, 
  molarMass: number, 
  volumeL: number, 
  purity: number = 100,
  precision: number = 4
): ChemResult {
  const steps: CalculationStep[] = [];
  
  // Paso 1: Ajuste por pureza
  const effectiveMass = mass * (purity / 100);
  if (purity < 100) {
    steps.push({
      label: 'Ajuste por pureza',
      formula: 'Masa efectiva = Masa × (% Pureza / 100)',
      substitution: `Masa efectiva = ${mass} g × (${purity}% / 100)`,
      result: `${formatNumber(effectiveMass, precision)} g`,
      explanation: 'Se corrige la masa según la pureza del reactivo'
    });
  }

  // Paso 2: Cálculo de moles
  const moles = effectiveMass / molarMass;
  steps.push({
    label: 'Cálculo de moles',
    formula: 'n = m / M',
    substitution: `n = ${formatNumber(effectiveMass, precision)} g / ${formatNumber(molarMass, precision)} g/mol`,
    result: `${formatNumber(moles, precision)} mol`,
    explanation: 'n = número de moles, m = masa, M = masa molar'
  });

  // Paso 3: Cálculo de molaridad
  const molarity = moles / volumeL;
  steps.push({
    label: 'Cálculo de molaridad',
    formula: 'M = n / V',
    substitution: `M = ${formatNumber(moles, precision)} mol / ${formatNumber(volumeL, precision)} L`,
    result: `${formatNumber(molarity, precision)} M`,
    explanation: 'M = molaridad (mol/L), n = moles, V = volumen en litros',
    isHighlight: true
  });

  return {
    title: 'Cálculo de Molaridad',
    steps,
    finalValue: formatNumber(molarity, precision),
    unit: 'M (mol/L)',
    additionalResults: [
      { label: 'Moles de soluto', value: formatNumber(moles, precision), unit: 'mol' },
      { label: 'Masa efectiva', value: formatNumber(effectiveMass, precision), unit: 'g' }
    ]
  };
}

export function calculateNormality(
  mass: number,
  molarMass: number,
  volumeL: number,
  equivalentFactor: number,
  normalityType: 'acidBase' | 'redox',
  precision: number = 4
): ChemResult {
  const steps: CalculationStep[] = [];

  // Paso 1: Calcular moles
  const moles = mass / molarMass;
  steps.push({
    label: 'Cálculo de moles',
    formula: 'n = m / M',
    substitution: `n = ${formatNumber(mass, precision)} g / ${formatNumber(molarMass, precision)} g/mol`,
    result: `${formatNumber(moles, precision)} mol`
  });

  // Paso 2: Calcular molaridad
  const molarity = moles / volumeL;
  steps.push({
    label: 'Cálculo de molaridad',
    formula: 'M = n / V',
    substitution: `M = ${formatNumber(moles, precision)} mol / ${formatNumber(volumeL, precision)} L`,
    result: `${formatNumber(molarity, precision)} M`
  });

  // Paso 3: Factor equivalente
  const factorExplanation = normalityType === 'acidBase' 
    ? `Número de H⁺ (ácido) o OH⁻ (base) disociables = ${equivalentFactor}`
    : `Número de electrones transferidos en la reacción = ${equivalentFactor}`;
  
  steps.push({
    label: 'Factor de equivalencia',
    formula: normalityType === 'acidBase' ? 'f = n(H⁺) o n(OH⁻)' : 'f = n(e⁻)',
    result: `f = ${equivalentFactor}`,
    explanation: factorExplanation
  });

  // Paso 4: Calcular normalidad
  const normality = molarity * equivalentFactor;
  steps.push({
    label: 'Cálculo de normalidad',
    formula: 'N = M × f',
    substitution: `N = ${formatNumber(molarity, precision)} M × ${equivalentFactor}`,
    result: `${formatNumber(normality, precision)} N`,
    explanation: 'N = normalidad (eq/L), M = molaridad, f = factor equivalente',
    isHighlight: true
  });

  return {
    title: 'Cálculo de Normalidad',
    steps,
    finalValue: formatNumber(normality, precision),
    unit: 'N (eq/L)',
    additionalResults: [
      { label: 'Molaridad', value: formatNumber(molarity, precision), unit: 'M' },
      { label: 'Equivalentes', value: formatNumber(moles * equivalentFactor, precision), unit: 'eq' }
    ],
    tip: normalityType === 'acidBase' 
      ? 'En ácido-base, el factor es el número de H⁺ u OH⁻ que puede liberar la sustancia.'
      : 'En redox, el factor es el número de electrones ganados o perdidos por mol.'
  };
}

export function calculateMolality(
  massSolute: number,
  molarMass: number,
  massSolventKg: number,
  precision: number = 4
): ChemResult {
  const steps: CalculationStep[] = [];

  // Paso 1: Calcular moles
  const moles = massSolute / molarMass;
  steps.push({
    label: 'Cálculo de moles de soluto',
    formula: 'n = m / M',
    substitution: `n = ${formatNumber(massSolute, precision)} g / ${formatNumber(molarMass, precision)} g/mol`,
    result: `${formatNumber(moles, precision)} mol`
  });

  // Paso 2: Calcular molalidad
  const molality = moles / massSolventKg;
  steps.push({
    label: 'Cálculo de molalidad',
    formula: 'm = n / masa solvente (kg)',
    substitution: `m = ${formatNumber(moles, precision)} mol / ${formatNumber(massSolventKg, precision)} kg`,
    result: `${formatNumber(molality, precision)} m`,
    explanation: 'La molalidad es independiente de la temperatura (usa masa, no volumen)',
    isHighlight: true
  });

  return {
    title: 'Cálculo de Molalidad',
    steps,
    finalValue: formatNumber(molality, precision),
    unit: 'm (mol/kg)',
    tip: 'La molalidad es útil en propiedades coligativas porque no cambia con la temperatura.'
  };
}

export function calculateMolarFraction(
  massSolute: number,
  molarMassSolute: number,
  massSolvent: number,
  molarMassSolvent: number,
  precision: number = 4
): ChemResult {
  const steps: CalculationStep[] = [];

  // Paso 1: Moles de soluto
  const molesSolute = massSolute / molarMassSolute;
  steps.push({
    label: 'Moles de soluto',
    formula: 'n₁ = m₁ / M₁',
    substitution: `n₁ = ${formatNumber(massSolute, precision)} g / ${formatNumber(molarMassSolute, precision)} g/mol`,
    result: `${formatNumber(molesSolute, precision)} mol`
  });

  // Paso 2: Moles de solvente
  const molesSolvent = massSolvent / molarMassSolvent;
  steps.push({
    label: 'Moles de solvente',
    formula: 'n₂ = m₂ / M₂',
    substitution: `n₂ = ${formatNumber(massSolvent, precision)} g / ${formatNumber(molarMassSolvent, precision)} g/mol`,
    result: `${formatNumber(molesSolvent, precision)} mol`
  });

  // Paso 3: Moles totales
  const totalMoles = molesSolute + molesSolvent;
  steps.push({
    label: 'Moles totales',
    formula: 'n_total = n₁ + n₂',
    substitution: `n_total = ${formatNumber(molesSolute, precision)} + ${formatNumber(molesSolvent, precision)}`,
    result: `${formatNumber(totalMoles, precision)} mol`
  });

  // Paso 4: Fracción molar del soluto
  const fractionSolute = molesSolute / totalMoles;
  steps.push({
    label: 'Fracción molar del soluto',
    formula: 'X₁ = n₁ / n_total',
    substitution: `X₁ = ${formatNumber(molesSolute, precision)} / ${formatNumber(totalMoles, precision)}`,
    result: formatNumber(fractionSolute, precision),
    isHighlight: true
  });

  // Paso 5: Fracción molar del solvente
  const fractionSolvent = molesSolvent / totalMoles;
  steps.push({
    label: 'Fracción molar del solvente',
    formula: 'X₂ = n₂ / n_total = 1 - X₁',
    result: formatNumber(fractionSolvent, precision)
  });

  return {
    title: 'Cálculo de Fracción Molar',
    steps,
    finalValue: formatNumber(fractionSolute, precision),
    unit: '(adimensional)',
    additionalResults: [
      { label: 'Fracción molar soluto (X₁)', value: formatNumber(fractionSolute, precision), unit: '' },
      { label: 'Fracción molar solvente (X₂)', value: formatNumber(fractionSolvent, precision), unit: '' },
      { label: 'Verificación X₁ + X₂', value: formatNumber(fractionSolute + fractionSolvent, precision), unit: '= 1' }
    ],
    tip: 'La suma de todas las fracciones molares siempre debe ser igual a 1.'
  };
}

export function calculateDilution(
  c1: number,
  v1: number,
  c2: number,
  v2: number,
  solveFor: 'c1' | 'v1' | 'c2' | 'v2',
  precision: number = 4
): ChemResult {
  const steps: CalculationStep[] = [];
  let result: number;
  let resultLabel: string;
  let resultUnit: string;

  steps.push({
    label: 'Fórmula de dilución',
    formula: 'C₁ × V₁ = C₂ × V₂',
    result: 'Conservación de la cantidad de soluto',
    explanation: 'La cantidad de soluto (moles) se mantiene constante durante la dilución'
  });

  switch (solveFor) {
    case 'v2':
      result = (c1 * v1) / c2;
      resultLabel = 'V₂';
      resultUnit = 'mL';
      steps.push({
        label: 'Despeje de V₂',
        formula: 'V₂ = (C₁ × V₁) / C₂',
        substitution: `V₂ = (${formatNumber(c1, precision)} × ${formatNumber(v1, precision)}) / ${formatNumber(c2, precision)}`,
        result: `${formatNumber(result, precision)} mL`,
        isHighlight: true
      });
      break;
    case 'c2':
      result = (c1 * v1) / v2;
      resultLabel = 'C₂';
      resultUnit = 'M';
      steps.push({
        label: 'Despeje de C₂',
        formula: 'C₂ = (C₁ × V₁) / V₂',
        substitution: `C₂ = (${formatNumber(c1, precision)} × ${formatNumber(v1, precision)}) / ${formatNumber(v2, precision)}`,
        result: `${formatNumber(result, precision)} M`,
        isHighlight: true
      });
      break;
    case 'c1':
      result = (c2 * v2) / v1;
      resultLabel = 'C₁';
      resultUnit = 'M';
      steps.push({
        label: 'Despeje de C₁',
        formula: 'C₁ = (C₂ × V₂) / V₁',
        substitution: `C₁ = (${formatNumber(c2, precision)} × ${formatNumber(v2, precision)}) / ${formatNumber(v1, precision)}`,
        result: `${formatNumber(result, precision)} M`,
        isHighlight: true
      });
      break;
    case 'v1':
      result = (c2 * v2) / c1;
      resultLabel = 'V₁';
      resultUnit = 'mL';
      steps.push({
        label: 'Despeje de V₁',
        formula: 'V₁ = (C₂ × V₂) / C₁',
        substitution: `V₁ = (${formatNumber(c2, precision)} × ${formatNumber(v2, precision)}) / ${formatNumber(c1, precision)}`,
        result: `${formatNumber(result, precision)} mL`,
        isHighlight: true
      });
      break;
  }

  // Factor de dilución
  const dilutionFactor = solveFor === 'v2' || solveFor === 'c2' 
    ? c1 / (solveFor === 'c2' ? result : c2)
    : (solveFor === 'c1' ? result : c1) / c2;
  
  steps.push({
    label: 'Factor de dilución',
    formula: 'FD = C₁ / C₂ = V₂ / V₁',
    result: `${formatNumber(dilutionFactor, 2)}x`,
    explanation: dilutionFactor > 1 ? 'La solución se diluyó' : 'La solución se concentró'
  });

  return {
    title: 'Cálculo de Dilución',
    steps,
    finalValue: formatNumber(result, precision),
    unit: resultUnit,
    additionalResults: [
      { label: 'Factor de dilución', value: `${formatNumber(dilutionFactor, 2)}`, unit: 'x' }
    ]
  };
}

export function calculatePPM(
  massSolute: number,
  massSolution: number,
  precision: number = 4
): ChemResult {
  const steps: CalculationStep[] = [];

  steps.push({
    label: 'Definición de ppm',
    formula: 'ppm = (masa soluto / masa solución) × 10⁶',
    result: '1 ppm = 1 mg/L',
    explanation: 'Partes por millón: mg de soluto por kg de solución'
  });

  const ppm = (massSolute / massSolution) * 1e6;
  steps.push({
    label: 'Cálculo',
    formula: 'ppm = (m_soluto / m_solución) × 10⁶',
    substitution: `ppm = (${formatNumber(massSolute, precision)} g / ${formatNumber(massSolution, precision)} g) × 10⁶`,
    result: `${formatNumber(ppm, precision)} ppm`,
    isHighlight: true
  });

  return {
    title: 'Concentración en ppm',
    steps,
    finalValue: formatNumber(ppm, precision),
    unit: 'ppm',
    tip: '1 ppm = 1 mg/L (en soluciones acuosas diluidas) = 0.0001%'
  };
}

// ============ CÁLCULOS DE pH ============

export function calculatePH(
  concentration: number,
  isAcid: boolean,
  isStrong: boolean,
  pKa: number = 4.75,
  temperature: number = 25,
  precision: number = 4
): ChemResult {
  const steps: CalculationStep[] = [];
  let pH: number;
  let pOH: number;

  // Constante de autoionización del agua
  const Kw = CONSTANTS.Kw_25;
  
  steps.push({
    label: 'Datos iniciales',
    formula: isAcid ? '[H⁺] = concentración del ácido' : '[OH⁻] = concentración de la base',
    result: `${formatNumber(concentration, precision)} M`,
    explanation: `Tipo: ${isStrong ? 'Fuerte' : 'Débil'}, Temperatura: ${temperature}°C`
  });

  if (isStrong) {
    if (isAcid) {
      // Ácido fuerte: disociación completa
      pH = -Math.log10(concentration);
      pOH = 14 - pH;
      
      steps.push({
        label: 'Disociación completa',
        formula: 'HA → H⁺ + A⁻',
        result: `[H⁺] = ${formatNumber(concentration, precision)} M`,
        explanation: 'Los ácidos fuertes se disocian completamente'
      });
      
      steps.push({
        label: 'Cálculo de pH',
        formula: 'pH = -log[H⁺]',
        substitution: `pH = -log(${formatNumber(concentration, precision)})`,
        result: formatNumber(pH, precision),
        isHighlight: true
      });
      
      steps.push({
        label: 'Cálculo de pOH',
        formula: 'pOH = 14 - pH',
        substitution: `pOH = 14 - ${formatNumber(pH, precision)}`,
        result: formatNumber(pOH, precision)
      });
    } else {
      // Base fuerte
      pOH = -Math.log10(concentration);
      pH = 14 - pOH;
      
      steps.push({
        label: 'Disociación completa',
        formula: 'BOH → B⁺ + OH⁻',
        result: `[OH⁻] = ${formatNumber(concentration, precision)} M`,
        explanation: 'Las bases fuertes se disocian completamente'
      });
      
      steps.push({
        label: 'Cálculo de pOH',
        formula: 'pOH = -log[OH⁻]',
        substitution: `pOH = -log(${formatNumber(concentration, precision)})`,
        result: formatNumber(pOH, precision)
      });
      
      steps.push({
        label: 'Cálculo de pH',
        formula: 'pH = 14 - pOH',
        substitution: `pH = 14 - ${formatNumber(pOH, precision)}`,
        result: formatNumber(pH, precision),
        isHighlight: true
      });
    }
  } else {
    // Ácido o base débil
    if (isAcid) {
      const Ka = Math.pow(10, -pKa);
      steps.push({
        label: 'Constante de acidez',
        formula: 'Ka = 10^(-pKa)',
        substitution: `Ka = 10^(-${pKa})`,
        result: formatNumber(Ka, precision)
      });
      
      // Aproximación: [H⁺] = √(Ka × C)
      const hConc = Math.sqrt(Ka * concentration);
      pH = -Math.log10(hConc);
      pOH = 14 - pH;
      
      steps.push({
        label: 'Concentración de H⁺ (aproximación)',
        formula: '[H⁺] ≈ √(Ka × C)',
        substitution: `[H⁺] ≈ √(${formatNumber(Ka, precision)} × ${formatNumber(concentration, precision)})`,
        result: `${formatNumber(hConc, precision)} M`,
        explanation: 'Válido cuando Ka << C (disociación pequeña)'
      });
      
      steps.push({
        label: 'Cálculo de pH',
        formula: 'pH = -log[H⁺]',
        result: formatNumber(pH, precision),
        isHighlight: true
      });
    } else {
      const pKb = 14 - pKa;
      const Kb = Math.pow(10, -pKb);
      
      steps.push({
        label: 'Constante de basicidad',
        formula: 'pKb = 14 - pKa, Kb = 10^(-pKb)',
        substitution: `pKb = 14 - ${pKa} = ${pKb}`,
        result: `Kb = ${formatNumber(Kb, precision)}`
      });
      
      const ohConc = Math.sqrt(Kb * concentration);
      pOH = -Math.log10(ohConc);
      pH = 14 - pOH;
      
      steps.push({
        label: 'Concentración de OH⁻',
        formula: '[OH⁻] ≈ √(Kb × C)',
        substitution: `[OH⁻] ≈ √(${formatNumber(Kb, precision)} × ${formatNumber(concentration, precision)})`,
        result: `${formatNumber(ohConc, precision)} M`
      });
      
      steps.push({
        label: 'Cálculo de pH',
        formula: 'pH = 14 - pOH',
        result: formatNumber(pH, precision),
        isHighlight: true
      });
    }
  }

  // Clasificación
  let classification = '';
  if (pH < 3) classification = 'Muy ácido';
  else if (pH < 6) classification = 'Ácido moderado';
  else if (pH < 7) classification = 'Ligeramente ácido';
  else if (pH === 7) classification = 'Neutro';
  else if (pH < 8) classification = 'Ligeramente básico';
  else if (pH < 11) classification = 'Básico moderado';
  else classification = 'Muy básico';

  return {
    title: 'Cálculo de pH/pOH',
    steps,
    finalValue: formatNumber(pH, precision),
    unit: 'pH',
    additionalResults: [
      { label: 'pH', value: formatNumber(pH, precision), unit: '' },
      { label: 'pOH', value: formatNumber(pOH, precision), unit: '' },
      { label: '[H⁺]', value: formatNumber(Math.pow(10, -pH), precision), unit: 'M' },
      { label: '[OH⁻]', value: formatNumber(Math.pow(10, -pOH), precision), unit: 'M' }
    ],
    classification,
    chartData: PH_SCALE.map(p => ({
      name: p.label,
      value: p.ph,
      color: p.color
    }))
  };
}

// ============ CÁLCULOS DE GASES ============

export function calculateIdealGas(
  pressure: number,
  volume: number,
  moles: number,
  temperature: number,
  solveFor: 'P' | 'V' | 'n' | 'T',
  precision: number = 4
): ChemResult {
  const steps: CalculationStep[] = [];
  const R = CONSTANTS.R_ATM;
  let result: number;
  let unit: string;

  steps.push({
    label: 'Ley del Gas Ideal',
    formula: 'PV = nRT',
    result: `R = ${R} L·atm/(mol·K)`,
    explanation: 'P = presión, V = volumen, n = moles, R = constante, T = temperatura'
  });

  switch (solveFor) {
    case 'P':
      result = (moles * R * temperature) / volume;
      unit = 'atm';
      steps.push({
        label: 'Despeje de P',
        formula: 'P = nRT / V',
        substitution: `P = (${formatNumber(moles, precision)} mol × ${R} × ${formatNumber(temperature, precision)} K) / ${formatNumber(volume, precision)} L`,
        result: `${formatNumber(result, precision)} atm`,
        isHighlight: true
      });
      break;
    case 'V':
      result = (moles * R * temperature) / pressure;
      unit = 'L';
      steps.push({
        label: 'Despeje de V',
        formula: 'V = nRT / P',
        substitution: `V = (${formatNumber(moles, precision)} mol × ${R} × ${formatNumber(temperature, precision)} K) / ${formatNumber(pressure, precision)} atm`,
        result: `${formatNumber(result, precision)} L`,
        isHighlight: true
      });
      break;
    case 'n':
      result = (pressure * volume) / (R * temperature);
      unit = 'mol';
      steps.push({
        label: 'Despeje de n',
        formula: 'n = PV / RT',
        substitution: `n = (${formatNumber(pressure, precision)} atm × ${formatNumber(volume, precision)} L) / (${R} × ${formatNumber(temperature, precision)} K)`,
        result: `${formatNumber(result, precision)} mol`,
        isHighlight: true
      });
      break;
    case 'T':
      result = (pressure * volume) / (moles * R);
      unit = 'K';
      steps.push({
        label: 'Despeje de T',
        formula: 'T = PV / nR',
        substitution: `T = (${formatNumber(pressure, precision)} atm × ${formatNumber(volume, precision)} L) / (${formatNumber(moles, precision)} mol × ${R})`,
        result: `${formatNumber(result, precision)} K (${formatNumber(result - 273.15, precision)} °C)`,
        isHighlight: true
      });
      break;
  }

  return {
    title: 'Ley del Gas Ideal',
    steps,
    finalValue: formatNumber(result!, precision),
    unit,
    tip: 'Esta ley asume comportamiento ideal: moléculas sin volumen y sin interacciones.'
  };
}

export function calculateDaltonPartialPressures(
  partialPressures: number[],
  precision: number = 4
): ChemResult {
  const steps: CalculationStep[] = [];

  steps.push({
    label: 'Ley de Dalton',
    formula: 'P_total = P₁ + P₂ + P₃ + ...',
    result: 'Suma de presiones parciales',
    explanation: 'La presión total es la suma de las presiones parciales'
  });

  const total = partialPressures.reduce((sum, p) => sum + p, 0);
  const pressureList = partialPressures.map((p, i) => `P${i+1} = ${formatNumber(p, precision)}`).join(' + ');
  
  steps.push({
    label: 'Suma de presiones parciales',
    formula: 'P_total = ' + pressureList,
    result: `${formatNumber(total, precision)} atm`,
    isHighlight: true
  });

  // Fracciones molares
  steps.push({
    label: 'Fracciones molares',
    formula: 'Xᵢ = Pᵢ / P_total',
    result: partialPressures.map((p, i) => `X${i+1} = ${formatNumber(p/total, precision)}`).join(', ')
  });

  return {
    title: 'Ley de Dalton - Presiones Parciales',
    steps,
    finalValue: formatNumber(total, precision),
    unit: 'atm',
    additionalResults: partialPressures.map((p, i) => ({
      label: `Fracción molar gas ${i+1}`,
      value: formatNumber(p/total, precision),
      unit: ''
    }))
  };
}

// ============ CÁLCULOS DE TERMOQUÍMICA ============

export function calculateHeat(
  mass: number,
  specificHeat: number,
  deltaT: number,
  precision: number = 4
): ChemResult {
  const steps: CalculationStep[] = [];

  steps.push({
    label: 'Fórmula de calor',
    formula: 'Q = m × c × ΔT',
    result: 'Calorimetría básica',
    explanation: 'Q = calor, m = masa, c = calor específico, ΔT = cambio de temperatura'
  });

  const Q = mass * specificHeat * deltaT;
  steps.push({
    label: 'Sustitución de valores',
    formula: 'Q = m × c × ΔT',
    substitution: `Q = ${formatNumber(mass, precision)} g × ${formatNumber(specificHeat, precision)} J/(g·°C) × ${formatNumber(deltaT, precision)} °C`,
    result: `${formatNumber(Q, precision)} J`,
    isHighlight: true
  });

  // Convertir a kJ
  const QkJ = Q / 1000;
  steps.push({
    label: 'Conversión a kJ',
    formula: 'Q(kJ) = Q(J) / 1000',
    result: `${formatNumber(QkJ, precision)} kJ`
  });

  // Interpretación
  const interpretation = Q > 0 ? 'Proceso endotérmico (absorbe calor)' : 'Proceso exotérmico (libera calor)';

  return {
    title: 'Cálculo de Calor (Calorimetría)',
    steps,
    finalValue: formatNumber(Q, precision),
    unit: 'J',
    additionalResults: [
      { label: 'Calor', value: formatNumber(QkJ, precision), unit: 'kJ' },
      { label: 'Calor', value: formatNumber(Q / 4.184, precision), unit: 'cal' }
    ],
    classification: interpretation
  };
}

export function calculateEnthalpyReaction(
  enthalpyReaction: number,
  molesReacted: number,
  precision: number = 4
): ChemResult {
  const steps: CalculationStep[] = [];

  steps.push({
    label: 'Entalpía de reacción',
    formula: 'ΔH = ΔH° × n',
    result: 'Proporcionalidad estequiométrica',
    explanation: 'El calor de reacción es proporcional a los moles reaccionados'
  });

  const totalHeat = enthalpyReaction * molesReacted;
  steps.push({
    label: 'Cálculo del calor total',
    formula: 'Q = ΔH° × n',
    substitution: `Q = ${formatNumber(enthalpyReaction, precision)} kJ/mol × ${formatNumber(molesReacted, precision)} mol`,
    result: `${formatNumber(totalHeat, precision)} kJ`,
    isHighlight: true
  });

  const classification = totalHeat < 0 ? 'Reacción exotérmica' : 'Reacción endotérmica';

  return {
    title: 'Cálculo de Entalpía de Reacción',
    steps,
    finalValue: formatNumber(totalHeat, precision),
    unit: 'kJ',
    classification,
    tip: enthalpyReaction < 0 
      ? 'ΔH < 0: La reacción libera energía al entorno.'
      : 'ΔH > 0: La reacción absorbe energía del entorno.'
  };
}

// ============ CONVERSIONES ============

export function convertTemperature(
  value: number,
  fromUnit: string,
  toUnit: string,
  precision: number = 4
): ChemResult {
  const steps: CalculationStep[] = [];
  
  // Convertir a Kelvin primero
  const kelvin = TEMPERATURE_CONVERSIONS[fromUnit as keyof typeof TEMPERATURE_CONVERSIONS].toKelvin(value);
  steps.push({
    label: 'Conversión a Kelvin',
    formula: fromUnit === 'K' ? 'Ya en Kelvin' : fromUnit === '°C' ? 'K = °C + 273.15' : 'K = (°F - 32) × 5/9 + 273.15',
    substitution: `K = ${formatNumber(kelvin, precision)}`,
    result: `${formatNumber(kelvin, precision)} K`
  });

  // Convertir de Kelvin a unidad destino
  const result = TEMPERATURE_CONVERSIONS[toUnit as keyof typeof TEMPERATURE_CONVERSIONS].fromKelvin(kelvin);
  steps.push({
    label: `Conversión a ${toUnit}`,
    formula: toUnit === 'K' ? 'Ya en Kelvin' : toUnit === '°C' ? '°C = K - 273.15' : '°F = (K - 273.15) × 9/5 + 32',
    result: `${formatNumber(result, precision)} ${toUnit}`,
    isHighlight: true
  });

  return {
    title: 'Conversión de Temperatura',
    steps,
    finalValue: formatNumber(result, precision),
    unit: toUnit
  };
}

export function convertPressure(
  value: number,
  fromUnit: string,
  toUnit: string,
  precision: number = 4
): ChemResult {
  const steps: CalculationStep[] = [];
  
  const atm = PRESSURE_CONVERSIONS[fromUnit as keyof typeof PRESSURE_CONVERSIONS].toAtm(value);
  const result = PRESSURE_CONVERSIONS[toUnit as keyof typeof PRESSURE_CONVERSIONS].fromAtm(atm);
  
  steps.push({
    label: 'Conversión',
    formula: `${value} ${fromUnit} → ${toUnit}`,
    substitution: `Vía atmósferas: ${formatNumber(atm, precision)} atm`,
    result: `${formatNumber(result, precision)} ${toUnit}`,
    isHighlight: true
  });

  return {
    title: 'Conversión de Presión',
    steps,
    finalValue: formatNumber(result, precision),
    unit: toUnit
  };
}

export function convertMassToMoles(
  mass: number,
  molarMass: number,
  precision: number = 4
): ChemResult {
  const steps: CalculationStep[] = [];
  
  const moles = mass / molarMass;
  steps.push({
    label: 'Conversión masa a moles',
    formula: 'n = m / M',
    substitution: `n = ${formatNumber(mass, precision)} g / ${formatNumber(molarMass, precision)} g/mol`,
    result: `${formatNumber(moles, precision)} mol`,
    isHighlight: true
  });

  // Número de partículas
  const particles = moles * CONSTANTS.AVOGADRO;
  steps.push({
    label: 'Número de partículas',
    formula: 'N = n × Nₐ',
    substitution: `N = ${formatNumber(moles, precision)} mol × 6.022 × 10²³`,
    result: `${particles.toExponential(4)} partículas`
  });

  return {
    title: 'Conversión Masa → Moles',
    steps,
    finalValue: formatNumber(moles, precision),
    unit: 'mol',
    additionalResults: [
      { label: 'Partículas', value: particles.toExponential(4), unit: '' }
    ]
  };
}

// ============ EXPORTAR RESULTADOS ============

export function exportResultToPDF(result: ChemResult): string {
  let content = `
═══════════════════════════════════════════════════
           RESULTADO DE CÁLCULO QUÍMICO
═══════════════════════════════════════════════════
📋 ${result.title}
📅 Fecha: ${new Date().toLocaleDateString('es-ES')}
⏰ Hora: ${new Date().toLocaleTimeString('es-ES')}

═══════════════════════════════════════════════════
                  RESULTADO FINAL
═══════════════════════════════════════════════════
   ➤ ${result.finalValue} ${result.unit}
${result.classification ? `   📊 Clasificación: ${result.classification}` : ''}
${result.warning ? `   ⚠️ Advertencia: ${result.warning}` : ''}
${result.tip ? `   💡 Tip: ${result.tip}` : ''}

═══════════════════════════════════════════════════
              PROCEDIMIENTO DETALLADO
═══════════════════════════════════════════════════
`;

  result.steps.forEach((step, i) => {
    content += `
┌─ Paso ${i + 1}: ${step.label}
│  📐 Fórmula: ${step.formula}
${step.substitution ? `│  📝 Sustitución: ${step.substitution}` : ''}
│  ✅ Resultado: ${step.result}
${step.explanation ? `│  📖 ${step.explanation}` : ''}
└──────────────────────────────────────────────────
`;
  });

  if (result.additionalResults && result.additionalResults.length > 0) {
    content += `
═══════════════════════════════════════════════════
              RESULTADOS ADICIONALES
═══════════════════════════════════════════════════
`;
    result.additionalResults.forEach(r => {
      content += `   • ${r.label}: ${r.value} ${r.unit}\n`;
    });
  }

  content += `
═══════════════════════════════════════════════════
     Generado por Laboratorio Químico Avanzado
═══════════════════════════════════════════════════
`;

  return content;
}
