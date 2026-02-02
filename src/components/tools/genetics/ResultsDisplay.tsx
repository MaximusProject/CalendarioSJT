import { CrossResult } from "./types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dna, Eye, BarChart3, TrendingUp, Percent, Hash } from "lucide-react";
import { calculateSimplifiedRatio } from "./geneticsUtils";

interface ResultsDisplayProps {
  result: CrossResult;
  crossType: string;
}

export function ResultsDisplay({ result, crossType }: ResultsDisplayProps) {
  const total = result.grid.length * result.grid[0]?.length || 0;
  
  // Calcular ratios simplificados
  const genotypeCounts = result.genotypes.map(g => g.count);
  const phenotypeCounts = result.phenotypes.map(p => p.count);
  const genotypeRatio = calculateSimplifiedRatio(genotypeCounts);
  const phenotypeRatio = calculateSimplifiedRatio(phenotypeCounts);

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 text-center bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <Hash className="h-5 w-5 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-primary">{total}</div>
          <div className="text-xs text-muted-foreground">Combinaciones</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <Dna className="h-5 w-5 mx-auto mb-2 text-emerald-600" />
          <div className="text-2xl font-bold text-emerald-600">{result.genotypes.length}</div>
          <div className="text-xs text-muted-foreground">Genotipos únicos</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <Eye className="h-5 w-5 mx-auto mb-2 text-amber-600" />
          <div className="text-2xl font-bold text-amber-600">{result.phenotypes.length}</div>
          <div className="text-xs text-muted-foreground">Fenotipos únicos</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <TrendingUp className="h-5 w-5 mx-auto mb-2 text-purple-600" />
          <div className="text-lg font-bold text-purple-600 font-mono">{phenotypeRatio || "N/A"}</div>
          <div className="text-xs text-muted-foreground">Ratio fenotípico</div>
        </Card>
      </div>

      {/* Gametos */}
      <Card className="p-5 rounded-2xl">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Dna className="h-5 w-5 text-primary" />
          Gametos Generados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Progenitor 1</span>
              <Badge variant="outline" className="font-mono">{result.gametes.parent1.length} gametos</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.gametes.parent1.map((gamete, idx) => (
                <Badge key={idx} variant="secondary" className="font-mono text-sm px-3 py-1">
                  {gamete}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Progenitor 2</span>
              <Badge variant="outline" className="font-mono">{result.gametes.parent2.length} gametos</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.gametes.parent2.map((gamete, idx) => (
                <Badge key={idx} variant="secondary" className="font-mono text-sm px-3 py-1">
                  {gamete}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Genotipos y Fenotipos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genotipos */}
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Dna className="h-5 w-5 text-emerald-600" />
              Distribución Genotípica
            </h3>
            {genotypeRatio && (
              <Badge className="font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                {genotypeRatio}
              </Badge>
            )}
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {result.genotypes.map((g, idx) => (
              <div key={idx} className="p-3 rounded-xl border bg-card hover:bg-accent/5 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lg bg-secondary px-2 py-0.5 rounded">
                      {g.genotype}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {g.count}/{total}
                    </Badge>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      {g.percentage.toFixed(1)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{g.phenotype}</p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${g.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Fenotipos */}
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-amber-600" />
              Distribución Fenotípica
            </h3>
            {phenotypeRatio && (
              <Badge className="font-mono bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                {phenotypeRatio}
              </Badge>
            )}
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {result.phenotypes.map((p, idx) => (
              <div key={idx} className="p-3 rounded-xl border bg-card hover:bg-accent/5 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{p.phenotype}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {p.count}/{total}
                    </Badge>
                    <span className="font-bold text-amber-600 flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      {p.percentage.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Análisis estadístico avanzado */}
      <Card className="p-5 rounded-2xl">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          Análisis Mendeliano
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
            <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
              Ratio Genotípico
            </h4>
            <p className="text-2xl font-mono font-bold">{genotypeRatio || "Calculando..."}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {result.genotypes.length} genotipos distintos
            </p>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
            <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
              Ratio Fenotípico
            </h4>
            <p className="text-2xl font-mono font-bold">{phenotypeRatio || "Calculando..."}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {result.phenotypes.length} fenotipos distintos
            </p>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
            <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">
              Predicción Mendeliana
            </h4>
            <p className="text-sm">
              {crossType === "mono" && phenotypeRatio === "3:1" && "✓ Cruza F2 clásica"}
              {crossType === "mono" && phenotypeRatio === "1:1" && "✓ Retrocruzamiento (Test cross)"}
              {crossType === "di" && phenotypeRatio === "9:3:3:1" && "✓ Dihíbrido clásico de Mendel"}
              {crossType === "di" && phenotypeRatio === "1:1:1:1" && "✓ Retrocruzamiento dihíbrido"}
              {!["3:1", "1:1", "9:3:3:1", "1:1:1:1"].includes(phenotypeRatio) && "Ratio personalizado"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
