import { AlleleConfig, CrossType, CrossResult } from "./types";
import { CROSS_TYPES } from "./constants";

// Validar formato de genotipo
export function validateGenotype(genotype: string, type: CrossType): boolean {
  const alleleCount = CROSS_TYPES.find(t => t.value === type)?.alleles || 2;
  if (genotype.length !== alleleCount) return false;
  
  for (let i = 0; i < genotype.length; i += 2) {
    const pair = genotype.substring(i, i + 2);
    if (!/^[A-Za-z]{2}$/.test(pair)) {
      return false;
    }
  }
  return true;
}

// Normalizar genotipo (mayúscula primero)
export function normalizeGenotype(genotype: string): string {
  let normalized = "";
  for (let i = 0; i < genotype.length; i += 2) {
    const allele1 = genotype[i];
    const allele2 = genotype[i + 1];
    
    if (allele1.toLowerCase() === allele2.toLowerCase()) {
      if (allele1 === allele1.toUpperCase()) {
        normalized += allele1 + allele2;
      } else {
        normalized += allele2 + allele1;
      }
    } else {
      normalized += allele1 + allele2;
    }
  }
  return normalized;
}

// Generar gametos
export function generateGametes(genotype: string): string[] {
  const pairs = [];
  const normalizedGenotype = normalizeGenotype(genotype);
  
  for (let i = 0; i < normalizedGenotype.length; i += 2) {
    pairs.push([normalizedGenotype[i], normalizedGenotype[i + 1]]);
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
}

// Combinar gametos
export function combineGametes(g1: string, g2: string): string {
  let result = "";
  for (let i = 0; i < g1.length; i++) {
    const alleles = [g1[i], g2[i]];
    alleles.sort((a, b) => {
      if (a === a.toUpperCase() && b === b.toLowerCase()) return -1;
      if (a === a.toLowerCase() && b === b.toUpperCase()) return 1;
      return a.localeCompare(b);
    });
    result += alleles.join("");
  }
  return result;
}

// Obtener fenotipo desde genotipo
export function getPhenotypeFromGenotype(genotype: string, alleleConfigs: AlleleConfig[]): string {
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
}

// Obtener fenotipo simplificado
export function getSimplePhenotype(genotype: string): string {
  let result = "";
  for (let i = 0; i < genotype.length; i += 2) {
    const allele1 = genotype[i];
    const allele2 = genotype[i + 1];
    const isDominant = allele1 === allele1.toUpperCase() || allele2 === allele2.toUpperCase();
    result += isDominant ? "D" : "r";
  }
  return result;
}

// Obtener descripción de genotipo
export function getGenotypeDescription(genotype: string): string {
  let description = "";
  for (let i = 0; i < genotype.length; i += 2) {
    const allele1 = genotype[i];
    const allele2 = genotype[i + 1];
    const isHomoDom = allele1 === allele1.toUpperCase() && allele2 === allele2.toUpperCase();
    const isHomoRec = allele1 === allele1.toLowerCase() && allele2 === allele2.toLowerCase();
    
    if (isHomoDom) {
      description += "Homocigoto Dom.";
    } else if (isHomoRec) {
      description += "Homocigoto Rec.";
    } else {
      description += "Heterocigoto";
    }
    
    if (i < genotype.length - 2) description += ", ";
  }
  return description;
}

// Obtener color para genotipo
export function getColorForGenotype(genotype: string): string {
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
  
  if (dominantRatio === 1) return "bg-emerald-100 border-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-600";
  if (dominantRatio >= 0.75) return "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700";
  if (dominantRatio >= 0.5) return "bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700";
  if (dominantRatio >= 0.25) return "bg-orange-50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-700";
  return "bg-rose-50 border-rose-300 dark:bg-rose-900/20 dark:border-rose-700";
}

// Calcular cruce genético completo
export function calculateCross(
  genotype1: string, 
  genotype2: string, 
  alleleConfigs: AlleleConfig[]
): CrossResult {
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
      
      const phenotype = getPhenotypeFromGenotype(genotype, alleleConfigs);
      phenotypeCounts[phenotype] = (phenotypeCounts[phenotype] || 0) + 1;
    }
  }

  const total = gametes1.length * gametes2.length;
  
  const genotypes = Object.entries(genotypeCounts)
    .map(([genotype, count]) => ({
      genotype,
      count,
      percentage: (count / total) * 100,
      phenotype: getPhenotypeFromGenotype(genotype, alleleConfigs)
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

  const genotypicRatios: Record<string, number> = {};
  Object.values(genotypeCounts).forEach(count => {
    genotypicRatios[count.toString()] = (genotypicRatios[count.toString()] || 0) + 1;
  });

  const phenotypicRatios: Record<string, number> = {};
  Object.values(phenotypeCounts).forEach(count => {
    phenotypicRatios[count.toString()] = (phenotypicRatios[count.toString()] || 0) + 1;
  });

  return {
    genotypes,
    phenotypes,
    grid,
    gametes: { parent1: gametes1, parent2: gametes2 },
    ratios: {
      genotypic: genotypicRatios,
      phenotypic: phenotypicRatios
    }
  };
}

// Generar patrón de genotipo
export function generatePattern(pattern: "heterozygous" | "homozygousDominant" | "homozygousRecessive", alleleCount: number): string {
  let generatedPattern = "";
  
  if (pattern === "heterozygous") {
    for (let i = 0; i < alleleCount / 2; i++) {
      const letter = String.fromCharCode(65 + i);
      generatedPattern += letter + letter.toLowerCase();
    }
  } else if (pattern === "homozygousDominant") {
    for (let i = 0; i < alleleCount / 2; i++) {
      const letter = String.fromCharCode(65 + i);
      generatedPattern += letter + letter;
    }
  } else if (pattern === "homozygousRecessive") {
    for (let i = 0; i < alleleCount / 2; i++) {
      const letter = String.fromCharCode(97 + i);
      generatedPattern += letter + letter;
    }
  }
  
  return generatedPattern;
}

// Calcular ratio simplificado
export function calculateSimplifiedRatio(counts: number[]): string {
  if (counts.length === 0) return "";
  
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const findGCD = (arr: number[]): number => arr.reduce((a, b) => gcd(a, b));
  
  const divisor = findGCD(counts);
  const simplified = counts.map(c => c / divisor);
  
  return simplified.join(":");
}

// Exportar resultados a texto
export function exportResultsToText(
  result: CrossResult, 
  parent1: string, 
  parent2: string, 
  crossTypeLabel: string
): string {
  const total = result.grid.length * result.grid[0]?.length || 0;
  
  return `
═══════════════════════════════════════════════════════════
           RESULTADOS DEL CRUCE GENÉTICO
═══════════════════════════════════════════════════════════

📊 INFORMACIÓN DEL CRUCE
─────────────────────────────────────────────────────────
Tipo de Cruce: ${crossTypeLabel}
Progenitor 1: ${parent1}
Progenitor 2: ${parent2}
Total de Combinaciones: ${total}

🧬 GAMETOS GENERADOS
─────────────────────────────────────────────────────────
Progenitor 1 (${parent1}): ${result.gametes.parent1.join(", ")}
Progenitor 2 (${parent2}): ${result.gametes.parent2.join(", ")}

📈 DISTRIBUCIÓN GENOTÍPICA
─────────────────────────────────────────────────────────
${result.genotypes.map(g => 
  `${g.genotype.padEnd(12)} → ${g.count}/${total} (${g.percentage.toFixed(1)}%) → ${g.phenotype}`
).join("\n")}

🎨 DISTRIBUCIÓN FENOTÍPICA
─────────────────────────────────────────────────────────
${result.phenotypes.map(p => 
  `${p.phenotype.padEnd(20)} → ${p.count}/${total} (${p.percentage.toFixed(1)}%)`
).join("\n")}

📋 CUADRO DE PUNNETT
─────────────────────────────────────────────────────────
${result.grid.map(row => row.join("\t")).join("\n")}

═══════════════════════════════════════════════════════════
Generado por Simulador Genético Profesional
Fecha: ${new Date().toLocaleString("es-ES")}
═══════════════════════════════════════════════════════════
  `.trim();
}
