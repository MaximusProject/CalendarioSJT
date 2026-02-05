export interface Assignment {
  id: string;
  subject: string;
  content: string;
  type: string;
  technique?: string;
  points: number;
  percentage: number;
  date: string;
  notes?: string;
  color: string;
}

export interface UndatedAssignment {
  id: string;
  subject: string;
  content: string;
  type?: string;
  percentage: number;
  notes?: string;
  color: string;
}

// Evaluaciones CON fecha - para el calendario (2026)
export const assignments: Assignment[] = [
  // Química
  {
    id: "quim-1",
    subject: "Química",
    content: "Disoluciones",
    type: "Prueba",
    points: 4,
    percentage: 20,
    date: "2026-02-05", // Jueves - modificado
    color: "quimica"
  },
  {
    id: "quim-2",
    subject: "Química",
    content: "pH y pOH (Parte 1)",
    type: "Práctica de laboratorio",
    points: 3,
    percentage: 15,
    date: "2026-02-19", // Jueves - válido
    color: "quimica"
  },
  {
    id: "quim-3",
    subject: "Química",
    content: "pH y pOH (Parte 2)",
    type: "Práctica de laboratorio",
    points: 3,
    percentage: 15,
    date: "2026-02-24", // Martes - válido
    color: "quimica"
  },
  {
    id: "quim-4",
    subject: "Química",
    content: "Electroquímica",
    type: "Prueba",
    points: 4,
    percentage: 20,
    date: "2026-03-12", // Cambiado de 2026-03-11 (miércoles) a jueves
    color: "quimica"
  },
  {
    id: "quim-5",
    subject: "Química",
    content: "Termoquímica",
    type: "Taller",
    points: 4,
    percentage: 20,
    date: "2026-03-26", // Cambiado de 2026-03-25 (miércoles) a jueves
    color: "quimica"
  },

  // Física
  {
    id: "fis-1",
    subject: "Física",
    content: "Lanzamiento Vertical - Evaluación #1",
    type: "Taller",
    points: 4,
    percentage: 20,
    date: "2026-02-3", // Cambiado el martes.
    color: "fisica"
  },
  {
    id: "fis-2",
    subject: "Física",
    content: "Lanzamiento Vertical - Evaluación #2",
    type: "Prueba",
    points: 4,
    percentage: 20,
    date: "2026-02-11", // Miércoles - válido
    color: "fisica"
  },
  {
    id: "fis-3",
    subject: "Física",
    content: "Lanzamiento Horizontal - Evaluación #3",
    type: "Infografía",
    points: 3,
    percentage: 15,
    date: "2026-02-25", // Miércoles - válido
    color: "fisica"
  },
  {
    id: "fis-4",
    subject: "Física",
    content: "Lanzamiento Horizontal - Evaluación #4",
    type: "Prueba",
    points: 4,
    percentage: 20,
    date: "2026-03-10", // Martes - válido
    color: "fisica"
  },
  {
    id: "fis-5",
    subject: "Física",
    content: "Lanzamiento Inclinado - Evaluación #5",
    type: "Laboratorio",
    points: 3,
    percentage: 15,
    date: "2026-03-24", // Martes - válido
    color: "fisica"
  },

  // Biología
  {
    id: "bio-1",
    subject: "Biología",
    content: "Base Genética de población",
    type: "Taller",
    points: 2,
    percentage: 10,
    date: "2026-02-6", // Pasado para el viernes
    color: "biology"
  },
  {
    id: "bio-2",
    subject: "Biología",
    content: "Evolución y características de la evolución del hombre",
    type: "Taller",
    points: 2,
    percentage: 10,
    date: "2026-02-9", // Pasado a martes
    color: "biology"
  },
  {
    id: "bio-3",
    subject: "Biología",
    content: "2 Contenidos",
    type: "Prueba Corta",
    points: 4,
    percentage: 20,
    date: "2026-02-27", // Cambiado de 2026-02-25 (miércoles) a viernes
    color: "biology"
  },
  {
    id: "bio-4",
    subject: "Biología",
    content: "Diversidad de las especies",
    type: "Taller",
    points: 2,
    percentage: 10,
    date: "2026-03-06", // Cambiado de 2026-03-04 (miércoles) a viernes
    color: "biology"
  },
  {
    id: "bio-5",
    subject: "Biología",
    content: "Reino Marino y Protista",
    type: "Exposición",
    points: 4,
    percentage: 20,
    date: "2026-03-17", // Cambiado de 2026-03-11 (miércoles) a martes
    color: "biology"
  },

  // Soberanía
  {
    id: "sob-1",
    subject: "Soberanía",
    content: "Taller",
    type: "Taller",
    points: 3,
    percentage: 15,
    date: "2026-01-26", // Lunes - válido
    color: "soberania"
  },
  {
    id: "sob-2",
    subject: "Soberanía",
    content: "Cartograma",
    type: "Cartograma",
    points: 2,
    percentage: 10,
    date: "2026-02-09", // Lunes - válido
    color: "soberania"
  },
  {
    id: "sob-4",
    subject: "Soberanía",
    content: "Prueba Escrita",
    type: "Prueba Escrita",
    points: 4,
    percentage: 20,
    date: "2026-03-16", // Lunes - válido
    color: "soberania"
  },
  {
    id: "sob-5",
    subject: "Soberanía",
    content: "Ensayo - Personajes de la Identidad Nacional",
    type: "Ensayo",
    points: 4,
    percentage: 20,
    date: "2026-03-23", // Lunes - válido
    color: "soberania"
  },
  {
    id: "sob-6",
    subject: "Soberanía",
    content: "Cuadernos",
    type: "Revisión de cuaderno",
    points: 3,
    percentage: 15,
    date: "2026-04-06", // Lunes - válido
    color: "soberania"
  },

  // Inglés
  {
    id: "ing-1",
    subject: "Inglés",
    content: "Reflexive pronouns",
    type: "Workshop",
    points: 3,
    percentage: 15,
    date: "2026-02-06", // Viernes - válido
    color: "ingles"
  },
  {
    id: "ing-2",
    subject: "Inglés",
    content: "Used to / would / get used to",
    type: "Comic",
    points: 3,
    percentage: 15,
    date: "2026-02-20", // Viernes - válido
    color: "ingles"
  },
  {
    id: "ing-3",
    subject: "Inglés",
    content: "Verb Tenses",
    type: "Reading Comprehension",
    points: 4,
    percentage: 20,
    date: "2026-02-27", // Viernes - válido
    color: "ingles"
  },
  {
    id: "ing-4",
    subject: "Inglés",
    content: "Comparative/Superlative",
    type: "Test",
    points: 4,
    percentage: 20,
    date: "2026-03-13", // Viernes - válido
    color: "ingles"
  },
  {
    id: "ing-5",
    subject: "Inglés",
    content: "Present Perfect Continuous",
    type: "Test",
    points: 4,
    percentage: 20,
    date: "2026-03-27", // Viernes - válido
    color: "ingles"
  },

  // Matemáticas
  {
    id: "mat-1",
    subject: "Matemáticas",
    content: "Ángulos, medidas, razones trigonométricas, teorema de Pitágoras, razones de ángulos notables",
    type: "Taller #1",
    points: 4,
    percentage: 20,
    date: "2026-02-6", // Proximo viernes
    color: "matematicas"
  },
  {
    id: "mat-2",
    subject: "Matemáticas",
    content: "Razones trigonométricas de ángulos notables y de cualquier ángulo",
    type: "Prueba #1",
    points: 4,
    percentage: 20,
    date: "2026-02-11", // Miércoles - válido
    color: "matematicas"
  },
  {
    id: "mat-3",
    subject: "Matemáticas",
    content: "Triángulos oblicuos, teorema de senos y cosenos",
    type: "Taller #2",
    points: 4,
    percentage: 20,
    date: "2026-03-04", // Miércoles - válido
    color: "matematicas"
  },
  {
    id: "mat-4",
    subject: "Matemáticas",
    content: "Identidades, ángulos medios, dobles y triples, fórmulas de Werner",
    type: "Prueba #2",
    points: 4,
    percentage: 20,
    date: "2026-03-25", // Miércoles - válido
    color: "matematicas"
  },

  // GHC
  {
    id: "ghc-1",
    subject: "GHC",
    content: "Tratado de Coche, gobierno federal, revolución azul y roja de abril",
    type: "Prueba",
    points: 4,
    percentage: 20,
    date: "2026-02-05", // Jueves - cambiado
    color: "ghc"
  },
  {
    id: "ghc-2",
    subject: "GHC",
    content: "Guzmancismo",
    type: "Exposiciones",
    points: 4,
    percentage: 20,
    date: "2026-02-09", // lunes - válido
    notes: "Del lunes 2 al 12 (cambio de fecha)",
    color: "ghc"
  },
  {
    id: "ghc-3",
    subject: "GHC",
    content: "Gobierno del Liberalismo Amarillo",
    type: "Cuadro resumen",
    percentage: 15,
	date: "2026-02-19",
    color: "ghc"
  },
  {
    id: "ghc-4",
    subject: "GHC",
    content: "Gobierno de los Andinos",
    type: "Prueba",
    points: 4,
    percentage: 20,
    date: "2026-03-23", // Lunes - válido
    color: "ghc"
  },
  {
    id: "ghc-5",
    subject: "GHC",
    content: "Gobierno de los Andinos",
    type: "Infografía",
    points: 3,
    percentage: 15,
    date: "2026-03-16", // Lunes - válido
    notes: "Alternativa a la prueba",
    color: "ghc"
  },

  // Castellano
  {
    id: "cast-1",
    subject: "Castellano",
    content: "La novela moderna - biografía maqueta",
    type: "Maqueta/Biografía",
    points: 4,
    percentage: 20,
    date: "2026-01-28", // Miércoles - válido
    notes: "Del 28/01 al 13/02",
    color: "castellano"
  },
  {
    id: "cast-2",
    subject: "Castellano",
    content: "La cuentística de Horacio Quiroga",
    type: "Prueba",
    points: 4,
    percentage: 20,
    date: "2026-02-20", // Viernes - válido
    color: "castellano"
  },
  {
    id: "cast-3",
    subject: "Castellano",
    content: "La novela regional - biografía infografía",
    type: "Infografía/Biografía",
    points: 4,
    percentage: 20,
    date: "2026-03-11", // Cambiado de 2026-03-08 (domingo) a miércoles
    color: "castellano"
  },
  {
    id: "cast-4",
    subject: "Castellano",
    content: "Análisis literario - Comprensión lectora de 'Orgullo y Prejuicio'",
    type: "Comprensión lectora",
    points: 4,
    percentage: 20,
    date: "2026-03-20", // Viernes - válido
    color: "castellano"
  },
];

