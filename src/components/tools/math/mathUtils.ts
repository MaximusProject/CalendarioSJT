import { StepDetail, TrigResult, GraphPoint, FunctionData, GraphRange } from "./types";
import { EXACT_VALUES } from "./constants";

// ==================== EVALUADOR SEGURO ====================
export const safeEval = (expression: string): { result: any; error: string | null; steps: string[] } => {
  const steps: string[] = [];
  try {
    let processedExpr = expression
      .replace(/\s/g, '')
      .replace(/π/gi, 'Math.PI')
      .replace(/pi/gi, 'Math.PI')
      .replace(/(?<![a-zA-Z])e(?![a-zA-Z(])/gi, 'Math.E')
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
      if (isNaN(result)) return { result: null, error: "Resultado indefinido (NaN)", steps };
      if (!isFinite(result)) return { result: null, error: "Resultado infinito", steps };
    }
    
    return { result, error: null, steps };
  } catch (error: any) {
    return { result: null, error: `Error de sintaxis: ${error.message}`, steps };
  }
};

// ==================== TRIGONOMETRÍA ====================
export const calculateTrigValues = (
  angleValue: number,
  angleUnit: "deg" | "rad" | "grad",
  precision: number
): { result: TrigResult; steps: StepDetail[] } => {
  let angleRad = angleValue;
  
  const steps: StepDetail[] = [{
    step: 1,
    title: "Conversión de ángulo",
    description: "Convertir ángulo a radianes para cálculo",
    formula: angleUnit === "deg" ? "radianes = grados × π / 180" : 
             angleUnit === "grad" ? "radianes = gradianes × π / 200" : 
             "radianes = ángulo (ya en radianes)",
    calculation: angleUnit === "deg" ? `${angleValue}° × π / 180 = ${(angleValue * Math.PI / 180).toFixed(6)} rad` :
                 angleUnit === "grad" ? `${angleValue} grad × π / 200 = ${(angleValue * Math.PI / 200).toFixed(6)} rad` :
                 `${angleValue} rad`,
    result: "",
    explanation: "Las funciones trigonométricas usan radianes internamente."
  }];

  if (angleUnit === "deg") angleRad = (angleValue * Math.PI) / 180;
  else if (angleUnit === "grad") angleRad = (angleValue * Math.PI) / 200;

  steps[0].result = `Ángulo en radianes: ${angleRad.toFixed(6)}`;

  const sinVal = Math.sin(angleRad);
  const cosVal = Math.cos(angleRad);
  const tanVal = Math.tan(angleRad);
  const unitSuffix = angleUnit === "deg" ? "°" : angleUnit === "rad" ? " rad" : " grad";

  steps.push({
    step: 2,
    title: "Cálculo de funciones básicas",
    description: "Seno, coseno y tangente",
    formula: "sin(θ), cos(θ), tan(θ) = sin(θ)/cos(θ)",
    calculation: `sin(${angleValue}${unitSuffix}) = ${sinVal.toFixed(precision)}\ncos(${angleValue}${unitSuffix}) = ${cosVal.toFixed(precision)}\ntan(${angleValue}${unitSuffix}) = ${Math.abs(cosVal) > 1e-10 ? tanVal.toFixed(precision) : "∞"}`,
    result: `Funciones calculadas con ${precision} decimales`,
    explanation: "El seno y coseno son funciones periódicas entre -1 y 1. La tangente es ±∞ cuando coseno = 0."
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
        description: `Ángulo ${roundedAngle}° es un ángulo notable`,
        formula: "Valores exactos para ángulos notables",
        calculation: `sin = ${result.exactValues.sin}, cos = ${result.exactValues.cos}, tan = ${result.exactValues.tan}`,
        result: "✓ Valores exactos encontrados",
        explanation: "Estos ángulos tienen representaciones exactas en fracciones y raíces."
      });
    }
  }

  return { result, steps };
};

