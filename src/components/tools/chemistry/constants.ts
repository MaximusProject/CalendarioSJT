import { Element, ChemicalCompound } from './types';

// ============ CONSTANTES FÍSICO-QUÍMICAS ============
export const CONSTANTS = {
  R_ATM: 0.08206, // L·atm/(mol·K)
  R_KPA: 8.314, // L·kPa/(mol·K) o J/(mol·K)
  R_MMHG: 62.364, // L·mmHg/(mol·K)
  R_BAR: 0.08314, // L·bar/(mol·K)
  Kw_25: 1.0e-14,
  AVOGADRO: 6.02214076e23,
  FARADAY: 96485, // C/mol
  PLANCK: 6.626e-34, // J·s
  SPEED_LIGHT: 2.998e8, // m/s
  BOLTZMANN: 1.381e-23, // J/K
  STP_TEMP: 273.15, // K
  STP_PRESSURE: 1, // atm
  MOLAR_VOLUME_STP: 22.414, // L/mol
};

// ============ ELEMENTOS DE LA TABLA PERIÓDICA ============
export const ELEMENTS: Element[] = [
  { symbol: 'H', name: 'Hydrogen', nameEs: 'Hidrógeno', atomicNumber: 1, atomicMass: 1.008, category: 'nonmetal', oxidationStates: [1, -1] },
  { symbol: 'He', name: 'Helium', nameEs: 'Helio', atomicNumber: 2, atomicMass: 4.003, category: 'noble gas', oxidationStates: [0] },
  { symbol: 'Li', name: 'Lithium', nameEs: 'Litio', atomicNumber: 3, atomicMass: 6.941, category: 'alkali metal', oxidationStates: [1] },
  { symbol: 'Be', name: 'Beryllium', nameEs: 'Berilio', atomicNumber: 4, atomicMass: 9.012, category: 'alkaline earth', oxidationStates: [2] },
  { symbol: 'B', name: 'Boron', nameEs: 'Boro', atomicNumber: 5, atomicMass: 10.81, category: 'metalloid', oxidationStates: [3] },
  { symbol: 'C', name: 'Carbon', nameEs: 'Carbono', atomicNumber: 6, atomicMass: 12.011, category: 'nonmetal', oxidationStates: [4, 2, -4] },
  { symbol: 'N', name: 'Nitrogen', nameEs: 'Nitrógeno', atomicNumber: 7, atomicMass: 14.007, category: 'nonmetal', oxidationStates: [5, 4, 3, 2, -3] },
  { symbol: 'O', name: 'Oxygen', nameEs: 'Oxígeno', atomicNumber: 8, atomicMass: 15.999, category: 'nonmetal', oxidationStates: [-2, -1] },
  { symbol: 'F', name: 'Fluorine', nameEs: 'Flúor', atomicNumber: 9, atomicMass: 18.998, category: 'halogen', oxidationStates: [-1] },
  { symbol: 'Ne', name: 'Neon', nameEs: 'Neón', atomicNumber: 10, atomicMass: 20.180, category: 'noble gas', oxidationStates: [0] },
  { symbol: 'Na', name: 'Sodium', nameEs: 'Sodio', atomicNumber: 11, atomicMass: 22.990, category: 'alkali metal', oxidationStates: [1] },
  { symbol: 'Mg', name: 'Magnesium', nameEs: 'Magnesio', atomicNumber: 12, atomicMass: 24.305, category: 'alkaline earth', oxidationStates: [2] },
  { symbol: 'Al', name: 'Aluminum', nameEs: 'Aluminio', atomicNumber: 13, atomicMass: 26.982, category: 'metal', oxidationStates: [3] },
  { symbol: 'Si', name: 'Silicon', nameEs: 'Silicio', atomicNumber: 14, atomicMass: 28.086, category: 'metalloid', oxidationStates: [4, -4] },
  { symbol: 'P', name: 'Phosphorus', nameEs: 'Fósforo', atomicNumber: 15, atomicMass: 30.974, category: 'nonmetal', oxidationStates: [5, 3, -3] },
  { symbol: 'S', name: 'Sulfur', nameEs: 'Azufre', atomicNumber: 16, atomicMass: 32.065, category: 'nonmetal', oxidationStates: [6, 4, 2, -2] },
  { symbol: 'Cl', name: 'Chlorine', nameEs: 'Cloro', atomicNumber: 17, atomicMass: 35.453, category: 'halogen', oxidationStates: [7, 5, 3, 1, -1] },
  { symbol: 'Ar', name: 'Argon', nameEs: 'Argón', atomicNumber: 18, atomicMass: 39.948, category: 'noble gas', oxidationStates: [0] },
  { symbol: 'K', name: 'Potassium', nameEs: 'Potasio', atomicNumber: 19, atomicMass: 39.098, category: 'alkali metal', oxidationStates: [1] },
  { symbol: 'Ca', name: 'Calcium', nameEs: 'Calcio', atomicNumber: 20, atomicMass: 40.078, category: 'alkaline earth', oxidationStates: [2] },
  { symbol: 'Fe', name: 'Iron', nameEs: 'Hierro', atomicNumber: 26, atomicMass: 55.845, category: 'transition metal', oxidationStates: [3, 2] },
  { symbol: 'Cu', name: 'Copper', nameEs: 'Cobre', atomicNumber: 29, atomicMass: 63.546, category: 'transition metal', oxidationStates: [2, 1] },
  { symbol: 'Zn', name: 'Zinc', nameEs: 'Zinc', atomicNumber: 30, atomicMass: 65.38, category: 'transition metal', oxidationStates: [2] },
  { symbol: 'Br', name: 'Bromine', nameEs: 'Bromo', atomicNumber: 35, atomicMass: 79.904, category: 'halogen', oxidationStates: [7, 5, 3, 1, -1] },
  { symbol: 'Ag', name: 'Silver', nameEs: 'Plata', atomicNumber: 47, atomicMass: 107.868, category: 'transition metal', oxidationStates: [1] },
  { symbol: 'I', name: 'Iodine', nameEs: 'Yodo', atomicNumber: 53, atomicMass: 126.904, category: 'halogen', oxidationStates: [7, 5, 1, -1] },
  { symbol: 'Au', name: 'Gold', nameEs: 'Oro', atomicNumber: 79, atomicMass: 196.967, category: 'transition metal', oxidationStates: [3, 1] },
  { symbol: 'Pb', name: 'Lead', nameEs: 'Plomo', atomicNumber: 82, atomicMass: 207.2, category: 'metal', oxidationStates: [4, 2] },
];

