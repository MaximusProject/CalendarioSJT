 // ============================================
 // Utilidades de Cálculo - Física Avanzada
 // ============================================
 
 import { CalculationStep, GraphData, PhysicsResult, UnitInfo } from "./types";
 import { UNIT_SYSTEM, PHYSICS_CONSTANTS } from "./constants";
 
 // ==========================================
 // UTILIDADES DE FORMATO Y CONVERSIÓN
 // ==========================================
 
 export const parseScientificInput = (value: string): number | null => {
   if (value === null || value === undefined || value.trim() === '') {
     return null;
   }
   const cleanValue = value.trim().replace(/,/g, '.');
   const num = Number(cleanValue);
   if (isNaN(num) || !isFinite(num)) {
     return null;
   }
   return num;
 };
 
 export const formatNumber = (num: number, decimalPlaces: number = 4): string => {
   if (num === null || isNaN(num)) return "N/A";
   if (Number.isInteger(num) && decimalPlaces > 0 && Math.abs(num) < 1e6) {
     return num.toString();
   }
   if (Math.abs(num) > 1e6 || (Math.abs(num) < 1e-4 && num !== 0)) {
     return num.toExponential(decimalPlaces);
   }
   return num.toFixed(decimalPlaces);
 };
 
 export const convertUnit = (
   value: number, 
   fromUnit: string, 
   toUnit: string, 
   category: keyof typeof UNIT_SYSTEM
 ): number => {
   try {
     const unitMap = UNIT_SYSTEM[category];
     if (unitMap) {
       const fromInfo = unitMap[fromUnit as keyof typeof unitMap] as UnitInfo;
       const toInfo = unitMap[toUnit as keyof typeof unitMap] as UnitInfo;
       if (fromInfo && toInfo) {
         const baseValue = value * fromInfo.factor;
         return baseValue / toInfo.factor;
       }
     }
     return value;
   } catch (error) {
     console.error('Error en conversión:', error);
     return value;
   }
 };
 
 export const autoConvert = (
   value: number | null,
   currentUnit: string,
   targetUnit: string,
   category: keyof typeof UNIT_SYSTEM,
   decimalPlaces: number = 4
 ): { value: number; converted: boolean; message?: string } => {
   if (value === null) return { value: 0, converted: false };
   if (currentUnit !== targetUnit) {
     const convertedValue = convertUnit(value, currentUnit, targetUnit, category);
     return {
       value: convertedValue,
       converted: true,
       message: `${formatNumber(value, decimalPlaces)} ${currentUnit} → ${formatNumber(convertedValue, decimalPlaces)} ${targetUnit}`
     };
   }
   return { value, converted: false };
 };
 
 // ==========================================
 // GENERADORES DE GRÁFICOS
 // ==========================================
 
 export const generateTrajectoryData = (
   v0x: number,
   v0y: number,
   g: number,
   tTotal: number,
   points: number = 25
 ): { x: number; y: number }[] => {
   const data: { x: number; y: number }[] = [];
   for (let t = 0; t <= tTotal * 1.05; t += tTotal / points) {
     const x = v0x * t;
     const y = v0y * t - 0.5 * g * t * t;
     if (y >= -0.1) {
       data.push({ x, y: Math.max(0, y) });
     }
   }
   return data;
 };
 
 export const generatePositionTimeData = (
   v0: number,
   a: number,
   tTotal: number,
   initialHeight: number = 0,
   points: number = 25
 ): { x: number; y: number }[] => {
   const data: { x: number; y: number }[] = [];
   for (let t = 0; t <= tTotal; t += tTotal / points) {
     const y = initialHeight + v0 * t + 0.5 * a * t * t;
     data.push({ x: t, y });
   }
   return data;
 };
 
 export const generateVelocityTimeData = (
   v0: number,
   a: number,
   tTotal: number,
   points: number = 25
 ): { x: number; y: number }[] => {
   const data: { x: number; y: number }[] = [];
   for (let t = 0; t <= tTotal; t += tTotal / points) {
     const v = v0 + a * t;
     data.push({ x: t, y: v });
   }
   return data;
 };
 
 // ==========================================
 // CÁLCULOS DE CINEMÁTICA
 // ==========================================
 
 export const calculateVerticalLaunch = (
   v0: number,
   g: number,
   decimalPlaces: number
 ): PhysicsResult => {
   const steps: CalculationStep[] = [];
   const graphs: GraphData[] = [];
   const fmt = (n: number) => formatNumber(n, decimalPlaces);
 
   // Altura máxima
   const hMax = (v0 * v0) / (2 * g);
   steps.push({
     formula: "h_max = v₀² / (2g)",
     substitution: `h_max = (${fmt(v0)})² / (2 × ${fmt(g)})`,
     result: `h_max = ${fmt(hMax)} m`,
     explanation: "La altura máxima se alcanza cuando la velocidad vertical es cero"
   });
 
   // Tiempo de subida
   const tSubida = v0 / g;
   steps.push({
     formula: "t_subida = v₀ / g",
     substitution: `t_subida = ${fmt(v0)} / ${fmt(g)}`,
     result: `t_subida = ${fmt(tSubida)} s`,
     explanation: "Tiempo que tarda en alcanzar la altura máxima"
   });
 
   // Tiempo total
   const tTotal = 2 * tSubida;
   steps.push({
     formula: "t_total = 2 × t_subida",
     substitution: `t_total = 2 × ${fmt(tSubida)}`,
     result: `t_total = ${fmt(tTotal)} s`,
     explanation: "Tiempo total de vuelo (subida + bajada)"
   });
 
   // Velocidad final
   const vFinal = v0;
   steps.push({
     formula: "v_final = v₀ (conservación de energía)",
     substitution: `v_final = ${fmt(v0)}`,
     result: `v_final = ${fmt(vFinal)} m/s (hacia abajo)`,
     explanation: "La velocidad final tiene la misma magnitud que la inicial"
   });
 
   // Gráficos
   graphs.push({
     title: "Altura vs Tiempo",
     type: "line",
     data: generatePositionTimeData(v0, -g, tTotal, 0),
     xLabel: "Tiempo (s)",
     yLabel: "Altura (m)",
     color: "#3b82f6"
   });
 
   graphs.push({
     title: "Velocidad vs Tiempo",
     type: "line",
     data: generateVelocityTimeData(v0, -g, tTotal),
     xLabel: "Tiempo (s)",
     yLabel: "Velocidad (m/s)",
     color: "#ef4444"
   });
 
   return {
     title: "Lanzamiento Vertical",
     steps,
     finalResults: [
       { label: "Altura máxima", value: fmt(hMax), unit: "m", description: "Máxima altura alcanzada" },
       { label: "Tiempo de subida", value: fmt(tSubida), unit: "s", description: "Tiempo hasta altura máxima" },
       { label: "Tiempo total", value: fmt(tTotal), unit: "s", description: "Tiempo total de vuelo" },
       { label: "Velocidad final", value: fmt(vFinal), unit: "m/s", description: "Velocidad al regresar" }
     ],
     graphs,
     assumptions: [
       "Sin resistencia del aire",
       `g = ${fmt(g)} m/s²`,
       "Aceleración constante"
     ]
   };
 };
 
 export const calculateHorizontalLaunch = (
   vx: number,
   h: number,
   g: number,
   decimalPlaces: number
 ): PhysicsResult => {
   const steps: CalculationStep[] = [];
   const graphs: GraphData[] = [];
   const fmt = (n: number) => formatNumber(n, decimalPlaces);
 
   // Tiempo de caída
   const tCaida = Math.sqrt((2 * h) / g);
   steps.push({
     formula: "t = √(2h / g)",
     substitution: `t = √(2 × ${fmt(h)} / ${fmt(g)})`,
     result: `t = ${fmt(tCaida)} s`,
     explanation: "Tiempo de caída desde la altura h"
   });
 
   // Alcance horizontal
   const alcance = vx * tCaida;
   steps.push({
     formula: "x = v₀ × t",
     substitution: `x = ${fmt(vx)} × ${fmt(tCaida)}`,
     result: `x = ${fmt(alcance)} m`,
     explanation: "Distancia horizontal recorrida"
   });
 
   // Velocidad vertical final
   const vy = g * tCaida;
   steps.push({
     formula: "v_y = g × t",
     substitution: `v_y = ${fmt(g)} × ${fmt(tCaida)}`,
     result: `v_y = ${fmt(vy)} m/s`,
     explanation: "Componente vertical al impactar"
   });
 
   // Velocidad resultante
   const vResultante = Math.sqrt(vx * vx + vy * vy);
   steps.push({
     formula: "v = √(v_x² + v_y²)",
     substitution: `v = √(${fmt(vx)}² + ${fmt(vy)}²)`,
     result: `v = ${fmt(vResultante)} m/s`,
     explanation: "Velocidad total al impactar"
   });
 
   // Ángulo de impacto
   const impactAngle = Math.atan(vy / vx) * 180 / Math.PI;
   steps.push({
     formula: "θ = arctan(v_y / v_x)",
     substitution: `θ = arctan(${fmt(vy)} / ${fmt(vx)})`,
     result: `θ = ${fmt(impactAngle)}°`,
     explanation: "Ángulo respecto a la horizontal al impactar"
   });
 
   // Trayectoria
   const trajectoryData: { x: number; y: number }[] = [];
   for (let t = 0; t <= tCaida * 1.05; t += tCaida / 25) {
     const x = vx * t;
     const y = h - 0.5 * g * t * t;
     if (y >= 0) trajectoryData.push({ x, y });
   }
 
   graphs.push({
     title: "Trayectoria Parabólica",
     type: "scatter",
     data: trajectoryData,
     xLabel: "Distancia (m)",
     yLabel: "Altura (m)",
     color: "#10b981"
   });
 
   return {
     title: "Lanzamiento Horizontal",
     steps,
     finalResults: [
       { label: "Tiempo de caída", value: fmt(tCaida), unit: "s" },
       { label: "Alcance horizontal", value: fmt(alcance), unit: "m" },
       { label: "Velocidad vertical", value: fmt(vy), unit: "m/s" },
       { label: "Velocidad final", value: fmt(vResultante), unit: "m/s" },
       { label: "Ángulo de impacto", value: fmt(impactAngle), unit: "°" }
     ],
     graphs,
     assumptions: [
       "Sin resistencia del aire",
       `g = ${fmt(g)} m/s²`,
       "Velocidad horizontal constante"
     ]
   };
 };
 
 export const calculateInclinedLaunch = (
   v0: number,
   angleDeg: number,
   g: number,
   decimalPlaces: number
 ): PhysicsResult => {
   const steps: CalculationStep[] = [];
   const graphs: GraphData[] = [];
   const fmt = (n: number) => formatNumber(n, decimalPlaces);
   const angleRad = angleDeg * Math.PI / 180;
 
   // Componentes
   const v0x = v0 * Math.cos(angleRad);
   const v0y = v0 * Math.sin(angleRad);
   steps.push({
     formula: "v₀x = v₀·cos(θ) ; v₀y = v₀·sin(θ)",
     substitution: `v₀x = ${fmt(v0)}·cos(${fmt(angleDeg)}°) ; v₀y = ${fmt(v0)}·sin(${fmt(angleDeg)}°)`,
     result: `v₀x = ${fmt(v0x)} m/s ; v₀y = ${fmt(v0y)} m/s`,
     explanation: "Descomposición de la velocidad inicial"
   });
 
   // Altura máxima
   const hMax = (v0y * v0y) / (2 * g);
   steps.push({
     formula: "h_max = v₀y² / (2g)",
     substitution: `h_max = (${fmt(v0y)})² / (2 × ${fmt(g)})`,
     result: `h_max = ${fmt(hMax)} m`,
     explanation: "Altura máxima del proyectil"
   });
 
   // Tiempo total
   const tTotal = (2 * v0y) / g;
   steps.push({
     formula: "t_total = (2·v₀y) / g",
     substitution: `t_total = (2 × ${fmt(v0y)}) / ${fmt(g)}`,
     result: `t_total = ${fmt(tTotal)} s`,
     explanation: "Tiempo total de vuelo"
   });
 
   // Alcance
   const alcance = v0x * tTotal;
   steps.push({
     formula: "R = v₀x × t_total",
     substitution: `R = ${fmt(v0x)} × ${fmt(tTotal)}`,
     result: `R = ${fmt(alcance)} m`,
     explanation: "Alcance horizontal máximo"
   });
 
   // Fórmula alternativa del alcance
   const alcanceAlt = (v0 * v0 * Math.sin(2 * angleRad)) / g;
   steps.push({
     formula: "R = v₀²·sin(2θ) / g",
     substitution: `R = (${fmt(v0)})²·sin(2×${fmt(angleDeg)}°) / ${fmt(g)}`,
     result: `R = ${fmt(alcanceAlt)} m`,
     explanation: "Verificación con fórmula alternativa"
   });
 
   graphs.push({
     title: "Trayectoria Parabólica",
     type: "scatter",
     data: generateTrajectoryData(v0x, v0y, g, tTotal),
     xLabel: "Alcance (m)",
     yLabel: "Altura (m)",
     color: "#8b5cf6"
   });
 
   return {
     title: "Lanzamiento Inclinado",
     steps,
     finalResults: [
       { label: "Velocidad horizontal", value: fmt(v0x), unit: "m/s" },
       { label: "Velocidad vertical", value: fmt(v0y), unit: "m/s" },
       { label: "Altura máxima", value: fmt(hMax), unit: "m" },
       { label: "Tiempo de vuelo", value: fmt(tTotal), unit: "s" },
       { label: "Alcance máximo", value: fmt(alcance), unit: "m" }
     ],
     graphs,
     assumptions: [
       "Sin resistencia del aire",
       `g = ${fmt(g)} m/s²`,
       `Ángulo: ${fmt(angleDeg)}°`
     ]
   };
 };
 
 export const calculateMRU = (
   velocity: number | null,
   time: number | null,
   distance: number | null,
   decimalPlaces: number
 ): PhysicsResult => {
   const steps: CalculationStep[] = [];
   const graphs: GraphData[] = [];
   const fmt = (n: number) => formatNumber(n, decimalPlaces);
 
   let v = velocity;
   let t = time;
   let d = distance;
 
   if (v !== null && t !== null) {
     d = v * t;
     steps.push({
       formula: "d = v × t",
       substitution: `d = ${fmt(v)} × ${fmt(t)}`,
       result: `d = ${fmt(d)} m`,
       explanation: "Distancia recorrida con velocidad constante"
     });
   } else if (d !== null && t !== null) {
     v = d / t;
     steps.push({
       formula: "v = d / t",
       substitution: `v = ${fmt(d)} / ${fmt(t)}`,
       result: `v = ${fmt(v)} m/s`,
       explanation: "Velocidad constante calculada"
     });
   } else if (d !== null && v !== null) {
     t = d / v;
     steps.push({
       formula: "t = d / v",
       substitution: `t = ${fmt(d)} / ${fmt(v)}`,
       result: `t = ${fmt(t)} s`,
       explanation: "Tiempo requerido"
     });
   }
 
   const maxTime = t || 10;
   graphs.push({
     title: "Posición vs Tiempo",
     type: "line",
     data: generatePositionTimeData(v || 0, 0, maxTime),
     xLabel: "Tiempo (s)",
     yLabel: "Posición (m)",
     color: "#3b82f6"
   });
 
   return {
     title: "Movimiento Rectilíneo Uniforme (MRU)",
     steps,
     finalResults: [
       { label: "Velocidad", value: fmt(v || 0), unit: "m/s" },
       { label: "Tiempo", value: fmt(t || 0), unit: "s" },
       { label: "Distancia", value: fmt(d || 0), unit: "m" }
     ],
     graphs,
     assumptions: ["Velocidad constante", "Aceleración nula", "Trayectoria recta"]
   };
 };
 
 export const calculateMRUA = (
   v0: number | null,
   vf: number | null,
   a: number | null,
   t: number | null,
   d: number | null,
   decimalPlaces: number
 ): PhysicsResult => {
   const steps: CalculationStep[] = [];
   const graphs: GraphData[] = [];
   const fmt = (n: number) => formatNumber(n, decimalPlaces);
 
   let velocity0 = v0 ?? 0;
   let velocityF = vf;
   let accel = a;
   let time = t;
   let distance = d;
 
   // Calcular valores faltantes
   if (v0 !== null && vf !== null && t !== null) {
     accel = (vf - v0) / t;
     steps.push({
       formula: "a = (v_f - v₀) / t",
       substitution: `a = (${fmt(vf)} - ${fmt(v0)}) / ${fmt(t)}`,
       result: `a = ${fmt(accel)} m/s²`,
       explanation: "Aceleración constante"
     });
     distance = v0 * t + 0.5 * accel * t * t;
     steps.push({
       formula: "d = v₀·t + ½·a·t²",
       substitution: `d = ${fmt(v0)}·${fmt(t)} + ½·${fmt(accel)}·${fmt(t)}²`,
       result: `d = ${fmt(distance)} m`,
       explanation: "Distancia recorrida"
     });
   } else if (v0 !== null && vf !== null && a !== null) {
     time = (vf - v0) / a;
     steps.push({
       formula: "t = (v_f - v₀) / a",
       substitution: `t = (${fmt(vf)} - ${fmt(v0)}) / ${fmt(a)}`,
       result: `t = ${fmt(time)} s`,
       explanation: "Tiempo del movimiento"
     });
     distance = (vf * vf - v0 * v0) / (2 * a);
     steps.push({
       formula: "d = (v_f² - v₀²) / (2a)",
       substitution: `d = (${fmt(vf)}² - ${fmt(v0)}²) / (2 × ${fmt(a)})`,
       result: `d = ${fmt(distance)} m`,
       explanation: "Ecuación de Torricelli"
     });
   } else if (v0 !== null && a !== null && t !== null) {
     velocityF = v0 + a * t;
     steps.push({
       formula: "v_f = v₀ + a·t",
       substitution: `v_f = ${fmt(v0)} + ${fmt(a)} × ${fmt(t)}`,
       result: `v_f = ${fmt(velocityF)} m/s`,
       explanation: "Velocidad final"
     });
     distance = v0 * t + 0.5 * a * t * t;
     steps.push({
       formula: "d = v₀·t + ½·a·t²",
       substitution: `d = ${fmt(v0)}·${fmt(t)} + ½·${fmt(a)}·${fmt(t)}²`,
       result: `d = ${fmt(distance)} m`,
       explanation: "Distancia recorrida"
     });
   }
 
   const totalTime = time || 5;
   const acceleration = accel || 0;
 
   graphs.push({
     title: "Posición vs Tiempo",
     type: "line",
     data: generatePositionTimeData(velocity0, acceleration, totalTime),
     xLabel: "Tiempo (s)",
     yLabel: "Posición (m)",
     color: "#8b5cf6"
   });
 
   graphs.push({
     title: "Velocidad vs Tiempo",
     type: "line",
     data: generateVelocityTimeData(velocity0, acceleration, totalTime),
     xLabel: "Tiempo (s)",
     yLabel: "Velocidad (m/s)",
     color: "#10b981"
   });
 
   return {
     title: "Movimiento Rectilíneo Uniformemente Acelerado (MRUA)",
     steps,
     finalResults: [
       { label: "Velocidad inicial", value: fmt(velocity0), unit: "m/s" },
       { label: "Velocidad final", value: fmt(velocityF || 0), unit: "m/s" },
       { label: "Aceleración", value: fmt(accel || 0), unit: "m/s²" },
       { label: "Tiempo", value: fmt(time || 0), unit: "s" },
       { label: "Distancia", value: fmt(distance || 0), unit: "m" }
     ],
     graphs,
     assumptions: ["Aceleración constante", "Trayectoria recta"]
   };
 };
 
 export const calculateFreeFall = (
   height: number,
   v0: number,
   g: number,
   decimalPlaces: number
 ): PhysicsResult => {
   const steps: CalculationStep[] = [];
   const graphs: GraphData[] = [];
   const fmt = (n: number) => formatNumber(n, decimalPlaces);
 
   // Tiempo de caída (ecuación cuadrática)
   const a = 0.5 * g;
   const b = v0;
   const c = -height;
   const discriminant = b * b - 4 * a * c;
   
   let tCaida = 0;
   if (discriminant >= 0) {
     const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
     const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
     tCaida = Math.max(t1, t2);
   }
 
   steps.push({
     formula: "h = v₀·t + ½·g·t² → t = [-v₀ + √(v₀² + 2gh)] / g",
     substitution: `t = [-${fmt(v0)} + √(${fmt(v0)}² + 2×${fmt(g)}×${fmt(height)})] / ${fmt(g)}`,
     result: `t = ${fmt(tCaida)} s`,
     explanation: "Tiempo de caída resolviendo ecuación cuadrática"
   });
 
   // Velocidad final
   const vFinal = v0 + g * tCaida;
   steps.push({
     formula: "v_f = v₀ + g·t",
     substitution: `v_f = ${fmt(v0)} + ${fmt(g)} × ${fmt(tCaida)}`,
     result: `v_f = ${fmt(vFinal)} m/s`,
     explanation: "Velocidad al tocar el suelo"
   });
 
   // Verificación con Torricelli
   const vFinalTorricelli = Math.sqrt(v0 * v0 + 2 * g * height);
   steps.push({
     formula: "v_f = √(v₀² + 2gh)",
     substitution: `v_f = √(${fmt(v0)}² + 2×${fmt(g)}×${fmt(height)})`,
     result: `v_f = ${fmt(vFinalTorricelli)} m/s`,
     explanation: "Verificación con ecuación de Torricelli"
   });
 
   // Gráficos
   const heightData: { x: number; y: number }[] = [];
   const velocityData: { x: number; y: number }[] = [];
   for (let t = 0; t <= tCaida; t += tCaida / 25) {
     const h = height - (v0 * t + 0.5 * g * t * t);
     const v = v0 + g * t;
     if (h >= 0) {
       heightData.push({ x: t, y: h });
       velocityData.push({ x: t, y: v });
     }
   }
 
   graphs.push({
     title: "Altura vs Tiempo",
     type: "line",
     data: heightData,
     xLabel: "Tiempo (s)",
     yLabel: "Altura (m)",
     color: "#ef4444"
   });
 
   graphs.push({
     title: "Velocidad vs Tiempo",
     type: "line",
     data: velocityData,
     xLabel: "Tiempo (s)",
     yLabel: "Velocidad (m/s)",
     color: "#f59e0b"
   });
 
   return {
     title: v0 > 0 ? "Caída con Velocidad Inicial" : "Caída Libre desde Reposo",
     steps,
     finalResults: [
       { label: "Altura inicial", value: fmt(height), unit: "m" },
       { label: "Velocidad inicial", value: fmt(v0), unit: "m/s" },
       { label: "Tiempo de caída", value: fmt(tCaida), unit: "s" },
       { label: "Velocidad final", value: fmt(vFinal), unit: "m/s" },
       { label: "Aceleración", value: fmt(g), unit: "m/s²" }
     ],
     graphs,
     assumptions: [
       "Sin resistencia del aire",
       `g = ${fmt(g)} m/s²`
     ]
   };
 };
 
 // ==========================================
 // CÁLCULOS DE DINÁMICA
 // ==========================================
 
 export const calculateNewtonSecond = (
   mass: number | null,
   force: number | null,
   acceleration: number | null,
   decimalPlaces: number
 ): PhysicsResult => {
   const steps: CalculationStep[] = [];
   const fmt = (n: number) => formatNumber(n, decimalPlaces);
 
   let m = mass;
   let F = force;
   let a = acceleration;
 
   if (m !== null && a !== null) {
     F = m * a;
     steps.push({
       formula: "F = m × a",
       substitution: `F = ${fmt(m)} × ${fmt(a)}`,
       result: `F = ${fmt(F)} N`,
       explanation: "Segunda Ley de Newton"
     });
   } else if (F !== null && a !== null) {
     m = F / a;
     steps.push({
       formula: "m = F / a",
       substitution: `m = ${fmt(F)} / ${fmt(a)}`,
       result: `m = ${fmt(m)} kg`,
       explanation: "Masa calculada"
     });
   } else if (F !== null && m !== null) {
     a = F / m;
     steps.push({
       formula: "a = F / m",
       substitution: `a = ${fmt(F)} / ${fmt(m)}`,
       result: `a = ${fmt(a)} m/s²`,
       explanation: "Aceleración resultante"
     });
   }
 
   return {
     title: "Segunda Ley de Newton",
     steps,
     finalResults: [
       { label: "Masa", value: fmt(m || 0), unit: "kg" },
       { label: "Fuerza", value: fmt(F || 0), unit: "N" },
       { label: "Aceleración", value: fmt(a || 0), unit: "m/s²" }
     ],
     assumptions: ["Sistema inercial", "Masa constante"]
   };
 };
 
 export const calculateFriction = (
   normalForce: number,
   coefficient: number,
   mass: number,
   g: number,
   decimalPlaces: number
 ): PhysicsResult => {
   const steps: CalculationStep[] = [];
   const fmt = (n: number) => formatNumber(n, decimalPlaces);
 
   // Fuerza normal si no se proporciona
   const N = normalForce || mass * g;
   if (!normalForce) {
     steps.push({
       formula: "N = m × g",
       substitution: `N = ${fmt(mass)} × ${fmt(g)}`,
       result: `N = ${fmt(N)} N`,
       explanation: "Fuerza normal en superficie horizontal"
     });
   }
 
   // Fuerza de fricción
   const frictionForce = coefficient * N;
   steps.push({
     formula: "f = μ × N",
     substitution: `f = ${fmt(coefficient)} × ${fmt(N)}`,
     result: `f = ${fmt(frictionForce)} N`,
     explanation: "Fuerza de fricción"
   });
 
   // Aceleración de frenado
   const accel = frictionForce / mass;
   steps.push({
     formula: "a = f / m",
     substitution: `a = ${fmt(frictionForce)} / ${fmt(mass)}`,
     result: `a = ${fmt(accel)} m/s²`,
     explanation: "Desaceleración por fricción"
   });
 
   return {
     title: "Fuerza de Fricción",
     steps,
     finalResults: [
       { label: "Fuerza normal", value: fmt(N), unit: "N" },
       { label: "Coeficiente μ", value: fmt(coefficient), unit: "" },
       { label: "Fuerza de fricción", value: fmt(frictionForce), unit: "N" },
       { label: "Desaceleración", value: fmt(accel), unit: "m/s²" }
     ],
     assumptions: [`g = ${fmt(g)} m/s²`, "Superficie plana"]
   };
 };
 
 // ==========================================
 // CÁLCULOS DE ENERGÍA
 // ==========================================
 
 export const calculateKineticEnergy = (
   mass: number,
   velocity: number,
   decimalPlaces: number
 ): PhysicsResult => {
   const steps: CalculationStep[] = [];
   const fmt = (n: number) => formatNumber(n, decimalPlaces);
 
   const Ec = 0.5 * mass * velocity * velocity;
   steps.push({
     formula: "E_c = ½ × m × v²",
     substitution: `E_c = ½ × ${fmt(mass)} × (${fmt(velocity)})²`,
     result: `E_c = ${fmt(Ec)} J`,
     explanation: "Energía cinética"
   });
 
   return {
     title: "Energía Cinética",
     steps,
     finalResults: [
       { label: "Masa", value: fmt(mass), unit: "kg" },
       { label: "Velocidad", value: fmt(velocity), unit: "m/s" },
       { label: "Energía cinética", value: fmt(Ec), unit: "J" }
     ]
   };
 };
 
 export const calculatePotentialEnergy = (
   mass: number,
   height: number,
   g: number,
   decimalPlaces: number
 ): PhysicsResult => {
   const steps: CalculationStep[] = [];
   const fmt = (n: number) => formatNumber(n, decimalPlaces);
 
   const Ep = mass * g * height;
   steps.push({
     formula: "E_p = m × g × h",
     substitution: `E_p = ${fmt(mass)} × ${fmt(g)} × ${fmt(height)}`,
     result: `E_p = ${fmt(Ep)} J`,
     explanation: "Energía potencial gravitatoria"
   });
 
   return {
     title: "Energía Potencial Gravitatoria",
     steps,
     finalResults: [
       { label: "Masa", value: fmt(mass), unit: "kg" },
       { label: "Altura", value: fmt(height), unit: "m" },
       { label: "Energía potencial", value: fmt(Ep), unit: "J" }
     ],
     assumptions: [`g = ${fmt(g)} m/s²`]
   };
 };
 
 // ==========================================
 // CÁLCULOS DE ELECTRICIDAD
 // ==========================================
 
 export const calculateOhmsLaw = (
   voltage: number | null,
   current: number | null,
   resistance: number | null,
   decimalPlaces: number
 ): PhysicsResult => {
   const steps: CalculationStep[] = [];
   const fmt = (n: number) => formatNumber(n, decimalPlaces);
 
   let V = voltage;
   let I = current;
   let R = resistance;
 
   if (I !== null && R !== null) {
     V = I * R;
     steps.push({
       formula: "V = I × R",
       substitution: `V = ${fmt(I)} × ${fmt(R)}`,
       result: `V = ${fmt(V)} V`,
       explanation: "Ley de Ohm"
     });
   } else if (V !== null && R !== null) {
     I = V / R;
     steps.push({
       formula: "I = V / R",
       substitution: `I = ${fmt(V)} / ${fmt(R)}`,
       result: `I = ${fmt(I)} A`,
       explanation: "Corriente calculada"
     });
   } else if (V !== null && I !== null) {
     R = V / I;
     steps.push({
       formula: "R = V / I",
       substitution: `R = ${fmt(V)} / ${fmt(I)}`,
       result: `R = ${fmt(R)} Ω`,
       explanation: "Resistencia calculada"
     });
   }
 
   // Potencia
   const P = (V || 0) * (I || 0);
   steps.push({
     formula: "P = V × I",
     substitution: `P = ${fmt(V || 0)} × ${fmt(I || 0)}`,
     result: `P = ${fmt(P)} W`,
     explanation: "Potencia eléctrica"
   });
 
   return {
     title: "Ley de Ohm",
     steps,
     finalResults: [
       { label: "Voltaje", value: fmt(V || 0), unit: "V" },
       { label: "Corriente", value: fmt(I || 0), unit: "A" },
       { label: "Resistencia", value: fmt(R || 0), unit: "Ω" },
       { label: "Potencia", value: fmt(P), unit: "W" }
     ]
   };
 };
 
 // ==========================================
 // EXPORTAR RESULTADOS
 // ==========================================
 
 export const exportResultsToText = (result: PhysicsResult): string => {
   let text = `═══════════════════════════════════════\n`;
   text += `  ${result.title.toUpperCase()}\n`;
   text += `═══════════════════════════════════════\n\n`;
 
   text += `📊 RESULTADOS FINALES\n`;
   text += `───────────────────────────────────────\n`;
   result.finalResults.forEach(r => {
     text += `  • ${r.label}: ${r.value} ${r.unit}\n`;
   });
 
   text += `\n📝 PROCEDIMIENTO PASO A PASO\n`;
   text += `───────────────────────────────────────\n`;
   result.steps.forEach((step, i) => {
     text += `\n  Paso ${i + 1}: ${step.explanation}\n`;
     text += `    Fórmula: ${step.formula}\n`;
     text += `    Sustitución: ${step.substitution}\n`;
     text += `    Resultado: ${step.result}\n`;
   });
 
   if (result.assumptions) {
     text += `\n⚙️ SUPOSICIONES DEL MODELO\n`;
     text += `───────────────────────────────────────\n`;
     result.assumptions.forEach(a => {
       text += `  • ${a}\n`;
     });
   }
 
   text += `\n═══════════════════════════════════════\n`;
   text += `  Generado por Laboratorio de Física\n`;
   text += `═══════════════════════════════════════\n`;
 
   return text;
 };