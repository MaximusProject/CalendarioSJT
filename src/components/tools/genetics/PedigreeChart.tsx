import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Users, Plus, Trash2, Play, RotateCcw, Download,
  ChevronDown, ChevronUp, Dna, Eye, Info, Shuffle,
  GitBranch, CircleDot, Square, Circle, Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tipos para el árbol genealógico
interface PedigreeIndividual {
  id: string;
  name: string;
  sex: "male" | "female";
  genotype: string;
  phenotype: string;
  isAffected: boolean;
  isCarrier: boolean;
  generation: number;
  parentIds: [string, string] | null;
  partnerId: string | null;
  position: { x: number; y: number };
}

interface PedigreeConfig {
  trait: string;
  dominantAllele: string;
  recessiveAllele: string;
  dominantPhenotype: string;
  recessivePhenotype: string;
  inheritanceType: "autosomal-dominant" | "autosomal-recessive" | "x-linked-dominant" | "x-linked-recessive";
}

interface PedigreeChartProps {
  onClose?: () => void;
}

const INHERITANCE_TYPES = [
  { value: "autosomal-dominant", label: "Autosómica Dominante", description: "Un alelo dominante causa el fenotipo" },
  { value: "autosomal-recessive", label: "Autosómica Recesiva", description: "Requiere dos alelos recesivos" },
  { value: "x-linked-dominant", label: "Ligada al X Dominante", description: "Gen dominante en cromosoma X" },
  { value: "x-linked-recessive", label: "Ligada al X Recesiva", description: "Gen recesivo en cromosoma X" },
];

const PRESET_TRAITS = [
  { trait: "Hemofilia", dominant: "H", recessive: "h", dominantPhenotype: "Normal", recessivePhenotype: "Hemofílico", type: "x-linked-recessive" },
  { trait: "Daltonismo", dominant: "C", recessive: "c", dominantPhenotype: "Visión normal", recessivePhenotype: "Daltónico", type: "x-linked-recessive" },
  { trait: "Huntington", dominant: "H", recessive: "h", dominantPhenotype: "Afectado", recessivePhenotype: "Normal", type: "autosomal-dominant" },
  { trait: "Fibrosis Quística", dominant: "F", recessive: "f", dominantPhenotype: "Normal", recessivePhenotype: "Afectado", type: "autosomal-recessive" },
  { trait: "Albinismo", dominant: "A", recessive: "a", dominantPhenotype: "Pigmentación normal", recessivePhenotype: "Albino", type: "autosomal-recessive" },
  { trait: "Anemia Falciforme", dominant: "S", recessive: "s", dominantPhenotype: "Normal", recessivePhenotype: "Anemia falciforme", type: "autosomal-recessive" },
];

// Generar ID único
const generateId = () => Math.random().toString(36).substring(2, 9);

