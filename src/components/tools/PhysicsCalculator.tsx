 // ============================================
 // Laboratorio de Física Avanzado
 // Sistema integral de cálculo con visualización
 // ============================================
 
 import { useState, useEffect } from "react";
 import { Card } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Label } from "@/components/ui/label";
 import { Input } from "@/components/ui/input";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Slider } from "@/components/ui/slider";
 import { Switch } from "@/components/ui/switch";
 import { 
   Atom, Calculator, ArrowUp, ArrowRight, RotateCw, 
   Move, TrendingUp, Rocket, RefreshCw,
   Sparkles, ChevronRight, Smartphone, Monitor, Tablet
 } from "lucide-react";
 
 // Tipos y constantes
 import { PhysicsResult, HistoryItem, KinematicsCalcType } from "./physics/types";
 import { GRAVITY_PRESETS } from "./physics/constants";
 import { 
   parseScientificInput, 
   autoConvert,
   calculateVerticalLaunch,
   calculateHorizontalLaunch,
   calculateInclinedLaunch,
   calculateMRU,
   calculateMRUA,
   calculateFreeFall
 } from "./physics/physicsUtils";
 
 // Componentes
 import { ResultsDisplay } from "./physics/ResultsDisplay";
 import {
   VerticalLaunchInputs,
   HorizontalLaunchInputs,
   InclinedLaunchInputs,
   MRUInputs,
   MRUAInputs,
   FreeFallInputs
 } from "./physics/InputFields";
 
 export function PhysicsCalculator() {
   // Estado del tipo de cálculo
   const [calcType, setCalcType] = useState<KinematicsCalcType>("vertical");
   
   // Configuración
   const [useStandardGravity, setUseStandardGravity] = useState(true);
   const [customGravity, setCustomGravity] = useState("9.80665");
   const [selectedGravityPreset, setSelectedGravityPreset] = useState("9.80665");
   const [decimalPlaces, setDecimalPlaces] = useState(4);
   const [showSteps, setShowSteps] = useState(true);
   const [showGraphs, setShowGraphs] = useState(true);
   const [autoConvertUnits, setAutoConvertUnits] = useState(true);
   
   // Unidades
   const [units, setUnits] = useState({
     length: "m",
     time: "s",
     velocity: "m/s",
     angle: "°",
     acceleration: "m/s²"
   });
   
   // Campos de entrada - Lanzamiento Vertical
   const [v0, setV0] = useState("20");
   
   // Campos - Lanzamiento Horizontal
   const [vx, setVx] = useState("15");
   const [hHeight, setHHeight] = useState("45");
   
   // Campos - Lanzamiento Inclinado
   const [iV0, setIV0] = useState("25");
   const [angle, setAngle] = useState("45");
   
   // Campos - MRU
   const [mruVelocity, setMruVelocity] = useState("10");
   const [mruTime, setMruTime] = useState("5");
   const [mruDistance, setMruDistance] = useState("");
   
   // Campos - MRUA
   const [mruaV0, setMruaV0] = useState("0");
   const [mruaVf, setMruaVf] = useState("20");
   const [mruaAcceleration, setMruaAcceleration] = useState("");
   const [mruaTime, setMruaTime] = useState("5");
   const [mruaDistance, setMruaDistance] = useState("");
   
   // Campos - Caída Libre
   const [freefallHeight, setFreefallHeight] = useState("50");
   const [freefallTime, setFreefallTime] = useState("");
   const [freefallV0, setFreefallV0] = useState("0");
   
   // Resultados e historial
   const [result, setResult] = useState<PhysicsResult | null>(null);
   const [history, setHistory] = useState<HistoryItem[]>([]);
   const [loading, setLoading] = useState(false);
   
   // Responsive
   const [isMobile, setIsMobile] = useState(false);
   const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">("desktop");
   
   // Detectar tamaño de pantalla
   useEffect(() => {
     const checkScreenSize = () => {
       const width = window.innerWidth;
       if (width < 640) {
         setIsMobile(true);
         setDeviceType("mobile");
       } else if (width < 1024) {
         setIsMobile(true);
         setDeviceType("tablet");
       } else {
         setIsMobile(false);
         setDeviceType("desktop");
       }
     };
     checkScreenSize();
     window.addEventListener('resize', checkScreenSize);
     return () => window.removeEventListener('resize', checkScreenSize);
   }, []);
   
   // Gravedad actual
   const g = useStandardGravity 
     ? parseFloat(selectedGravityPreset) || 9.80665
     : parseScientificInput(customGravity) || 9.80665;
   
   // Función de cálculo principal
   const handleCalculate = () => {
     setLoading(true);
     
     setTimeout(() => {
       try {
         let newResult: PhysicsResult | null = null;
         
         switch (calcType) {
           case "vertical": {
             const v0Num = parseScientificInput(v0);
             if (v0Num !== null) {
               const converted = autoConvertUnits 
                 ? autoConvert(v0Num, units.velocity, "m/s", "velocity", decimalPlaces)
                 : { value: v0Num, converted: false };
               newResult = calculateVerticalLaunch(converted.value, g, decimalPlaces);
               if (converted.converted && converted.message) {
                 newResult.unitConversions = [converted.message];
               }
             }
             break;
           }
           
           case "horizontal": {
             const vxNum = parseScientificInput(vx);
             const hNum = parseScientificInput(hHeight);
             if (vxNum !== null && hNum !== null) {
               const vxConverted = autoConvertUnits 
                 ? autoConvert(vxNum, units.velocity, "m/s", "velocity", decimalPlaces)
                 : { value: vxNum, converted: false };
               const hConverted = autoConvertUnits
                 ? autoConvert(hNum, units.length, "m", "length", decimalPlaces)
                 : { value: hNum, converted: false };
               newResult = calculateHorizontalLaunch(vxConverted.value, hConverted.value, g, decimalPlaces);
               const conversions: string[] = [];
               if (vxConverted.converted && vxConverted.message) conversions.push(vxConverted.message);
               if (hConverted.converted && hConverted.message) conversions.push(hConverted.message);
               if (conversions.length > 0) newResult.unitConversions = conversions;
             }
             break;
           }
           
           case "inclinado": {
             const v0Num = parseScientificInput(iV0);
             const angleNum = parseScientificInput(angle);
             if (v0Num !== null && angleNum !== null) {
               const converted = autoConvertUnits 
                 ? autoConvert(v0Num, units.velocity, "m/s", "velocity", decimalPlaces)
                 : { value: v0Num, converted: false };
               newResult = calculateInclinedLaunch(converted.value, angleNum, g, decimalPlaces);
               if (converted.converted && converted.message) {
                 newResult.unitConversions = [converted.message];
               }
             }
             break;
           }
           
           case "mru": {
             const vNum = parseScientificInput(mruVelocity);
             const tNum = parseScientificInput(mruTime);
             const dNum = parseScientificInput(mruDistance);
             newResult = calculateMRU(vNum, tNum, dNum, decimalPlaces);
             break;
           }
           
           case "mrua": {
             const v0Num = parseScientificInput(mruaV0);
             const vfNum = parseScientificInput(mruaVf);
             const aNum = parseScientificInput(mruaAcceleration);
             const tNum = parseScientificInput(mruaTime);
             const dNum = parseScientificInput(mruaDistance);
             newResult = calculateMRUA(v0Num, vfNum, aNum, tNum, dNum, decimalPlaces);
             break;
           }
           
           case "caida_libre": {
             const hNum = parseScientificInput(freefallHeight);
             const v0Num = parseScientificInput(freefallV0) || 0;
             if (hNum !== null) {
               const hConverted = autoConvertUnits
                 ? autoConvert(hNum, units.length, "m", "length", decimalPlaces)
                 : { value: hNum, converted: false };
               newResult = calculateFreeFall(hConverted.value, v0Num, g, decimalPlaces);
               if (hConverted.converted && hConverted.message) {
                 newResult.unitConversions = [hConverted.message];
               }
             }
             break;
           }
         }
         
         if (newResult) {
           setResult(newResult);
           // Guardar en historial
           const historyItem: HistoryItem = {
             id: Date.now().toString(),
             timestamp: new Date(),
             type: calcType,
             inputs: {},
             results: newResult
           };
           setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
         }
       } catch (error) {
         console.error("Error en cálculo:", error);
         setResult({
           title: "Error en el cálculo",
           steps: [],
           finalResults: [],
           warnings: ["Ha ocurrido un error. Verifica los valores ingresados."]
         });
       }
       setLoading(false);
     }, 200);
   };
   
   // Limpiar campos
   const handleClear = () => {
     setV0(""); setVx(""); setHHeight(""); setIV0(""); setAngle("");
     setMruVelocity(""); setMruTime(""); setMruDistance("");
     setMruaV0(""); setMruaVf(""); setMruaAcceleration(""); setMruaTime(""); setMruaDistance("");
     setFreefallHeight(""); setFreefallTime(""); setFreefallV0("");
     setResult(null);
   };
   
   // Renderizar campos según tipo
   const renderInputFields = () => {
     switch (calcType) {
       case "vertical":
         return (
           <VerticalLaunchInputs
             v0={v0}
             setV0={setV0}
             velocityUnit={units.velocity}
             setVelocityUnit={(u) => setUnits({ ...units, velocity: u })}
             isMobile={isMobile}
           />
         );
       case "horizontal":
         return (
           <HorizontalLaunchInputs
             vx={vx}
             setVx={setVx}
             height={hHeight}
             setHeight={setHHeight}
             velocityUnit={units.velocity}
             setVelocityUnit={(u) => setUnits({ ...units, velocity: u })}
             lengthUnit={units.length}
             setLengthUnit={(u) => setUnits({ ...units, length: u })}
             isMobile={isMobile}
           />
         );
       case "inclinado":
         return (
           <InclinedLaunchInputs
             v0={iV0}
             setV0={setIV0}
             angle={angle}
             setAngle={setAngle}
             velocityUnit={units.velocity}
             setVelocityUnit={(u) => setUnits({ ...units, velocity: u })}
             angleUnit={units.angle}
             setAngleUnit={(u) => setUnits({ ...units, angle: u })}
             isMobile={isMobile}
           />
         );
       case "mru":
         return (
           <MRUInputs
             velocity={mruVelocity}
             setVelocity={setMruVelocity}
             time={mruTime}
             setTime={setMruTime}
             distance={mruDistance}
             setDistance={setMruDistance}
             velocityUnit={units.velocity}
             setVelocityUnit={(u) => setUnits({ ...units, velocity: u })}
             timeUnit={units.time}
             setTimeUnit={(u) => setUnits({ ...units, time: u })}
             lengthUnit={units.length}
             setLengthUnit={(u) => setUnits({ ...units, length: u })}
             isMobile={isMobile}
           />
         );
       case "mrua":
         return (
           <MRUAInputs
             v0={mruaV0}
             setV0={setMruaV0}
             vf={mruaVf}
             setVf={setMruaVf}
             acceleration={mruaAcceleration}
             setAcceleration={setMruaAcceleration}
             time={mruaTime}
             setTime={setMruaTime}
             distance={mruaDistance}
             setDistance={setMruaDistance}
             velocityUnit={units.velocity}
             setVelocityUnit={(u) => setUnits({ ...units, velocity: u })}
             accelerationUnit={units.acceleration}
             setAccelerationUnit={(u) => setUnits({ ...units, acceleration: u })}
             timeUnit={units.time}
             setTimeUnit={(u) => setUnits({ ...units, time: u })}
             lengthUnit={units.length}
             setLengthUnit={(u) => setUnits({ ...units, length: u })}
             isMobile={isMobile}
           />
         );
       case "caida_libre":
         return (
           <FreeFallInputs
             height={freefallHeight}
             setHeight={setFreefallHeight}
             time={freefallTime}
             setTime={setFreefallTime}
             v0={freefallV0}
             setV0={setFreefallV0}
             lengthUnit={units.length}
             setLengthUnit={(u) => setUnits({ ...units, length: u })}
             timeUnit={units.time}
             setTimeUnit={(u) => setUnits({ ...units, time: u })}
             velocityUnit={units.velocity}
             setVelocityUnit={(u) => setUnits({ ...units, velocity: u })}
             isMobile={isMobile}
           />
         );
       default:
         return null;
     }
   };
   
   return (
     <div className="space-y-4 md:space-y-6">
       {/* Indicador de dispositivo móvil */}
       <div className="flex items-center justify-end md:hidden">
         <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
           {deviceType === "mobile" && <Smartphone className="h-3 w-3" />}
           {deviceType === "tablet" && <Tablet className="h-3 w-3" />}
           {deviceType === "desktop" && <Monitor className="h-3 w-3" />}
           <span className="capitalize">{deviceType}</span>
         </div>
       </div>
       
       {/* Tarjeta Principal */}
       <Card 
         className="p-4 md:p-6 rounded-xl md:rounded-2xl border-l-4 shadow-sm md:shadow-lg"
         style={{ borderLeftColor: "hsl(var(--fisica))" }}
       >
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 md:mb-6">
           <div className="flex items-center gap-3">
             <div className={`${isMobile ? 'w-10 h-10' : 'w-14 h-14'} rounded-lg md:rounded-xl flex items-center justify-center bg-gradient-to-br from-[hsl(var(--fisica))]/20 to-[hsl(var(--fisica))]/5`}>
               <Atom className={`${isMobile ? 'h-5 w-5' : 'h-7 w-7'} text-[hsl(var(--fisica))]`} />
             </div>
             <div>
               <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
                 Laboratorio de Física
               </h1>
               <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                 Cinemática avanzada con procedimiento paso a paso
               </p>
             </div>
           </div>
           
           <div className="flex items-center gap-2">
             <Button
               variant="outline"
               size={isMobile ? "sm" : "default"}
               onClick={handleClear}
               className="rounded-lg gap-1 text-xs"
             >
               <RefreshCw className="h-3 w-3" />
               Limpiar
             </Button>
           </div>
         </div>
         
         {/* Selector de tipo de cálculo */}
         <div className="mb-4 md:mb-6">
           <Label className="text-sm font-medium mb-2 block">Tipo de Cálculo</Label>
           <Tabs value={calcType} onValueChange={(v) => setCalcType(v as KinematicsCalcType)}>
             <TabsList className={`w-full ${isMobile ? 'h-auto' : 'h-12'} rounded-lg md:rounded-xl mb-3 grid ${isMobile ? 'grid-cols-3 gap-1' : 'grid-cols-6'} p-1`}>
               <TabsTrigger value="vertical" className={`rounded-md gap-1 ${isMobile ? 'text-xs py-2 flex-col' : 'text-sm'}`}>
                 <ArrowUp className="h-3 w-3 md:h-4 md:w-4" />
                 {isMobile ? "Vert." : "Vertical"}
               </TabsTrigger>
               <TabsTrigger value="horizontal" className={`rounded-md gap-1 ${isMobile ? 'text-xs py-2 flex-col' : 'text-sm'}`}>
                 <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                 {isMobile ? "Horiz." : "Horizontal"}
               </TabsTrigger>
               <TabsTrigger value="inclinado" className={`rounded-md gap-1 ${isMobile ? 'text-xs py-2 flex-col' : 'text-sm'}`}>
                 <RotateCw className="h-3 w-3 md:h-4 md:w-4" />
                 {isMobile ? "Inclin." : "Inclinado"}
               </TabsTrigger>
               <TabsTrigger value="mru" className={`rounded-md gap-1 ${isMobile ? 'text-xs py-2 flex-col' : 'text-sm'}`}>
                 <Move className="h-3 w-3 md:h-4 md:w-4" />
                 MRU
               </TabsTrigger>
               <TabsTrigger value="mrua" className={`rounded-md gap-1 ${isMobile ? 'text-xs py-2 flex-col' : 'text-sm'}`}>
                 <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                 MRUA
               </TabsTrigger>
               <TabsTrigger value="caida_libre" className={`rounded-md gap-1 ${isMobile ? 'text-xs py-2 flex-col' : 'text-sm'}`}>
                 <Rocket className="h-3 w-3 md:h-4 md:w-4" />
                 {isMobile ? "Caída" : "Caída Libre"}
               </TabsTrigger>
             </TabsList>
             
             <TabsContent value={calcType} className="mt-4">
               {renderInputFields()}
             </TabsContent>
           </Tabs>
         </div>
         
         {/* Configuración Avanzada */}
         <div className="mb-4 md:mb-6">
           <details className="group">
             <summary className="flex items-center justify-between cursor-pointer list-none p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
               <span className="text-sm font-medium flex items-center gap-2">
                 <Sparkles className="h-3 w-3 text-[hsl(var(--fisica))]" />
                 Configuración Avanzada
               </span>
               <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
             </summary>
             
             <div className="mt-3 p-3 bg-muted/20 rounded-lg space-y-4">
               {/* Gravedad */}
               <div className="space-y-2">
                 <div className="flex items-center justify-between">
                   <Label className="text-xs font-medium">Gravedad (g)</Label>
                   <div className="flex items-center gap-2">
                     <Switch
                       checked={useStandardGravity}
                       onCheckedChange={setUseStandardGravity}
                       className="scale-75"
                     />
                     <span className="text-xs text-muted-foreground">
                       {useStandardGravity ? "Presets" : "Personalizada"}
                     </span>
                   </div>
                 </div>
                 
                 {useStandardGravity ? (
                   <Select value={selectedGravityPreset} onValueChange={setSelectedGravityPreset}>
                     <SelectTrigger className="h-9 rounded-lg">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       {GRAVITY_PRESETS.map((preset) => (
                         <SelectItem key={preset.value} value={preset.value.toString()}>
                           <span className="flex items-center gap-2">
                             <span>{preset.emoji}</span>
                             <span>{preset.name}</span>
                             <span className="text-muted-foreground">({preset.value} m/s²)</span>
                           </span>
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 ) : (
                   <Input
                     type="number"
                     value={customGravity}
                     onChange={(e) => setCustomGravity(e.target.value)}
                     placeholder="9.80665"
                     className="h-9"
                     step="0.01"
                   />
                 )}
               </div>
               
               {/* Precisión */}
               <div className="space-y-2">
                 <Label className="text-xs font-medium">
                   Precisión: {decimalPlaces} decimal{decimalPlaces !== 1 ? 'es' : ''}
                 </Label>
                 <Slider
                   value={[decimalPlaces]}
                   onValueChange={(vals) => setDecimalPlaces(vals[0])}
                   min={0}
                   max={8}
                   step={1}
                   className="h-2"
                 />
               </div>
               
               {/* Opciones de visualización */}
               <div className="grid grid-cols-2 gap-3">
                 <div className="flex items-center justify-between p-2 bg-background rounded-lg">
                   <Label className="text-xs">Pasos</Label>
                   <Switch checked={showSteps} onCheckedChange={setShowSteps} className="scale-75" />
                 </div>
                 <div className="flex items-center justify-between p-2 bg-background rounded-lg">
                   <Label className="text-xs">Gráficos</Label>
                   <Switch checked={showGraphs} onCheckedChange={setShowGraphs} className="scale-75" />
                 </div>
                 <div className="flex items-center justify-between p-2 bg-background rounded-lg col-span-2">
                   <Label className="text-xs">Auto-convertir unidades</Label>
                   <Switch checked={autoConvertUnits} onCheckedChange={setAutoConvertUnits} className="scale-75" />
                 </div>
               </div>
             </div>
           </details>
         </div>
         
         {/* Botón Calcular */}
         <Button
           onClick={handleCalculate}
           disabled={loading}
           className={`w-full rounded-lg ${isMobile ? 'h-10' : 'h-12'} gap-2 text-base font-semibold`}
         >
           {loading ? (
             <>
               <RefreshCw className="h-4 w-4 animate-spin" />
               Calculando...
             </>
           ) : (
             <>
               <Calculator className="h-4 w-4" />
               Calcular
             </>
           )}
         </Button>
       </Card>
       
       {/* Resultados */}
       {result && (
         <ResultsDisplay
           result={result}
           gravity={g}
           isMobile={isMobile}
           showGraphs={showGraphs}
           showSteps={showSteps}
           decimalPlaces={decimalPlaces}
         />
       )}
     </div>
   );
 }