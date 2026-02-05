 // ============================================
 // Componente de Gráficos - Física
 // ============================================
 
 import { GraphData } from "./types";
 
 interface PhysicsGraphProps {
   graph: GraphData;
   isMobile?: boolean;
 }
 
 export function PhysicsGraph({ graph, isMobile = false }: PhysicsGraphProps) {
   if (!graph.data || graph.data.length === 0) return null;
 
   const width = isMobile ? 300 : 420;
   const height = isMobile ? 200 : 260;
   const padding = { top: 20, right: 20, bottom: 35, left: 45 };
 
   const xValues = graph.data.map(d => d.x);
   const yValues = graph.data.map(d => d.y);
 
   const minX = Math.min(...xValues);
   const maxX = Math.max(...xValues);
   const minY = Math.min(0, ...yValues);
   const maxY = Math.max(...yValues);
 
   const rangeX = maxX - minX || 1;
   const rangeY = maxY - minY || 1;
 
   const scaleX = (width - padding.left - padding.right) / rangeX;
   const scaleY = (height - padding.top - padding.bottom) / rangeY;
 
   const toX = (x: number) => padding.left + (x - minX) * scaleX;
   const toY = (y: number) => height - padding.bottom - (y - minY) * scaleY;
 
   const points = graph.data.map(d => `${toX(d.x)},${toY(d.y)}`).join(" ");
 
   // Generar líneas de cuadrícula
   const gridLinesX = [];
   const gridLinesY = [];
   const numGridLines = 5;
 
   for (let i = 0; i <= numGridLines; i++) {
     const xVal = minX + (rangeX / numGridLines) * i;
     const yVal = minY + (rangeY / numGridLines) * i;
     gridLinesX.push({ x: toX(xVal), label: xVal.toFixed(1) });
     gridLinesY.push({ y: toY(yVal), label: yVal.toFixed(1) });
   }
 
   return (
     <div className="bg-muted/20 rounded-xl p-3 border">
       <h4 className="font-medium text-sm mb-2 text-center">{graph.title}</h4>
       <div className="flex justify-center overflow-hidden">
         <svg 
           width="100%" 
           height={height} 
           viewBox={`0 0 ${width} ${height}`} 
           className="overflow-visible"
           style={{ maxWidth: width }}
         >
           {/* Cuadrícula */}
           {gridLinesX.map((line, i) => (
             <line
               key={`gx-${i}`}
               x1={line.x}
               y1={padding.top}
               x2={line.x}
               y2={height - padding.bottom}
               stroke="currentColor"
               strokeOpacity={0.1}
               strokeWidth="1"
             />
           ))}
           {gridLinesY.map((line, i) => (
             <line
               key={`gy-${i}`}
               x1={padding.left}
               y1={line.y}
               x2={width - padding.right}
               y2={line.y}
               stroke="currentColor"
               strokeOpacity={0.1}
               strokeWidth="1"
             />
           ))}
 
           {/* Ejes */}
           <line
             x1={padding.left}
             y1={padding.top}
             x2={padding.left}
             y2={height - padding.bottom}
             stroke="currentColor"
             strokeOpacity={0.5}
             strokeWidth="1.5"
           />
           <line
             x1={padding.left}
             y1={height - padding.bottom}
             x2={width - padding.right}
             y2={height - padding.bottom}
             stroke="currentColor"
             strokeOpacity={0.5}
             strokeWidth="1.5"
           />
 
           {/* Etiquetas de ejes */}
           <text
             x={width / 2}
             y={height - 5}
             fill="currentColor"
             fontSize={isMobile ? 10 : 11}
             textAnchor="middle"
             opacity={0.7}
           >
             {graph.xLabel}
           </text>
           <text
             x={12}
             y={height / 2}
             fill="currentColor"
             fontSize={isMobile ? 10 : 11}
             textAnchor="middle"
             opacity={0.7}
             transform={`rotate(-90, 12, ${height / 2})`}
           >
             {graph.yLabel}
           </text>
 
           {/* Etiquetas de valores en X */}
           {gridLinesX.filter((_, i) => i % 2 === 0 || !isMobile).map((line, i) => (
             <text
               key={`lx-${i}`}
               x={line.x}
               y={height - padding.bottom + 15}
               fill="currentColor"
               fontSize={9}
               textAnchor="middle"
               opacity={0.6}
             >
               {line.label}
             </text>
           ))}
 
           {/* Etiquetas de valores en Y */}
           {gridLinesY.filter((_, i) => i % 2 === 0 || !isMobile).map((line, i) => (
             <text
               key={`ly-${i}`}
               x={padding.left - 8}
               y={line.y + 3}
               fill="currentColor"
               fontSize={9}
               textAnchor="end"
               opacity={0.6}
             >
               {line.label}
             </text>
           ))}
 
           {/* Línea del gráfico */}
           {graph.type === "line" && (
             <>
               {/* Área bajo la curva */}
               <path
                 d={`M ${toX(graph.data[0].x)} ${toY(0)} ${graph.data.map(d => `L ${toX(d.x)} ${toY(d.y)}`).join(' ')} L ${toX(graph.data[graph.data.length - 1].x)} ${toY(0)} Z`}
                 fill={graph.color || "#3b82f6"}
                 fillOpacity={0.1}
               />
               <polyline
                 points={points}
                 fill="none"
                 stroke={graph.color || "#3b82f6"}
                 strokeWidth="2.5"
                 strokeLinejoin="round"
                 strokeLinecap="round"
               />
             </>
           )}
 
           {graph.type === "scatter" && (
             <>
               <polyline
                 points={points}
                 fill="none"
                 stroke={graph.color || "#3b82f6"}
                 strokeWidth="2"
                 strokeLinejoin="round"
                 strokeLinecap="round"
               />
               {graph.data.map((d, i) => (
                 <circle
                   key={i}
                   cx={toX(d.x)}
                   cy={toY(d.y)}
                   r={isMobile ? 3 : 4}
                   fill={graph.color || "#3b82f6"}
                   stroke="white"
                   strokeWidth="1.5"
                 />
               ))}
             </>
           )}
 
           {/* Punto inicial (verde) */}
           {graph.data.length > 0 && (
             <circle
               cx={toX(graph.data[0].x)}
               cy={toY(graph.data[0].y)}
               r={5}
               fill="#10b981"
               stroke="white"
               strokeWidth="2"
             />
           )}
 
           {/* Punto final (rojo) */}
           {graph.data.length > 1 && (
             <circle
               cx={toX(graph.data[graph.data.length - 1].x)}
               cy={toY(graph.data[graph.data.length - 1].y)}
               r={5}
               fill="#ef4444"
               stroke="white"
               strokeWidth="2"
             />
           )}
 
           {/* Punto máximo */}
           {graph.data.length > 2 && (
             (() => {
               const maxPoint = graph.data.reduce((max, d) => d.y > max.y ? d : max, graph.data[0]);
               const maxIndex = graph.data.indexOf(maxPoint);
               if (maxIndex > 0 && maxIndex < graph.data.length - 1) {
                 return (
                   <circle
                     cx={toX(maxPoint.x)}
                     cy={toY(maxPoint.y)}
                     r={5}
                     fill="#f59e0b"
                     stroke="white"
                     strokeWidth="2"
                   />
                 );
               }
               return null;
             })()
           )}
         </svg>
       </div>
       
       {/* Leyenda */}
       <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
         <div className="flex items-center gap-1">
           <div className="w-2 h-2 rounded-full bg-[#10b981]" />
           <span>Inicio</span>
         </div>
         <div className="flex items-center gap-1">
           <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
           <span>Máximo</span>
         </div>
         <div className="flex items-center gap-1">
           <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
           <span>Final</span>
         </div>
       </div>
     </div>
   );
 }