// Calcular fenotipo desde genotipo
const calculatePhenotype = (genotype: string, config: PedigreeConfig): { phenotype: string; isAffected: boolean; isCarrier: boolean } => {
  const { inheritanceType, dominantAllele, recessiveAllele, dominantPhenotype, recessivePhenotype } = config;
  
  if (inheritanceType.startsWith("x-linked")) {
    // Herencia ligada al X
    if (genotype.length === 1) {
      // Masculino (solo tiene un alelo X)
      const isRecessive = genotype === recessiveAllele.toLowerCase();
      if (inheritanceType === "x-linked-recessive") {
        return {
          phenotype: isRecessive ? recessivePhenotype : dominantPhenotype,
          isAffected: isRecessive,
          isCarrier: false
        };
      } else {
        return {
          phenotype: !isRecessive ? dominantPhenotype : recessivePhenotype,
          isAffected: !isRecessive,
          isCarrier: false
        };
      }
    } else {
      // Femenino (tiene dos alelos X)
      const hasRecessive = genotype.includes(recessiveAllele.toLowerCase());
      const hasDominant = genotype.includes(dominantAllele.toUpperCase());
      const isHomoRecessive = genotype === recessiveAllele.toLowerCase() + recessiveAllele.toLowerCase();
      
      if (inheritanceType === "x-linked-recessive") {
        return {
          phenotype: isHomoRecessive ? recessivePhenotype : dominantPhenotype,
          isAffected: isHomoRecessive,
          isCarrier: hasRecessive && hasDominant
        };
      } else {
        return {
          phenotype: hasDominant ? dominantPhenotype : recessivePhenotype,
          isAffected: hasDominant,
          isCarrier: hasRecessive && hasDominant
        };
      }
    }
  } else {
    // Herencia autosómica
    const hasDominant = genotype.includes(dominantAllele.toUpperCase());
    const hasRecessive = genotype.includes(recessiveAllele.toLowerCase());
    const isHomoRecessive = !hasDominant;
    
    if (inheritanceType === "autosomal-recessive") {
      return {
        phenotype: isHomoRecessive ? recessivePhenotype : dominantPhenotype,
        isAffected: isHomoRecessive,
        isCarrier: hasDominant && hasRecessive
      };
    } else {
      return {
        phenotype: hasDominant ? dominantPhenotype : recessivePhenotype,
        isAffected: hasDominant,
        isCarrier: hasDominant && hasRecessive
      };
    }
  }
};

// Generar gametos
const generateGametes = (genotype: string, sex: "male" | "female", isXLinked: boolean): string[] => {
  if (isXLinked) {
    if (sex === "male") {
      return [genotype]; // Solo tiene un alelo X
    } else {
      return [genotype[0], genotype[1]];
    }
  } else {
    if (genotype.length === 2) {
      return [genotype[0], genotype[1]];
    }
    return [genotype];
  }
};

// Generar descendencia
const generateOffspring = (
  parent1: PedigreeIndividual, 
  parent2: PedigreeIndividual, 
  config: PedigreeConfig
): Omit<PedigreeIndividual, "id" | "name" | "position">[] => {
  const isXLinked = config.inheritanceType.startsWith("x-linked");
  const mother = parent1.sex === "female" ? parent1 : parent2;
  const father = parent1.sex === "male" ? parent1 : parent2;
  
  const motherGametes = generateGametes(mother.genotype, "female", isXLinked);
  const fatherGametes = isXLinked ? [father.genotype] : generateGametes(father.genotype, "male", false);
  
  const offspring: Omit<PedigreeIndividual, "id" | "name" | "position">[] = [];
  
  // Generar todas las combinaciones posibles
  for (const mg of motherGametes) {
    for (const fg of fatherGametes) {
      // 50% probabilidad de cada sexo
      for (const sex of ["male", "female"] as const) {
        let genotype: string;
        
        if (isXLinked) {
          if (sex === "male") {
            genotype = mg; // Heredan X de madre
          } else {
            // Ordenar alelos (dominante primero)
            const alleles = [mg, fg].sort((a, b) => {
              if (a === a.toUpperCase() && b === b.toLowerCase()) return -1;
              if (a === a.toLowerCase() && b === b.toUpperCase()) return 1;
              return 0;
            });
            genotype = alleles.join("");
          }
        } else {
          const alleles = [mg, fg].sort((a, b) => {
            if (a === a.toUpperCase() && b === b.toLowerCase()) return -1;
            if (a === a.toLowerCase() && b === b.toUpperCase()) return 1;
            return 0;
          });
          genotype = alleles.join("");
        }
        
        const phenotypeInfo = calculatePhenotype(genotype, config);
        
        offspring.push({
          sex,
          genotype,
          phenotype: phenotypeInfo.phenotype,
          isAffected: phenotypeInfo.isAffected,
          isCarrier: phenotypeInfo.isCarrier,
          generation: Math.max(parent1.generation, parent2.generation) + 1,
          parentIds: [father.id, mother.id],
          partnerId: null
        });
      }
    }
  }
  
  return offspring;
};

