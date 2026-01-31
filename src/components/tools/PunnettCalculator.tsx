import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dna, RefreshCw, Download, Info, BarChart3, 
  Grid3x3, Eye, EyeOff, Copy, CheckCheck, FileText,
  Calculator, Filter, ZoomIn, ZoomOut
} from "lucide-react";
import { toast } from "sonner";

interface CrossResult {
  genotypes: { genotype: string; count: number; percentage: number; phenotype: string }[];
  phenotypes: { phenotype: string; count: number; percentage: number; description: string }[];
  grid: string[][];
  gametes: {
    parent1: string[];
    parent2: string[];
  };
  ratios: {
    genotypic: Record<string, number>;
    phenotypic: Record<string, number>;
  };
}

interface AlleleConfig {
  name: string;
  dominant: string;
  recessive: string;
  trait: string;
  dominantTrait: string;
  recessiveTrait: string;
}

type CrossType = "mono" | "di" | "tri" | "tetra" | "penta";
type DisplayMode = "genotype" | "phenotype" | "color" | "simple" | "detailed";
type ZoomLevel = 1 | 2 | 3 | 4 | 5;

const CROSS_TYPES: { value: CrossType; label: string; alleles: number }[] = [
  { value: "mono", label: "Monohíbrido", alleles: 2 },
  { value: "di", label: "Dihíbrido", alleles: 4 },
  { value: "tri", label: "Trihíbrido", alleles: 6 },
  { value: "tetra", label: "Tetrahibrido", alleles: 8 },
  { value: "penta", label: "Pentahíbrido", alleles: 10 },
];

const DISPLAY_MODES = [
  { value: "genotype", label: "Genotipo", icon: Dna },
  { value: "phenotype", label: "Fenotipo", icon: Eye },
  { value: "color", label: "Color", icon: Grid3x3 },
  { value: "simple", label: "Simple", icon: EyeOff },
  { value: "detailed", label: "Detallado", icon: BarChart3 },
];

const EXAMPLE_CROSSES = {
  mono: [
    { parent1: "AA", parent2: "AA", label: "Homocigoto dominante" },
    { parent1: "Aa", parent2: "Aa", label: "Heterocigoto" },
    { parent1: "aa", parent2: "aa", label: "Homocigoto recesivo" },
    { parent1: "AA", parent2: "aa", label: "Cruza pura" },
  ],
  di: [
    { parent1: "AABB", parent2: "AABB", label: "Doble homocigoto dominante" },
    { parent1: "AaBb", parent2: "AaBb", label: "Doble heterocigoto" },
    { parent1: "aabb", parent2: "aabb", label: "Doble homocigoto recesivo" },
    { parent1: "AABB", parent2: "aabb", label: "Dihíbrido puro" },
  ],
};

