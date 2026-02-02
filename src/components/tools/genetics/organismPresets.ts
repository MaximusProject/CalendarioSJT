import { OrganismPreset, TraitPreset } from "./types";

// ===== PRESETS DE ORGANISMOS REALES =====

export const ORGANISM_PRESETS: OrganismPreset[] = [
  // ===== HUMANOS =====
  {
    id: "human",
    name: "Humano",
    icon: "👤",
    category: "human",
    scientificName: "Homo sapiens",
    description: "Rasgos genéticos humanos comunes estudiados en genética mendeliana",
    traits: [
      {
        id: "h_eye_brown",
        name: "Color de Ojos",
        gene: "EYCL1/OCA2",
        dominantAllele: "B",
        recessiveAllele: "b",
        dominantTrait: "Ojos Cafés",
        recessiveTrait: "Ojos Azules",
        dominanceType: "complete",
        chromosome: "autosomal",
        description: "El marrón es dominante sobre el azul"
      },
      {
        id: "h_widow_peak",
        name: "Pico de Viuda",
        gene: "WP",
        dominantAllele: "W",
        recessiveAllele: "w",
        dominantTrait: "Con Pico",
        recessiveTrait: "Línea Recta",
        dominanceType: "complete",
        chromosome: "autosomal",
        description: "El pico de viuda es dominante"
      },
      {
        id: "h_dimples",
        name: "Hoyuelos",
        gene: "DM",
        dominantAllele: "D",
        recessiveAllele: "d",
        dominantTrait: "Con Hoyuelos",
        recessiveTrait: "Sin Hoyuelos",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "h_freckles",
        name: "Pecas",
        gene: "MC1R",
        dominantAllele: "F",
        recessiveAllele: "f",
        dominantTrait: "Con Pecas",
        recessiveTrait: "Sin Pecas",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "h_earlobe",
        name: "Lóbulo de la Oreja",
        gene: "EL",
        dominantAllele: "E",
        recessiveAllele: "e",
        dominantTrait: "Lóbulo Suelto",
        recessiveTrait: "Lóbulo Pegado",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "h_tongue_roll",
        name: "Enrollar la Lengua",
        gene: "TR",
        dominantAllele: "T",
        recessiveAllele: "t",
        dominantTrait: "Puede Enrollar",
        recessiveTrait: "No Puede Enrollar",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "h_thumb",
        name: "Pulgar Hitchhiker",
        gene: "HT",
        dominantAllele: "H",
        recessiveAllele: "h",
        dominantTrait: "Pulgar Recto",
        recessiveTrait: "Pulgar Curvo (Hitchhiker)",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "h_hair_color",
        name: "Color de Cabello",
        gene: "MC1R/TYR",
        dominantAllele: "C",
        recessiveAllele: "c",
        dominantTrait: "Cabello Oscuro",
        recessiveTrait: "Cabello Claro",
        dominanceType: "incomplete",
        chromosome: "autosomal"
      },
      {
        id: "h_blood_rh",
        name: "Factor Rh",
        gene: "RHD",
        dominantAllele: "R",
        recessiveAllele: "r",
        dominantTrait: "Rh Positivo (Rh+)",
        recessiveTrait: "Rh Negativo (Rh-)",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "h_colorblind",
        name: "Daltonismo",
        gene: "OPN1LW/OPN1MW",
        dominantAllele: "X",
        recessiveAllele: "x",
        dominantTrait: "Visión Normal",
        recessiveTrait: "Daltonismo",
        dominanceType: "sex-linked",
        chromosome: "X-linked",
        description: "Herencia ligada al cromosoma X"
      },
      {
        id: "h_hemophilia",
        name: "Hemofilia",
        gene: "F8/F9",
        dominantAllele: "X",
        recessiveAllele: "x",
        dominantTrait: "Coagulación Normal",
        recessiveTrait: "Hemofilia",
        dominanceType: "sex-linked",
        chromosome: "X-linked"
      }
    ]
  },

  // ===== CONEJOS =====
  {
    id: "rabbit",
    name: "Conejo",
    icon: "🐰",
    category: "animal",
    scientificName: "Oryctolagus cuniculus",
    description: "Rasgos genéticos de conejos domésticos",
    traits: [
      {
        id: "r_coat_color",
        name: "Color del Pelaje",
        gene: "C",
        dominantAllele: "C",
        recessiveAllele: "c",
        dominantTrait: "Pigmentado (Café/Negro)",
        recessiveTrait: "Albino",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "r_agouti",
        name: "Patrón Agutí",
        gene: "A",
        dominantAllele: "A",
        recessiveAllele: "a",
        dominantTrait: "Agutí (Salvaje)",
        recessiveTrait: "Color Sólido",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "r_black_brown",
        name: "Negro vs Chocolate",
        gene: "B",
        dominantAllele: "B",
        recessiveAllele: "b",
        dominantTrait: "Negro",
        recessiveTrait: "Chocolate",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "r_dilute",
        name: "Dilución del Color",
        gene: "D",
        dominantAllele: "D",
        recessiveAllele: "d",
        dominantTrait: "Color Intenso",
        recessiveTrait: "Color Diluido",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "r_ear_length",
        name: "Longitud de Orejas",
        gene: "L",
        dominantAllele: "L",
        recessiveAllele: "l",
        dominantTrait: "Orejas Largas",
        recessiveTrait: "Orejas Cortas",
        dominanceType: "incomplete",
        chromosome: "autosomal"
      },
      {
        id: "r_fur_type",
        name: "Tipo de Pelaje",
        gene: "F",
        dominantAllele: "F",
        recessiveAllele: "f",
        dominantTrait: "Pelaje Normal",
        recessiveTrait: "Pelaje Rex (Rizado)",
        dominanceType: "complete",
        chromosome: "autosomal"
      }
    ]
  },

  // ===== RATONES =====
  {
    id: "mouse",
    name: "Ratón",
    icon: "🐭",
    category: "animal",
    scientificName: "Mus musculus",
    description: "Organismo modelo clásico en genética",
    traits: [
      {
        id: "m_agouti",
        name: "Color Agutí",
        gene: "A",
        dominantAllele: "A",
        recessiveAllele: "a",
        dominantTrait: "Agutí (Marrón Salvaje)",
        recessiveTrait: "No-Agutí (Negro)",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "m_albino",
        name: "Albinismo",
        gene: "C",
        dominantAllele: "C",
        recessiveAllele: "c",
        dominantTrait: "Pigmentado",
        recessiveTrait: "Albino",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "m_brown",
        name: "Marrón vs Negro",
        gene: "B",
        dominantAllele: "B",
        recessiveAllele: "b",
        dominantTrait: "Negro",
        recessiveTrait: "Marrón",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "m_dilute",
        name: "Dilución",
        gene: "D",
        dominantAllele: "D",
        recessiveAllele: "d",
        dominantTrait: "Color Intenso",
        recessiveTrait: "Color Diluido",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "m_obese",
        name: "Gen de Obesidad",
        gene: "ob",
        dominantAllele: "O",
        recessiveAllele: "o",
        dominantTrait: "Peso Normal",
        recessiveTrait: "Obesidad",
        dominanceType: "complete",
        chromosome: "autosomal"
      }
    ]
  },

  // ===== DROSOPHILA =====
  {
    id: "fruitfly",
    name: "Mosca de la Fruta",
    icon: "🪰",
    category: "animal",
    scientificName: "Drosophila melanogaster",
    description: "El organismo modelo más famoso en genética",
    traits: [
      {
        id: "d_eye_color",
        name: "Color de Ojos",
        gene: "w",
        dominantAllele: "W",
        recessiveAllele: "w",
        dominantTrait: "Ojos Rojos (Salvaje)",
        recessiveTrait: "Ojos Blancos",
        dominanceType: "sex-linked",
        chromosome: "X-linked",
        description: "Ligado al cromosoma X - Experimento clásico de Morgan"
      },
      {
        id: "d_body_color",
        name: "Color del Cuerpo",
        gene: "e",
        dominantAllele: "E",
        recessiveAllele: "e",
        dominantTrait: "Gris (Salvaje)",
        recessiveTrait: "Ébano (Negro)",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "d_wing",
        name: "Forma de Alas",
        gene: "vg",
        dominantAllele: "V",
        recessiveAllele: "v",
        dominantTrait: "Alas Normales",
        recessiveTrait: "Alas Vestigiales",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "d_antennae",
        name: "Antenas",
        gene: "Antp",
        dominantAllele: "A",
        recessiveAllele: "a",
        dominantTrait: "Antenas Normales",
        recessiveTrait: "Aristapedia (Patas en lugar de antenas)",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "d_curly",
        name: "Alas Rizadas",
        gene: "Cy",
        dominantAllele: "C",
        recessiveAllele: "c",
        dominantTrait: "Alas Rizadas",
        recessiveTrait: "Alas Rectas",
        dominanceType: "complete",
        chromosome: "autosomal"
      }
    ]
  },

  // ===== GUISANTES DE MENDEL =====
  {
    id: "pea",
    name: "Guisante",
    icon: "🟢",
    category: "plant",
    scientificName: "Pisum sativum",
    description: "Los experimentos originales de Gregor Mendel",
    traits: [
      {
        id: "p_seed_shape",
        name: "Forma de la Semilla",
        gene: "R",
        dominantAllele: "R",
        recessiveAllele: "r",
        dominantTrait: "Redonda",
        recessiveTrait: "Arrugada",
        dominanceType: "complete",
        chromosome: "autosomal",
        description: "Experimento clásico de Mendel"
      },
      {
        id: "p_seed_color",
        name: "Color de la Semilla",
        gene: "Y",
        dominantAllele: "Y",
        recessiveAllele: "y",
        dominantTrait: "Amarilla",
        recessiveTrait: "Verde",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "p_flower_color",
        name: "Color de la Flor",
        gene: "P",
        dominantAllele: "P",
        recessiveAllele: "p",
        dominantTrait: "Púrpura",
        recessiveTrait: "Blanca",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "p_pod_shape",
        name: "Forma de la Vaina",
        gene: "I",
        dominantAllele: "I",
        recessiveAllele: "i",
        dominantTrait: "Inflada",
        recessiveTrait: "Contraída",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "p_pod_color",
        name: "Color de la Vaina",
        gene: "G",
        dominantAllele: "G",
        recessiveAllele: "g",
        dominantTrait: "Verde",
        recessiveTrait: "Amarilla",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "p_stem",
        name: "Altura del Tallo",
        gene: "T",
        dominantAllele: "T",
        recessiveAllele: "t",
        dominantTrait: "Alto",
        recessiveTrait: "Enano",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "p_flower_pos",
        name: "Posición de la Flor",
        gene: "A",
        dominantAllele: "A",
        recessiveAllele: "a",
        dominantTrait: "Axial",
        recessiveTrait: "Terminal",
        dominanceType: "complete",
        chromosome: "autosomal"
      }
    ]
  },

  // ===== MAÍZ =====
  {
    id: "corn",
    name: "Maíz",
    icon: "🌽",
    category: "plant",
    scientificName: "Zea mays",
    description: "Importante modelo para estudiar herencia y biotecnología",
    traits: [
      {
        id: "c_kernel_color",
        name: "Color del Grano",
        gene: "C",
        dominantAllele: "C",
        recessiveAllele: "c",
        dominantTrait: "Púrpura",
        recessiveTrait: "Amarillo",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "c_kernel_texture",
        name: "Textura del Grano",
        gene: "S",
        dominantAllele: "S",
        recessiveAllele: "s",
        dominantTrait: "Liso",
        recessiveTrait: "Arrugado",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "c_plant_height",
        name: "Altura de la Planta",
        gene: "D",
        dominantAllele: "D",
        recessiveAllele: "d",
        dominantTrait: "Normal",
        recessiveTrait: "Enano",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "c_starch",
        name: "Tipo de Almidón",
        gene: "W",
        dominantAllele: "W",
        recessiveAllele: "w",
        dominantTrait: "Ceroso",
        recessiveTrait: "Normal",
        dominanceType: "complete",
        chromosome: "autosomal"
      }
    ]
  },

  // ===== FLORES BOCA DE DRAGÓN =====
  {
    id: "snapdragon",
    name: "Boca de Dragón",
    icon: "🌸",
    category: "plant",
    scientificName: "Antirrhinum majus",
    description: "Ejemplo clásico de dominancia incompleta",
    traits: [
      {
        id: "s_flower_color",
        name: "Color de la Flor",
        gene: "C",
        dominantAllele: "R",
        recessiveAllele: "W",
        dominantTrait: "Rojo (RR) / Rosa (RW)",
        recessiveTrait: "Blanco (WW)",
        dominanceType: "incomplete",
        chromosome: "autosomal",
        description: "Dominancia incompleta: RR=Rojo, RW=Rosa, WW=Blanco"
      },
      {
        id: "s_leaf_shape",
        name: "Forma de la Hoja",
        gene: "L",
        dominantAllele: "L",
        recessiveAllele: "l",
        dominantTrait: "Hojas Anchas",
        recessiveTrait: "Hojas Angostas",
        dominanceType: "complete",
        chromosome: "autosomal"
      }
    ]
  },

  // ===== GATOS =====
  {
    id: "cat",
    name: "Gato",
    icon: "🐱",
    category: "animal",
    scientificName: "Felis catus",
    description: "Genética del color y patrones en gatos",
    traits: [
      {
        id: "cat_orange",
        name: "Color Naranja",
        gene: "O",
        dominantAllele: "O",
        recessiveAllele: "o",
        dominantTrait: "Naranja",
        recessiveTrait: "No-Naranja",
        dominanceType: "sex-linked",
        chromosome: "X-linked",
        description: "Ligado al X - produce gatos calicó en hembras"
      },
      {
        id: "cat_agouti",
        name: "Patrón Tabby",
        gene: "A",
        dominantAllele: "A",
        recessiveAllele: "a",
        dominantTrait: "Tabby (Rayado)",
        recessiveTrait: "Color Sólido",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "cat_black",
        name: "Negro vs Chocolate",
        gene: "B",
        dominantAllele: "B",
        recessiveAllele: "b",
        dominantTrait: "Negro",
        recessiveTrait: "Chocolate",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "cat_dilute",
        name: "Dilución del Color",
        gene: "D",
        dominantAllele: "D",
        recessiveAllele: "d",
        dominantTrait: "Color Intenso",
        recessiveTrait: "Color Diluido (Gris/Crema)",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "cat_white",
        name: "Blanco Dominante",
        gene: "W",
        dominantAllele: "W",
        recessiveAllele: "w",
        dominantTrait: "Blanco Total",
        recessiveTrait: "Color Normal",
        dominanceType: "complete",
        chromosome: "autosomal",
        description: "W enmascara todos los otros colores"
      },
      {
        id: "cat_longhair",
        name: "Longitud del Pelo",
        gene: "L",
        dominantAllele: "L",
        recessiveAllele: "l",
        dominantTrait: "Pelo Corto",
        recessiveTrait: "Pelo Largo",
        dominanceType: "complete",
        chromosome: "autosomal"
      }
    ]
  },

  // ===== PERROS =====
  {
    id: "dog",
    name: "Perro",
    icon: "🐕",
    category: "animal",
    scientificName: "Canis lupus familiaris",
    description: "Genética del color y tipo de pelaje en perros",
    traits: [
      {
        id: "dog_black",
        name: "Pigmento Negro",
        gene: "E",
        dominantAllele: "E",
        recessiveAllele: "e",
        dominantTrait: "Pigmento Normal",
        recessiveTrait: "Amarillo/Rojo",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "dog_brown",
        name: "Negro vs Marrón",
        gene: "B",
        dominantAllele: "B",
        recessiveAllele: "b",
        dominantTrait: "Negro",
        recessiveTrait: "Marrón (Chocolate)",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "dog_agouti",
        name: "Patrón Agutí",
        gene: "A",
        dominantAllele: "A",
        recessiveAllele: "a",
        dominantTrait: "Agutí (Bandas)",
        recessiveTrait: "Color Sólido",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "dog_dilute",
        name: "Dilución",
        gene: "D",
        dominantAllele: "D",
        recessiveAllele: "d",
        dominantTrait: "Color Intenso",
        recessiveTrait: "Diluido (Azul/Isabella)",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "dog_wire",
        name: "Pelo de Alambre",
        gene: "W",
        dominantAllele: "W",
        recessiveAllele: "w",
        dominantTrait: "Pelo de Alambre",
        recessiveTrait: "Pelo Normal",
        dominanceType: "complete",
        chromosome: "autosomal"
      }
    ]
  },

  // ===== BACTERIAS =====
  {
    id: "ecoli",
    name: "E. coli",
    icon: "🦠",
    category: "microorganism",
    scientificName: "Escherichia coli",
    description: "Organismo modelo para biología molecular",
    traits: [
      {
        id: "ec_lac",
        name: "Operón Lac",
        gene: "lac",
        dominantAllele: "L",
        recessiveAllele: "l",
        dominantTrait: "Lac+ (Metaboliza Lactosa)",
        recessiveTrait: "Lac- (No Metaboliza)",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "ec_amp",
        name: "Resistencia a Ampicilina",
        gene: "amp",
        dominantAllele: "A",
        recessiveAllele: "a",
        dominantTrait: "Resistente",
        recessiveTrait: "Sensible",
        dominanceType: "complete",
        chromosome: "autosomal"
      },
      {
        id: "ec_gfp",
        name: "GFP (Proteína Fluorescente)",
        gene: "gfp",
        dominantAllele: "G",
        recessiveAllele: "g",
        dominantTrait: "Fluorescente",
        recessiveTrait: "No Fluorescente",
        dominanceType: "complete",
        chromosome: "autosomal"
      }
    ]
  }
];

export const ORGANISM_CATEGORIES = [
  { id: "all", name: "Todos", icon: "🧬" },
  { id: "human", name: "Humanos", icon: "👤" },
  { id: "animal", name: "Animales", icon: "🐾" },
  { id: "plant", name: "Plantas", icon: "🌱" },
  { id: "microorganism", name: "Microorganismos", icon: "🦠" }
];

export function getOrganismById(id: string): OrganismPreset | undefined {
  return ORGANISM_PRESETS.find(o => o.id === id);
}

export function getTraitsByOrganism(organismId: string): TraitPreset[] {
  const organism = getOrganismById(organismId);
  return organism?.traits || [];
}
