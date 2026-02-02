import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dna, RefreshCw, Download, Info, Grid3x3, 
  Copy, Calculator, ZoomIn, ZoomOut, Sparkles,
  ChevronDown, BookOpen, Beaker, Settings2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Importar componentes y utilidades
import { OrganismSelector } from "./genetics/OrganismSelector";
import { PunnettGrid } from "./genetics/PunnettGrid";
import { ResultsDisplay } from "./genetics/ResultsDisplay";
import { CROSS_TYPES, DISPLAY_MODES, EXAMPLE_CROSSES, DEFAULT_ALLELE_CONFIGS } from "./genetics/constants";
import { 
  CrossResult, AlleleConfig, CrossType, DisplayMode, ZoomLevel, ParentGenotypes, TraitPreset, OrganismPreset 
} from "./genetics/types";
import { 
  validateGenotype, calculateCross, generatePattern, exportResultsToText 
} from "./genetics/geneticsUtils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function PunnettCalculator() {
  const [crossType, setCrossType] = useState<CrossType>("mono");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("genotype");
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(3);
  const [showOrganismSelector, setShowOrganismSelector] = useState(false);
  const [selectedOrganism, setSelectedOrganism] = useState<OrganismPreset | null>(null);
  
  const [parentGenotypes, setParentGenotypes] = useState<ParentGenotypes>({
    mono: { parent1: "Aa", parent2: "Aa" },
    di: { parent1: "AaBb", parent2: "AaBb" },
    tri: { parent1: "AaBbCc", parent2: "AaBbCc" },
    tetra: { parent1: "AaBbCcDd", parent2: "AaBbCcDd" },
    penta: { parent1: "AaBbCcDdEe", parent2: "AaBbCcDdEe" },
  });

  const [result, setResult] = useState<CrossResult | null>(null);
  const [alleleConfigs, setAlleleConfigs] = useState<AlleleConfig[]>(DEFAULT_ALLELE_CONFIGS);

  const currentParents = parentGenotypes[crossType];
  const currentCrossType = CROSS_TYPES.find(t => t.value === crossType);

  // Auto-calcular al cambiar valores
  useEffect(() => {
    handleCalculate();
  }, [crossType, parentGenotypes, alleleConfigs]);

  const getAlleleCount = () => currentCrossType?.alleles || 2;

  const handleCalculate = () => {
    const parents = parentGenotypes[crossType];
    
    if (!validateGenotype(parents.parent1, crossType) || !validateGenotype(parents.parent2, crossType)) {
      return;
    }

    const crossResult = calculateCross(parents.parent1, parents.parent2, alleleConfigs);
    setResult(crossResult);
  };

  const handleParentChange = (parent: "parent1" | "parent2", value: string) => {
    const maxLength = getAlleleCount();
    const lettersOnly = value.replace(/[^A-Za-z]/g, '');
    const trimmedValue = lettersOnly.slice(0, maxLength);
    
    setParentGenotypes(prev => ({
      ...prev,
      [crossType]: {
        ...prev[crossType],
        [parent]: trimmedValue
      }
    }));
  };

  const handleQuickEntry = (pattern: "heterozygous" | "homozygousDominant" | "homozygousRecessive") => {
    const generatedPattern = generatePattern(pattern, getAlleleCount());
    
    setParentGenotypes(prev => ({
      ...prev,
      [crossType]: {
        parent1: generatedPattern,
        parent2: generatedPattern
      }
    }));
    
    toast.success(`Patrón ${pattern === "heterozygous" ? "heterocigoto" : pattern === "homozygousDominant" ? "homocigoto dominante" : "homocigoto recesivo"} aplicado`);
  };

  const handleExampleSelect = (example: { parent1: string; parent2: string }) => {
    setParentGenotypes(prev => ({
      ...prev,
      [crossType]: {
        parent1: example.parent1,
        parent2: example.parent2
      }
    }));
  };

  const handleOrganismTraitsSelect = (traits: TraitPreset[], organism: OrganismPreset) => {
    setSelectedOrganism(organism);
    
    // Determinar tipo de cruce según cantidad de traits
    const traitCount = traits.length;
    let newCrossType: CrossType = "mono";
    if (traitCount === 2) newCrossType = "di";
    else if (traitCount === 3) newCrossType = "tri";
    else if (traitCount === 4) newCrossType = "tetra";
    else if (traitCount >= 5) newCrossType = "penta";
    
    setCrossType(newCrossType);
    
    // Actualizar configuración de alelos
    const newConfigs: AlleleConfig[] = traits.map(trait => ({
      name: trait.dominantAllele,
      dominant: trait.dominantAllele,
      recessive: trait.recessiveAllele,
      trait: trait.name,
      dominantTrait: trait.dominantTrait,
      recessiveTrait: trait.recessiveTrait,
    }));
    
    setAlleleConfigs(newConfigs);
    
    // Generar genotipos heterocigotos por defecto
    let parent = "";
    traits.forEach(trait => {
      parent += trait.dominantAllele + trait.recessiveAllele;
    });
    
    setParentGenotypes(prev => ({
      ...prev,
      [newCrossType]: { parent1: parent, parent2: parent }
    }));
    
    setShowOrganismSelector(false);
    toast.success(`${organism.icon} ${organism.name}: ${traits.length} rasgo${traits.length > 1 ? "s" : ""} aplicado${traits.length > 1 ? "s" : ""}`);
  };

  const handleDownload = () => {
    if (!result) return;
    
    const content = exportResultsToText(result, currentParents.parent1, currentParents.parent2, currentCrossType?.label || "");
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cruce-genetico-${selectedOrganism?.id || "custom"}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Resultados descargados");
  };

  const handleCopyResults = () => {
    if (!result) return;
    
    const total = result.grid.length * result.grid[0]?.length;
    const ratios = result.genotypes.map(g => 
      `${g.genotype}: ${g.count}/${total} (${g.percentage.toFixed(1)}%)`
    ).join("\n");
    
    navigator.clipboard.writeText(ratios);
    toast.success("Resultados copiados al portapapeles");
  };

  const isValidCross = validateGenotype(currentParents.parent1, crossType) && 
                       validateGenotype(currentParents.parent2, crossType);

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <Card className="p-6 rounded-2xl border-l-4 shadow-lg bg-gradient-to-br from-card to-secondary/20" style={{ borderLeftColor: "hsl(var(--biology))" }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[hsl(var(--biology))] to-[hsl(var(--biology))]/70 shadow-lg">
              <Dna className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Simulador Genético Profesional
              </h1>
              <p className="text-muted-foreground">
                Cuadros de Punnett con organismos reales y análisis completo
              </p>
              {selectedOrganism && (
                <Badge variant="secondary" className="mt-1 gap-1">
                  <span>{selectedOrganism.icon}</span>
                  {selectedOrganism.name}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => setShowOrganismSelector(!showOrganismSelector)} 
              className="gap-2"
            >
              <Beaker className="h-4 w-4" />
              {showOrganismSelector ? "Cerrar" : "Organismos"}
            </Button>
            <Button variant="outline" onClick={handleCopyResults} className="gap-2" disabled={!result}>
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
            <Button onClick={handleDownload} className="gap-2 bg-[hsl(var(--biology))] hover:bg-[hsl(var(--biology))]/90" disabled={!result}>
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Selector de Organismos */}
        {showOrganismSelector && (
          <div className="mb-6 animate-fade-in">
            <OrganismSelector 
              onSelectTraits={handleOrganismTraitsSelect}
              selectedCount={alleleConfigs.length}
              maxTraits={getAlleleCount() / 2}
            />
          </div>
        )}

        {/* Tipo de Cruce */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              TIPO DE CRUCE
            </Label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1) as ZoomLevel)}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setZoomLevel(Math.min(5, zoomLevel + 1) as ZoomLevel)}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs 
            value={crossType} 
            onValueChange={(v) => setCrossType(v as CrossType)}
          >
            <TabsList className="w-full rounded-xl p-1 bg-muted/50 flex-wrap h-auto">
              {CROSS_TYPES.map((type) => (
                <TabsTrigger 
                  key={type.value}
                  value={type.value}
                  className="flex-1 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm min-w-[80px]"
                >
                  <span className="hidden sm:inline">{type.label}</span>
                  <span className="sm:hidden">{type.value.charAt(0).toUpperCase() + type.value.slice(1, 2)}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Entrada rápida */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between gap-2 h-auto py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-semibold">Configuración Rápida</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickEntry("heterozygous")}
                  className="gap-2"
                >
                  <Dna className="h-4 w-4" />
                  Heterocigoto
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickEntry("homozygousDominant")}
                  className="gap-2"
                >
                  <Dna className="h-4 w-4" />
                  Homocigoto Dom.
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickEntry("homozygousRecessive")}
                  className="gap-2"
                >
                  <Dna className="h-4 w-4" />
                  Homocigoto Rec.
                </Button>
              </div>
              
              {/* Ejemplos predefinidos */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Ejemplos clásicos:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_CROSSES[crossType]?.slice(0, 4).map((example, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary/20 font-mono transition-colors"
                      onClick={() => handleExampleSelect(example)}
                    >
                      {example.parent1} × {example.parent2}
                    </Badge>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Modos de Visualización */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              VISUALIZACIÓN
            </Label>
            <div className="flex flex-wrap gap-2">
              {DISPLAY_MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Button
                    key={mode.value}
                    variant={displayMode === mode.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDisplayMode(mode.value as DisplayMode)}
                    className="gap-1.5"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Genotipos de Padres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Padre 1 */}
            <Card className={cn(
              "p-4 border-2 transition-colors",
              validateGenotype(currentParents.parent1, crossType) 
                ? "border-emerald-500/30" 
                : "border-destructive/30"
            )}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-bold">PROGENITOR 1</Label>
                  <Badge variant="outline" className="font-mono text-xs">
                    {getAlleleCount()} alelos
                  </Badge>
                </div>
                <Input
                  value={currentParents.parent1}
                  onChange={(e) => handleParentChange("parent1", e.target.value)}
                  placeholder={`Ej: ${crossType === "mono" ? "Aa" : crossType === "di" ? "AaBb" : "AaBbCc"}`}
                  className="text-center text-xl font-mono rounded-xl h-14 border-2"
                  maxLength={getAlleleCount()}
                />
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      validateGenotype(currentParents.parent1, crossType) ? "bg-emerald-500" : "bg-destructive"
                    )} />
                    <span className={validateGenotype(currentParents.parent1, crossType) ? "text-emerald-600" : "text-destructive"}>
                      {validateGenotype(currentParents.parent1, crossType) ? "✓ Válido" : "✗ Inválido"}
                    </span>
                  </div>
                  <span className="text-muted-foreground font-mono text-xs">
                    {currentParents.parent1.length}/{getAlleleCount()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Padre 2 */}
            <Card className={cn(
              "p-4 border-2 transition-colors",
              validateGenotype(currentParents.parent2, crossType) 
                ? "border-emerald-500/30" 
                : "border-destructive/30"
            )}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-bold">PROGENITOR 2</Label>
                  <Badge variant="outline" className="font-mono text-xs">
                    {getAlleleCount()} alelos
                  </Badge>
                </div>
                <Input
                  value={currentParents.parent2}
                  onChange={(e) => handleParentChange("parent2", e.target.value)}
                  placeholder={`Ej: ${crossType === "mono" ? "Aa" : crossType === "di" ? "AaBb" : "AaBbCc"}`}
                  className="text-center text-xl font-mono rounded-xl h-14 border-2"
                  maxLength={getAlleleCount()}
                />
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      validateGenotype(currentParents.parent2, crossType) ? "bg-emerald-500" : "bg-destructive"
                    )} />
                    <span className={validateGenotype(currentParents.parent2, crossType) ? "text-emerald-600" : "text-destructive"}>
                      {validateGenotype(currentParents.parent2, crossType) ? "✓ Válido" : "✗ Inválido"}
                    </span>
                  </div>
                  <span className="text-muted-foreground font-mono text-xs">
                    {currentParents.parent2.length}/{getAlleleCount()}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Configuración de rasgos activos */}
          {alleleConfigs.slice(0, getAlleleCount() / 2).length > 0 && (
            <div className="p-3 bg-muted/30 rounded-xl">
              <Label className="text-xs text-muted-foreground mb-2 block">Rasgos configurados:</Label>
              <div className="flex flex-wrap gap-2">
                {alleleConfigs.slice(0, getAlleleCount() / 2).map((config, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs gap-1">
                    <span className="font-mono font-bold">{config.dominant}/{config.recessive}</span>
                    <span className="text-muted-foreground">→</span>
                    <span>{config.trait}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Botón de cálculo */}
          <Button 
            onClick={handleCalculate} 
            className="w-full mt-4 rounded-xl h-14 gap-3 text-lg shadow-md hover:shadow-lg transition-all"
            size="lg"
            disabled={!isValidCross}
          >
            <Calculator className="h-5 w-5" />
            Calcular Cruce Genético
            {currentCrossType && (
              <Badge variant="secondary" className="ml-2">
                {currentCrossType.gridSize} combinaciones
              </Badge>
            )}
          </Button>

          {/* Info */}
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl text-sm">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Instrucciones:</p>
              <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                <li>Mayúsculas = dominante (A, B, C), minúsculas = recesivo (a, b, c)</li>
                <li>Usa el selector de <strong>Organismos</strong> para aplicar rasgos biológicos reales</li>
                <li>Ejemplos válidos: <span className="font-mono">Aa, AaBb, AaBbCc</span></li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Resultados */}
      {result && isValidCross && (
        <div className="space-y-6 animate-fade-in">
          {/* Cuadro de Punnett */}
          <Card className="p-5 rounded-2xl shadow-md">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Grid3x3 className="h-5 w-5 text-primary" />
                Cuadro de Punnett
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {result.grid.length} × {result.grid[0]?.length || 0}
                </Badge>
                <Badge variant="secondary">
                  Zoom: {zoomLevel}x
                </Badge>
              </div>
            </div>
            
            <PunnettGrid 
              result={result} 
              displayMode={displayMode} 
              zoomLevel={zoomLevel}
              alleleConfigs={alleleConfigs}
            />
          </Card>

          {/* Resultados detallados */}
          <ResultsDisplay result={result} crossType={crossType} />
        </div>
      )}
    </div>
  );
}