// ============ BASE DE DATOS DE COMPUESTOS ============
export const COMPOUNDS: ChemicalCompound[] = [
  // ===== ÁCIDOS FUERTES =====
  { 
    id: 'hcl', 
    name: 'Ácido clorhídrico', 
    formula: 'HCl', 
    molarMass: 36.461, 
    type: 'acid', 
    strength: 'strong',
    nH: 1,
    density: 1.18,
    pKa: [-7]
  },
  { 
    id: 'h2so4', 
    name: 'Ácido sulfúrico', 
    formula: 'H₂SO₄', 
    molarMass: 98.079, 
    type: 'acid', 
    strength: 'strong',
    nH: 2,
    density: 1.84,
    pKa: [-3, 1.99],
    enthalpyFormation: -814
  },
  { 
    id: 'hno3', 
    name: 'Ácido nítrico', 
    formula: 'HNO₃', 
    molarMass: 63.012, 
    type: 'acid', 
    strength: 'strong',
    nH: 1,
    density: 1.51,
    pKa: [-1.4],
    enthalpyFormation: -174.1
  },
  { 
    id: 'hbr', 
    name: 'Ácido bromhídrico', 
    formula: 'HBr', 
    molarMass: 80.912, 
    type: 'acid', 
    strength: 'strong',
    nH: 1,
    pKa: [-9]
  },
  { 
    id: 'hi', 
    name: 'Ácido yodhídrico', 
    formula: 'HI', 
    molarMass: 127.912, 
    type: 'acid', 
    strength: 'strong',
    nH: 1,
    pKa: [-10]
  },
  { 
    id: 'hclo4', 
    name: 'Ácido perclórico', 
    formula: 'HClO₄', 
    molarMass: 100.46, 
    type: 'acid', 
    strength: 'strong',
    nH: 1,
    pKa: [-10]
  },

  // ===== ÁCIDOS DÉBILES =====
  { 
    id: 'ch3cooh', 
    name: 'Ácido acético', 
    formula: 'CH₃COOH', 
    molarMass: 60.052, 
    type: 'acid', 
    strength: 'weak',
    nH: 1,
    density: 1.049,
    pKa: [4.76],
    enthalpyFormation: -484.3
  },
  { 
    id: 'h3po4', 
    name: 'Ácido fosfórico', 
    formula: 'H₃PO₄', 
    molarMass: 97.994, 
    type: 'acid', 
    strength: 'weak',
    nH: 3,
    density: 1.885,
    pKa: [2.14, 7.20, 12.37],
    enthalpyFormation: -1288
  },
  { 
    id: 'h3po3', 
    name: 'Ácido fosforoso', 
    formula: 'H₃PO₃', 
    molarMass: 81.995, 
    type: 'acid', 
    strength: 'weak',
    nH: 2, // Solo 2 H son ácidos
    density: 1.651,
    pKa: [1.3, 6.7]
  },
  { 
    id: 'h2co3', 
    name: 'Ácido carbónico', 
    formula: 'H₂CO₃', 
    molarMass: 62.025, 
    type: 'acid', 
    strength: 'weak',
    nH: 2,
    pKa: [6.35, 10.33]
  },
  { 
    id: 'h2so3', 
    name: 'Ácido sulfuroso', 
    formula: 'H₂SO₃', 
    molarMass: 82.079, 
    type: 'acid', 
    strength: 'weak',
    nH: 2,
    pKa: [1.81, 6.91]
  },
  { 
    id: 'hf', 
    name: 'Ácido fluorhídrico', 
    formula: 'HF', 
    molarMass: 20.006, 
    type: 'acid', 
    strength: 'weak',
    nH: 1,
    pKa: [3.17]
  },
  { 
    id: 'hcooh', 
    name: 'Ácido fórmico', 
    formula: 'HCOOH', 
    molarMass: 46.025, 
    type: 'acid', 
    strength: 'weak',
    nH: 1,
    density: 1.22,
    pKa: [3.75]
  },
  { 
    id: 'c6h5cooh', 
    name: 'Ácido benzoico', 
    formula: 'C₆H₅COOH', 
    molarMass: 122.12, 
    type: 'acid', 
    strength: 'weak',
    nH: 1,
    pKa: [4.20]
  },
  { 
    id: 'h2c2o4', 
    name: 'Ácido oxálico', 
    formula: 'H₂C₂O₄', 
    molarMass: 90.034, 
    type: 'acid', 
    strength: 'weak',
    nH: 2,
    pKa: [1.25, 4.27]
  },
  { 
    id: 'c6h8o7', 
    name: 'Ácido cítrico', 
    formula: 'C₆H₈O₇', 
    molarMass: 192.124, 
    type: 'acid', 
    strength: 'weak',
    nH: 3,
    pKa: [3.13, 4.76, 6.40]
  },

  // ===== BASES FUERTES =====
  { 
    id: 'naoh', 
    name: 'Hidróxido de sodio', 
    formula: 'NaOH', 
    molarMass: 39.997, 
    type: 'base', 
    strength: 'strong',
    nOH: 1,
    density: 2.13,
    enthalpyFormation: -425.6
  },
  { 
    id: 'koh', 
    name: 'Hidróxido de potasio', 
    formula: 'KOH', 
    molarMass: 56.105, 
    type: 'base', 
    strength: 'strong',
    nOH: 1,
    density: 2.04,
    enthalpyFormation: -424.8
  },
  { 
    id: 'caoh2', 
    name: 'Hidróxido de calcio', 
    formula: 'Ca(OH)₂', 
    molarMass: 74.093, 
    type: 'base', 
    strength: 'strong',
    nOH: 2,
    density: 2.21,
    solubility: 'Poco soluble',
    enthalpyFormation: -986.1
  },
  { 
    id: 'baoh2', 
    name: 'Hidróxido de bario', 
    formula: 'Ba(OH)₂', 
    molarMass: 171.34, 
    type: 'base', 
    strength: 'strong',
    nOH: 2,
    density: 3.74
  },

  // ===== BASES DÉBILES =====
  { 
    id: 'nh3', 
    name: 'Amoníaco', 
    formula: 'NH₃', 
    molarMass: 17.031, 
    type: 'base', 
    strength: 'weak',
    nOH: 1,
    pKb: [4.75],
    density: 0.73,
    enthalpyFormation: -46.11
  },
  { 
    id: 'ch3nh2', 
    name: 'Metilamina', 
    formula: 'CH₃NH₂', 
    molarMass: 31.057, 
    type: 'base', 
    strength: 'weak',
    nOH: 1,
    pKb: [3.36]
  },
  { 
    id: 'c2h5nh2', 
    name: 'Etilamina', 
    formula: 'C₂H₅NH₂', 
    molarMass: 45.084, 
    type: 'base', 
    strength: 'weak',
    nOH: 1,
    pKb: [3.37]
  },
  { 
    id: 'c5h5n', 
    name: 'Piridina', 
    formula: 'C₅H₅N', 
    molarMass: 79.10, 
    type: 'base', 
    strength: 'weak',
    nOH: 1,
    pKb: [8.77]
  },

  // ===== SALES =====
  { 
    id: 'nacl', 
    name: 'Cloruro de sodio', 
    formula: 'NaCl', 
    molarMass: 58.443, 
    type: 'salt',
    density: 2.165,
    solubility: 'Muy soluble',
    enthalpyFormation: -411.2
  },
  { 
    id: 'kcl', 
    name: 'Cloruro de potasio', 
    formula: 'KCl', 
    molarMass: 74.551, 
    type: 'salt',
    density: 1.984,
    solubility: 'Muy soluble',
    enthalpyFormation: -436.5
  },
  { 
    id: 'cuso4', 
    name: 'Sulfato de cobre (II)', 
    formula: 'CuSO₄', 
    molarMass: 159.609, 
    type: 'salt',
    density: 3.60,
    nE: 2,
    solubility: 'Soluble'
  },
  { 
    id: 'caco3', 
    name: 'Carbonato de calcio', 
    formula: 'CaCO₃', 
    molarMass: 100.086, 
    type: 'salt',
    density: 2.71,
    solubility: 'Insoluble',
    enthalpyFormation: -1206.9
  },
  { 
    id: 'na2so4', 
    name: 'Sulfato de sodio', 
    formula: 'Na₂SO₄', 
    molarMass: 142.04, 
    type: 'salt',
    density: 2.664,
    solubility: 'Soluble'
  },
  { 
    id: 'agno3', 
    name: 'Nitrato de plata', 
    formula: 'AgNO₃', 
    molarMass: 169.87, 
    type: 'salt',
    nE: 1,
    density: 4.35,
    solubility: 'Soluble'
  },
  { 
    id: 'kmno4', 
    name: 'Permanganato de potasio', 
    formula: 'KMnO₄', 
    molarMass: 158.034, 
    type: 'salt',
    nE: 5, // En medio ácido
    density: 2.70,
    solubility: 'Soluble'
  },
  { 
    id: 'k2cr2o7', 
    name: 'Dicromato de potasio', 
    formula: 'K₂Cr₂O₇', 
    molarMass: 294.185, 
    type: 'salt',
    nE: 6,
    density: 2.68,
    solubility: 'Soluble'
  },

  // ===== COMPUESTOS ORGÁNICOS =====
  { 
    id: 'c6h12o6', 
    name: 'Glucosa', 
    formula: 'C₆H₁₂O₆', 
    molarMass: 180.156, 
    type: 'organic',
    density: 1.54,
    enthalpyFormation: -1273.3
  },
  { 
    id: 'c2h5oh', 
    name: 'Etanol', 
    formula: 'C₂H₅OH', 
    molarMass: 46.068, 
    type: 'organic',
    density: 0.789,
    specificHeat: 2.44,
    enthalpyFormation: -277.7
  },
  { 
    id: 'ch3oh', 
    name: 'Metanol', 
    formula: 'CH₃OH', 
    molarMass: 32.042, 
    type: 'organic',
    density: 0.792,
    specificHeat: 2.51,
    enthalpyFormation: -238.7
  },
  { 
    id: 'c12h22o11', 
    name: 'Sacarosa', 
    formula: 'C₁₂H₂₂O₁₁', 
    molarMass: 342.297, 
    type: 'organic',
    density: 1.587
  },
  { 
    id: 'c3h8o3', 
    name: 'Glicerol', 
    formula: 'C₃H₈O₃', 
    molarMass: 92.094, 
    type: 'organic',
    density: 1.261
  },
  { 
    id: 'c6h6', 
    name: 'Benceno', 
    formula: 'C₆H₆', 
    molarMass: 78.114, 
    type: 'organic',
    density: 0.876,
    enthalpyFormation: 49.0
  },

  // ===== COMPUESTOS INORGÁNICOS/GASES =====
  { 
    id: 'h2o', 
    name: 'Agua', 
    formula: 'H₂O', 
    molarMass: 18.015, 
    type: 'inorganic',
    density: 1.00,
    specificHeat: 4.184,
    enthalpyFormation: -285.8
  },
  { 
    id: 'co2', 
    name: 'Dióxido de carbono', 
    formula: 'CO₂', 
    molarMass: 44.009, 
    type: 'gas',
    enthalpyFormation: -393.5
  },
  { 
    id: 'co', 
    name: 'Monóxido de carbono', 
    formula: 'CO', 
    molarMass: 28.010, 
    type: 'gas',
    enthalpyFormation: -110.5
  },
  { 
    id: 'o2', 
    name: 'Oxígeno', 
    formula: 'O₂', 
    molarMass: 31.998, 
    type: 'gas',
    enthalpyFormation: 0
  },
  { 
    id: 'n2', 
    name: 'Nitrógeno', 
    formula: 'N₂', 
    molarMass: 28.014, 
    type: 'gas',
    enthalpyFormation: 0
  },
  { 
    id: 'h2', 
    name: 'Hidrógeno', 
    formula: 'H₂', 
    molarMass: 2.016, 
    type: 'gas',
    enthalpyFormation: 0
  },
  { 
    id: 'ch4', 
    name: 'Metano', 
    formula: 'CH₄', 
    molarMass: 16.043, 
    type: 'gas',
    enthalpyFormation: -74.8
  },
  { 
    id: 'nh3_gas', 
    name: 'Amoníaco (gas)', 
    formula: 'NH₃', 
    molarMass: 17.031, 
    type: 'gas',
    enthalpyFormation: -46.1
  },
  { 
    id: 'so2', 
    name: 'Dióxido de azufre', 
    formula: 'SO₂', 
    molarMass: 64.066, 
    type: 'gas',
    enthalpyFormation: -296.8
  },
  { 
    id: 'no2', 
    name: 'Dióxido de nitrógeno', 
    formula: 'NO₂', 
    molarMass: 46.005, 
    type: 'gas',
    enthalpyFormation: 33.2
  },
];

