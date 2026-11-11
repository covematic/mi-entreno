// Imágenes referenciales: free-exercise-db (dominio público) — https://github.com/yuhonas/free-exercise-db
export const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

export const GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Bíceps', 'Tríceps', 'Core'];

// n: nombre · g: grupo · eq: equipo · img: carpeta de imagen · b: peso base (solo datos de ejemplo) · tip: consejo técnico
export const EXERCISES = [
  { id: 'press_banca', n: 'Press de banca con barra', g: 'Pecho', eq: 'Barra', img: 'Barbell_Bench_Press_-_Medium_Grip', b: 50, tip: 'Escápulas juntas y abajo, pies firmes. Baja la barra al pecho medio con control y empuja sin despegar los glúteos.' },
  { id: 'press_inclinado_barra', n: 'Press inclinado con barra', g: 'Pecho', eq: 'Barra', img: 'Barbell_Incline_Bench_Press_-_Medium_Grip', b: 40, tip: 'Banco a 30–45°. Baja la barra a la parte alta del pecho, codos a unos 45° del torso.' },
  { id: 'press_inclinado_manc', n: 'Press inclinado con mancuernas', g: 'Pecho', eq: 'Mancuernas', img: 'Incline_Dumbbell_Press', b: 18, tip: 'Baja hasta sentir estiramiento en el pecho y junta las mancuernas arriba sin chocarlas.' },
  { id: 'press_manc', n: 'Press de banca con mancuernas', g: 'Pecho', eq: 'Mancuernas', img: 'Dumbbell_Bench_Press', b: 20, tip: 'Mayor recorrido que con barra. Muñecas rectas y codos ligeramente por debajo de los hombros.' },
  { id: 'aperturas', n: 'Aperturas con mancuernas', g: 'Pecho', eq: 'Mancuernas', img: 'Dumbbell_Flyes', b: 10, tip: 'Codos algo flexionados todo el tiempo. Abre en arco, como abrazando un árbol.' },
  { id: 'cruce_poleas', n: 'Cruce de poleas', g: 'Pecho', eq: 'Polea', img: 'Cable_Crossover', b: 15, tip: 'Inclínate un poco hacia delante y junta las manos frente al pecho apretando un segundo.' },
  { id: 'flexiones', n: 'Flexiones', g: 'Pecho', eq: 'Peso corporal', img: 'Pushups', b: 0, tip: 'Cuerpo en línea recta de cabeza a talones. Baja el pecho hasta casi tocar el suelo.' },
  { id: 'fondos_pecho', n: 'Fondos en paralelas (pecho)', g: 'Pecho', eq: 'Peso corporal', img: 'Dips_-_Chest_Version', b: 0, tip: 'Inclina el torso hacia delante para dar más trabajo al pecho. Baja hasta que el hombro quede a la altura del codo.' },

  { id: 'dominadas', n: 'Dominadas', g: 'Espalda', eq: 'Peso corporal', img: 'Pullups', b: 0, tip: 'Empieza colgado con brazos estirados. Lleva el pecho hacia la barra tirando de los codos hacia abajo.' },
  { id: 'jalon', n: 'Jalón al pecho', g: 'Espalda', eq: 'Polea', img: 'Wide-Grip_Lat_Pulldown', b: 45, tip: 'Pecho arriba, tira la barra hacia la clavícula. No te balancees hacia atrás.' },
  { id: 'remo_barra', n: 'Remo con barra', g: 'Espalda', eq: 'Barra', img: 'Bent_Over_Barbell_Row', b: 45, tip: 'Espalda recta e inclinada. Lleva la barra hacia el ombligo y aprieta las escápulas.' },
  { id: 'remo_polea', n: 'Remo sentado en polea', g: 'Espalda', eq: 'Polea', img: 'Seated_Cable_Rows', b: 45, tip: 'Torso erguido. Tira hacia el abdomen sin encoger los hombros.' },
  { id: 'remo_manc', n: 'Remo con mancuerna a una mano', g: 'Espalda', eq: 'Mancuernas', img: 'One-Arm_Dumbbell_Row', b: 22, tip: 'Apoya mano y rodilla en el banco. Sube el codo pegado al cuerpo, sin rotar el torso.' },
  { id: 'peso_muerto', n: 'Peso muerto', g: 'Espalda', eq: 'Barra', img: 'Barbell_Deadlift', b: 80, tip: 'Barra pegada a las piernas, espalda neutra. Empuja el suelo con los pies y extiende cadera y rodillas a la vez.' },
  { id: 'encogimientos', n: 'Encogimientos con mancuernas', g: 'Espalda', eq: 'Mancuernas', img: 'Dumbbell_Shrug', b: 24, tip: 'Sube los hombros hacia las orejas en línea recta, sin girarlos.' },

  { id: 'sentadilla', n: 'Sentadilla con barra', g: 'Piernas', eq: 'Barra', img: 'Barbell_Squat', b: 70, tip: 'Pies al ancho de hombros, rodillas en la línea de los pies. Baja al menos hasta el paralelo con el pecho arriba.' },
  { id: 'sentadilla_goblet', n: 'Sentadilla goblet', g: 'Piernas', eq: 'Mancuernas', img: 'Goblet_Squat', b: 20, tip: 'Sujeta la mancuerna pegada al pecho. Ideal para aprender la técnica de sentadilla.' },
  { id: 'prensa', n: 'Prensa de piernas', g: 'Piernas', eq: 'Máquina', img: 'Leg_Press', b: 120, tip: 'No despegues la zona lumbar del respaldo ni bloquees las rodillas arriba.' },
  { id: 'zancadas', n: 'Zancadas con mancuernas', g: 'Piernas', eq: 'Mancuernas', img: 'Dumbbell_Lunges', b: 14, tip: 'Paso largo, torso erguido. La rodilla de atrás baja casi hasta el suelo.' },
  { id: 'extension_cuad', n: 'Extensión de cuádriceps', g: 'Piernas', eq: 'Máquina', img: 'Leg_Extensions', b: 40, tip: 'Sube controlado, aprieta arriba un segundo y baja lento.' },
  { id: 'curl_femoral', n: 'Curl femoral tumbado', g: 'Piernas', eq: 'Máquina', img: 'Lying_Leg_Curls', b: 35, tip: 'Cadera pegada al banco. Lleva los talones hacia los glúteos sin dar tirones.' },
  { id: 'pm_rumano', n: 'Peso muerto rumano', g: 'Piernas', eq: 'Barra', img: 'Romanian_Deadlift', b: 60, tip: 'Rodillas apenas flexionadas, lleva la cadera atrás y baja la barra pegada a las piernas hasta sentir los isquios.' },
  { id: 'hip_thrust', n: 'Hip thrust con barra', g: 'Piernas', eq: 'Barra', img: 'Barbell_Hip_Thrust', b: 70, tip: 'Espalda alta apoyada en el banco. Sube la cadera hasta alinear torso y muslos y aprieta glúteos.' },
  { id: 'gemelos_pie', n: 'Elevación de gemelos de pie', g: 'Piernas', eq: 'Máquina', img: 'Standing_Calf_Raises', b: 60, tip: 'Recorrido completo: estira abajo, sube todo lo que puedas y pausa arriba.' },
  { id: 'gemelos_sentado', n: 'Elevación de gemelos sentado', g: 'Piernas', eq: 'Máquina', img: 'Seated_Calf_Raise', b: 40, tip: 'Trabaja más el sóleo. Movimiento lento y con pausa arriba.' },

  { id: 'press_militar', n: 'Press militar con barra', g: 'Hombros', eq: 'Barra', img: 'Standing_Military_Press', b: 35, tip: 'Abdomen y glúteos apretados. Empuja la barra en vertical y mete la cabeza al pasar la frente.' },
  { id: 'press_hombro_manc', n: 'Press de hombros con mancuernas', g: 'Hombros', eq: 'Mancuernas', img: 'Dumbbell_Shoulder_Press', b: 16, tip: 'Codos ligeramente adelantados. Sube sin arquear la espalda.' },
  { id: 'elev_laterales', n: 'Elevaciones laterales', g: 'Hombros', eq: 'Mancuernas', img: 'Side_Lateral_Raise', b: 8, tip: 'Sube hasta la altura del hombro con los codos algo flexionados. Poco peso y sin impulso.' },
  { id: 'elev_frontales', n: 'Elevaciones frontales', g: 'Hombros', eq: 'Mancuernas', img: 'Front_Dumbbell_Raise', b: 8, tip: 'Sube al frente hasta la altura de los ojos, sin balancear el torso.' },
  { id: 'pajaros', n: 'Pájaros (deltoides posterior)', g: 'Hombros', eq: 'Mancuernas', img: 'Reverse_Flyes', b: 7, tip: 'Torso inclinado, abre los brazos hacia los lados llevando los codos atrás.' },
  { id: 'face_pull', n: 'Face pull', g: 'Hombros', eq: 'Polea', img: 'Face_Pull', b: 20, tip: 'Tira de la cuerda hacia la cara separando las manos, codos altos.' },

  { id: 'curl_barra', n: 'Curl de bíceps con barra', g: 'Bíceps', eq: 'Barra', img: 'Barbell_Curl', b: 25, tip: 'Codos pegados al cuerpo. Sube sin balancearte y baja lento.' },
  { id: 'curl_manc', n: 'Curl de bíceps con mancuernas', g: 'Bíceps', eq: 'Mancuernas', img: 'Dumbbell_Bicep_Curl', b: 10, tip: 'Gira la palma hacia arriba al subir. No muevas los codos.' },
  { id: 'curl_martillo', n: 'Curl martillo', g: 'Bíceps', eq: 'Mancuernas', img: 'Hammer_Curls', b: 12, tip: 'Palmas enfrentadas todo el recorrido. Trabaja también el antebrazo.' },
  { id: 'curl_predicador', n: 'Curl en banco predicador', g: 'Bíceps', eq: 'Barra', img: 'Preacher_Curl', b: 20, tip: 'Brazos bien apoyados. Baja casi hasta estirar y sube sin despegar los codos.' },
  { id: 'chin_up', n: 'Dominadas supinas', g: 'Bíceps', eq: 'Peso corporal', img: 'Chin-Up', b: 0, tip: 'Agarre con palmas hacia ti. Sube hasta pasar la barbilla sobre la barra.' },

  { id: 'triceps_polea', n: 'Extensión de tríceps en polea', g: 'Tríceps', eq: 'Polea', img: 'Triceps_Pushdown', b: 25, tip: 'Codos fijos a los costados. Estira del todo abajo y sube controlado.' },
  { id: 'fondos_triceps', n: 'Fondos en paralelas (tríceps)', g: 'Tríceps', eq: 'Peso corporal', img: 'Dips_-_Triceps_Version', b: 0, tip: 'Torso vertical y codos cerca del cuerpo para centrar el trabajo en el tríceps.' },
  { id: 'press_frances', n: 'Press francés con barra Z', g: 'Tríceps', eq: 'Barra', img: 'EZ-Bar_Skullcrusher', b: 20, tip: 'Baja la barra hacia la frente doblando solo los codos, que apuntan al techo.' },

  { id: 'plancha', n: 'Plancha', g: 'Core', eq: 'Peso corporal', img: 'Plank', b: 0, tip: 'Codos bajo los hombros, cuerpo recto y abdomen apretado. Anota los segundos como repeticiones.' },
  { id: 'crunch', n: 'Crunch abdominal', g: 'Core', eq: 'Peso corporal', img: 'Crunches', b: 0, tip: 'Despega solo la parte alta de la espalda. No tires del cuello.' },
  { id: 'elev_piernas', n: 'Elevación de piernas colgado', g: 'Core', eq: 'Peso corporal', img: 'Hanging_Leg_Raise', b: 0, tip: 'Sube las piernas sin balancearte y baja lento.' },
  { id: 'giro_ruso', n: 'Giro ruso', g: 'Core', eq: 'Peso corporal', img: 'Russian_Twist', b: 0, tip: 'Torso inclinado atrás con la espalda recta. Gira desde la cintura, no solo los brazos.' },
];

