import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Palette, Calculator, RotateCcw, Info, ChevronDown, ChevronUp,
  Dna, BarChart3, Layers, Sparkles, Eye, BookOpen, TrendingUp
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tipos para herencia poligénica
interface PolygenicTrait {
  id: string;
  name: string;
  genes: number;
  minPhenotype: string;
  maxPhenotype: string;
  unit?: string;
  colorScale?: string[];
  description: string;
}

interface PolygenicResult {
  genotype: string;
  dominantAlleles: number;
  totalAlleles: number;
  phenotypeValue: number;
  phenotypeLabel: string;
  frequency: number;
  percentage: number;
  color: string;
}

interface OffspringDistribution {
  results: PolygenicResult[];
  mean: number;
  variance: number;
  standardDeviation: number;
  mode: number;
  total: number;
}

// Rasgos poligénicos preestablecidos
const POLYGENIC_TRAITS: PolygenicTrait[] = [
  {
    id: "skin-color",
    name: "Color de Piel Humano",
    genes: 3,
    minPhenotype: "Muy claro",
    maxPhenotype: "Muy oscuro",
    colorScale: ["#FFE5D9", "#E8C4B8", "#D4A574", "#B8860B", "#8B4513", "#654321", "#3D2314"],
    description: "Modelo de 3 genes (AaBbCc) que determina la cantidad de melanina"
  },
  {
    id: "height",
    name: "Altura Humana",
    genes: 4,
    minPhenotype: "150 cm",
    maxPhenotype: "198 cm",
    unit: "cm",
    description: "Modelo simplificado con 4 genes aditivos para la estatura"
  },
  {
    id: "wheat-color",
    name: "Color del Grano de Trigo",
    genes: 3,
    minPhenotype: "Blanco",
    maxPhenotype: "Rojo oscuro",
    colorScale: ["#FFFFF0", "#FFF8DC", "#F5DEB3", "#DEB887", "#D2691E", "#CD853F", "#8B4513"],
    description: "Clásico ejemplo de herencia cuantitativa con 3 genes"
  },
  {
    id: "eye-color-poly",
    name: "Color de Ojos (Poligénico)",
    genes: 2,
    minPhenotype: "Azul claro",
    maxPhenotype: "Marrón oscuro",
    colorScale: ["#87CEEB", "#6495ED", "#3CB371", "#9ACD32", "#BDB76B", "#8B7355", "#5D4037"],
    description: "Modelo de 2 genes principales (OCA2 y HERC2)"
  },
  {
    id: "intelligence",
    name: "Capacidad Cognitiva (Modelo)",
    genes: 5,
    minPhenotype: "Bajo",
    maxPhenotype: "Alto",
    description: "Modelo educativo simplificado - la inteligencia real es más compleja"
  },
];

// Generar todos los genotipos posibles
const generateAllGenotypes = (genes: number): string[] => {
  const alleles = genes * 2;
  const genotypes: string[] = [];
  
  const generate = (current: string, position: number, geneIndex: number) => {
    if (position === alleles) {
      genotypes.push(current);
      return;
    }
    
    const letter = String.fromCharCode(65 + geneIndex);
    const isFirstOfPair = position % 2 === 0;
    
    if (isFirstOfPair) {
      generate(current + letter, position + 1, geneIndex);
      generate(current + letter.toLowerCase(), position + 1, geneIndex);
    } else {
      generate(current + letter, position + 1, geneIndex + 1);
      generate(current + letter.toLowerCase(), position + 1, geneIndex + 1);
    }
  };
  
  generate("", 0, 0);
  return genotypes;
};

// Contar alelos dominantes
const countDominantAlleles = (genotype: string): number => {
  return genotype.split("").filter(c => c === c.toUpperCase()).length;
};

// Generar gametos desde genotipo
const generateGametes = (genotype: string): string[] => {
  const pairs: string[][] = [];
  
  for (let i = 0; i < genotype.length; i += 2) {
    pairs.push([genotype[i], genotype[i + 1]]);
  }
  
  const gametes: string[] = [];
  
  const generate = (index: number, current: string) => {
    if (index === pairs.length) {
      gametes.push(current);
      return;
    }
    generate(index + 1, current + pairs[index][0]);
    generate(index + 1, current + pairs[index][1]);
  };
  
  generate(0, "");
  return [...new Set(gametes)];
};