export function PunnettCalculator() {
  const [crossType, setCrossType] = useState<CrossType>("mono");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("genotype");
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(3);
  const [showDetails, setShowDetails] = useState(true);
  
  // Estados para genotipos de padres
  const [parentGenotypes, setParentGenotypes] = useState({
    mono: { parent1: "Aa", parent2: "Aa" },
    di: { parent1: "AaBb", parent2: "AaBb" },
    tri: { parent1: "AaBbCc", parent2: "AaBbCc" },
    tetra: { parent1: "AaBbCcDd", parent2: "AaBbCcDd" },
    penta: { parent1: "AaBbCcDdEe", parent2: "AaBbCcDdEe" },
  });

  const [result, setResult] = useState<CrossResult | null>(null);
  const [alleleConfigs, setAlleleConfigs] = useState<AlleleConfig[]>([
    { name: "A", dominant: "A", recessive: "a", trait: "Color", dominantTrait: "Rojo", recessiveTrait: "Blanco" },
    { name: "B", dominant: "B", recessive: "b", trait: "Forma", dominantTrait: "Redondo", recessiveTrait: "Arrugado" },
    { name: "C", dominant: "C", recessive: "c", trait: "Tamaño", dominantTrait: "Grande", recessiveTrait: "Pequeño" },
    { name: "D", dominant: "D", recessive: "d", trait: "Sabor", dominantTrait: "Dulce", recessiveTrait: "Amargo" },
    { name: "E", dominant: "E", recessive: "e", trait: "Textura", dominantTrait: "Lisa", recessiveTrait: "Rugosa" },
  ]);

  // Obtener genotipos actuales según el tipo de cruce
  const currentParents = parentGenotypes[crossType];

  // Calcular automáticamente al cambiar los valores
  useEffect(() => {
    handleCalculate();
  }, [crossType, parentGenotypes]);

  const getAlleleCount = () => {
    return CROSS_TYPES.find(t => t.value === crossType)?.alleles || 2;
  };

  const validateGenotype = (genotype: string, type: CrossType): boolean => {
    const alleleCount = CROSS_TYPES.find(t => t.value === type)?.alleles || 2;
    if (genotype.length !== alleleCount) return false;
    
    // Validar que sea formato válido (pares de alelos)
    for (let i = 0; i < genotype.length; i += 2) {
      const pair = genotype.substring(i, i + 2);
      if (!/^[A-Z][a-z]$|^[a-z][A-Z]$|^[A-Z]{2}$|^[a-z]{2}$/.test(pair)) {
        return false;
      }
    }
    return true;
  };

  const generateGametes = (genotype: string): string[] => {
    const pairs = [];
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
    return [...new Set(gametes)]; // Eliminar duplicados
  };

  const combineGametes = (g1: string, g2: string): string => {
    let result = "";
    for (let i = 0; i < g1.length; i++) {
      const alleles = [g1[i], g2[i]];
      // Ordenar: mayúscula primero, luego minúscula
      alleles.sort((a, b) => {
        if (a === a.toUpperCase() && b === b.toLowerCase()) return -1;
        if (a === a.toLowerCase() && b === b.toUpperCase()) return 1;
        return a.localeCompare(b);
      });
      result += alleles.join("");
    }
    return result;
  };

  const getPhenotypeFromGenotype = (genotype: string): string => {
    let phenotype = "";
    for (let i = 0; i < genotype.length; i += 2) {
      const allele1 = genotype[i];
      const allele2 = genotype[i + 1];
      const isDominant = allele1 === allele1.toUpperCase() || allele2 === allele2.toUpperCase();
      const configIndex = Math.floor(i / 2);
      const config = alleleConfigs[configIndex];
      
      if (config) {
        phenotype += isDominant ? config.dominantTrait : config.recessiveTrait;
        if (i < genotype.length - 2) phenotype += " + ";
      } else {
        phenotype += isDominant ? "Dominante" : "Recesivo";
        if (i < genotype.length - 2) phenotype += " ";
      }
    }
    return phenotype;
  };

  const getSimplePhenotype = (genotype: string): string => {
    let result = "";
    for (let i = 0; i < genotype.length; i += 2) {
      const allele1 = genotype[i];
      const allele2 = genotype[i + 1];
      const isDominant = allele1 === allele1.toUpperCase() || allele2 === allele2.toUpperCase();
      result += isDominant ? "D" : "r";
    }
    return result;
  };

  const getColorForGenotype = (genotype: string): string => {
    let dominantCount = 0;
    for (let i = 0; i < genotype.length; i += 2) {
      const allele1 = genotype[i];
      const allele2 = genotype[i + 1];
      if (allele1 === allele1.toUpperCase() || allele2 === allele2.toUpperCase()) {
        dominantCount++;
      }
    }
    
    const totalTraits = genotype.length / 2;
    const dominantRatio = dominantCount / totalTraits;
    
    if (dominantRatio === 1) return "bg-green-100 border-green-300";
    if (dominantRatio >= 0.75) return "bg-emerald-50 border-emerald-200";
    if (dominantRatio >= 0.5) return "bg-yellow-50 border-yellow-200";
    if (dominantRatio >= 0.25) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  const handleCalculate = () => {
    const parents = parentGenotypes[crossType];
    const genotype1 = parents.parent1;
    const genotype2 = parents.parent2;

    if (!validateGenotype(genotype1, crossType) || !validateGenotype(genotype2, crossType)) {
      toast.error("Formato de genotipo inválido");
      return;
    }

    const gametes1 = generateGametes(genotype1);
    const gametes2 = generateGametes(genotype2);

    const grid: string[][] = [];
    const genotypeCounts: Record<string, number> = {};
    const phenotypeCounts: Record<string, number> = {};

    for (let i = 0; i < gametes1.length; i++) {
      grid[i] = [];
      for (let j = 0; j < gametes2.length; j++) {
        const genotype = combineGametes(gametes1[i], gametes2[j]);
        grid[i][j] = genotype;
        genotypeCounts[genotype] = (genotypeCounts[genotype] || 0) + 1;
        
        const phenotype = getPhenotypeFromGenotype(genotype);
        phenotypeCounts[phenotype] = (phenotypeCounts[phenotype] || 0) + 1;
      }
    }

    const total = gametes1.length * gametes2.length;
    
    const genotypes = Object.entries(genotypeCounts)
      .map(([genotype, count]) => ({
        genotype,
        count,
        percentage: (count / total) * 100,
        phenotype: getPhenotypeFromGenotype(genotype)
      }))
      .sort((a, b) => b.count - a.count);

    const phenotypes = Object.entries(phenotypeCounts)
      .map(([phenotype, count]) => ({
        phenotype,
        count,
        percentage: (count / total) * 100,
        description: phenotype
      }))
      .sort((a, b) => b.count - a.count);

    // Calcular ratios
    const genotypicRatios: Record<string, number> = {};
    Object.values(genotypeCounts).forEach(count => {
      const ratio = `${count}:${total - count}`;
      genotypicRatios[ratio] = (genotypicRatios[ratio] || 0) + 1;
    });

    const phenotypicRatios: Record<string, number> = {};
    Object.values(phenotypeCounts).forEach(count => {
      const ratio = `${count}:${total - count}`;
      phenotypicRatios[ratio] = (phenotypicRatios[ratio] || 0) + 1;
    });

    setResult({
      genotypes,
      phenotypes,
      grid,
      gametes: { parent1: gametes1, parent2: gametes2 },
      ratios: {
        genotypic: genotypicRatios,
        phenotypic: phenotypicRatios
      }
    });

    toast.success("Cruce calculado exitosamente");
  };

  const handleExampleSelect = (example: typeof EXAMPLE_CROSSES.mono[0]) => {
    setParentGenotypes(prev => ({
      ...prev,
      [crossType]: {
        parent1: example.parent1,
        parent2: example.parent2
      }
    }));
  };

  const handleDownload = () => {
    if (!result) return;
    
    const content = `
Resultados del Cruce Genético
===============================
Tipo: ${CROSS_TYPES.find(t => t.value === crossType)?.label}
Padre 1: ${currentParents.parent1}
Padre 2: ${currentParents.parent2}

Gametos:
Padre 1: ${result.gametes.parent1.join(", ")}
Padre 2: ${result.gametes.parent2.join(", ")}

Distribución Genotípica:
${result.genotypes.map(g => `${g.genotype}: ${g.count}/${result.grid.length * result.grid[0]?.length} (${g.percentage.toFixed(1)}%)`).join("\n")}

Distribución Fenotípica:
${result.phenotypes.map(p => `${p.phenotype}: ${p.count}/${result.grid.length * result.grid[0]?.length} (${p.percentage.toFixed(1)}%)`).join("\n")}

Cuadro de Punnett:
${result.grid.map(row => row.join("\t")).join("\n")}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cruce-genetico-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Resultados descargados");
  };

  const handleCopyResults = () => {
    if (!result) return;
    
    const ratios = result.genotypes.map(g => 
      `${g.genotype}: ${g.count}/${result.grid.length * result.grid[0]?.length}`
    ).join(", ");
    
    navigator.clipboard.writeText(ratios);
    toast.success("Ratios copiados al portapapeles");
  };

  const handleParentChange = (parent: "parent1" | "parent2", value: string) => {
    const maxLength = getAlleleCount();
    const trimmedValue = value.slice(0, maxLength).toUpperCase();
    
    setParentGenotypes(prev => ({
      ...prev,
      [crossType]: {
        ...prev[crossType],
        [parent]: trimmedValue
      }
    }));
  };

  const renderCellContent = (genotype: string) => {
    switch (displayMode) {
      case "genotype":
        return <span className="font-bold">{genotype}</span>;
      case "phenotype":
        return <span className="text-sm">{getPhenotypeFromGenotype(genotype)}</span>;
      case "simple":
        return <span className="font-mono">{getSimplePhenotype(genotype)}</span>;
      case "color":
        return <span className="font-bold">{genotype}</span>;
      case "detailed":
        return (
          <div className="text-xs">
            <div className="font-bold">{genotype}</div>
            <div className="text-muted-foreground">{getSimplePhenotype(genotype)}</div>
          </div>
        );
      default:
        return genotype;
    }
  };

  const getCellClasses = (genotype: string) => {
    const baseClasses = "border p-2 text-center transition-all duration-200";
    
    if (displayMode === "color") {
      return `${baseClasses} ${getColorForGenotype(genotype)}`;
    }
    
    return `${baseClasses} bg-background`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 rounded-2xl border-l-4 shadow-lg" style={{ borderLeftColor: "hsl(var(--biology))" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[hsl(var(--biology))]/20 shadow-md">
              <Dna className="h-7 w-7 text-[hsl(var(--biology))]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Calculadora de Cuadros Punnett</h1>
              <p className="text-muted-foreground mt-1">Predice combinaciones genéticas con análisis fenotípico y genotípico detallado</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopyResults} className="gap-2">
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
            <Button onClick={handleDownload} className="gap-2 bg-[hsl(var(--biology))] hover:bg-[hsl(var(--biology))]/90">
              <Download className="h-4 w-4" />
              Descargar
            </Button>
          </div>
        </div>

        {/* Tipo de Cruce */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">SELECCIONE TIPO DE CRUZ</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1) as ZoomLevel)}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.min(5, zoomLevel + 1) as ZoomLevel)}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs 
            value={crossType} 
            onValueChange={(v) => setCrossType(v as CrossType)}
            className="w-full"
          >
            <TabsList className="w-full rounded-xl p-1 bg-muted/50">
              {CROSS_TYPES.map((type) => (
                <TabsTrigger 
                  key={type.value}
                  value={type.value}
                  className="flex-1 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Modos de Visualización */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">TIPO DE DATOS</Label>
            <div className="flex flex-wrap gap-2">
              {DISPLAY_MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Button
                    key={mode.value}
                    variant={displayMode === mode.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDisplayMode(mode.value as DisplayMode)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {mode.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Genotipos de Padres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="p-4 border-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-lg">GENOTIPO DEL PADRE 1</Label>
                  <Badge variant="outline" className="font-mono">
                    {getAlleleCount()} alelos
                  </Badge>
                </div>
                <Input
                  value={currentParents.parent1}
                  onChange={(e) => handleParentChange("parent1", e.target.value)}
                  placeholder={`Ej: ${"A".repeat(getAlleleCount()/2)}${"a".repeat(getAlleleCount()/2)}`}
                  className="text-center text-xl font-mono rounded-xl h-12 border-2"
                  maxLength={getAlleleCount()}
                />
                
                {/* Ejemplos rápidos */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Ejemplos rápidos:</Label>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_CROSSES[crossType]?.map((example, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => handleExampleSelect(example)}
                      >
                        {example.parent1}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-lg">GENOTIPO DEL PADRE 2</Label>
                  <Badge variant="outline" className="font-mono">
                    {getAlleleCount()} alelos
                  </Badge>
                </div>
                <Input
                  value={currentParents.parent2}
                  onChange={(e) => handleParentChange("parent2", e.target.value)}
                  placeholder={`Ej: ${"A".repeat(getAlleleCount()/2)}${"a".repeat(getAlleleCount()/2)}`}
                  className="text-center text-xl font-mono rounded-xl h-12 border-2"
                  maxLength={getAlleleCount()}
                />
                
                {/* Ejemplos rápidos */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Ejemplos rápidos:</Label>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_CROSSES[crossType]?.map((example, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => handleExampleSelect(example)}
                      >
                        {example.parent2}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Botón de cálculo */}
          <Button 
            onClick={handleCalculate} 
            className="w-full mt-6 rounded-xl h-14 gap-3 text-lg shadow-md hover:shadow-lg transition-all"
            size="lg"
          >
            <Calculator className="h-5 w-5" />
            Calcular Cruce Genético
          </Button>

          {/* Info */}
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Instrucciones:</p>
              <p className="text-sm text-muted-foreground">
                • Usa mayúsculas para alelos dominantes (A, B, C) y minúsculas para recesivos (a, b, c)
                <br />
                • Para cruces dihíbridos y superiores, usa pares de alelos consecutivos (AaBb, AaBbCc, etc.)
                <br />
                • Los resultados incluyen análisis detallado de ratios genotípicos y fenotípicos
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Resultados */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Gametos */}
          <Card className="p-5 rounded-2xl shadow-md">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Dna className="h-5 w-5" />
              Gametos Generados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold">Padre 1 ({currentParents.parent1}):</Label>
                <div className="flex flex-wrap gap-2">
                  {result.gametes.parent1.map((gamete, idx) => (
                    <Badge key={idx} variant="secondary" className="font-mono text-sm">
                      {gamete}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Padre 2 ({currentParents.parent2}):</Label>
                <div className="flex flex-wrap gap-2">
                  {result.gametes.parent2.map((gamete, idx) => (
                    <Badge key={idx} variant="secondary" className="font-mono text-sm">
                      {gamete}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Cuadro de Punnett */}
          <Card className="p-5 rounded-2xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Grid3x3 className="h-5 w-5" />
                Cuadro de Punnett
              </h3>
              <Badge variant="outline">
                {result.grid.length} × {result.grid[0]?.length || 0} combinaciones
              </Badge>
            </div>
            
            <div className="overflow-x-auto">
              <div 
                className="inline-block border border-border rounded-lg"
                style={{ transform: `scale(${zoomLevel * 0.2 + 0.6})`, transformOrigin: 'top left' }}
              >
                <table className="border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-border p-3 bg-muted/50 font-semibold">
                        Gametos
                      </th>
                      {result.gametes.parent2.map((gamete, idx) => (
                        <th 
                          key={idx}
                          className="border border-border p-3 bg-muted/30 font-mono text-sm"
                        >
                          {gamete}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.grid.map((row, i) => (
                      <tr key={i}>
                        <td className="border border-border p-3 bg-muted/30 font-mono text-sm font-semibold">
                          {result.gametes.parent1[i]}
                        </td>
                        {row.map((cell, j) => (
                          <td 
                            key={j}
                            className={getCellClasses(cell)}
                            style={{ 
                              minWidth: displayMode === "phenotype" ? "120px" : "80px",
                              minHeight: "60px"
                            }}
                          >
                            {renderCellContent(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Resultados detallados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Genotipos */}
            <Card className="p-5 rounded-2xl shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Dna className="h-5 w-5" />
                  Distribución Genotípica
                </h3>
                <Badge variant="secondary">
                  Total: {result.grid.length * result.grid[0]?.length || 0}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {result.genotypes.map((g, idx) => (
                  <div key={idx} className="p-4 rounded-xl border bg-card hover:bg-accent/5 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-lg">{g.genotype}</span>
                        <Badge variant="outline">{g.phenotype}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-primary">{g.percentage.toFixed(1)}%</span>
                        <Badge variant="secondary">
                          {g.count}/{result.grid.length * result.grid[0]?.length}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${g.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Fenotipos */}
            <Card className="p-5 rounded-2xl shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Distribución Fenotípica
                </h3>
                <Badge variant="secondary">
                  {result.phenotypes.length} fenotipos distintos
                </Badge>
              </div>
              
              <div className="space-y-3">
                {result.phenotypes.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl border bg-card hover:bg-accent/5 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{p.phenotype}</p>
                        <p className="text-sm text-muted-foreground">{p.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-emerald-600">{p.percentage.toFixed(1)}%</span>
                        <Badge variant="secondary">
                          {p.count}/{result.grid.length * result.grid[0]?.length}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${p.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Ratios y estadísticas */}
          <Card className="p-5 rounded-2xl shadow-md">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Análisis Estadístico
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-primary">Ratios Genotípicos</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(result.ratios.genotypic).map(([ratio, count], idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-primary/5 border">
                      <div className="font-bold text-lg">{ratio}</div>
                      <div className="text-sm text-muted-foreground">{count} combinaciones</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-emerald-600">Ratios Fenotípicos</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(result.ratios.phenotypic).map(([ratio, count], idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-emerald-50 border">
                      <div className="font-bold text-lg">{ratio}</div>
                      <div className="text-sm text-muted-foreground">{count} combinaciones</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Estadísticas resumen */}
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <div className="text-2xl font-bold text-primary">
                    {result.genotypes.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Genotipos únicos</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <div className="text-2xl font-bold text-emerald-600">
                    {result.phenotypes.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Fenotipos únicos</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <div className="text-2xl font-bold text-amber-600">
                    {Math.max(...result.genotypes.map(g => g.percentage)).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Genotipo más común</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.max(...result.phenotypes.map(p => p.percentage)).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Fenotipo más común</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}