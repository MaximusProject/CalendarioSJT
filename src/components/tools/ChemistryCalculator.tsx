import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FlaskConical, 
  Droplets, 
  Cloud, 
  Thermometer, 
  Scale,
  Smartphone,
  Monitor
} from "lucide-react";
import { CalcType } from "./chemistry/types";
import { SolutionsCalculator } from "./chemistry/SolutionsCalculator";
import { GasesCalculator } from "./chemistry/GasesCalculator";
import { ThermoCalculator } from "./chemistry/ThermoCalculator";
import { PHCalculator } from "./chemistry/PHCalculator";
import { ConversionsCalculator } from "./chemistry/ConversionsCalculator";

const CALC_TABS: { id: CalcType; label: string; icon: React.ReactNode; shortLabel: string }[] = [
  { id: 'solutions', label: 'Soluciones', icon: <FlaskConical className="h-4 w-4" />, shortLabel: 'Sol' },
  { id: 'ph', label: 'pH/pOH', icon: <Droplets className="h-4 w-4" />, shortLabel: 'pH' },
  { id: 'gases', label: 'Gases', icon: <Cloud className="h-4 w-4" />, shortLabel: 'Gas' },
  { id: 'thermo', label: 'Termoquímica', icon: <Thermometer className="h-4 w-4" />, shortLabel: 'ΔH' },
  { id: 'conversions', label: 'Conversiones', icon: <Scale className="h-4 w-4" />, shortLabel: '⇌' },
];

export function ChemistryCalculator() {
  const [calcType, setCalcType] = useState<CalcType>('solutions');
  const [precision, setPrecision] = useState(4);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl flex items-center justify-center bg-[hsl(var(--quimica))]/15`}>
            <FlaskConical className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-[hsl(var(--quimica))]`} />
          </div>
          <div>
            <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
              Laboratorio Químico Avanzado
            </h1>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              Calculadora completa con procedimiento paso a paso
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {isMobile ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Decimales:</Label>
            <Select value={precision.toString()} onValueChange={(v) => setPrecision(parseInt(v))}>
              <SelectTrigger className="h-8 w-16 rounded-xl text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="6">6</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Card className="p-4 md:p-5 rounded-2xl border-l-4" style={{ borderLeftColor: "hsl(var(--quimica))" }}>
        <Tabs value={calcType} onValueChange={(v) => setCalcType(v as CalcType)}>
          <TabsList className={`w-full ${isMobile ? 'grid grid-cols-5' : 'flex'} gap-1 mb-4 h-auto p-1`}>
            {CALC_TABS.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className={`${isMobile ? 'flex-col py-2 px-1 text-[10px]' : 'gap-2'} rounded-lg`}
              >
                {tab.icon}
                <span>{isMobile ? tab.shortLabel : tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="solutions" className="mt-0">
            <SolutionsCalculator precision={precision} isMobile={isMobile} />
          </TabsContent>

          <TabsContent value="ph" className="mt-0">
            <PHCalculator precision={precision} isMobile={isMobile} />
          </TabsContent>

          <TabsContent value="gases" className="mt-0">
            <GasesCalculator precision={precision} isMobile={isMobile} />
          </TabsContent>

          <TabsContent value="thermo" className="mt-0">
            <ThermoCalculator precision={precision} isMobile={isMobile} />
          </TabsContent>

          <TabsContent value="conversions" className="mt-0">
            <ConversionsCalculator precision={precision} isMobile={isMobile} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