// Rutinas con las que empieza cada perfil (se pueden editar o borrar)
export const TEMPLATES = [
  { nombre: 'Empuje (pecho, hombros, tríceps)', items: [['press_banca', 4, '6-8'], ['press_inclinado_manc', 3, '8-10'], ['press_militar', 3, '8-10'], ['elev_laterales', 3, '12-15'], ['triceps_polea', 3, '10-12']] },
  { nombre: 'Tirón (espalda, bíceps)', items: [['peso_muerto', 3, '5'], ['jalon', 3, '8-10'], ['remo_barra', 3, '8-10'], ['face_pull', 3, '12-15'], ['curl_barra', 3, '10-12']] },
  { nombre: 'Pierna', items: [['sentadilla', 4, '6-8'], ['pm_rumano', 3, '8-10'], ['prensa', 3, '10-12'], ['curl_femoral', 3, '10-12'], ['gemelos_pie', 4, '12-15']] },
  { nombre: 'Cuerpo completo (principiante)', items: [['sentadilla_goblet', 3, '10'], ['press_manc', 3, '10'], ['remo_polea', 3, '10'], ['press_hombro_manc', 2, '10'], ['plancha', 3, '30']] },
];

export const GOALS = {
  musculo: { label: 'Ganar músculo', short: 'Músculo', prot: [1.6, 2.2] },
  grasa: { label: 'Perder grasa', short: 'Grasa', prot: [1.8, 2.4] },
  mantener: { label: 'Mantenerme / salud', short: 'Salud', prot: [1.4, 1.8] },
};

