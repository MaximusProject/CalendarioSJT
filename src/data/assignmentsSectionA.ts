import { Assignment, UndatedAssignment } from "./assignments";

// Evaluaciones CON fecha - Sección A (2026)
export const assignmentsSectionA: Assignment[] = [
  // Soberanía
  {
    id: "a-sob-1",
    subject: "Soberanía",
    content: "Liderazgo militar",
    type: "Taller",
    points: 3,
    percentage: 15,
    date: "2026-01-26",
    color: "soberania"
  },
  {
    id: "a-sob-2",
    subject: "Soberanía",
    content: "Lectura de mapas",
    type: "Cartograma",
    points: 2,
    percentage: 10,
    date: "2026-02-09",
    color: "soberania"
  },
  {
    id: "a-sob-3",
    subject: "Soberanía",
    content: "Valores",
    type: "Exposición",
    points: 4,
    percentage: 20,
    date: "2026-03-09",
    notes: "Fecha estimada",
    color: "soberania"
  },
  {
    id: "a-sob-4",
    subject: "Soberanía",
    content: "Valores",
    type: "Prueba escrita",
    points: 4,
    percentage: 20,
    date: "2026-03-16",
    color: "soberania"
  },
  {
    id: "a-sob-5",
    subject: "Soberanía",
    content: "Personajes de la identidad nacional",
    type: "Ensayo",
    points: 4,
    percentage: 20,
    date: "2026-03-23",
    color: "soberania"
  },

  // Castellano
  {
    id: "a-cast-1",
    subject: "Castellano",
    content: "La novela moderna",
    type: "Biografía Maqueta",
    points: 4,
    percentage: 20,
    date: "2026-01-28",
    notes: "Del 28/01 al 13/02",
    color: "castellano"
  },
  {
    id: "a-cast-2",
    subject: "Castellano",
    content: "La cuentística de Horacio Quiroga",
    type: "Biografía y Prueba",
    points: 4,
    percentage: 20,
    date: "2026-02-20",
    color: "castellano"
  },
  {
    id: "a-cast-3",
    subject: "Castellano",
    content: "La novela regional",
    type: "Biografía e Infografía",
    points: 4,
    percentage: 20,
    date: "2026-03-06",
    color: "castellano"
  },
  {
    id: "a-cast-4",
    subject: "Castellano",
    content: "Análisis Literario (Orgullo y prejuicio)",
    type: "Biografía y comprobación lectora",
    points: 4,
    percentage: 20,
    date: "2026-03-20",
    color: "castellano"
  },

  // Inglés
  {
    id: "a-ing-1",
    subject: "Inglés",
    content: "Reflexive pronouns",
    type: "WorkShop",
    points: 3,
    percentage: 15,
    date: "2026-02-06",
    color: "ingles"
  },
  {
    id: "a-ing-2",
    subject: "Inglés",
    content: "Used to / Would / Get used to",
    type: "Comic",
    points: 3,
    percentage: 15,
    date: "2026-02-20",
    color: "ingles"
  },
  {
    id: "a-ing-3",
    subject: "Inglés",
    content: "Verb Tenses",
    type: "Reading comprehension",
    points: 4,
    percentage: 20,
    date: "2026-02-27",
    color: "ingles"
  },
  {
    id: "a-ing-4",
    subject: "Inglés",
    content: "Comparative/Superlative",
    type: "Test",
    points: 4,
    percentage: 20,
    date: "2026-03-13",
    color: "ingles"
  },
  {
    id: "a-ing-5",
    subject: "Inglés",
    content: "Present perfect continuous",
    type: "Test",
    points: 4,
    percentage: 20,
    date: "2026-03-27",
    color: "ingles"
  },

  // Química
  {
    id: "a-quim-1",
    subject: "Química",
    content: "Disoluciones",
    type: "Prueba",
    points: 4,
    percentage: 20,
    date: "2026-02-03",
    color: "quimica"
  },
  {
    id: "a-quim-2",
    subject: "Química",
    content: "pH y pOH (Primera parte)",
    type: "Laboratorio",
    points: 3,
    percentage: 15,
    date: "2026-02-19",
    color: "quimica"
  },
  {
    id: "a-quim-3",
    subject: "Química",
    content: "pH y pOH (Segunda parte)",
    type: "Laboratorio",
    points: 3,
    percentage: 15,
    date: "2026-02-24",
    color: "quimica"
  },
  {
    id: "a-quim-4",
    subject: "Química",
    content: "Electroquímica",
    type: "Prueba",
    points: 4,
    percentage: 20,
    date: "2026-03-11",
    notes: "11-12 de marzo",
    color: "quimica"
  },
  {
    id: "a-quim-5",
    subject: "Química",
    content: "Termoquímica",
    type: "Taller",
    points: 4,
    percentage: 20,
    date: "2026-03-25",
    notes: "25-26 de marzo",
    color: "quimica"
  },

  // Física
  {
    id: "a-fis-1",
    subject: "Física",
    content: "Lanzamiento Vertical",
    type: "Taller",
    points: 4,
    percentage: 20,
    date: "2026-01-29",
    color: "fisica"
  },
  {
    id: "a-fis-2",
    subject: "Física",
    content: "Lanzamiento Vertical",
    type: "Prueba #1",
    points: 4,
    percentage: 20,
    date: "2026-02-12",
    color: "fisica"
  },
  {
    id: "a-fis-3",
    subject: "Física",
    content: "Lanzamiento Horizontal",
    type: "Infografía",
    points: 3,
    percentage: 15,
    date: "2026-02-26",
    color: "fisica"
  },
  {
    id: "a-fis-4",
    subject: "Física",
    content: "Lanzamiento Horizontal",
    type: "Prueba #2",
    points: 4,
    percentage: 20,
    date: "2026-03-11",
    color: "fisica"
  },
  {
    id: "a-fis-5",
    subject: "Física",
    content: "Lanzamiento Inclinado",
    type: "Laboratorio",
    points: 3,
    percentage: 15,
    date: "2026-03-25",
    notes: "25-26 de marzo",
    color: "fisica"
  },

  // GHC
  {
    id: "a-ghc-1",
    subject: "GHC",
    content: "Tratado de Coche Gobierno Federal Revolución Azul y de Abril",
    type: "Prueba #1",
    points: 4,
    percentage: 20,
    date: "2026-02-23",
    color: "ghc"
  },
  {
    id: "a-ghc-3",
    subject: "GHC",
    content: "Gobierno del Liberalismo Amarillo",
    type: "Cuadro resumen",
    points: 3,
    percentage: 15,
    date: "2026-03-19",
    color: "ghc"
  },
  {
    id: "a-ghc-4",
    subject: "GHC",
    content: "Gobierno de los Andinos",
    type: "Infografía",
    points: 3,
    percentage: 15,
    date: "2026-03-16",
    notes: "16-19 de marzo",
    color: "ghc"
  },
  {
    id: "a-ghc-5",
    subject: "GHC",
    content: "Gobierno de los Andinos",
    type: "Prueba",
    points: 4,
    percentage: 20,
    date: "2026-03-26",
    color: "ghc"
  },

  // Matemáticas
  {
    id: "a-mat-1",
    subject: "Matemáticas",
    content: "Ángulos y medidas, razones trigonométricas: Suma de ángulos, resolución de triángulos",
    type: "Taller #1",
    points: 4,
    percentage: 20,
    date: "2026-02-03",
    color: "matematicas"
  },
  {
    id: "a-mat-2",
    subject: "Matemáticas",
    content: "Ángulos notables y razones de un ángulo cualquiera",
    type: "Prueba #1",
    points: 4,
    percentage: 20,
    date: "2026-02-17",
    color: "matematicas"
  },
  {
    id: "a-mat-3",
    subject: "Matemáticas",
    content: "Triángulos oblicuángulos: Teoremas de senos y cosenos",
    type: "Taller #2",
    points: 4,
    percentage: 20,
    date: "2026-03-10",
    color: "matematicas"
  },
  {
    id: "a-mat-4",
    subject: "Matemáticas",
    content: "Ángulos dobles, mitad de su ángulo, fórmula de Werner",
    type: "Prueba #2",
    points: 4,
    percentage: 20,
    date: "2026-03-31",
    color: "matematicas"
  },
  {
    id: "a-mat-5",
    subject: "Matemáticas",
    content: "Cuaderno",
    type: "Revisión",
    points: 2,
    percentage: 10,
    date: "2026-04-06",
    color: "matematicas"
  },

  // Francés
  {
    id: "a-fra-1",
    subject: "Francés",
    content: "Projet Francophonie",
    type: "Proyecto",
    points: 6,
    percentage: 30,
    date: "2026-03-16",
    notes: "16-20 de marzo",
    color: "frances"
  },
  {
    id: "a-fra-4",
    subject: "Francés",
    content: "Examen",
    type: "Examen",
    points: 4,
    percentage: 20,
    date: "2026-03-23",
    color: "frances"
  },
];

