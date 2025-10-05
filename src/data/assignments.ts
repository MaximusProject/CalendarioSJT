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

export const assignments: Assignment[] = [
  // Biología
  {
    id: "bio-1",
    subject: "Biología",
    content: "Orígen de la vida hipótesis del orígen",
    type: "Escala de estimación",
    technique: "Procesador de información (Mapa mixto)",
    points: 4,
    percentage: 20,
    date: "2025-10-07",
    color: "biology"
  },
  {
    id: "bio-2",
    subject: "Biología",
    content: "Proceso energético de las enzimas, funciones, tipo ATP, efecto, entre otros",
    type: "Escala de estimación",
    technique: "Producción escrita (taller)",
    points: 3,
    percentage: 15,
    date: "2025-10-28",
    color: "biology"
  },
  {
    id: "bio-3",
    subject: "Biología",
    content: "Metabolismo, respiración, celular y la fotosíntesis",
    type: "Escala de estimación",
    technique: "Producción escrita (taller)",
    points: 3,
    percentage: 15,
    date: "2025-11-14",
    color: "biology"
  },
  {
    id: "bio-4",
    subject: "Biología",
    content: "Contenidos del 1 al 2",
    type: "Prueba corta",
    technique: "Prueba corta",
    points: 4,
    percentage: 20,
    date: "2025-11-18",
    color: "biology"
  },
  {
    id: "bio-5",
    subject: "Biología",
    content: "Variabilidad Genética",
    type: "Escala de estimación",
    technique: "Producción escrita (Taller)",
    points: 3,
    percentage: 15,
    date: "2025-12-02",
    color: "biology"
  },

  // GHC
  {
    id: "ghc-1",
    subject: "GHC",
    content: "Características de Venezuela al inicio de la cuarta república",
    type: "Infografía",
    points: 4,
    percentage: 20,
    date: "2025-10-13",
    notes: "Todo se realiza en clase",
    color: "ghc"
  },
  {
    id: "ghc-2",
    subject: "GHC",
    content: "El papel de las casas comerciales",
    type: "Cuadro resumen",
    points: 2,
    percentage: 10,
    date: "2025-10-20",
    notes: "¿Cuales casas comerciales funcionaban en Venezuela para 1830? Toda esa información completa, funciones, etc. (Transcribir)",
    color: "ghc"
  },
  {
    id: "ghc-3",
    subject: "GHC",
    content: "Modelos políticos al inicio de la cuarta república",
    type: "Prueba escrita",
    points: 4,
    percentage: 20,
<<<<<<< HEAD
    date: "2025-10-30",
=======
    date: "2025-10-27",
>>>>>>> 806ce752b2ffd01196fc27e4e10850998b243736
    color: "ghc"
  },
  {
    id: "ghc-4",
    subject: "GHC",
    content: "La Guerra Federal (Facismo Monagato)",
    type: "Prueba escrita",
    points: 4,
    percentage: 20,
    date: "2025-11-10",
    color: "ghc"
  },
  {
    id: "ghc-5",
    subject: "GHC",
    content: "Guerra Federal y Guzmancismo",
    type: "Prueba escrita",
    points: 4,
    percentage: 20,
<<<<<<< HEAD
    date: "2025-11-17",
=======
    date: "2025-11-10",
>>>>>>> 806ce752b2ffd01196fc27e4e10850998b243736
    color: "ghc"
  },

  // Soberanía
  {
    id: "sob-1",
    subject: "Soberanía",
    content: "Elementos constitutivos de la nación y el estado",
    type: "Infografía",
    points: 3,
    percentage: 15,
    date: "2025-10-06",
    color: "soberania"
  },
  {
    id: "sob-2",
    subject: "Soberanía",
    content: "El poder público nacional",
    type: "Esquema",
    points: 3,
    percentage: 15,
    date: "2025-10-20",
    color: "soberania"
  },
  {
    id: "sob-3",
    subject: "Soberanía",
    content: "El poder estatal y municipal",
    type: "Análisis",
    points: 2,
    percentage: 10,
    date: "2025-11-03",
    color: "soberania"
  },
  {
    id: "sob-4",
    subject: "Soberanía",
    content: "Democracia",
    type: "Prueba escrita",
    points: 4,
    percentage: 20,
    date: "2025-11-17",
    color: "soberania"
  },
  {
    id: "sob-5",
    subject: "Soberanía",
    content: "Soberanía Nacional",
    type: "Organizador gráfico",
    points: 3,
    percentage: 15,
    date: "2025-11-24",
    color: "soberania"
  },
  {
    id: "sob-6",
    subject: "Soberanía",
    content: "Cuaderno",
    type: "Revisión de cuaderno",
    points: 3,
    percentage: 15,
    date: "2025-12-01",
    color: "soberania"
  },

  // Castellano
  {
    id: "cast-1",
    subject: "Castellano",
    content: "Épica Griega",
    type: "Cuadro",
    points: 2,
    percentage: 10,
    date: "2025-10-15",
    color: "castellano"
  },
  {
    id: "cast-2",
    subject: "Castellano",
    content: "Épica Española",
    type: "Prueba",
    points: 3,
    percentage: 15,
<<<<<<< HEAD
    date: "2025-10-25",
=======
    date: "2025-10-23",
>>>>>>> 806ce752b2ffd01196fc27e4e10850998b243736
    color: "castellano"
  },
  {
    id: "cast-3",
    subject: "Castellano",
    content: "Épica pre-historica",
    type: "Cuestionario (cuadro comparativo)",
    points: 4,
    percentage: 20,
<<<<<<< HEAD
    date: "2025-11-05",
=======
    date: "2025-11-10",
>>>>>>> 806ce752b2ffd01196fc27e4e10850998b243736
    color: "castellano"
  },
  {
    id: "cast-4",
    subject: "Castellano",
    content: "La novela caballeresca",
    type: "Mapa Mental",
    points: 2,
    percentage: 10,
<<<<<<< HEAD
    date: "2025-11-12",
=======
    date: "2025-11-17",
>>>>>>> 806ce752b2ffd01196fc27e4e10850998b243736
    color: "castellano"
  },
  {
    id: "cast-5",
    subject: "Castellano",
    content: "Análisis Literario",
    type: "Compresión lectora \"Zeus\"",
    points: 4,
    percentage: 20,
<<<<<<< HEAD
    date: "2025-11-28",
=======
    date: "2025-11-24",
>>>>>>> 806ce752b2ffd01196fc27e4e10850998b243736
    color: "castellano"
  },
  {
    id: "cast-6",
    subject: "Castellano",
    content: "Aspectos formales de la escritura",
    type: "Revisión de cuaderno",
    points: 2,
    percentage: 10,
    date: "2025-12-02",
    notes: "Todo el lapso",
    color: "castellano"
  },

  // Química
  {
    id: "quim-1",
    subject: "Química",
    content: "Nomenclatura de compuestos inorgánicos (Óxidos y hidróxidos)",
    type: "Guía de ejercicios",
    points: 4,
    percentage: 20,
    date: "2025-10-14",
    color: "quimica"
  },
  {
    id: "quim-2",
    subject: "Química",
    content: "Nomenclatura de compuestos inorgánicos (Ácidos y Sales)",
    type: "Prueba (todo lo visto anteriormente)",
    points: 4,
    percentage: 20,
    date: "2025-10-29",
    color: "quimica"
  },
  {
    id: "quim-3",
    subject: "Química",
    content: "Mol y ecuaciones químicas",
    type: "Taller",
    points: 4,
    percentage: 20,
    date: "2025-11-18",
    color: "quimica"
  },
  {
    id: "quim-4",
    subject: "Química",
    content: "Estequiometria",
    type: "Mapa Mixto",
    points: 2,
    percentage: 10,
    date: "2025-11-25",
    color: "quimica"
  },
  {
    id: "quim-5",
    subject: "Química",
    content: "Continuación...",
    type: "Prueba",
    points: 4,
    percentage: 20,
    date: "2025-12-02",
    color: "quimica"
  },

  // Matemáticas
  {
    id: "mat-1",
    subject: "Matemáticas",
    content: "Funciones reales (repaso) y función exponencial",
    type: "Taller individual",
    points: 4,
    percentage: 20,
    date: "2025-10-08",
    color: "matematicas"
  },
  {
    id: "mat-2",
    subject: "Matemáticas",
    content: "Logaritmos y funciones logarítmicas",
    type: "Prueba #1",
    points: 4,
    percentage: 20,
    date: "2025-10-24",
    color: "matematicas"
  },
  {
    id: "mat-3",
    subject: "Matemáticas",
<<<<<<< HEAD
    content: "Trigonometría",
=======
    content: "Tema 3",
>>>>>>> 806ce752b2ffd01196fc27e4e10850998b243736
    type: "Taller #2",
    points: 4,
    percentage: 20,
    date: "2025-11-12",
    color: "matematicas"
  },
  {
    id: "mat-4",
    subject: "Matemáticas",
    content: "Continuación...",
    type: "Prueba #3",
    points: 4,
    percentage: 20,
    date: "2025-11-28",
    color: "matematicas"
  },

  // Finanzas
  {
    id: "fin-1",
    subject: "Finanzas",
    content: "Mi vida soñada",
    type: "Cuadro resúmen",
    points: 4,
    percentage: 20,
    date: "2025-10-14",
    color: "finanzas"
  },
  {
    id: "fin-2",
    subject: "Finanzas",
    content: "El valor del dinero",
    type: "Cuadro resúmen",
    points: 4,
    percentage: 20,
    date: "2025-10-21",
    color: "finanzas"
  },
  {
    id: "fin-3",
    subject: "Finanzas",
    content: "Horario de trabajo y estudio",
    type: "El mundo de finanzas",
    points: 4,
    percentage: 20,
    date: "2025-11-04",
    color: "finanzas"
  },
  {
    id: "fin-4",
    subject: "Finanzas",
    content: "Trabajo, empleo y emprendimiento",
    type: "Mapa conceptual",
    points: 4,
    percentage: 20,
    date: "2025-11-21",
    color: "finanzas"
  },

  // Inglés
  {
    id: "ing-1",
    subject: "Inglés",
    content: "Simple Present - Simple Past",
    type: "Reading comprehension",
    points: 3,
    percentage: 15,
    date: "2025-10-10",
    color: "ingles"
  },
  {
    id: "ing-2",
    subject: "Inglés",
    content: "Present perfect",
    type: "Test",
    points: 4,
    percentage: 20,
    date: "2025-10-24",
    color: "ingles"
  },
  {
    id: "ing-3",
    subject: "Inglés",
    content: "Agreements and disagreements",
    type: "Listening test",
    points: 4,
    percentage: 20,
    date: "2025-11-07",
    color: "ingles"
  },
  {
    id: "ing-4",
    subject: "Inglés",
    content: "Wishes and regrets",
    type: "Dialogue",
    points: 3,
    percentage: 15,
    date: "2025-11-14",
    color: "ingles"
  },
  {
    id: "ing-5",
    subject: "Inglés",
    content: "Future Wishes",
    type: "Christmas story",
    points: 4,
    percentage: 20,
    date: "2025-11-21",
    color: "ingles"
  },
];