// ============ ESCALA DE pH ============
export const PH_SCALE = [
  { ph: 0, color: '#ff0000', label: 'Superácido' },
  { ph: 1, color: '#ff2200', label: 'Ácido fuerte' },
  { ph: 2, color: '#ff4400', label: 'Muy ácido' },
  { ph: 3, color: '#ff6600', label: 'Ácido' },
  { ph: 4, color: '#ff8800', label: 'Ácido moderado' },
  { ph: 5, color: '#ffaa00', label: 'Ligeramente ácido' },
  { ph: 6, color: '#cccc00', label: 'Débilmente ácido' },
  { ph: 7, color: '#00cc00', label: 'Neutro' },
  { ph: 8, color: '#00cccc', label: 'Débilmente básico' },
  { ph: 9, color: '#0099ff', label: 'Ligeramente básico' },
  { ph: 10, color: '#0066ff', label: 'Básico moderado' },
  { ph: 11, color: '#0044ff', label: 'Básico' },
  { ph: 12, color: '#0022ff', label: 'Muy básico' },
  { ph: 13, color: '#0000ff', label: 'Base fuerte' },
  { ph: 14, color: '#4400aa', label: 'Superbase' },
];

// ============ UNIDADES DE CONVERSIÓN ============
export const TEMPERATURE_CONVERSIONS = {
  'K': { toKelvin: (v: number) => v, fromKelvin: (v: number) => v },
  '°C': { toKelvin: (v: number) => v + 273.15, fromKelvin: (v: number) => v - 273.15 },
  '°F': { toKelvin: (v: number) => (v - 32) * 5/9 + 273.15, fromKelvin: (v: number) => (v - 273.15) * 9/5 + 32 },
};

