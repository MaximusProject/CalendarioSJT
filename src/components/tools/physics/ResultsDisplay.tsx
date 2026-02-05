 // ============================================
 // Componente de Resultados - Física
 // ============================================
 
 import { PhysicsResult } from "./types";
 import { PhysicsGraph } from "./PhysicsGraph";
 import { Card } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { 
   Info, BookOpen, LineChart, Braces, Download, 
   CheckCircle, AlertCircle, ChevronDown 
 } from "lucide-react";
 import { formatNumber, exportResultsToText } from "./physicsUtils";
 import { useState } from "react";
 
 interface ResultsDisplayProps {
   result: PhysicsResult;
   gravity: number;
   isMobile?: boolean;
   showGraphs?: boolean;
   showSteps?: boolean;
   decimalPlaces?: number;
 }
 
 export function ResultsDisplay({
   result,
   gravity,
   isMobile = false,
   showGraphs = true,
   showSteps = true,
   decimalPlaces = 4
 }: ResultsDisplayProps) {
   const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
   
   const toggleStep = (index: number) => {
     setExpandedSteps(prev => 
       prev.includes(index) 
         ? prev.filter(i => i !== index)
         : [...prev, index]
     );
   };
 
   const handleExport = () => {
     const text = exportResultsToText(result);
     const blob = new Blob([text], { type: 'text/plain' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `${result.title.replace(/\s+/g, '_')}.txt`;
     a.click();
     URL.revokeObjectURL(url);
   };
 
   return (
     <div className="space-y-4 animate-fade-in">
       {/* Resultados Finales */}
       <Card 
         className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-[hsl(var(--fisica))]/10 to-transparent border-l-4"
         style={{ borderLeftColor: "hsl(var(--fisica))" }}
       >
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
           <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold`}>
             {result.title}
           </h3>
           <div className="flex items-center gap-2">
             <span className="text-xs text-muted-foreground flex items-center gap-1">
               <Info className="h-3 w-3" />
               g = {formatNumber(gravity, decimalPlaces)} m/s²
             </span>
             <Button
               variant="outline"
               size="sm"
               onClick={handleExport}
               className="h-7 text-xs gap-1"
             >
               <Download className="h-3 w-3" />
               Exportar
             </Button>
           </div>
         </div>
 
         {/* Conversiones aplicadas */}
         {result.unitConversions && result.unitConversions.length > 0 && (
           <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
             <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
               <CheckCircle className="h-4 w-4" />
               <span className="font-medium text-sm">Conversiones Automáticas</span>
             </div>
             <ul className="space-y-1">
               {result.unitConversions.map((c, i) => (
                 <li key={i} className="text-xs text-blue-600 dark:text-blue-400">• {c}</li>
               ))}
             </ul>
           </div>
         )}
 
         {/* Grid de resultados */}
         <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3'}`}>
           {result.finalResults.map((r, idx) => (
             <div
               key={idx}
               className={`p-3 ${isMobile ? 'p-2' : 'p-4'} bg-background rounded-xl border text-center transition-all hover:shadow-md hover:border-[hsl(var(--fisica))]`}
             >
               <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-[hsl(var(--fisica))]`}>
                 {r.value}
               </div>
               <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}>
                 {r.unit}
               </div>
               <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium mt-2`}>
                 {r.label}
               </div>
               {r.description && !isMobile && (
                 <div className="text-xs text-muted-foreground mt-1 opacity-70">
                   {r.description}
                 </div>
               )}
             </div>
           ))}
         </div>
 
         {/* Suposiciones y advertencias */}
         {(result.assumptions || result.warnings) && (
           <div className="mt-4 pt-4 border-t">
             {result.assumptions && result.assumptions.length > 0 && (
               <div className="mb-3">
                 <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                   <BookOpen className="h-3 w-3" />
                   Suposiciones del Modelo
                 </h4>
                 <div className="flex flex-wrap gap-1.5">
                   {result.assumptions.map((a, i) => (
                     <span
                       key={i}
                       className={`${isMobile ? 'text-xs px-2 py-0.5' : 'text-xs px-3 py-1'} bg-muted rounded-full`}
                     >
                       {a}
                     </span>
                   ))}
                 </div>
               </div>
             )}
 
             {result.warnings && result.warnings.length > 0 && (
               <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                 <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-2">
                   <AlertCircle className="h-4 w-4" />
                   <span className="font-medium text-sm">Advertencias</span>
                 </div>
                 <ul className="space-y-1">
                   {result.warnings.map((w, i) => (
                     <li key={i} className="text-xs text-amber-600 dark:text-amber-400">• {w}</li>
                   ))}
                 </ul>
               </div>
             )}
           </div>
         )}
       </Card>
 
       {/* Gráficos */}
       {showGraphs && result.graphs && result.graphs.length > 0 && (
         <Card className="p-4 md:p-6 rounded-xl md:rounded-2xl">
           <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-4 flex items-center gap-2`}>
             <LineChart className="h-4 w-4 text-[hsl(var(--fisica))]" />
             Visualización Gráfica
           </h3>
           <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
             {result.graphs.map((graph, idx) => (
               <PhysicsGraph key={idx} graph={graph} isMobile={isMobile} />
             ))}
           </div>
         </Card>
       )}
 
       {/* Procedimiento paso a paso */}
       {showSteps && result.steps.length > 0 && (
         <Card className="p-4 md:p-6 rounded-xl md:rounded-2xl">
           <div className="flex items-center justify-between mb-4">
             <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold flex items-center gap-2`}>
               <Braces className="h-4 w-4 text-[hsl(var(--fisica))]" />
               Procedimiento Detallado
             </h3>
             <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
               {result.steps.length} pasos
             </span>
           </div>
 
           <div className="space-y-3">
             {result.steps.map((step, idx) => {
               const isExpanded = expandedSteps.includes(idx) || !isMobile;
               
               return (
                 <div
                   key={idx}
                   className="p-3 md:p-4 bg-muted/30 rounded-xl border-l-4 border-[hsl(var(--fisica))] transition-all"
                 >
                   <div 
                     className="flex items-start gap-3 cursor-pointer md:cursor-default"
                     onClick={() => isMobile && toggleStep(idx)}
                   >
                     <span className={`${isMobile ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'} rounded-full bg-[hsl(var(--fisica))] text-white flex items-center justify-center font-bold shrink-0`}>
                       {idx + 1}
                     </span>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between">
                         <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                           {step.explanation}
                         </span>
                         {isMobile && (
                           <ChevronDown 
                             className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                           />
                         )}
                       </div>
                       
                       {isExpanded && (
                         <div className={`mt-3 font-mono ${isMobile ? 'text-xs p-2' : 'text-sm p-3'} bg-background rounded-lg border space-y-2`}>
                           <div>
                             <span className="text-muted-foreground text-xs block mb-0.5">Fórmula:</span>
                             <span className="text-[hsl(var(--fisica))]">{step.formula}</span>
                           </div>
                           <div>
                             <span className="text-muted-foreground text-xs block mb-0.5">Sustitución:</span>
                             <span>{step.substitution}</span>
                           </div>
                           <div className="pt-2 border-t">
                             <span className="text-muted-foreground text-xs block mb-0.5">Resultado:</span>
                             <span className="font-bold text-[hsl(var(--fisica))]">{step.result}</span>
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>
         </Card>
       )}
     </div>
   );
 }