export function PedigreeChart({ onClose }: PedigreeChartProps) {
  const [config, setConfig] = useState<PedigreeConfig>({
    trait: "Hemofilia",
    dominantAllele: "H",
    recessiveAllele: "h",
    dominantPhenotype: "Normal",
    recessivePhenotype: "Hemofílico",
    inheritanceType: "x-linked-recessive"
  });
  
  const [individuals, setIndividuals] = useState<PedigreeIndividual[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGenotypes, setShowGenotypes] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [generations, setGenerations] = useState(3);
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  
  const isXLinked = config.inheritanceType.startsWith("x-linked");
  
  // Inicializar árbol con fundadores
  const initializeTree = () => {
    const founder1: PedigreeIndividual = {
      id: generateId(),
      name: "Padre (F0)",
      sex: "male",
      genotype: isXLinked ? config.dominantAllele : config.dominantAllele + config.recessiveAllele.toLowerCase(),
      phenotype: "",
      isAffected: false,
      isCarrier: !isXLinked,
      generation: 0,
      parentIds: null,
      partnerId: null,
      position: { x: 200, y: 50 }
    };
    
    const founder2: PedigreeIndividual = {
      id: generateId(),
      name: "Madre (F0)",
      sex: "female",
      genotype: isXLinked 
        ? config.dominantAllele + config.recessiveAllele.toLowerCase()
        : config.dominantAllele + config.recessiveAllele.toLowerCase(),
      phenotype: "",
      isAffected: false,
      isCarrier: true,
      generation: 0,
      parentIds: null,
      partnerId: founder1.id,
      position: { x: 350, y: 50 }
    };
    
    founder1.partnerId = founder2.id;
    
    // Calcular fenotipos
    const f1Info = calculatePhenotype(founder1.genotype, config);
    const f2Info = calculatePhenotype(founder2.genotype, config);
    
    founder1.phenotype = f1Info.phenotype;
    founder1.isAffected = f1Info.isAffected;
    founder1.isCarrier = f1Info.isCarrier;
    
    founder2.phenotype = f2Info.phenotype;
    founder2.isAffected = f2Info.isAffected;
    founder2.isCarrier = f2Info.isCarrier;
    
    setIndividuals([founder1, founder2]);
    toast.success("Árbol genealógico inicializado");
  };
  
  // Generar siguiente generación
  const generateNextGeneration = () => {
    const currentGen = Math.max(...individuals.map(i => i.generation), -1);
    
    if (currentGen >= generations - 1) {
      toast.error(`Máximo ${generations} generaciones alcanzadas`);
      return;
    }
    
    const couples = individuals.filter(i => 
      i.generation === currentGen && i.partnerId
    ).reduce((acc, ind) => {
      const partnerId = ind.partnerId!;
      const key = [ind.id, partnerId].sort().join("-");
      if (!acc[key]) {
        acc[key] = [ind, individuals.find(i => i.id === partnerId)!];
      }
      return acc;
    }, {} as Record<string, PedigreeIndividual[]>);
    
    const newIndividuals: PedigreeIndividual[] = [];
    let xOffset = 100;
    
    Object.values(couples).forEach(([parent1, parent2]) => {
      if (!parent1 || !parent2) return;
      
      const offspring = generateOffspring(parent1, parent2, config);
      
      // Tomar una muestra representativa (4 hijos)
      const sample = offspring.slice(0, 4);
      
      sample.forEach((child, idx) => {
        newIndividuals.push({
          ...child,
          id: generateId(),
          name: `Hijo ${newIndividuals.length + 1} (F${currentGen + 1})`,
          position: { x: xOffset + idx * 120, y: (currentGen + 1) * 150 + 50 }
        });
      });
      
      xOffset += sample.length * 120 + 50;
    });
    
    if (newIndividuals.length === 0) {
      toast.error("No hay parejas para generar descendencia");
      return;
    }
    
    // Emparejar algunos hijos aleatoriamente si hay más de una generación restante
    if (currentGen + 1 < generations - 1 && newIndividuals.length >= 2) {
      const males = newIndividuals.filter(i => i.sex === "male" && !i.isAffected);
      const females = newIndividuals.filter(i => i.sex === "female");
      
      if (males.length > 0 && females.length > 0) {
        males[0].partnerId = females[0].id;
        females[0].partnerId = males[0].id;
      }
    }
    
    setIndividuals(prev => [...prev, ...newIndividuals]);
    toast.success(`Generación F${currentGen + 1} creada con ${newIndividuals.length} individuos`);
  };
  
  // Aplicar preset
  const applyPreset = (preset: typeof PRESET_TRAITS[0]) => {
    setConfig({
      trait: preset.trait,
      dominantAllele: preset.dominant,
      recessiveAllele: preset.recessive,
      dominantPhenotype: preset.dominantPhenotype,
      recessivePhenotype: preset.recessivePhenotype,
      inheritanceType: preset.type as PedigreeConfig["inheritanceType"]
    });
    setIndividuals([]);
    toast.success(`Preset "${preset.trait}" aplicado`);
  };
  
  // Estadísticas
  const stats = useMemo(() => {
    const total = individuals.length;
    const affected = individuals.filter(i => i.isAffected).length;
    const carriers = individuals.filter(i => i.isCarrier).length;
    const males = individuals.filter(i => i.sex === "male").length;
    const females = individuals.filter(i => i.sex === "female").length;
    const affectedMales = individuals.filter(i => i.sex === "male" && i.isAffected).length;
    const affectedFemales = individuals.filter(i => i.sex === "female" && i.isAffected).length;
    
    return { total, affected, carriers, males, females, affectedMales, affectedFemales };
  }, [individuals]);
  
  // Renderizar individuo
  const renderIndividual = (ind: PedigreeIndividual) => {
    const isSelected = selectedId === ind.id;
    const ShapeIcon = ind.sex === "male" ? Square : Circle;
    
    return (
      <g 
        key={ind.id}
        transform={`translate(${ind.position.x}, ${ind.position.y})`}
        onClick={() => setSelectedId(isSelected ? null : ind.id)}
        className="cursor-pointer"
      >
        {/* Forma base */}
        <rect
          x={ind.sex === "male" ? -20 : -25}
          y={-20}
          width={ind.sex === "male" ? 40 : 50}
          height={40}
          rx={ind.sex === "male" ? 4 : 20}
          className={cn(
            "stroke-2 transition-all",
            ind.isAffected 
              ? "fill-rose-500 stroke-rose-700" 
              : ind.isCarrier 
                ? "fill-amber-100 stroke-amber-500"
                : "fill-white stroke-slate-400",
            isSelected && "stroke-primary stroke-[3px]"
          )}
        />
        
        {/* Indicador de portador (medio relleno) */}
        {ind.isCarrier && !ind.isAffected && (
          <path
            d={ind.sex === "male" 
              ? "M -20 20 L -20 -20 L 20 -20 Z"
              : "M -25 0 A 25 20 0 0 1 25 0 Z"
            }
            className="fill-amber-400"
          />
        )}
        
        {/* Genotipo */}
        {showGenotypes && (
          <text
            y={-30}
            textAnchor="middle"
            className="text-xs font-mono font-bold fill-current"
          >
            {isXLinked && ind.sex === "male" ? `X${ind.genotype}Y` : isXLinked ? `X${ind.genotype[0]}X${ind.genotype[1]}` : ind.genotype}
          </text>
        )}
        
        {/* Nombre */}
        <text
          y={55}
          textAnchor="middle"
          className="text-[10px] fill-muted-foreground"
        >
          {ind.name}
        </text>
        
        {/* Fenotipo */}
        <text
          y={68}
          textAnchor="middle"
          className="text-[9px] fill-muted-foreground italic"
        >
          {ind.phenotype}
        </text>
      </g>
    );
  };
  
  // Renderizar conexiones
  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    individuals.forEach(ind => {
      // Línea horizontal entre parejas
      if (ind.partnerId) {
        const partner = individuals.find(i => i.id === ind.partnerId);
        if (partner && ind.position.x < partner.position.x) {
          connections.push(
            <line
              key={`couple-${ind.id}-${partner.id}`}
              x1={ind.position.x + 25}
              y1={ind.position.y}
              x2={partner.position.x - 25}
              y2={partner.position.y}
              className="stroke-slate-400 stroke-2"
            />
          );
        }
      }
      
      // Líneas a padres
      if (ind.parentIds) {
        const [fatherId, motherId] = ind.parentIds;
        const father = individuals.find(i => i.id === fatherId);
        const mother = individuals.find(i => i.id === motherId);
        
        if (father && mother) {
          const parentMidX = (father.position.x + mother.position.x) / 2;
          const parentY = father.position.y;
          
          // Línea vertical desde el centro de los padres
          connections.push(
            <path
              key={`child-${ind.id}`}
              d={`M ${parentMidX} ${parentY + 20} 
                  L ${parentMidX} ${parentY + 50} 
                  L ${ind.position.x} ${parentY + 50} 
                  L ${ind.position.x} ${ind.position.y - 25}`}
              className="stroke-slate-300 stroke-2 fill-none"
            />
          );
        }
      }
    });
    
    return connections;
  };
  
  const maxGen = Math.max(...individuals.map(i => i.generation), 0);
  const svgHeight = Math.max(400, (maxGen + 1) * 150 + 100);
  const svgWidth = Math.max(600, individuals.length * 80 + 200);

  return (
    <div className="space-y-4">
      {/* Configuración */}
      <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <Card className="p-4 rounded-2xl">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <GitBranch className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold">Árbol Genealógico</h3>
                  <p className="text-sm text-muted-foreground">
                    {config.trait} - {INHERITANCE_TYPES.find(t => t.value === config.inheritanceType)?.label}
                  </p>
                </div>
              </div>
              {isConfigOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-4 space-y-4">
            {/* Presets */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Condiciones Genéticas Preestablecidas</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_TRAITS.map(preset => (
                  <Badge
                    key={preset.trait}
                    variant={config.trait === preset.trait ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.trait}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Tipo de herencia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Herencia</Label>
                <Select
                  value={config.inheritanceType}
                  onValueChange={(v) => {
                    setConfig(prev => ({ ...prev, inheritanceType: v as PedigreeConfig["inheritanceType"] }));
                    setIndividuals([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INHERITANCE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Generaciones a simular: {generations}</Label>
                <Slider
                  value={[generations]}
                  onValueChange={([v]) => setGenerations(v)}
                  min={2}
                  max={5}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
            
            {/* Configuración de alelos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Alelo Dominante</Label>
                <Input
                  value={config.dominantAllele}
                  onChange={(e) => setConfig(prev => ({ ...prev, dominantAllele: e.target.value.toUpperCase().slice(0, 1) }))}
                  className="font-mono text-center"
                  maxLength={1}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Alelo Recesivo</Label>
                <Input
                  value={config.recessiveAllele}
                  onChange={(e) => setConfig(prev => ({ ...prev, recessiveAllele: e.target.value.toLowerCase().slice(0, 1) }))}
                  className="font-mono text-center"
                  maxLength={1}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fenotipo Dominante</Label>
                <Input
                  value={config.dominantPhenotype}
                  onChange={(e) => setConfig(prev => ({ ...prev, dominantPhenotype: e.target.value }))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fenotipo Recesivo</Label>
                <Input
                  value={config.recessivePhenotype}
                  onChange={(e) => setConfig(prev => ({ ...prev, recessivePhenotype: e.target.value }))}
                  className="text-sm"
                />
              </div>
            </div>
            
            {/* Controles */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={initializeTree} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Iniciar Árbol
              </Button>
              <Button 
                onClick={generateNextGeneration} 
                variant="secondary" 
                className="gap-2"
                disabled={individuals.length === 0}
              >
                <Plus className="h-4 w-4" />
                Generar F{maxGen + 1}
              </Button>
              <div className="flex items-center gap-2 ml-auto">
                <Switch
                  checked={showGenotypes}
                  onCheckedChange={setShowGenotypes}
                  id="show-genotypes"
                />
                <Label htmlFor="show-genotypes" className="text-sm">Genotipos</Label>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      
      {/* Leyenda */}
      {showLegend && individuals.length > 0 && (
        <Card className="p-4 rounded-xl">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-slate-400 bg-white" />
              <span>Masculino sano</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-slate-400 bg-white rounded-full" />
              <span>Femenino sano</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-rose-700 bg-rose-500" />
              <span>Afectado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-amber-500 bg-gradient-to-br from-amber-400 to-amber-100" />
              <span>Portador</span>
            </div>
          </div>
        </Card>
      )}
      
      {/* Árbol SVG */}
      {individuals.length > 0 ? (
        <Card className="p-4 rounded-2xl overflow-x-auto">
          <svg 
            width={svgWidth} 
            height={svgHeight}
            className="mx-auto"
          >
            {/* Etiquetas de generación */}
            {Array.from({ length: maxGen + 1 }).map((_, gen) => (
              <text
                key={gen}
                x={30}
                y={gen * 150 + 55}
                className="text-sm font-bold fill-muted-foreground"
              >
                F{gen}
              </text>
            ))}
            
            {/* Conexiones */}
            {renderConnections()}
            
            {/* Individuos */}
            {individuals.map(renderIndividual)}
          </svg>
        </Card>
      ) : (
        <Card className="p-8 rounded-2xl text-center">
          <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-bold text-lg mb-2">Árbol Genealógico Vacío</h3>
          <p className="text-muted-foreground mb-4">
            Configura los parámetros y haz clic en "Iniciar Árbol" para comenzar
          </p>
          <Button onClick={initializeTree} className="gap-2">
            <Play className="h-4 w-4" />
            Iniciar Simulación
          </Button>
        </Card>
      )}
      
      {/* Estadísticas */}
      {individuals.length > 0 && (
        <Card className="p-4 rounded-2xl">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <Dna className="h-4 w-4" />
            Estadísticas del Árbol
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-muted/30 rounded-xl text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total individuos</div>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-center">
              <div className="text-2xl font-bold text-rose-600">{stats.affected}</div>
              <div className="text-xs text-muted-foreground">Afectados ({((stats.affected / stats.total) * 100).toFixed(1)}%)</div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-center">
              <div className="text-2xl font-bold text-amber-600">{stats.carriers}</div>
              <div className="text-xs text-muted-foreground">Portadores</div>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl text-center">
              <div className="text-lg font-bold">
                ♂{stats.affectedMales} / ♀{stats.affectedFemales}
              </div>
              <div className="text-xs text-muted-foreground">Afectados por sexo</div>
            </div>
          </div>
          
          {/* Explicación según tipo de herencia */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl flex gap-3">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-700 dark:text-blue-400">
                {INHERITANCE_TYPES.find(t => t.value === config.inheritanceType)?.label}
              </p>
              <p className="text-blue-600/80 dark:text-blue-300/80 mt-1">
                {config.inheritanceType === "x-linked-recessive" && 
                  "Los varones afectados heredan el alelo de su madre portadora. Las mujeres necesitan dos copias del alelo para estar afectadas."}
                {config.inheritanceType === "x-linked-dominant" && 
                  "Un solo alelo dominante en el cromosoma X causa la condición. Los varones afectados transmiten a todas sus hijas."}
                {config.inheritanceType === "autosomal-recessive" && 
                  "Ambos padres deben ser portadores para que un hijo esté afectado. Probabilidad de 25% para hijos de dos portadores."}
                {config.inheritanceType === "autosomal-dominant" && 
                  "Un solo alelo dominante causa la condición. Cada hijo de un afectado tiene 50% de probabilidad de heredar."}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
