 // ============================================
 // Constantes y Sistema de Unidades - Física
 // ============================================
 
 import { UnitSystem } from "./types";
 
 // Constantes físicas fundamentales
 export const PHYSICS_CONSTANTS = {
   // Mecánica
   g_standard: 9.80665,      // Gravedad estándar (m/s²)
   g_earth: 9.81,            // Gravedad terrestre aproximada
   g_moon: 1.62,             // Gravedad lunar (m/s²)
   g_mars: 3.71,             // Gravedad en Marte (m/s²)
   g_jupiter: 24.79,         // Gravedad en Júpiter (m/s²)
   
   // Termodinámica
   R_gas: 8.314462618,       // Constante universal de gases (J/(mol·K))
   k_boltzmann: 1.380649e-23, // Constante de Boltzmann (J/K)
   N_avogadro: 6.02214076e23, // Número de Avogadro (1/mol)
   
   // Electromagnetismo
   e_charge: 1.602176634e-19, // Carga del electrón (C)
   k_coulomb: 8.9875517923e9, // Constante de Coulomb (N·m²/C²)
   epsilon_0: 8.8541878128e-12, // Permitividad del vacío (F/m)
   mu_0: 1.25663706212e-6,   // Permeabilidad del vacío (H/m)
   
   // Velocidad y ondas
   c_light: 299792458,       // Velocidad de la luz (m/s)
   v_sound_air: 343,         // Velocidad del sonido en aire (m/s)
   
   // Otras
   h_planck: 6.62607015e-34, // Constante de Planck (J·s)
   G_gravity: 6.67430e-11,   // Constante gravitacional (m³/(kg·s²))
 };
 
 // Presets de gravedad para diferentes planetas/lunas
 export const GRAVITY_PRESETS = [
   { name: "Tierra (estándar)", value: 9.80665, emoji: "🌍" },
   { name: "Tierra (aproximado)", value: 9.8, emoji: "🌏" },
   { name: "Tierra (simplificado)", value: 10, emoji: "🌎" },
   { name: "Luna", value: 1.62, emoji: "🌙" },
   { name: "Marte", value: 3.71, emoji: "🔴" },
   { name: "Júpiter", value: 24.79, emoji: "🟠" },
   { name: "Venus", value: 8.87, emoji: "🟡" },
   { name: "Saturno", value: 10.44, emoji: "🪐" },
   { name: "Mercurio", value: 3.7, emoji: "⚪" },
 ];
 
 // Sistema de unidades completo
 export const UNIT_SYSTEM: UnitSystem = {
   // Longitud
   length: {
     m: { name: "Metros", base: "m", factor: 1, system: "SI" },
     km: { name: "Kilómetros", base: "m", factor: 1000, system: "SI" },
     cm: { name: "Centímetros", base: "m", factor: 0.01, system: "SI" },
     mm: { name: "Milímetros", base: "m", factor: 0.001, system: "SI" },
     μm: { name: "Micrómetros", base: "m", factor: 1e-6, system: "SI" },
     nm: { name: "Nanómetros", base: "m", factor: 1e-9, system: "SI" },
     ft: { name: "Pies", base: "m", factor: 0.3048, system: "Imperial" },
     in: { name: "Pulgadas", base: "m", factor: 0.0254, system: "Imperial" },
     yd: { name: "Yardas", base: "m", factor: 0.9144, system: "Imperial" },
     mi: { name: "Millas", base: "m", factor: 1609.344, system: "Imperial" },
     Hm: { name: "Hectómetros", base: "m", factor: 100, system: "SI" },
   },
   
   // Tiempo
   time: {
     s: { name: "Segundos", base: "s", factor: 1, system: "SI" },
     min: { name: "Minutos", base: "s", factor: 60, system: "Other" },
     h: { name: "Horas", base: "s", factor: 3600, system: "Other" },
     ms: { name: "Milisegundos", base: "s", factor: 0.001, system: "SI" },
     μs: { name: "Microsegundos", base: "s", factor: 1e-6, system: "SI" },
     ns: { name: "Nanosegundos", base: "s", factor: 1e-9, system: "SI" },
     d: { name: "Días", base: "s", factor: 86400, system: "Other" },
   },
   
   // Masa
   mass: {
     kg: { name: "Kilogramos", base: "kg", factor: 1, system: "SI" },
     g: { name: "Gramos", base: "kg", factor: 0.001, system: "SI" },
     mg: { name: "Miligramos", base: "kg", factor: 1e-6, system: "SI" },
     t: { name: "Toneladas", base: "kg", factor: 1000, system: "SI" },
     lb: { name: "Libras", base: "kg", factor: 0.45359237, system: "Imperial" },
     oz: { name: "Onzas", base: "kg", factor: 0.0283495, system: "Imperial" },
     slug: { name: "Slugs", base: "kg", factor: 14.593903, system: "Imperial" },
   },
   
   // Velocidad
   velocity: {
     "m/s": { name: "Metros/segundo", base: "m/s", factor: 1, system: "SI" },
     "km/h": { name: "Kilómetros/hora", base: "m/s", factor: 0.277778, system: "Other" },
     "Hm/h": { name: "Hectómetros/hora", base: "m/s", factor: 0.0277778, system: "Other" },
     mph: { name: "Millas/hora", base: "m/s", factor: 0.44704, system: "Imperial" },
     "ft/s": { name: "Pies/segundo", base: "m/s", factor: 0.3048, system: "Imperial" },
     knots: { name: "Nudos", base: "m/s", factor: 0.514444, system: "Other" },
     "cm/s": { name: "Centímetros/segundo", base: "m/s", factor: 0.01, system: "SI" },
   },
   
   // Aceleración
   acceleration: {
     "m/s²": { name: "Metros/s²", base: "m/s²", factor: 1, system: "SI" },
     "ft/s²": { name: "Pies/s²", base: "m/s²", factor: 0.3048, system: "Imperial" },
     "cm/s²": { name: "Centímetros/s²", base: "m/s²", factor: 0.01, system: "CGS" },
     g: { name: "Gravedad terrestre", base: "m/s²", factor: 9.80665, system: "Other" },
     Gal: { name: "Galileo", base: "m/s²", factor: 0.01, system: "CGS" },
   },
   
   // Ángulo
   angle: {
     "°": { name: "Grados", base: "rad", factor: Math.PI/180, system: "Other" },
     rad: { name: "Radianes", base: "rad", factor: 1, system: "SI" },
     grad: { name: "Gradianes", base: "rad", factor: Math.PI/200, system: "Other" },
     rev: { name: "Revoluciones", base: "rad", factor: 2*Math.PI, system: "Other" },
   },
   
   // Fuerza
   force: {
     N: { name: "Newtons", base: "N", factor: 1, system: "SI" },
     kN: { name: "Kilonewtons", base: "N", factor: 1000, system: "SI" },
     dyn: { name: "Dinas", base: "N", factor: 1e-5, system: "CGS" },
     lbf: { name: "Libras-fuerza", base: "N", factor: 4.44822, system: "Imperial" },
     kgf: { name: "Kilogramos-fuerza", base: "N", factor: 9.80665, system: "Other" },
   },
   
   // Energía
   energy: {
     J: { name: "Joules", base: "J", factor: 1, system: "SI" },
     kJ: { name: "Kilojoules", base: "J", factor: 1000, system: "SI" },
     MJ: { name: "Megajoules", base: "J", factor: 1e6, system: "SI" },
     cal: { name: "Calorías", base: "J", factor: 4.184, system: "Other" },
     kcal: { name: "Kilocalorías", base: "J", factor: 4184, system: "Other" },
     kWh: { name: "Kilovatio-hora", base: "J", factor: 3.6e6, system: "Other" },
     eV: { name: "Electronvoltios", base: "J", factor: 1.602176634e-19, system: "Other" },
     erg: { name: "Ergios", base: "J", factor: 1e-7, system: "CGS" },
   },
   
   // Temperatura
   temperature: {
     K: { name: "Kelvin", base: "K", factor: 1, system: "SI" },
     "°C": { name: "Celsius", base: "K", factor: 1, system: "SI" }, // Conversión especial
     "°F": { name: "Fahrenheit", base: "K", factor: 1, system: "Imperial" }, // Conversión especial
   },
   
   // Presión
   pressure: {
     Pa: { name: "Pascales", base: "Pa", factor: 1, system: "SI" },
     kPa: { name: "Kilopascales", base: "Pa", factor: 1000, system: "SI" },
     bar: { name: "Bares", base: "Pa", factor: 100000, system: "Other" },
     atm: { name: "Atmósferas", base: "Pa", factor: 101325, system: "Other" },
     mmHg: { name: "mm de mercurio", base: "Pa", factor: 133.322, system: "Other" },
     psi: { name: "Libras/in²", base: "Pa", factor: 6894.76, system: "Imperial" },
   },
   
   // Corriente eléctrica
   electricCurrent: {
     A: { name: "Amperios", base: "A", factor: 1, system: "SI" },
     mA: { name: "Miliamperios", base: "A", factor: 0.001, system: "SI" },
     μA: { name: "Microamperios", base: "A", factor: 1e-6, system: "SI" },
     kA: { name: "Kiloamperios", base: "A", factor: 1000, system: "SI" },
   },
   
   // Voltaje
   voltage: {
     V: { name: "Voltios", base: "V", factor: 1, system: "SI" },
     mV: { name: "Milivoltios", base: "V", factor: 0.001, system: "SI" },
     kV: { name: "Kilovoltios", base: "V", factor: 1000, system: "SI" },
     μV: { name: "Microvoltios", base: "V", factor: 1e-6, system: "SI" },
   },
   
   // Resistencia
   resistance: {
     Ω: { name: "Ohmios", base: "Ω", factor: 1, system: "SI" },
     kΩ: { name: "Kiloohmios", base: "Ω", factor: 1000, system: "SI" },
     MΩ: { name: "Megaohmios", base: "Ω", factor: 1e6, system: "SI" },
     mΩ: { name: "Miliohmios", base: "Ω", factor: 0.001, system: "SI" },
   },
 };
 
 // Categorías de cálculo con iconos
 export const PHYSICS_CATEGORIES = [
   { id: "cinematica", name: "Cinemática", icon: "Move", shortName: "Cinem." },
   { id: "dinamica", name: "Dinámica", icon: "Zap", shortName: "Dinámica" },
   { id: "energia", name: "Energía", icon: "Battery", shortName: "Energía" },
   { id: "electricidad", name: "Electricidad", icon: "Lightbulb", shortName: "Elect." },
   { id: "termodinamica", name: "Termodinámica", icon: "Thermometer", shortName: "Termo." },
   { id: "ondas", name: "Ondas", icon: "Waves", shortName: "Ondas" },
 ] as const;
 
 // Tipos de cálculo por categoría
 export const KINEMATICS_CALCS = [
   { id: "vertical", name: "L. Vertical", icon: "ArrowUp", description: "Lanzamiento vertical hacia arriba" },
   { id: "horizontal", name: "L. Horizontal", icon: "ArrowRight", description: "Lanzamiento horizontal desde altura" },
   { id: "inclinado", name: "L. Inclinado", icon: "RotateCw", description: "Lanzamiento parabólico con ángulo" },
   { id: "mru", name: "MRU", icon: "Move", description: "Movimiento rectilíneo uniforme" },
   { id: "mrua", name: "MRUA", icon: "TrendingUp", description: "Movimiento rectilíneo uniformemente acelerado" },
   { id: "caida_libre", name: "Caída Libre", icon: "Rocket", description: "Caída libre desde reposo o con velocidad inicial" },
 ] as const;
 
 export const DYNAMICS_CALCS = [
   { id: "newton_second", name: "2da Ley Newton", icon: "Zap", description: "F = m·a" },
   { id: "friction", name: "Fricción", icon: "Gauge", description: "Fuerza de rozamiento" },
   { id: "inclined_plane", name: "Plano Inclinado", icon: "TrendingUp", description: "Dinámica en plano inclinado" },
   { id: "circular_motion", name: "Mov. Circular", icon: "RotateCw", description: "Fuerza centrípeta" },
 ] as const;
 
 export const ENERGY_CALCS = [
   { id: "kinetic", name: "E. Cinética", icon: "Zap", description: "Ec = ½mv²" },
   { id: "potential", name: "E. Potencial", icon: "ArrowUp", description: "Ep = mgh" },
   { id: "conservation", name: "Conservación", icon: "RefreshCw", description: "Conservación de energía" },
   { id: "work", name: "Trabajo", icon: "Activity", description: "W = F·d·cos(θ)" },
   { id: "power", name: "Potencia", icon: "Gauge", description: "P = W/t" },
 ] as const;
 
 export const ELECTRICITY_CALCS = [
   { id: "ohm", name: "Ley de Ohm", icon: "Zap", description: "V = I·R" },
   { id: "power", name: "Potencia", icon: "Lightbulb", description: "P = V·I" },
   { id: "series", name: "Circuito Serie", icon: "ArrowRight", description: "Resistencias en serie" },
   { id: "parallel", name: "Circuito Paralelo", icon: "GitBranch", description: "Resistencias en paralelo" },
 ] as const;