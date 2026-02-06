// ==================== CONSTANTES Y DATOS ====================

export const NOTABLE_ANGLES = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];

export const EXACT_VALUES: Record<number, { sin: string; cos: string; tan: string }> = {
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

export const GRAPH_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
];

export const TEST_CASES_SSS = [
  { name: "Válido (3,4,5)", a: 3, b: 4, c: 5, expected: "Triángulo rectángulo escaleno" },
  { name: "Equilátero (10,10,10)", a: 10, b: 10, c: 10, expected: "Triángulo equilátero" },
  { name: "Inválido (50,7,40)", a: 50, b: 7, c: 40, expected: "Error de desigualdad" },
  { name: "Inválido (5,0,5)", a: 5, b: 0, c: 5, expected: "Error lado ≤ 0" },
  { name: "Inválido (3,4,-5)", a: 3, b: 4, c: -5, expected: "Error lado ≤ 0" },
  { name: "Límite válido (1,1,1.9999)", a: 1, b: 1, c: 1.9999, expected: "Triángulo isósceles" },
  { name: "Límite inválido (1,1,2)", a: 1, b: 1, c: 2, expected: "Error de desigualdad" },
];

export const BASIC_OPERATIONS = [
  { type: "number", value: "7" }, { type: "number", value: "8" }, { type: "number", value: "9" }, { type: "operator", value: "/" },
  { type: "number", value: "4" }, { type: "number", value: "5" }, { type: "number", value: "6" }, { type: "operator", value: "*" },
  { type: "number", value: "1" }, { type: "number", value: "2" }, { type: "number", value: "3" }, { type: "operator", value: "-" },
  { type: "number", value: "0" }, { type: "number", value: "." }, { type: "operator", value: "=" }, { type: "operator", value: "+" }
];

export const ADVANCED_OPERATIONS = [
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

export const COMMON_FUNCTIONS = [
  { label: "x²", value: "x^2" },
  { label: "x³", value: "x^3" },
  { label: "sin(x)", value: "sin(x)" },
  { label: "cos(x)", value: "cos(x)" },
  { label: "tan(x)", value: "tan(x)" },
  { label: "eˣ", value: "exp(x)" },
  { label: "ln(x)", value: "ln(x)" },
  { label: "√x", value: "sqrt(x)" },
  { label: "1/x", value: "1/x" },
  { label: "|x|", value: "abs(x)" },
];