// ==================== TRIÁNGULOS SSS ====================
export const validateTriangleSSS = (a: number, b: number, c: number) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (a <= 0) errors.push(`Lado a = ${a} debe ser mayor que 0`);
  if (b <= 0) errors.push(`Lado b = ${b} debe ser mayor que 0`);
  if (c <= 0) errors.push(`Lado c = ${c} debe ser mayor que 0`);
  
  if (errors.length === 0) {
    if (a + b <= c) errors.push(`a + b = ${a + b} ≤ c = ${c} (viola a + b > c)`);
    if (a + c <= b) errors.push(`a + c = ${a + c} ≤ b = ${b} (viola a + c > b)`);
    if (b + c <= a) errors.push(`b + c = ${b + c} ≤ a = ${a} (viola b + c > a)`);
    
    if (a + b - c < 0.0001) warnings.push("a + b ≈ c (casi degenerado)");
    if (a + c - b < 0.0001) warnings.push("a + c ≈ b (casi degenerado)");
    if (b + c - a < 0.0001) warnings.push("b + c ≈ a (casi degenerado)");
  }
  
  return { isValid: errors.length === 0, errors, warnings, sumArithmetic: a + b + c };
};

export const solveTriangleSSS = (a: number, b: number, c: number) => {
  const perimeter = a + b + c;
  const s = perimeter / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  
  const calcAngle = (opp: number, adj1: number, adj2: number) => {
    const cos = (adj1 * adj1 + adj2 * adj2 - opp * opp) / (2 * adj1 * adj2);
    return Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
  };
  
  const angleA = calcAngle(a, b, c);
  const angleB = calcAngle(b, a, c);
  const angleC = 180 - angleA - angleB;
  
  let type = "Escaleno";
  if (Math.abs(a - b) < 1e-10 && Math.abs(b - c) < 1e-10) type = "Equilátero";
  else if (Math.abs(a - b) < 1e-10 || Math.abs(a - c) < 1e-10 || Math.abs(b - c) < 1e-10) type = "Isósceles";
  
  const maxAngle = Math.max(angleA, angleB, angleC);
  let angleType = "Acutángulo";
  if (Math.abs(maxAngle - 90) < 1e-5) angleType = "Rectángulo";
  else if (maxAngle > 90) angleType = "Obtusángulo";
  
  const height = (2 * area) / a;
  const inscribedRadius = area / s;
  const circumscribedRadius = (a * b * c) / (4 * area);
  
  return {
    perimeter, area, semiperimeter: s,
    angles: { A: angleA, B: angleB, C: angleC, sum: angleA + angleB + angleC },
    type: `${type} ${angleType}`,
    height, inscribedRadius, circumscribedRadius
  };
};