// Combinar gametos y normalizar
const combineGametes = (g1: string, g2: string): string => {
  let result = "";
  for (let i = 0; i < g1.length; i++) {
    const alleles = [g1[i], g2[i]].sort((a, b) => {
      if (a === a.toUpperCase() && b === b.toLowerCase()) return -1;
      if (a === a.toLowerCase() && b === b.toUpperCase()) return 1;
      return a.localeCompare(b);
    });
    result += alleles.join("");
  }
  return result;
};

// Calcular distribución de descendencia
const calculateOffspringDistribution = (
  parent1Genotype: string,
  parent2Genotype: string,
  trait: PolygenicTrait
): OffspringDistribution => {
  const gametes1 = generateGametes(parent1Genotype);
  const gametes2 = generateGametes(parent2Genotype);
  
  const genotypeCounts: Record<string, number> = {};
  const totalCombinations = gametes1.length * gametes2.length;
  
  gametes1.forEach(g1 => {
    gametes2.forEach(g2 => {
      const offspring = combineGametes(g1, g2);
      genotypeCounts[offspring] = (genotypeCounts[offspring] || 0) + 1;
    });
  });
  
  const totalAlleles = trait.genes * 2;
  const results: PolygenicResult[] = [];
  
  Object.entries(genotypeCounts).forEach(([genotype, count]) => {
    const dominantAlleles = countDominantAlleles(genotype);
    const phenotypeValue = dominantAlleles / totalAlleles;
    
    let phenotypeLabel: string;
    let color: string;
    
    if (trait.colorScale) {
      const colorIndex = Math.round(phenotypeValue * (trait.colorScale.length - 1));
      color = trait.colorScale[colorIndex];
      phenotypeLabel = `Nivel ${dominantAlleles}/${totalAlleles}`;
    } else if (trait.unit) {
      const minVal = parseFloat(trait.minPhenotype);
      const maxVal = parseFloat(trait.maxPhenotype);
      const value = minVal + phenotypeValue * (maxVal - minVal);
      phenotypeLabel = `${value.toFixed(1)} ${trait.unit}`;
      color = `hsl(${120 - phenotypeValue * 60}, 70%, ${50 + phenotypeValue * 20}%)`;
    } else {
      phenotypeLabel = `${dominantAlleles} alelos dominantes`;
      color = `hsl(${200 + phenotypeValue * 80}, 60%, 50%)`;
    }
    
    results.push({
      genotype,
      dominantAlleles,
      totalAlleles,
      phenotypeValue,
      phenotypeLabel,
      frequency: count,
      percentage: (count / totalCombinations) * 100,
      color
    });
  });
  
  // Ordenar por número de alelos dominantes
  results.sort((a, b) => a.dominantAlleles - b.dominantAlleles);
  
  // Calcular estadísticas
  const allValues = results.flatMap(r => Array(r.frequency).fill(r.dominantAlleles));
  const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
  const variance = allValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / allValues.length;
  const standardDeviation = Math.sqrt(variance);
  
  const modeCounts: Record<number, number> = {};
  allValues.forEach(v => modeCounts[v] = (modeCounts[v] || 0) + 1);
  const mode = parseInt(Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0][0]);
  
  return {
    results,
    mean,
    variance,
    standardDeviation,
    mode,
    total: totalCombinations
  };
};

// Generar genotipo por defecto
const generateDefaultGenotype = (genes: number, type: "hetero" | "homoDom" | "homoRec"): string => {
  let genotype = "";
  for (let i = 0; i < genes; i++) {
    const letter = String.fromCharCode(65 + i);
    if (type === "hetero") {
      genotype += letter + letter.toLowerCase();
    } else if (type === "homoDom") {
      genotype += letter + letter;
    } else {
      genotype += letter.toLowerCase() + letter.toLowerCase();
    }
  }
  return genotype;
};