export const NUTRITION = {
  pre: [
    {
      t: '2 a 3 horas antes', d: 'Comida completa: carbohidratos de absorción lenta + proteína + poca grasa.',
      foods: [
        ['🍚', 'Arroz con pollo y ensalada', 'Energía sostenida y proteína magra.'],
        ['🍠', 'Camote o papa sancochada con pescado', 'Carbohidrato complejo fácil de digerir.'],
        ['🥣', 'Avena con leche, plátano y un puñado de frutos secos', 'Buena opción si entrenas por la mañana.'],
        ['🍝', 'Fideos con atún o carne magra', 'Carga de glucógeno para sesiones largas.'],
        ['🥗', 'Quinua con huevo y verduras', 'Proteína completa y carbohidratos.'],
      ],
    },
    {
      t: '30 a 60 minutos antes', d: 'Snack ligero y rico en carbohidratos rápidos. Evita grasas, frituras y mucha fibra.',
      foods: [
        ['🍌', 'Plátano', 'El clásico: carbohidrato rápido y potasio.'],
        ['🍞', 'Pan con mermelada o miel', 'Energía inmediata, digestión ligera.'],
        ['🥛', 'Yogur con fruta', 'Algo de proteína sin caer pesado.'],
        ['🍏', 'Fruta + un puñado de pasas o dátiles', 'Azúcares naturales para rendir.'],
        ['☕', 'Café solo (opcional)', 'La cafeína puede mejorar el rendimiento. Evítalo si entrenas de noche.'],
      ],
    },
  ],
  post: [
    {
      t: 'En las 2 horas siguientes', d: 'Proteína de calidad para reparar el músculo + carbohidratos para reponer energía.',
      foods: [
        ['🍗', 'Pollo o pavo con arroz y verduras', 'La combinación más completa para recuperar.'],
        ['🥚', 'Huevos (2–3) con pan integral y palta', 'Proteína completa y grasas saludables.'],
        ['🐟', 'Atún o pescado con papa o camote', 'Proteína magra y omega-3.'],
        ['🥤', 'Batido de proteína con plátano y avena', 'Práctico si no puedes comer pronto.'],
        ['🥛', 'Yogur griego con fruta y granola', 'Snack rápido con 15–20 g de proteína.'],
        ['🫘', 'Lentejas o menestras con arroz', 'Opción vegetal: juntas dan proteína completa.'],
      ],
    },
  ],
  goalTips: {
    musculo: [
      'Come un poco por encima de lo que gastas (unas 250–400 kcal extra al día).',
      'Reparte la proteína en 3–5 comidas a lo largo del día.',
      'No te saltes los carbohidratos después de entrenar: ayudan a recuperar y crecer.',
    ],
    grasa: [
      'Mantén un déficit moderado (300–500 kcal al día), no dietas extremas.',
      'Proteína alta para conservar el músculo mientras bajas de peso.',
      'Deja la mayor parte de tus carbohidratos para antes y después de entrenar.',
      'Llena el plato con verduras: sacian con pocas calorías.',
    ],
    mantener: [
      'Come variado y a horarios regulares; no hace falta contar cada caloría.',
      'Incluye una fuente de proteína en cada comida principal.',
      'Prioriza alimentos poco procesados la mayor parte del tiempo.',
    ],
  },
  hydration: [
    'Bebe unos 400–600 ml de agua en las 2 horas previas.',
    'Durante el entreno, pequeños sorbos cada 15–20 minutos.',
    'Si sudas mucho o entrenas más de 1 hora, añade electrolitos o una bebida isotónica.',
    'Después, repón líquidos: tu orina debe ser de color amarillo claro.',
  ],
  avoid: [
    'Comidas muy grasosas o frituras justo antes (digestión lenta y pesadez).',
    'Mucha fibra o legumbres 1 hora antes (pueden dar molestias).',
    'Entrenar fuerte en ayunas si te mareas o te quedas sin energía.',
    'Alcohol después de entrenar: frena la recuperación muscular.',
  ],
};