export const generateSSSSteps = (a: number, b: number, c: number, validation: any, solution: any): StepDetail[] => {
  const steps: StepDetail[] = [];
  let step = 1;
  
  if (!validation.isValid) {
    steps.push({
      step: step++, title: "Validación", description: "Verificación de entrada",
      formula: "a > 0, b > 0, c > 0, a + b > c, a + c > b, b + c > a",
      calculation: `a = ${a}, b = ${b}, c = ${c}`,
      result: "❌ TRIÁNGULO INVÁLIDO",
      explanation: validation.errors.join(". ")
    });
    return steps;
  }

  steps.push({
    step: step++, title: "✓ Validación exitosa", description: "Todas las condiciones cumplidas",
    formula: "a + b > c, a + c > b, b + c > a",
    calculation: `${a}+${b}=${a+b}>${c} ✓ | ${a}+${c}=${a+c}>${b} ✓ | ${b}+${c}=${b+c}>${a} ✓`,
    result: "VÁLIDO", explanation: "El triángulo cumple la desigualdad triangular."
  });

  steps.push({
    step: step++, title: "Perímetro", description: "Suma de todos los lados",
    formula: "P = a + b + c", calculation: `P = ${a} + ${b} + ${c}`,
    result: `P = ${solution.perimeter.toFixed(4)}`, explanation: ""
  });

  steps.push({
    step: step++, title: "Semiperímetro", description: "Para fórmula de Herón",
    formula: "s = P / 2", calculation: `s = ${solution.perimeter.toFixed(4)} / 2`,
    result: `s = ${solution.semiperimeter.toFixed(4)}`, explanation: ""
  });

  steps.push({
    step: step++, title: "Área (Herón)", description: "Fórmula de Herón",
    formula: "A = √[s(s-a)(s-b)(s-c)]",
    calculation: `A = √[${solution.semiperimeter.toFixed(2)}×(${(solution.semiperimeter-a).toFixed(2)})×(${(solution.semiperimeter-b).toFixed(2)})×(${(solution.semiperimeter-c).toFixed(2)})]`,
    result: `A = ${solution.area.toFixed(4)}`, explanation: ""
  });

  steps.push({
    step: step++, title: "Ángulo A (Cosenos)", description: "Ley de cosenos",
    formula: "cos(A) = (b² + c² - a²) / (2bc)",
    calculation: `cos(A) = (${b}² + ${c}² - ${a}²) / (2×${b}×${c})`,
    result: `A = ${solution.angles.A.toFixed(2)}°`, explanation: ""
  });

  steps.push({
    step: step++, title: "Ángulo B (Cosenos)", description: "Ley de cosenos",
    formula: "cos(B) = (a² + c² - b²) / (2ac)",
    calculation: `cos(B) = (${a}² + ${c}² - ${b}²) / (2×${a}×${c})`,
    result: `B = ${solution.angles.B.toFixed(2)}°`, explanation: ""
  });

  steps.push({
    step: step++, title: "Ángulo C", description: "Suma de ángulos = 180°",
    formula: "C = 180° - A - B",
    calculation: `C = 180° - ${solution.angles.A.toFixed(2)}° - ${solution.angles.B.toFixed(2)}°`,
    result: `C = ${solution.angles.C.toFixed(2)}° (Suma: ${solution.angles.sum.toFixed(1)}°)`, explanation: ""
  });

  steps.push({
    step: step++, title: "Clasificación", description: "Tipo de triángulo",
    formula: "Por lados y ángulos", calculation: `Lados: ${a}, ${b}, ${c} | Ángulos: ${solution.angles.A.toFixed(1)}°, ${solution.angles.B.toFixed(1)}°, ${solution.angles.C.toFixed(1)}°`,
    result: solution.type, explanation: ""
  });

  steps.push({
    step: step++, title: "Propiedades adicionales", description: "Altura, inradio, circunradio",
    formula: "hₐ = 2A/a, r = A/s, R = abc/(4A)",
    calculation: `hₐ = ${solution.height.toFixed(4)}, r = ${solution.inscribedRadius.toFixed(4)}, R = ${solution.circumscribedRadius.toFixed(4)}`,
    result: "Propiedades calculadas", explanation: ""
  });

  return steps;
};

// ==================== ÁLGEBRA ====================
export const solveLinearEquation = (equation: string, precision: number): { solutions: string[]; steps: StepDetail[]; error?: string } => {
  const steps: StepDetail[] = [];
  const match = equation.match(/([-+]?\d*\.?\d*)x\s*([+-]\s*\d+\.?\d*)?\s*=\s*([-+]?\d+\.?\d*)/i);
  
  if (!match) return { solutions: [], steps: [], error: "Formato inválido. Use: ax + b = c" };
  
  const a = parseFloat(match[1] || "1") || 1;
  const b = parseFloat(match[2]?.replace(/\s/g, '') || "0");
  const c = parseFloat(match[3]);
  
  steps.push({
    step: 1, title: "Identificación", description: "Extraer coeficientes",
    formula: "ax + b = c", calculation: `a = ${a}, b = ${b}, c = ${c}`,
    result: "✓ Coeficientes identificados",
    explanation: "'a' es el coeficiente de x, 'b' el término independiente, 'c' el lado derecho."
  });
  
  steps.push({
    step: 2, title: "Aislar x", description: "Restar b de ambos lados",
    formula: "ax = c - b", calculation: `${a}x = ${c} - (${b}) = ${c - b}`,
    result: `${a}x = ${c - b}`,
    explanation: "Movemos el término constante al otro lado."
  });
  
  const sol = (c - b) / a;
  steps.push({
    step: 3, title: "Despejar x", description: "Dividir por a",
    formula: "x = (c - b) / a", calculation: `x = ${c - b} / ${a} = ${sol.toFixed(precision)}`,
    result: `x = ${sol.toFixed(precision)}`,
    explanation: "Dividimos ambos lados por el coeficiente para obtener x."
  });
  
  return { solutions: [sol.toFixed(precision)], steps };
};

