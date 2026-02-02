// Tipos para el Simulador Genético Profesional

export interface CrossResult {
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

export interface AlleleConfig {
  name: string;
  dominant: string;
  recessive: string;
  trait: string;
  dominantTrait: string;
  recessiveTrait: string;
  codominant?: boolean;
  incompletelyDominant?: boolean;
}

export interface OrganismPreset {
  id: string;
  name: string;
  icon: string;
  category: "human" | "animal" | "plant" | "microorganism";
  traits: TraitPreset[];
  description: string;
  scientificName?: string;
}

export interface TraitPreset {
  id: string;
  name: string;
  gene: string;
  dominantAllele: string;
  recessiveAllele: string;
  dominantTrait: string;
  recessiveTrait: string;
  dominanceType: "complete" | "incomplete" | "codominant" | "sex-linked";
  chromosome?: "autosomal" | "X-linked" | "Y-linked";
  description?: string;
}

export interface ParentGenotypes {
  mono: { parent1: string; parent2: string };
  di: { parent1: string; parent2: string };
  tri: { parent1: string; parent2: string };
  tetra: { parent1: string; parent2: string };
  penta: { parent1: string; parent2: string };
}

export type CrossType = "mono" | "di" | "tri" | "tetra" | "penta";
export type DisplayMode = "genotype" | "phenotype" | "color" | "simple" | "detailed";
export type ZoomLevel = 1 | 2 | 3 | 4 | 5;

export interface ExampleCross {
  parent1: string;
  parent2: string;
  label: string;
}

export interface CrossTypeConfig {
  value: CrossType;
  label: string;
  alleles: number;
  gridSize: number;
}
