 // ============================================
 // Componentes de Entrada - Física
 // ============================================
 
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { UNIT_SYSTEM } from "./constants";
 import { UnitInfo } from "./types";
 
 interface UnitInputProps {
   id: string;
   label: string;
   value: string;
   onChange: (value: string) => void;
   unit: string;
   onUnitChange: (unit: string) => void;
   unitCategory: keyof typeof UNIT_SYSTEM;
   placeholder?: string;
   description?: string;
   isMobile?: boolean;
   min?: string;
   max?: string;
   step?: string;
 }
 
 export function UnitInput({
   id,
   label,
   value,
   onChange,
   unit,
   onUnitChange,
   unitCategory,
   placeholder = "",
   description,
   isMobile = false,
   min,
   max,
   step = "any"
 }: UnitInputProps) {
   const unitOptions = UNIT_SYSTEM[unitCategory] as Record<string, UnitInfo>;
 
   return (
     <div className="space-y-2">
       <div className="flex items-center justify-between">
         <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
         <span className="text-xs text-muted-foreground">{unit}</span>
       </div>
       <div className="flex gap-2">
         <Input
           id={id}
           type="number"
           value={value}
           onChange={(e) => onChange(e.target.value)}
           placeholder={placeholder}
           className="flex-1 rounded-lg"
           step={step}
           min={min}
           max={max}
         />
         <Select value={unit} onValueChange={onUnitChange}>
           <SelectTrigger className={`${isMobile ? 'w-20' : 'w-24'} rounded-lg`}>
             <SelectValue />
           </SelectTrigger>
           <SelectContent>
             {Object.entries(unitOptions).map(([key, info]) => (
               <SelectItem key={key} value={key} className="text-xs">
                 {info.name}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>
       {description && (
         <p className="text-xs text-muted-foreground">{description}</p>
       )}
     </div>
   );
 }
 
 interface SimpleInputProps {
   id: string;
   label: string;
   value: string;
   onChange: (value: string) => void;
   unit?: string;
   placeholder?: string;
   description?: string;
   min?: string;
   max?: string;
   step?: string;
 }
 
 export function SimpleInput({
   id,
   label,
   value,
   onChange,
   unit,
   placeholder = "",
   description,
   min,
   max,
   step = "any"
 }: SimpleInputProps) {
   return (
     <div className="space-y-2">
       <div className="flex items-center justify-between">
         <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
         {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
       </div>
       <Input
         id={id}
         type="number"
         value={value}
         onChange={(e) => onChange(e.target.value)}
         placeholder={placeholder}
         className="rounded-lg"
         step={step}
         min={min}
         max={max}
       />
       {description && (
         <p className="text-xs text-muted-foreground">{description}</p>
       )}
     </div>
   );
 }
 
 // Componentes de campos específicos para cada tipo de cálculo
 
 interface VerticalLaunchInputsProps {
   v0: string;
   setV0: (v: string) => void;
   velocityUnit: string;
   setVelocityUnit: (u: string) => void;
   isMobile?: boolean;
 }
 
 export function VerticalLaunchInputs({
   v0,
   setV0,
   velocityUnit,
   setVelocityUnit,
   isMobile = false
 }: VerticalLaunchInputsProps) {
   return (
     <div className="space-y-4">
       <UnitInput
         id="v0"
         label="Velocidad inicial (v₀)"
         value={v0}
         onChange={setV0}
         unit={velocityUnit}
         onUnitChange={setVelocityUnit}
         unitCategory="velocity"
         placeholder="Ej: 20"
         description="Velocidad inicial hacia arriba"
         isMobile={isMobile}
       />
     </div>
   );
 }
 
 interface HorizontalLaunchInputsProps {
   vx: string;
   setVx: (v: string) => void;
   height: string;
   setHeight: (h: string) => void;
   velocityUnit: string;
   setVelocityUnit: (u: string) => void;
   lengthUnit: string;
   setLengthUnit: (u: string) => void;
   isMobile?: boolean;
 }
 
 export function HorizontalLaunchInputs({
   vx,
   setVx,
   height,
   setHeight,
   velocityUnit,
   setVelocityUnit,
   lengthUnit,
   setLengthUnit,
   isMobile = false
 }: HorizontalLaunchInputsProps) {
   return (
     <div className="space-y-4">
       <UnitInput
         id="vx"
         label="Velocidad horizontal (v₀)"
         value={vx}
         onChange={setVx}
         unit={velocityUnit}
         onUnitChange={setVelocityUnit}
         unitCategory="velocity"
         placeholder="Ej: 15"
         isMobile={isMobile}
       />
       <UnitInput
         id="height"
         label="Altura inicial (h)"
         value={height}
         onChange={setHeight}
         unit={lengthUnit}
         onUnitChange={setLengthUnit}
         unitCategory="length"
         placeholder="Ej: 45"
         isMobile={isMobile}
       />
     </div>
   );
 }
 
 interface InclinedLaunchInputsProps {
   v0: string;
   setV0: (v: string) => void;
   angle: string;
   setAngle: (a: string) => void;
   velocityUnit: string;
   setVelocityUnit: (u: string) => void;
   angleUnit: string;
   setAngleUnit: (u: string) => void;
   isMobile?: boolean;
 }
 
 export function InclinedLaunchInputs({
   v0,
   setV0,
   angle,
   setAngle,
   velocityUnit,
   setVelocityUnit,
   angleUnit,
   setAngleUnit,
   isMobile = false
 }: InclinedLaunchInputsProps) {
   return (
     <div className="space-y-4">
       <UnitInput
         id="iv0"
         label="Velocidad inicial (v₀)"
         value={v0}
         onChange={setV0}
         unit={velocityUnit}
         onUnitChange={setVelocityUnit}
         unitCategory="velocity"
         placeholder="Ej: 25"
         isMobile={isMobile}
       />
       <UnitInput
         id="angle"
         label="Ángulo de lanzamiento"
         value={angle}
         onChange={setAngle}
         unit={angleUnit}
         onUnitChange={setAngleUnit}
         unitCategory="angle"
         placeholder="Ej: 45"
         min="0"
         max="90"
         isMobile={isMobile}
       />
     </div>
   );
 }
 
 interface MRUInputsProps {
   velocity: string;
   setVelocity: (v: string) => void;
   time: string;
   setTime: (t: string) => void;
   distance: string;
   setDistance: (d: string) => void;
   velocityUnit: string;
   setVelocityUnit: (u: string) => void;
   timeUnit: string;
   setTimeUnit: (u: string) => void;
   lengthUnit: string;
   setLengthUnit: (u: string) => void;
   isMobile?: boolean;
 }
 
 export function MRUInputs({
   velocity,
   setVelocity,
   time,
   setTime,
   distance,
   setDistance,
   velocityUnit,
   setVelocityUnit,
   timeUnit,
   setTimeUnit,
   lengthUnit,
   setLengthUnit,
   isMobile = false
 }: MRUInputsProps) {
   return (
     <div className="space-y-4">
       <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground text-center">
         💡 Ingresa dos valores cualesquiera para calcular el tercero
       </div>
       <UnitInput
         id="mruV"
         label="Velocidad (v)"
         value={velocity}
         onChange={setVelocity}
         unit={velocityUnit}
         onUnitChange={setVelocityUnit}
         unitCategory="velocity"
         placeholder="m/s"
         isMobile={isMobile}
       />
       <UnitInput
         id="mruT"
         label="Tiempo (t)"
         value={time}
         onChange={setTime}
         unit={timeUnit}
         onUnitChange={setTimeUnit}
         unitCategory="time"
         placeholder="s"
         isMobile={isMobile}
       />
       <UnitInput
         id="mruD"
         label="Distancia (d)"
         value={distance}
         onChange={setDistance}
         unit={lengthUnit}
         onUnitChange={setLengthUnit}
         unitCategory="length"
         placeholder="m"
         isMobile={isMobile}
       />
     </div>
   );
 }
 
 interface MRUAInputsProps {
   v0: string;
   setV0: (v: string) => void;
   vf: string;
   setVf: (v: string) => void;
   acceleration: string;
   setAcceleration: (a: string) => void;
   time: string;
   setTime: (t: string) => void;
   distance: string;
   setDistance: (d: string) => void;
   velocityUnit: string;
   setVelocityUnit: (u: string) => void;
   accelerationUnit: string;
   setAccelerationUnit: (u: string) => void;
   timeUnit: string;
   setTimeUnit: (u: string) => void;
   lengthUnit: string;
   setLengthUnit: (u: string) => void;
   isMobile?: boolean;
 }
 
 export function MRUAInputs({
   v0,
   setV0,
   vf,
   setVf,
   acceleration,
   setAcceleration,
   time,
   setTime,
   distance,
   setDistance,
   velocityUnit,
   setVelocityUnit,
   accelerationUnit,
   setAccelerationUnit,
   timeUnit,
   setTimeUnit,
   lengthUnit,
   setLengthUnit,
   isMobile = false
 }: MRUAInputsProps) {
   return (
     <div className="space-y-4">
       <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground text-center">
         💡 Ingresa al menos tres valores para calcular los demás
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <UnitInput
           id="mruaV0"
           label="Velocidad inicial (v₀)"
           value={v0}
           onChange={setV0}
           unit={velocityUnit}
           onUnitChange={setVelocityUnit}
           unitCategory="velocity"
           placeholder="m/s"
           isMobile={isMobile}
         />
         <UnitInput
           id="mruaVf"
           label="Velocidad final (vf)"
           value={vf}
           onChange={setVf}
           unit={velocityUnit}
           onUnitChange={setVelocityUnit}
           unitCategory="velocity"
           placeholder="m/s"
           isMobile={isMobile}
         />
         <UnitInput
           id="mruaA"
           label="Aceleración (a)"
           value={acceleration}
           onChange={setAcceleration}
           unit={accelerationUnit}
           onUnitChange={setAccelerationUnit}
           unitCategory="acceleration"
           placeholder="m/s²"
           isMobile={isMobile}
         />
         <UnitInput
           id="mruaT"
           label="Tiempo (t)"
           value={time}
           onChange={setTime}
           unit={timeUnit}
           onUnitChange={setTimeUnit}
           unitCategory="time"
           placeholder="s"
           isMobile={isMobile}
         />
       </div>
       <UnitInput
         id="mruaD"
         label="Distancia (d)"
         value={distance}
         onChange={setDistance}
         unit={lengthUnit}
         onUnitChange={setLengthUnit}
         unitCategory="length"
         placeholder="m"
         isMobile={isMobile}
       />
     </div>
   );
 }
 
 interface FreeFallInputsProps {
   height: string;
   setHeight: (h: string) => void;
   time: string;
   setTime: (t: string) => void;
   v0: string;
   setV0: (v: string) => void;
   lengthUnit: string;
   setLengthUnit: (u: string) => void;
   timeUnit: string;
   setTimeUnit: (u: string) => void;
   velocityUnit: string;
   setVelocityUnit: (u: string) => void;
   isMobile?: boolean;
 }
 
 export function FreeFallInputs({
   height,
   setHeight,
   time,
   setTime,
   v0,
   setV0,
   lengthUnit,
   setLengthUnit,
   timeUnit,
   setTimeUnit,
   velocityUnit,
   setVelocityUnit,
   isMobile = false
 }: FreeFallInputsProps) {
   return (
     <div className="space-y-4">
       <UnitInput
         id="ffHeight"
         label="Altura (h)"
         value={height}
         onChange={setHeight}
         unit={lengthUnit}
         onUnitChange={setLengthUnit}
         unitCategory="length"
         placeholder="Ej: 50"
         description="Altura desde la que cae el objeto"
         isMobile={isMobile}
       />
       <UnitInput
         id="ffTime"
         label="Tiempo (t) - Opcional"
         value={time}
         onChange={setTime}
         unit={timeUnit}
         onUnitChange={setTimeUnit}
         unitCategory="time"
         placeholder="s"
         description="Si no se proporciona, se calculará"
         isMobile={isMobile}
       />
       <UnitInput
         id="ffV0"
         label="Velocidad inicial (v₀) - Opcional"
         value={v0}
         onChange={setV0}
         unit={velocityUnit}
         onUnitChange={setVelocityUnit}
         unitCategory="velocity"
         placeholder="m/s"
         description="Para caída con velocidad inicial hacia abajo"
         isMobile={isMobile}
       />
     </div>
   );
 }