export const solveQuadraticEquation = (equation: string, precision: number): { solutions: string[]; discriminant: number; nature: string; steps: StepDetail[]; error?: string } => {
  const steps: StepDetail[] = [];
  const match = equation.match(/([-+]?\d*\.?\d*)x[²\^]?2?\s*([+-]\s*\d*\.?\d*)x?\s*([+-]\s*\d+\.?\d*)?\s*=\s*0/i);
  
  if (!match) return { solutions: [], discriminant: 0, nature: "", steps: [], error: "Formato: ax² + bx + c = 0" };
  
  const a = parseFloat(match[1] || "1") || 1;
  const b = parseFloat(match[2]?.replace(/\s/g, '') || "0");
  const c = parseFloat(match[3]?.replace(/\s/g, '') || "0");
  const discriminant = b * b - 4 * a * c;
  
  steps.push({
    step: 1, title: "Coeficientes", description: "ax² + bx + c = 0",
    formula: "ax² + bx + c = 0", calculation: `a = ${a}, b = ${b}, c = ${c}`,
    result: "✓ Identificados", explanation: ""
  });
  
  steps.push({
    step: 2, title: "Discriminante", description: "Δ = b² - 4ac",
    formula: "Δ = b² - 4ac",
    calculation: `Δ = (${b})² - 4×${a}×${c} = ${b*b} - ${4*a*c} = ${discriminant}`,
    result: `Δ = ${discriminant.toFixed(precision)}`,
    explanation: "Δ > 0: 2 reales, Δ = 0: 1 doble, Δ < 0: complejas."
  });
  
  let solutions: string[] = [];
  let nature = "";
  
  if (discriminant > 0) {
    nature = "Dos raíces reales distintas";
    const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    solutions = [x1.toFixed(precision), x2.toFixed(precision)];
    
    steps.push({
      step: 3, title: "Fórmula cuadrática", description: "x = (-b ± √Δ) / 2a",
      formula: "x = [-b ± √(b² - 4ac)] / 2a",
      calculation: `x₁ = [-(${b}) + √${discriminant.toFixed(4)}] / (2×${a}) = ${x1.toFixed(precision)}\nx₂ = [-(${b}) - √${discriminant.toFixed(4)}] / (2×${a}) = ${x2.toFixed(precision)}`,
      result: `x₁ = ${x1.toFixed(precision)}, x₂ = ${x2.toFixed(precision)}`,
      explanation: "Con discriminante positivo hay dos soluciones reales."
    });
  } else if (discriminant === 0) {
    nature = "Una raíz real doble";
    const x = -b / (2 * a);
    solutions = [x.toFixed(precision)];
    
    steps.push({
      step: 3, title: "Raíz doble", description: "x = -b / 2a",
      formula: "x = -b / 2a",
      calculation: `x = -(${b}) / (2×${a}) = ${x.toFixed(precision)}`,
      result: `x = ${x.toFixed(precision)}`,
      explanation: "La parábola toca el eje x en un solo punto."
    });
  } else {
    nature = "Dos raíces complejas conjugadas";
    const re = -b / (2 * a);
    const im = Math.sqrt(-discriminant) / (2 * a);
    solutions = [`${re.toFixed(precision)} + ${im.toFixed(precision)}i`, `${re.toFixed(precision)} - ${im.toFixed(precision)}i`];
    
    steps.push({
      step: 3, title: "Raíces complejas", description: "x = [-b ± i√(-Δ)] / 2a",
      formula: "x = [-b ± i√(-Δ)] / 2a",
      calculation: `Re = -(${b})/(2×${a}) = ${re.toFixed(precision)}\nIm = √(${-discriminant})/(2×${a}) = ${im.toFixed(precision)}`,
      result: `${solutions[0]}, ${solutions[1]}`,
      explanation: "Las soluciones son números complejos conjugados."
    });
  }
  
  return { solutions, discriminant, nature, steps };
};

