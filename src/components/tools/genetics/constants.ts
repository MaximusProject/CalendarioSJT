import { CrossTypeConfig, ExampleCross } from "./types";
import { Dna, Eye, Grid3x3, EyeOff, BarChart3 } from "lucide-react";

export const CROSS_TYPES: CrossTypeConfig[] = [
  { value: "mono", label: "Monohíbrido", alleles: 2, gridSize: 4 },
  { value: "di", label: "Dihíbrido", alleles: 4, gridSize: 16 },
  { value: "tri", label: "Trihíbrido", alleles: 6, gridSize: 64 },
  { value: "tetra", label: "Tetrahíbrido", alleles: 8, gridSize: 256 },
  { value: "penta", label: "Pentahíbrido", alleles: 10, gridSize: 1024 },
];

export const DISPLAY_MODES = [
  { value: "genotype", label: "Genotipo", icon: Dna },
  { value: "phenotype", label: "Fenotipo", icon: Eye },
  { value: "color", label: "Color", icon: Grid3x3 },
  { value: "simple", label: "Simple", icon: EyeOff },
  { value: "detailed", label: "Detallado", icon: BarChart3 },
];

export const EXAMPLE_CROSSES: Record<string, ExampleCross[]> = {
  mono: [
    { parent1: "AA", parent2: "AA", label: "Homocigoto dominante × Homocigoto dominante" },
    { parent1: "Aa", parent2: "Aa", label: "Heterocigoto × Heterocigoto (F2)" },
    { parent1: "aa", parent2: "aa", label: "Homocigoto recesivo × Homocigoto recesivo" },
    { parent1: "AA", parent2: "aa", label: "P × P (Cruza parental pura)" },
    { parent1: "Aa", parent2: "aa", label: "Retrocruzamiento (Test cross)" },
    { parent1: "AA", parent2: "Aa", label: "Homocigoto dom. × Heterocigoto" },
  ],
  di: [
    { parent1: "AABB", parent2: "aabb", label: "Dihíbrido P × P (9:3:3:1)" },
    { parent1: "AaBb", parent2: "AaBb", label: "F1 × F1 (Clásico de Mendel)" },
    { parent1: "AaBb", parent2: "aabb", label: "Retrocruzamiento dihíbrido" },
    { parent1: "AABb", parent2: "AaBb", label: "Semi-heterocigoto" },
    { parent1: "aaBb", parent2: "Aabb", label: "Recesivo A × Recesivo B" },
  ],
  tri: [
    { parent1: "AaBbCc", parent2: "AaBbCc", label: "Triple heterocigoto (F2)" },
    { parent1: "AABBCC", parent2: "aabbcc", label: "Trihíbrido parental puro" },
    { parent1: "AaBbCc", parent2: "aabbcc", label: "Retrocruzamiento trihíbrido" },
  ],
  tetra: [
    { parent1: "AaBbCcDd", parent2: "AaBbCcDd", label: "Cuádruple heterocigoto" },
    { parent1: "AABBCCDD", parent2: "aabbccdd", label: "Tetrahíbrido parental puro" },
  ],
  penta: [
    { parent1: "AaBbCcDdEe", parent2: "AaBbCcDdEe", label: "Quíntuple heterocigoto" },
    { parent1: "AABBCCDDEE", parent2: "aabbccddee", label: "Pentahíbrido parental puro" },
  ],
};

export const DEFAULT_ALLELE_CONFIGS = [
  { name: "A", dominant: "A", recessive: "a", trait: "Color", dominantTrait: "Rojo", recessiveTrait: "Blanco" },
  { name: "B", dominant: "B", recessive: "b", trait: "Forma", dominantTrait: "Redondo", recessiveTrait: "Arrugado" },
  { name: "C", dominant: "C", recessive: "c", trait: "Tamaño", dominantTrait: "Grande", recessiveTrait: "Pequeño" },
  { name: "D", dominant: "D", recessive: "d", trait: "Textura", dominantTrait: "Liso", recessiveTrait: "Rugoso" },
  { name: "E", dominant: "E", recessive: "e", trait: "Altura", dominantTrait: "Alto", recessiveTrait: "Bajo" },
];

export const MENDELIAN_RATIOS = {
  mono: {
    "3:1": "Heterocigoto × Heterocigoto (Aa × Aa)",
    "1:1": "Heterocigoto × Homocigoto recesivo (Aa × aa)",
    "1:0": "Homocigoto dominante × cualquiera (AA × __)",
    "0:1": "Homocigoto recesivo × Homocigoto recesivo (aa × aa)",
  },
  di: {
    "9:3:3:1": "Dihíbrido clásico (AaBb × AaBb)",
    "1:1:1:1": "Retrocruzamiento dihíbrido (AaBb × aabb)",
  }
};

export const INHERITANCE_PATTERNS = [
  {
    id: "complete",
    name: "Dominancia Completa",
    description: "Un alelo enmascara completamente al otro",
    example: "Ojos cafés (B) domina sobre ojos azules (b)"
  },
  {
    id: "incomplete",
    name: "Dominancia Incompleta",
    description: "El heterocigoto muestra un fenotipo intermedio",
    example: "Flores rojas × blancas = flores rosas"
  },
  {
    id: "codominant",
    name: "Codominancia",
    description: "Ambos alelos se expresan por igual",
    example: "Grupo sanguíneo AB"
  },
  {
    id: "sex-linked",
    name: "Herencia Ligada al Sexo",
    description: "Genes localizados en cromosomas sexuales",
    example: "Daltonismo, hemofilia"
  }
];
