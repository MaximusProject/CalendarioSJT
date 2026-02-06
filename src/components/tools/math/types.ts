// ==================== INTERFACES Y TIPOS ====================

export interface TrigResult {
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

export interface TriangleResult {
  valid: boolean;
  sides: { a: number; b: number; c: number };
  angles?: { A: number; B: number; C: number; sum?: number };
  area?: number;
  perimeter?: number;
  type?: string;
  steps: StepDetail[];
  height?: number;
  inscribedRadius?: number;
  circumscribedRadius?: number;
  errors?: string[];
  sumArithmetic?: number;
}

export interface GraphPoint {
  x: number;
  y: number;
}

export interface FunctionData {
  points: GraphPoint[];
  domain: [number, number];
  range: [number, number];
  derivativePoints?: GraphPoint[];
  integralPoints?: GraphPoint[];
}

export interface MathHistoryItem {
  id: string;
  type: string;
  input: string;
  result: string;
  timestamp: Date;
}

export interface CalculusResult {
  derivative: string;
  integral: string;
  limit: string;
  steps: StepDetail[];
}

export interface StepDetail {
  step: number;
  title: string;
  description: string;
  formula: string;
  calculation: string;
  result: string;
  explanation: string;
}

export interface AlgebraResult {
  solutions: string[];
  discriminant?: number;
  nature?: string;
  steps: StepDetail[];
}

export interface GraphRange {
  min: number;
  max: number;
  step: number;
}