export const PRESSURE_CONVERSIONS = {
  'atm': { toAtm: (v: number) => v, fromAtm: (v: number) => v },
  'kPa': { toAtm: (v: number) => v / 101.325, fromAtm: (v: number) => v * 101.325 },
  'mmHg': { toAtm: (v: number) => v / 760, fromAtm: (v: number) => v * 760 },
  'bar': { toAtm: (v: number) => v / 1.01325, fromAtm: (v: number) => v * 1.01325 },
  'Pa': { toAtm: (v: number) => v / 101325, fromAtm: (v: number) => v * 101325 },
  'psi': { toAtm: (v: number) => v / 14.696, fromAtm: (v: number) => v * 14.696 },
};

export const VOLUME_CONVERSIONS = {
  'L': { toL: (v: number) => v, fromL: (v: number) => v },
  'mL': { toL: (v: number) => v / 1000, fromL: (v: number) => v * 1000 },
  'm³': { toL: (v: number) => v * 1000, fromL: (v: number) => v / 1000 },
  'cm³': { toL: (v: number) => v / 1000, fromL: (v: number) => v * 1000 },
  'gal': { toL: (v: number) => v * 3.785, fromL: (v: number) => v / 3.785 },
};

// ============ CALORES ESPECÍFICOS COMUNES (J/g·°C) ============
export const SPECIFIC_HEATS: Record<string, number> = {
  'Agua': 4.184,
  'Hielo': 2.09,
  'Vapor de agua': 2.01,
  'Etanol': 2.44,
  'Metanol': 2.51,
  'Aceite': 2.0,
  'Hierro': 0.449,
  'Cobre': 0.385,
  'Aluminio': 0.897,
  'Plata': 0.235,
  'Oro': 0.129,
  'Plomo': 0.128,
  'Vidrio': 0.84,
  'Madera': 1.76,
  'Arena': 0.835,
  'Aire': 1.01,
};