// Evaluaciones SIN fecha - para sección especial
export const undatedAssignments: UndatedAssignment[] = [
  // Robótica
  {
    id: "rob-1",
    subject: "Robótica",
    content: "Introducción al Kit Nezha",
    percentage: 20,
    color: "robotica"
  },
  {
    id: "rob-2",
    subject: "Robótica",
    content: "Motores DC y servomotores",
    percentage: 20,
    color: "robotica"
  },
  {
    id: "rob-3",
    subject: "Robótica",
    content: "Sensores: Ultra Sonido y Sigue-línea",
    percentage: 20,
    color: "robotica"
  },
  {
    id: "rob-4",
    subject: "Robótica",
    content: "Ensamblaje y demostración",
    percentage: 20,
    color: "robotica"
  },
  {
    id: "rob-5",
    subject: "Robótica",
    content: "Cuaderno",
    percentage: 10,
    color: "robotica"
  },
  {
    id: "rob-6",
    subject: "Robótica",
    content: "Rasgos",
    percentage: 10,
    color: "robotica"
  },

  // Educación de la fé
  {
    id: "fe-1",
    subject: "Educación de la fé",
    content: "Registro de temas",
    percentage: 20,
    color: "fe"
  },
  {
    id: "fe-2",
    subject: "Educación de la fé",
    content: "Exposición",
    percentage: 20,
    color: "fe"
  },
  {
    id: "fe-3",
    subject: "Educación de la fé",
    content: "Video",
    percentage: 20,
    color: "fe"
  },
  {
    id: "fe-4",
    subject: "Educación de la fé",
    content: "Debate",
    percentage: 20,
    color: "fe"
  },
  {
    id: "fe-5",
    subject: "Educación de la fé",
    content: "Actividad Pastoral",
    percentage: 10,
    color: "fe"
  },
  {
    id: "fe-6",
    subject: "Educación de la fé",
    content: "Rasgos",
    percentage: 10,
    color: "fe"
  },

  // Francés
  {
    id: "fra-1",
    subject: "Francés",
    content: "Projet Francophonie",
    percentage: 30,
    color: "frances"
  },
  {
    id: "fra-2",
    subject: "Francés",
    content: "Atelier d'écriture",
    percentage: 10,
    color: "frances"
  },
  {
    id: "fra-3",
    subject: "Francés",
    content: "Présentation orale",
    percentage: 10,
    color: "frances"
  },
  {
    id: "fra-4",
    subject: "Francés",
    content: "Examen (P.E)",
    percentage: 20,
    color: "frances"
  },
  {
    id: "fra-5",
    subject: "Francés",
    content: "Traits de la personnalité et cahier",
    percentage: 10,
    color: "frances"
  },
  {
    id: "fra-6",
    subject: "Francés",
    content: "Activités d'expression orale",
    percentage: 10,
    color: "frances"
  },
  {
    id: "fra-7",
    subject: "Francés",
    content: "Activités évaluées (Pastoral)",
    percentage: 10,
    color: "frances"
  },

  // Soberanía (sin fecha)
  {
    id: "sob-3",
    subject: "Soberanía",
    content: "Exposición",
    percentage: 20,
    notes: "Según el tema asignado",
    color: "soberania"
  },

  // Inglés (rasgos)
  {
    id: "ing-6",
    subject: "Inglés",
    content: "Personal Features",
    percentage: 10,
    color: "ingles"
  },

  // Matemáticas (sin fecha)
  {
    id: "mat-5",
    subject: "Matemáticas",
    content: "Revisión de cuaderno",
    percentage: 10,
    notes: "En clases",
    color: "matematicas"
  },
  {
    id: "mat-6",
    subject: "Matemáticas",
    content: "Rasgos Personales",
    percentage: 10,
    notes: "Disciplina, respeto, etc.",
    color: "matematicas"
  },

  // Castellano (sin fecha)
  {
    id: "cast-5",
    subject: "Castellano",
    content: "Aspectos formales",
    percentage: 10,
    notes: "Ortografía, caligrafía, margen, sangría, presentación y redacción - Todo el lapso",
    color: "castellano"
  },
  {
    id: "cast-6",
    subject: "Castellano",
    content: "Rasgos",
    percentage: 10,
    notes: "Comportamiento, hábitos de trabajo y estudio, responsabilidad - Todo el lapso",
    color: "castellano"
  },

  // Química (rasgos)
  {
    id: "quim-6",
    subject: "Química",
    content: "Rasgos",
    percentage: 10,
    color: "quimica"
  },

  // Física (rasgos)
  {
    id: "fis-6",
    subject: "Física",
    content: "Rasgos - Lanzamiento Inclinado",
    percentage: 10,
    notes: "Todo el lapso",
    color: "fisica"
  },
];