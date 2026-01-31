import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dna, RefreshCw, Download, Info } from "lucide-react";

interface CrossResult {
  genotypes: { genotype: string; count: number; percentage: number }[];
  phenotypes: { phenotype: string; count: number; percentage: number }[];
  grid: string[][];
}

export function PunnettCalculator() {
  const [parent1, setParent1] = useState("Aa");
  const [parent2, setParent2] = useState("Aa");
  const [result, setResult] = useState<CrossResult | null>(null);
  const [crossType, setCrossType] = useState<"mono" | "di">("mono");
  
  // Para cruce dihíbrido
  const [parent1Di, setParent1Di] = useState("AaBb");
  const [parent2Di, setParent2Di] = useState("AaBb");

  const calculateMonohybrid = () => {
    const alleles1 = [parent1[0], parent1[1]];
    const alleles2 = [parent2[0], parent2[1]];
    
    const grid: string[][] = [];
    const genotypeCounts: Record<string, number> = {};
    
    for (let i = 0; i < 2; i++) {
      grid[i] = [];
      for (let j = 0; j < 2; j++) {
        const allele1 = alleles1[i];
        const allele2 = alleles2[j];
        // Ordenar alelos (mayúscula primero)
        const genotype = allele1.toUpperCase() === allele1 
          ? allele1 + allele2 
          : allele2 + allele1;
        grid[i][j] = genotype;
        genotypeCounts[genotype] = (genotypeCounts[genotype] || 0) + 1;
      }
    }

    const total = 4;
    const genotypes = Object.entries(genotypeCounts).map(([genotype, count]) => ({
      genotype,
      count,
      percentage: (count / total) * 100
    }));

    // Determinar fenotipos
    const phenotypeCounts: Record<string, number> = {};
    Object.entries(genotypeCounts).forEach(([genotype, count]) => {
      const isDominant = genotype[0].toUpperCase() === genotype[0];
      const phenotype = isDominant ? "Dominante" : "Recesivo";
      phenotypeCounts[phenotype] = (phenotypeCounts[phenotype] || 0) + count;
    });

    const phenotypes = Object.entries(phenotypeCounts).map(([phenotype, count]) => ({
      phenotype,
      count,
      percentage: (count / total) * 100
    }));

    setResult({ genotypes, phenotypes, grid });
  };

  const calculateDihybrid = () => {
    // Obtener gametos del padre 1
    const gametes1 = getGametes(parent1Di);
    const gametes2 = getGametes(parent2Di);
    
    const grid: string[][] = [];
    const genotypeCounts: Record<string, number> = {};
    
    for (let i = 0; i < gametes1.length; i++) {
      grid[i] = [];
      for (let j = 0; j < gametes2.length; j++) {
        const genotype = combineGametes(gametes1[i], gametes2[j]);
        grid[i][j] = genotype;
        genotypeCounts[genotype] = (genotypeCounts[genotype] || 0) + 1;
      }
    }

    const total = 16;
    const genotypes = Object.entries(genotypeCounts)
      .map(([genotype, count]) => ({
        genotype,
        count,
        percentage: (count / total) * 100
      }))
      .sort((a, b) => b.count - a.count);

    // Fenotipos basados en dominancia
    const phenotypeCounts: Record<string, number> = {};
    Object.entries(genotypeCounts).forEach(([genotype, count]) => {
      const phenotype = getPhenotype(genotype);
      phenotypeCounts[phenotype] = (phenotypeCounts[phenotype] || 0) + count;
    });

    const phenotypes = Object.entries(phenotypeCounts)
      .map(([phenotype, count]) => ({
        phenotype,
        count,
        percentage: (count / total) * 100
      }))
      .sort((a, b) => b.count - a.count);

    setResult({ genotypes, phenotypes, grid });
  };

  const getGametes = (genotype: string): string[] => {
    const alleles = [];
    for (let i = 0; i < genotype.length; i += 2) {
      alleles.push([genotype[i], genotype[i + 1]]);
    }
    
    const gametes: string[] = [];
    for (const a1 of alleles[0]) {
      for (const a2 of alleles[1]) {
        gametes.push(a1 + a2);
      }
    }
    return gametes;
  };

  const combineGametes = (g1: string, g2: string): string => {
    let result = "";
    for (let i = 0; i < g1.length; i++) {
      const a1 = g1[i];
      const a2 = g2[i];
      if (a1.toUpperCase() === a1) {
        result += a1 + a2;
      } else {
        result += a2 + a1;
      }
    }
    return result;
  };

  const getPhenotype = (genotype: string): string => {
    const parts = [];
    for (let i = 0; i < genotype.length; i += 2) {
      const isDominant = genotype[i].toUpperCase() === genotype[i];
      parts.push(isDominant ? genotype[i].toUpperCase() + "_" : genotype[i].toLowerCase() + genotype[i].toLowerCase());
    }
    return parts.join(" ");
  };

  const handleCalculate = () => {
    if (crossType === "mono") {
      calculateMonohybrid();
    } else {
      calculateDihybrid();
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 rounded-2xl border-l-4" style={{ borderLeftColor: "hsl(var(--biology))" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[hsl(var(--biology))]/15">
            <Dna className="h-6 w-6 text-[hsl(var(--biology))]" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Simulador Genético</h2>
            <p className="text-sm text-muted-foreground">Cuadros de Punnett y probabilidades</p>
          </div>
        </div>

        <Tabs value={crossType} onValueChange={(v) => setCrossType(v as "mono" | "di")}>
          <TabsList className="w-full rounded-xl mb-4">
            <TabsTrigger value="mono" className="flex-1 rounded-lg">Monohíbrido</TabsTrigger>
            <TabsTrigger value="di" className="flex-1 rounded-lg">Dihíbrido</TabsTrigger>
          </TabsList>

          <TabsContent value="mono" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Progenitor 1</Label>
                <Input
                  value={parent1}
                  onChange={(e) => setParent1(e.target.value.slice(0, 2))}
                  placeholder="Ej: Aa"
                  className="text-center text-lg font-mono rounded-xl"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Progenitor 2</Label>
                <Input
                  value={parent2}
                  onChange={(e) => setParent2(e.target.value.slice(0, 2))}
                  placeholder="Ej: Aa"
                  className="text-center text-lg font-mono rounded-xl"
                  maxLength={2}
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 p-2 bg-muted rounded-lg">
              <Info className="h-3 w-3" />
              Usa mayúscula para dominante (A) y minúscula para recesivo (a)
            </div>
          </TabsContent>

          <TabsContent value="di" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Progenitor 1</Label>
                <Input
                  value={parent1Di}
                  onChange={(e) => setParent1Di(e.target.value.slice(0, 4))}
                  placeholder="Ej: AaBb"
                  className="text-center text-lg font-mono rounded-xl"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Progenitor 2</Label>
                <Input
                  value={parent2Di}
                  onChange={(e) => setParent2Di(e.target.value.slice(0, 4))}
                  placeholder="Ej: AaBb"
                  className="text-center text-lg font-mono rounded-xl"
                  maxLength={4}
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 p-2 bg-muted rounded-lg">
              <Info className="h-3 w-3" />
              Formato: AaBb (dos pares de alelos)
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={handleCalculate} className="w-full mt-4 rounded-xl h-12 gap-2">
          <RefreshCw className="h-4 w-4" />
          Calcular Cruce
        </Button>
      </Card>

      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Cuadro de Punnett */}
          <Card className="p-4 rounded-2xl">
            <h3 className="font-semibold mb-3">Cuadro de Punnett</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {result.grid.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td 
                          key={j}
                          className="border border-border p-3 text-center font-mono text-lg"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Genotipos */}
          <Card className="p-4 rounded-2xl">
            <h3 className="font-semibold mb-3">Genotipos</h3>
            <div className="space-y-2">
              {result.genotypes.map((g, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <span className="font-mono font-bold">{g.genotype}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{g.count}/{ crossType === "mono" ? 4 : 16}</Badge>
                    <span className="text-sm font-semibold text-primary">{g.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Fenotipos */}
          <Card className="p-4 rounded-2xl">
            <h3 className="font-semibold mb-3">Fenotipos</h3>
            <div className="space-y-2">
              {result.phenotypes.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <span className="font-medium">{p.phenotype}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{p.count}/{ crossType === "mono" ? 4 : 16}</Badge>
                    <span className="text-sm font-semibold text-emerald-500">{p.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