// ============ ENTALPÍAS DE FORMACIÓN ESTÁNDAR (kJ/mol) ============
export const FORMATION_ENTHALPIES: Record<string, number> = {
  'H₂O(l)': -285.8,
  'H₂O(g)': -241.8,
  'CO₂(g)': -393.5,
  'CO(g)': -110.5,
  'CH₄(g)': -74.8,
  'C₂H₆(g)': -84.7,
  'C₃H₈(g)': -103.8,
  'C₆H₆(l)': 49.0,
  'CH₃OH(l)': -238.7,
  'C₂H₅OH(l)': -277.7,
  'NH₃(g)': -46.1,
  'NO(g)': 90.3,
  'NO₂(g)': 33.2,
  'N₂O(g)': 81.6,
  'SO₂(g)': -296.8,
  'SO₃(g)': -395.7,
  'HCl(g)': -92.3,
  'HBr(g)': -36.4,
  'HI(g)': 26.5,
  'NaCl(s)': -411.2,
  'NaOH(s)': -425.6,
  'CaCO₃(s)': -1206.9,
  'Fe₂O₃(s)': -824.2,
  'Al₂O₃(s)': -1675.7,
  'C(grafito)': 0,
  'O₂(g)': 0,
  'N₂(g)': 0,
  'H₂(g)': 0,
};