// ==================== CÁLCULO ====================
export const calculateDerivative = (func: string, precision: number): { result: string; steps: StepDetail[] } => {
  const steps: StepDetail[] = [];
  const f = func.toLowerCase().trim();
  let derivative = "";

  steps.push({
    step: 1, title: "Identificación", description: "Analizar función para derivación",
    formula: `f(x) = ${func}`, calculation: "Identificar términos y reglas aplicables",
    result: "✓ Función analizada", explanation: ""
  });

  // Potencia: ax^n
  const powerMatch = f.match(/^(\d*\.?\d*)?x\^?(\d+\.?\d*)?$/);
  if (powerMatch) {
    const coeff = parseFloat(powerMatch[1] || "1") || 1;
    const n = parseFloat(powerMatch[2] || "1") || 1;
    const newCoeff = coeff * n;
    const newPow = n - 1;
    derivative = newPow === 0 ? `${newCoeff}` : newPow === 1 ? `${newCoeff}x` : `${newCoeff}x^${newPow}`;
    
    steps.push({
      step: 2, title: "Regla de la potencia", description: "d/dx(axⁿ) = anx^(n-1)",
      formula: `d/dx(${coeff === 1 ? '' : coeff}x^${n}) = ${coeff}×${n}x^(${n}-1)`,
      calculation: `= ${newCoeff}x^${newPow}`,
      result: `f'(x) = ${derivative}`, explanation: "Regla fundamental para polinomios."
    });
  } else if (f === "sin(x)") {
    derivative = "cos(x)";
    steps.push({ step: 2, title: "Derivada de seno", description: "d/dx(sin x) = cos x", formula: "d/dx(sin x) = cos x", calculation: "", result: "f'(x) = cos(x)", explanation: "" });
  } else if (f === "cos(x)") {
    derivative = "-sin(x)";
    steps.push({ step: 2, title: "Derivada de coseno", description: "d/dx(cos x) = -sin x", formula: "d/dx(cos x) = -sin x", calculation: "", result: "f'(x) = -sin(x)", explanation: "" });
  } else if (f === "tan(x)") {
    derivative = "sec²(x)";
    steps.push({ step: 2, title: "Derivada de tangente", description: "d/dx(tan x) = sec²(x)", formula: "d/dx(tan x) = sec²(x)", calculation: "", result: "f'(x) = sec²(x)", explanation: "" });
  } else if (f === "e^x" || f === "exp(x)") {
    derivative = "e^x";
    steps.push({ step: 2, title: "Derivada exponencial", description: "d/dx(eˣ) = eˣ", formula: "d/dx(eˣ) = eˣ", calculation: "", result: "f'(x) = e^x", explanation: "" });
  } else if (f === "ln(x)") {
    derivative = "1/x";
    steps.push({ step: 2, title: "Derivada logarítmica", description: "d/dx(ln x) = 1/x", formula: "d/dx(ln x) = 1/x", calculation: "", result: "f'(x) = 1/x", explanation: "" });
  } else if (f === "sqrt(x)") {
    derivative = "1/(2√x)";
    steps.push({ step: 2, title: "Derivada de raíz", description: "d/dx(√x) = 1/(2√x)", formula: "d/dx(x^(1/2)) = (1/2)x^(-1/2)", calculation: "", result: "f'(x) = 1/(2√x)", explanation: "" });
  } else {
    derivative = "Derivada numérica (ver gráficas)";
    steps.push({ step: 2, title: "Función compleja", description: "Derivada simbólica no disponible", formula: "", calculation: "Use gráficas para derivada numérica", result: "Derivada numérica disponible en gráficas", explanation: "" });
  }

  return { result: derivative, steps };
};

