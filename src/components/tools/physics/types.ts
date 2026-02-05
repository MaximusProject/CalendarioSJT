 // ============================================
 // Tipos del Laboratorio de Física Avanzado
 // ============================================
 
 export interface CalculationStep {
   formula: string;
   substitution: string;
   result: string;
   explanation: string;
   unitConversion?: string;
 }
 
 export interface PhysicsResult {
   title: string;
   steps: CalculationStep[];
   finalResults: ResultItem[];
   graphs?: GraphData[];
   warnings?: string[];
   assumptions?: string[];
   unitConversions?: string[];
 }
 
 export interface ResultItem {
   label: string;
   value: string;
   unit: string;
   description?: string;
 }
 
 export interface GraphData {
   title: string;
   type: "line" | "scatter" | "bar";
   data: { x: number; y: number }[];
   xLabel: string;
   yLabel: string;
   color?: string;
 }
 
 export interface HistoryItem {
   id: string;
   timestamp: Date;
   type: string;
   inputs: Record<string, any>;
   results: PhysicsResult;
 }
 
 export interface UnitInfo {
   name: string;
   base: string;
   factor: number;
   system: "SI" | "Imperial" | "CGS" | "Other";
 }
 
 export type PhysicsCategory = 
   | "cinematica" 
   | "dinamica" 
   | "energia" 
   | "electricidad" 
   | "termodinamica" 
   | "ondas";
 
 export type KinematicsCalcType = 
   | "vertical" 
   | "horizontal" 
   | "inclinado" 
   | "mru" 
   | "mrua" 
   | "caida_libre";
 
 export type DynamicsCalcType = 
   | "newton_second" 
   | "friction" 
   | "inclined_plane"
   | "circular_motion";
 
 export type EnergyCalcType = 
   | "kinetic" 
   | "potential" 
   | "conservation"
   | "work"
   | "power";
 
 export type ElectricityCalcType = 
   | "ohm" 
   | "power" 
   | "series" 
   | "parallel"
   | "capacitor";
 
 export interface UnitSystem {
   length: Record<string, UnitInfo>;
   time: Record<string, UnitInfo>;
   mass: Record<string, UnitInfo>;
   velocity: Record<string, UnitInfo>;
   acceleration: Record<string, UnitInfo>;
   angle: Record<string, UnitInfo>;
   force: Record<string, UnitInfo>;
   energy: Record<string, UnitInfo>;
   temperature: Record<string, UnitInfo>;
   pressure: Record<string, UnitInfo>;
   electricCurrent: Record<string, UnitInfo>;
   voltage: Record<string, UnitInfo>;
   resistance: Record<string, UnitInfo>;
 }