export function PolygenicCalculator() {
  const [selectedTrait, setSelectedTrait] = useState<PolygenicTrait>(POLYGENIC_TRAITS[0]);
  const [parent1Genotype, setParent1Genotype] = useState(generateDefaultGenotype(3, "hetero"));
  const [parent2Genotype, setParent2Genotype] = useState(generateDefaultGenotype(3, "hetero"));
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [activeTab, setActiveTab] = useState<"config" | "results" | "explanation">("config");
  
  // Calcular resultados
  const distribution = useMemo(() => {
    if (parent1Genotype.length !== selectedTrait.genes * 2 || 
        parent2Genotype.length !== selectedTrait.genes * 2) {
      return null;
    }
    return calculateOffspringDistribution(parent1Genotype, parent2Genotype, selectedTrait);
  }, [parent1Genotype, parent2Genotype, selectedTrait]);
  
  // Gametos para visualización paso a paso
  const gametes1 = useMemo(() => generateGametes(parent1Genotype), [parent1Genotype]);
  const gametes2 = useMemo(() => generateGametes(parent2Genotype), [parent2Genotype]);
  
  // Cambiar rasgo
  const handleTraitChange = (traitId: string) => {
    const trait = POLYGENIC_TRAITS.find(t => t.id === traitId);
    if (trait) {
      setSelectedTrait(trait);
      setParent1Genotype(generateDefaultGenotype(trait.genes, "hetero"));
      setParent2Genotype(generateDefaultGenotype(trait.genes, "hetero"));
    }
  };
  
  // Aplicar patrón rápido
  const applyPattern = (type: "hetero" | "homoDom" | "homoRec") => {
    const genotype = generateDefaultGenotype(selectedTrait.genes, type);
    setParent1Genotype(genotype);
    setParent2Genotype(genotype);
    toast.success(`Patrón ${type === "hetero" ? "heterocigoto" : type === "homoDom" ? "homocigoto dominante" : "homocigoto recesivo"} aplicado`);
  };
  
  // Agrupar resultados por número de alelos dominantes
  const groupedResults = useMemo(() => {
    if (!distribution) return [];
    
    const groups: Record<number, { count: number; percentage: number; genotypes: PolygenicResult[] }> = {};
    
    distribution.results.forEach(r => {
      if (!groups[r.dominantAlleles]) {
        groups[r.dominantAlleles] = { count: 0, percentage: 0, genotypes: [] };
      }
      groups[r.dominantAlleles].count += r.frequency;
      groups[r.dominantAlleles].percentage += r.percentage;
      groups[r.dominantAlleles].genotypes.push(r);
    });
    
    return Object.entries(groups)
      .map(([alleles, data]) => ({
        dominantAlleles: parseInt(alleles),
        ...data
      }))
      .sort((a, b) => a.dominantAlleles - b.dominantAlleles);
  }, [distribution]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 rounded-2xl bg-gradient-to-br from-card to-secondary/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg">
              <Layers className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Herencia Poligénica</h2>
              <p className="text-muted-foreground text-sm">
                Múltiples genes con efecto aditivo sobre un fenotipo
              </p>
            </div>
          </div>
          
          <Badge variant="outline" className="text-sm gap-2">
            <Dna className="h-4 w-4" />
            {selectedTrait.genes} genes = {selectedTrait.genes * 2} alelos
          </Badge>
        </div>
      </Card>
      
      {/* Tabs de navegación */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full rounded-xl p-1 bg-muted/50">
          <TabsTrigger value="config" className="flex-1 gap-2">
            <Palette className="h-4 w-4" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="results" className="flex-1 gap-2" disabled={!distribution}>
            <BarChart3 className="h-4 w-4" />
            Resultados
          </TabsTrigger>
          <TabsTrigger value="explanation" className="flex-1 gap-2">
            <BookOpen className="h-4 w-4" />
            Explicación
          </TabsTrigger>
        </TabsList>
        
        {/* Configuración */}
        <TabsContent value="config" className="space-y-4 mt-4">
          {/* Selector de rasgo */}
          <Card className="p-4 rounded-xl">
            <Label className="font-bold mb-3 block">Seleccionar Rasgo Poligénico</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {POLYGENIC_TRAITS.map(trait => (
                <Card
                  key={trait.id}
                  className={cn(
                    "p-3 cursor-pointer transition-all hover:shadow-md",
                    selectedTrait.id === trait.id 
                      ? "border-2 border-primary bg-primary/5" 
                      : "border hover:border-primary/50"
                  )}
                  onClick={() => handleTraitChange(trait.id)}
                >
                  <div className="flex items-start gap-3">
                    {trait.colorScale && (
                      <div className="flex gap-0.5 shrink-0">
                        {trait.colorScale.slice(0, 4).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-3 h-6 first:rounded-l last:rounded-r"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{trait.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {trait.genes} genes • {Math.pow(2, trait.genes * 2)} genotipos
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
          
          {/* Descripción del rasgo */}
          <Card className="p-4 rounded-xl bg-muted/30">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{selectedTrait.name}</p>
                <p className="text-sm text-muted-foreground">{selectedTrait.description}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span><strong>Mínimo:</strong> {selectedTrait.minPhenotype}</span>
                  <span><strong>Máximo:</strong> {selectedTrait.maxPhenotype}</span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Configuración rápida */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => applyPattern("hetero")}>
              <Dna className="h-4 w-4 mr-2" />
              Ambos Heterocigotos
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyPattern("homoDom")}>
              Ambos Homocigotos Dom.
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyPattern("homoRec")}>
              Ambos Homocigotos Rec.
            </Button>
          </div>
          
          {/* Genotipos de padres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <Label className="font-bold mb-2 block text-blue-700 dark:text-blue-300">
                Progenitor 1
              </Label>
              <Input
                value={parent1Genotype}
                onChange={(e) => setParent1Genotype(e.target.value.slice(0, selectedTrait.genes * 2))}
                className="font-mono text-xl text-center h-14"
                placeholder={generateDefaultGenotype(selectedTrait.genes, "hetero")}
              />
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Alelos dominantes: {countDominantAlleles(parent1Genotype)}
                </span>
                <Badge variant="outline" className="font-mono">
                  {parent1Genotype.length}/{selectedTrait.genes * 2}
                </Badge>
              </div>
              {/* Visualización de color */}
              {selectedTrait.colorScale && (
                <div 
                  className="mt-2 h-8 rounded-lg border"
                  style={{ 
                    backgroundColor: selectedTrait.colorScale[
                      Math.round((countDominantAlleles(parent1Genotype) / (selectedTrait.genes * 2)) * 
                        (selectedTrait.colorScale.length - 1))
                    ] || "#ccc"
                  }}
                />
              )}
            </Card>
            
            <Card className="p-4 rounded-xl border-2 border-pink-200 dark:border-pink-800">
              <Label className="font-bold mb-2 block text-pink-700 dark:text-pink-300">
                Progenitor 2
              </Label>
              <Input
                value={parent2Genotype}
                onChange={(e) => setParent2Genotype(e.target.value.slice(0, selectedTrait.genes * 2))}
                className="font-mono text-xl text-center h-14"
                placeholder={generateDefaultGenotype(selectedTrait.genes, "hetero")}
              />
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Alelos dominantes: {countDominantAlleles(parent2Genotype)}
                </span>
                <Badge variant="outline" className="font-mono">
                  {parent2Genotype.length}/{selectedTrait.genes * 2}
                </Badge>
              </div>
              {selectedTrait.colorScale && (
                <div 
                  className="mt-2 h-8 rounded-lg border"
                  style={{ 
                    backgroundColor: selectedTrait.colorScale[
                      Math.round((countDominantAlleles(parent2Genotype) / (selectedTrait.genes * 2)) * 
                        (selectedTrait.colorScale.length - 1))
                    ] || "#ccc"
                  }}
                />
              )}
            </Card>
          </div>
          
          {/* Toggle para paso a paso */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
            <Switch
              checked={showStepByStep}
              onCheckedChange={setShowStepByStep}
              id="step-by-step"
            />
            <Label htmlFor="step-by-step" className="cursor-pointer">
              Mostrar proceso paso a paso
            </Label>
          </div>
          
          {/* Paso a paso: Gametos */}
          {showStepByStep && (
            <Card className="p-4 rounded-xl">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Paso 1: Generación de Gametos
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Gametos Progenitor 1 ({gametes1.length})
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {gametes1.map((g, i) => (
                      <Badge key={i} variant="secondary" className="font-mono">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Gametos Progenitor 2 ({gametes2.length})
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {gametes2.map((g, i) => (
                      <Badge key={i} variant="secondary" className="font-mono">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Total de combinaciones posibles: {gametes1.length} × {gametes2.length} = {gametes1.length * gametes2.length}
              </p>
            </Card>
          )}
          
          {/* Botón calcular */}
          <Button 
            onClick={() => setActiveTab("results")} 
            className="w-full h-14 text-lg gap-3"
            disabled={!distribution}
          >
            <Calculator className="h-5 w-5" />
            Ver Distribución de Descendencia
            {distribution && (
              <Badge variant="secondary">{distribution.total} combinaciones</Badge>
            )}
          </Button>
        </TabsContent>
        
        {/* Resultados */}
        <TabsContent value="results" className="space-y-4 mt-4">
          {distribution && (
            <>
              {/* Estadísticas principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-4 text-center bg-gradient-to-br from-blue-500/10 to-transparent">
                  <TrendingUp className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">{distribution.mean.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Media (μ)</div>
                </Card>
                <Card className="p-4 text-center bg-gradient-to-br from-purple-500/10 to-transparent">
                  <BarChart3 className="h-5 w-5 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-600">{distribution.mode}</div>
                  <div className="text-xs text-muted-foreground">Moda</div>
                </Card>
                <Card className="p-4 text-center bg-gradient-to-br from-green-500/10 to-transparent">
                  <Layers className="h-5 w-5 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">{distribution.standardDeviation.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Desv. Estándar (σ)</div>
                </Card>
                <Card className="p-4 text-center bg-gradient-to-br from-orange-500/10 to-transparent">
                  <Dna className="h-5 w-5 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-orange-600">{distribution.results.length}</div>
                  <div className="text-xs text-muted-foreground">Genotipos únicos</div>
                </Card>
              </div>
              
              {/* Distribución visual (histograma) */}
              <Card className="p-5 rounded-2xl">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Distribución Fenotípica (Curva de Campana)
                </h4>
                
                {/* Escala de colores para rasgos con colorScale */}
                {selectedTrait.colorScale && (
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{selectedTrait.minPhenotype}</span>
                    <div className="flex-1 h-4 rounded-full overflow-hidden flex">
                      {selectedTrait.colorScale.map((color, i) => (
                        <div 
                          key={i} 
                          className="flex-1" 
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{selectedTrait.maxPhenotype}</span>
                  </div>
                )}
                
                {/* Histograma */}
                <div className="flex items-end gap-1 h-48 px-4">
                  {groupedResults.map((group, idx) => {
                    const maxPercentage = Math.max(...groupedResults.map(g => g.percentage));
                    const heightPercentage = (group.percentage / maxPercentage) * 100;
                    
                    let bgColor = "hsl(var(--primary))";
                    if (selectedTrait.colorScale) {
                      const colorIdx = Math.round((group.dominantAlleles / (selectedTrait.genes * 2)) * 
                        (selectedTrait.colorScale.length - 1));
                      bgColor = selectedTrait.colorScale[colorIdx];
                    }
                    
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full rounded-t-lg transition-all hover:opacity-80 relative group"
                          style={{ 
                            height: `${heightPercentage}%`,
                            backgroundColor: bgColor,
                            minHeight: "10px"
                          }}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <div className="bg-popover text-popover-foreground text-xs p-2 rounded shadow-lg whitespace-nowrap">
                              <div className="font-bold">{group.dominantAlleles} alelos dom.</div>
                              <div>{group.percentage.toFixed(1)}%</div>
                              <div>{group.genotypes.length} genotipos</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs mt-1 font-mono">{group.dominantAlleles}</div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="text-center text-sm text-muted-foreground mt-2">
                  Número de alelos dominantes
                </div>
              </Card>
              
              {/* Tabla de resultados detallados */}
              <Card className="p-4 rounded-xl">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Clases Fenotípicas Detalladas
                </h4>
                
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {groupedResults.map((group, idx) => (
                    <div key={idx} className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {selectedTrait.colorScale && (
                            <div 
                              className="w-8 h-8 rounded-lg border"
                              style={{ 
                                backgroundColor: selectedTrait.colorScale[
                                  Math.round((group.dominantAlleles / (selectedTrait.genes * 2)) * 
                                    (selectedTrait.colorScale.length - 1))
                                ]
                              }}
                            />
                          )}
                          <div>
                            <span className="font-bold">{group.dominantAlleles} alelos dominantes</span>
                            <p className="text-xs text-muted-foreground">
                              {group.genotypes.length} genotipo{group.genotypes.length > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="font-mono">
                            {group.count}/{distribution.total}
                          </Badge>
                          <div className="text-lg font-bold text-primary mt-1">
                            {group.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Genotipos de este grupo */}
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full justify-between h-8">
                            <span className="text-xs">Ver genotipos</span>
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2">
                          <div className="flex flex-wrap gap-1">
                            {group.genotypes.map((g, i) => (
                              <Badge key={i} variant="secondary" className="font-mono text-xs">
                                {g.genotype} ({g.frequency})
                              </Badge>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                      
                      {/* Barra de progreso */}
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div 
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${group.percentage}%`,
                            backgroundColor: selectedTrait.colorScale 
                              ? selectedTrait.colorScale[Math.round((group.dominantAlleles / (selectedTrait.genes * 2)) * (selectedTrait.colorScale.length - 1))]
                              : "hsl(var(--primary))"
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </TabsContent>
        
        {/* Explicación */}
        <TabsContent value="explanation" className="space-y-4 mt-4">
          <Card className="p-5 rounded-2xl">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              ¿Qué es la Herencia Poligénica?
            </h4>
            
            <div className="space-y-4 text-sm">
              <p>
                La <strong>herencia poligénica</strong> (o cuantitativa) ocurre cuando un rasgo está 
                controlado por múltiples genes, donde cada uno contribuye una pequeña cantidad al 
                fenotipo final. A diferencia de la herencia mendeliana simple, produce una 
                <strong> distribución continua</strong> de fenotipos.
              </p>
              
              <div className="p-4 bg-muted/30 rounded-xl">
                <h5 className="font-semibold mb-2">Características principales:</h5>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                  <li><strong>Efecto aditivo:</strong> Cada alelo dominante añade una "dosis" al fenotipo</li>
                  <li><strong>Distribución normal:</strong> Los fenotipos siguen una curva de campana</li>
                  <li><strong>Variación continua:</strong> No hay categorías discretas como en herencia simple</li>
                  <li><strong>Influencia ambiental:</strong> El ambiente puede modificar la expresión</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                <h5 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                  Ejemplo: Color de Piel Humano
                </h5>
                <p className="text-muted-foreground">
                  Si usamos un modelo de 3 genes (AaBbCc × AaBbCc):
                </p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• <strong>0 alelos dominantes</strong> (aabbcc): Piel muy clara</li>
                  <li>• <strong>3 alelos dominantes</strong>: Tono intermedio</li>
                  <li>• <strong>6 alelos dominantes</strong> (AABBCC): Piel muy oscura</li>
                </ul>
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                <h5 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
                  Fórmula de Distribución
                </h5>
                <p className="font-mono text-center text-lg my-2">
                  Clases fenotípicas = 2n + 1
                </p>
                <p className="text-muted-foreground text-center">
                  Donde n = número de genes
                </p>
                <p className="text-muted-foreground mt-2">
                  Para {selectedTrait.genes} genes: {selectedTrait.genes * 2 + 1} clases fenotípicas posibles
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