export const calculateIntegral = (func: string): { result: string; steps: StepDetail[] } => {
  const steps: StepDetail[] = [];
  const f = func.toLowerCase().trim();
  let integral = "";

  steps.push({
    step: 1, title: "Integración", description: "Encontrar integral indefinida",
    formula: `∫${func} dx`, calculation: "Aplicando reglas de integración",
    result: "", explanation: ""
  });

  const powerMatch = f.match(/^(\d*\.?\d*)?x\^?(\d+\.?\d*)?$/);
  if (powerMatch) {
    const coeff = parseFloat(powerMatch[1] || "1") || 1;
    const n = parseFloat(powerMatch[2] || "1") || 1;
    const newPow = n + 1;
    const newCoeff = coeff / newPow;
    integral = `${newCoeff === 1 ? '' : newCoeff.toFixed(4)}x^${newPow}`;
    steps[0].result = `∫${func} dx = ${integral} + C`;
  } else if (f === "sin(x)") {
    integral = "-cos(x)";
    steps[0].result = "∫sin(x) dx = -cos(x) + C";
  } else if (f === "cos(x)") {
    integral = "sin(x)";
    steps[0].result = "∫cos(x) dx = sin(x) + C";
  } else if (f === "e^x" || f === "exp(x)") {
    integral = "e^x";
    steps[0].result = "∫eˣ dx = eˣ + C";
  } else if (f === "1/x") {
    integral = "ln|x|";
    steps[0].result = "∫1/x dx = ln|x| + C";
  } else {
    integral = `∫${func} dx`;
    steps[0].result = "Integral numérica disponible en gráficas";
  }

  return { result: integral + " + C", steps };
};

// ==================== GRÁFICAS ====================
export const generateGraphData = (
  functionInput: string,
  graphRange: GraphRange,
  showDerivative: boolean,
  showIntegral: boolean
): { data: FunctionData | null; error: string | null } => {
  if (!functionInput.trim()) return { data: null, error: "Función vacía" };

  try {
    const points: GraphPoint[] = [];
    const derivativePoints: GraphPoint[] = [];
    const integralPoints: GraphPoint[] = [];
    let integralAccumulator = 0;
    
    for (let x = graphRange.min; x <= graphRange.max; x += graphRange.step) {
      try {
        const expr = functionInput.replace(/x/g, `(${x})`);
        const { result: y, error } = safeEval(expr);
        
        if (!error && typeof y === 'number' && isFinite(y) && Math.abs(y) < 1e6) {
          points.push({ x: parseFloat(x.toFixed(4)), y });
          
          if (showDerivative && x > graphRange.min) {
            const prevX = x - graphRange.step;
            const prevExpr = functionInput.replace(/x/g, `(${prevX})`);
            const { result: prevY } = safeEval(prevExpr);
            if (typeof prevY === 'number' && isFinite(prevY)) {
              derivativePoints.push({ x: parseFloat(x.toFixed(4)), y: (y - prevY) / graphRange.step });
            }
          }
          
          if (showIntegral && x > graphRange.min) {
            const prevX = x - graphRange.step;
            const prevExpr = functionInput.replace(/x/g, `(${prevX})`);
            const { result: prevY } = safeEval(prevExpr);
            if (typeof prevY === 'number' && isFinite(prevY)) {
              integralAccumulator += ((y + prevY) / 2) * graphRange.step;
              integralPoints.push({ x: parseFloat(x.toFixed(4)), y: integralAccumulator });
            }
          }
        }
      } catch { continue; }
    }
    
    if (points.length === 0) return { data: null, error: "No se calcularon puntos válidos" };
    
    const yValues = points.map(p => p.y);
    return {
      data: {
        points,
        domain: [graphRange.min, graphRange.max],
        range: [Math.min(...yValues), Math.max(...yValues)],
        derivativePoints: showDerivative ? derivativePoints : undefined,
        integralPoints: showIntegral ? integralPoints : undefined
      },
      error: null
    };
  } catch {
    return { data: null, error: "Error al generar gráfica" };
  }
};