// Evaluaciones SIN fecha - Sección A
export const undatedAssignmentsSectionA: UndatedAssignment[] = [
  // Robótica (igual que sección B)
  {
    id: "a-rob-1",
    subject: "Robótica",
    content: "Introducción al Kit Nezha",
    percentage: 20,
    color: "robotica"
  },
  {
    id: "a-rob-2",
    subject: "Robótica",
    content: "Motores DC y servomotores",
    percentage: 20,
    color: "robotica"
  },
  {
    id: "a-rob-3",
    subject: "Robótica",
    content: "Sensores: Ultra Sonido y Sigue-línea",
    percentage: 20,
    color: "robotica"
  },
  {
    id: "a-rob-4",
    subject: "Robótica",
    content: "Ensamblaje y demostración",
    percentage: 20,
    color: "robotica"
  },
  {
    id: "a-rob-5",
    subject: "Robótica",
    content: "Cuaderno",
    percentage: 10,
    color: "robotica"
  },
  {
    id: "a-rob-6",
    subject: "Robótica",
    content: "Rasgos",
    percentage: 10,
    color: "robotica"
  },

  // Educación de la fé (igual que sección B)
  {
    id: "a-fe-1",
    subject: "Educación de la fé",
    content: "Registro de temas",
    percentage: 20,
    color: "fe"
  },
  {
    id: "a-fe-2",
    subject: "Educación de la fé",
    content: "Exposición",
    percentage: 20,
    color: "fe"
  },
  {
    id: "a-fe-3",
    subject: "Educación de la fé",
    content: "Video",
    percentage: 20,
    color: "fe"
  },
  {
    id: "a-fe-4",
    subject: "Educación de la fé",
    content: "Debate",
    percentage: 20,
    color: "fe"
  },
  {
    id: "a-fe-5",
    subject: "Educación de la fé",
    content: "Actividad Pastoral",
    percentage: 10,
    color: "fe"
  },
  {
    id: "a-fe-6",
    subject: "Educación de la fé",
    content: "Rasgos",
    percentage: 10,
    color: "fe"
  },

  // Biología (sin fecha para sección A)
  {
    id: "a-bio-1",
    subject: "Biología",
    content: "Base genética de la evolución de la población",
    type: "Taller",
    percentage: 10,
    color: "biology"
  },
  {
    id: "a-bio-2",
    subject: "Biología",
    content: "Evolución y características de los hominoides",
    type: "Taller",
    percentage: 10,
    color: "biology"
  },
  {
    id: "a-bio-3",
    subject: "Biología",
    content: "Base genética de la evolución de la población y evolución de los homínides",
    type: "Prueba",
    percentage: 20,
    color: "biology"
  },
  {
    id: "a-bio-4",
    subject: "Biología",
    content: "Diversidad de los seres vivos (Taxonómica)",
    type: "Taller",
    percentage: 10,
    color: "biology"
  },
  {
    id: "a-bio-5",
    subject: "Biología",
    content: "Reino monera y protista",
    type: "Exposición",
    percentage: 20,
    color: "biology"
  },

  // GHC (sin fecha)
  {
    id: "a-ghc-2",
    subject: "GHC",
    content: "Guzmancismo: Panteón nacional",
    type: "Exposición",
    percentage: 20,
    notes: "Sin fecha asignada",
    color: "ghc"
  },
  {
    id: "a-ghc-6",
    subject: "GHC",
    content: "Actividad Pastoral",
    type: "Actividad de recuperación",
    percentage: 10,
    notes: "Sin fecha asignada",
    color: "ghc"
  },

  // Soberanía (cuaderno)
  {
    id: "a-sob-6",
    subject: "Soberanía",
    content: "Cuaderno",
    percentage: 15,
    color: "soberania"
  },

  // Castellano (sin fecha)
  {
    id: "a-cast-5",
    subject: "Castellano",
    content: "Cuaderno",
    percentage: 10,
    color: "castellano"
  },
  {
    id: "a-cast-6",
    subject: "Castellano",
    content: "Rasgos",
    percentage: 10,
    color: "castellano"
  },

  // Inglés (rasgos)
  {
    id: "a-ing-6",
    subject: "Inglés",
    content: "Personal Features",
    percentage: 10,
    color: "ingles"
  },

  // Química (rasgos)
  {
    id: "a-quim-6",
    subject: "Química",
    content: "Rasgos",
    percentage: 10,
    color: "quimica"
  },

  // Física (rasgos)
  {
    id: "a-fis-6",
    subject: "Física",
    content: "Rasgos",
    percentage: 10,
    color: "fisica"
  },

  // Matemáticas (rasgos)
  {
    id: "a-mat-6",
    subject: "Matemáticas",
    content: "Rasgos",
    percentage: 10,
    color: "matematicas"
  },

  // GHC (rasgos)
  {
    id: "a-ghc-7",
    subject: "GHC",
    content: "Rasgos",
    percentage: 10,
    color: "ghc"
  },

  // Francés (incompleto)
  {
    id: "a-fra-2",
    subject: "Francés",
    content: "Atelier d'écriture",
    percentage: 10,
    notes: "Fecha pendiente",
    color: "frances"
  },
  {
    id: "a-fra-3",
    subject: "Francés",
    content: "Présentation orale",
    percentage: 10,
    notes: "Fecha pendiente",
    color: "frances"
  },
  {
    id: "a-fra-5",
    subject: "Francés",
    content: "Traits de la personnalité et cahier",
    percentage: 10,
    color: "frances"
  },
  {
    id: "a-fra-6",
    subject: "Francés",
    content: "Activités d'expression orale",
    percentage: 10,
    color: "frances"
  },
  {
    id: "a-fra-7",
    subject: "Francés",
    content: "Activités évaluées (Pastoral)",
    percentage: 10,
    color: "frances"
  },
];
