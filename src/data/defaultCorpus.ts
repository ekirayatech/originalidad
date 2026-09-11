import { ReferenceDocument } from '../types';

export const DEFAULT_CORPUS: ReferenceDocument[] = [
  {
    id: 'ref-col-ley23',
    title: 'Ley 23 de 1982 sobre Derechos de Autor en Colombia',
    author: 'Congreso de la República de Colombia',
    type: 'legal_statute',
    year: 1982,
    language: 'es',
    institutionOrJournal: 'Diario Oficial No. 35.939 - República de Colombia',
    content: `Los autores de obras literarias, científicas y artísticas gozarán de protección para sus obras en la forma prescrita por la presente Ley.
El derecho de autor comprende para su titular los derechos morales consagrados en el artículo 30 de esta ley y los derechos patrimoniales de reproducción, comunicación pública y transformación.
Es permitido citar a un autor transcribiendo los pasajes necesarios, siempre que éstos no sean tantos y seguidos que razonadamente puedan estimarse como una reproducción simulada y sustancial, que redunde en perjuicio del autor de la obra de donde se toman. En cada cita deberá mencionarse el nombre del autor de la obra citada y el título de dicha obra.
El derecho moral del autor es inalienable, inembargable, imprescriptible e irrenunciable. La omisión del crédito de autoría en obras derivadas o transcripciones directas constituye una infracción a los derechos morales de paternidad e integridad de la obra.`
  },
  {
    id: 'ref-unal-ia-etica',
    title: 'Inteligencia Artificial en la Educación Superior: Desafíos Pedagógicos y Éticos en Colombia',
    author: 'Dr. Fernando Restrepo & Dra. Marcela Gómez (Grupo de Investigación en Humanidades Digitales)',
    type: 'institutional_repository',
    year: 2023,
    language: 'es',
    institutionOrJournal: 'Repositorio Institucional Universidad Nacional de Colombia (UNAL)',
    content: `La incorporación acelerada de modelos de lenguaje a gran escala en los entornos universitarios latinoamericanos ha desencadenado un debate epistemológico fundamental respecto a la autenticidad de la producción académica.
El aprendizaje autorregulado y el pensamiento crítico se ven amenazados cuando la síntesis automatizada sustituye el proceso deliberativo del estudiante. Las instituciones de educación superior deben transitar desde un enfoque exclusivamente punitivo de detección de plagio hacia una cultura de integridad académica basada en el diálogo pedagógico y la alfabetización informacional crítica.
Asimismo, es imperativo reconocer que los sistemas de inteligencia artificial generativa entrenados con conjuntos de datos masivos tienden a reproducir sesgos culturales dominantes, homogeneizando la prosa académica y reduciendo la diversidad estilística propia de la investigación regional.`
  },
  {
    id: 'ref-scielo-ambiente',
    title: 'Biodiversidad y servicios ecosistémicos en la cuenca andina colombiana: Un análisis socioecológico',
    author: 'Dra. Claudia Patricia Morales & Dr. Javier E. Quintero',
    type: 'academic_journal',
    year: 2022,
    language: 'es',
    institutionOrJournal: 'Revista Iberoamericana de Biodiversidad y Conservación (SciELO)',
    content: `La región andina colombiana alberga uno de los mosaicos de biodiversidad más complejos y vulnerables del planeta, caracterizado por una alta tasa de endemismo y gradientes altitudinales pronunciados.
Las dinámicas de deforestación asociadas a la expansión de la frontera agropecuaria y la minería no regulada han fragmentado corredores biológicos vitales para especies de flora y fauna emblemáticas.
La evaluación integral de los servicios ecosistémicos hidrológicos demuestra que los páramos andinos actúan como esponjas hídricas naturales regulando el ciclo del agua que abastece al 70% de los centros urbanos del país. Por consiguiente, el diseño de políticas públicas de conservación requiere la participación activa de comunidades campesinas e indígenas locales bajo esquemas de gobernanza territorial participativa.`
  },
  {
    id: 'ref-javeriana-constitucional',
    title: 'El principio de dignidad humana y la protección de datos en la era algorítmica',
    author: 'Carlos Alberto Varela & Sofia Mendez',
    type: 'institutional_repository',
    year: 2024,
    language: 'es',
    institutionOrJournal: 'Revista Universitas Jurídica - Pontificia Universidad Javeriana',
    content: `La Ley Estatutaria 1581 de 2012 consagró en el ordenamiento jurídico colombiano el derecho fundamental al habeas data, facultando a los ciudadanos para conocer, actualizar y rectificar las informaciones recogidas sobre ellos en bancos de datos.
En el contexto de la digitalización y el procesamiento algorítmico masivo, la privacidad por diseño se erige como una garantía ineludible para prevenir el perfilamiento automatizado no consentido.
Cualquier sistema de evaluación, incluyendo herramientas de supervisión académica e integridad documental, debe resguardar la confidencialidad de las creaciones intelectuales y abstenerse de almacenar o comercializar los textos sometidos a verificación sin la autorización expresa, previa e informada de sus titulares.`
  },
  {
    id: 'ref-redalyc-neurociencias',
    title: 'Plasticidad sináptica y consolidación de la memoria en modelos de neuroaprendizaje',
    author: 'Dr. Alejandro Benítez & Dra. Valentina Ortiz',
    type: 'academic_journal',
    year: 2021,
    language: 'es',
    institutionOrJournal: 'Red de Revistas Científicas de América Latina y el Caribe (Redalyc)',
    content: `La potenciación a largo plazo constituye el mecanismo celular y molecular preponderante que subyace a los procesos de memoria declarativa y plasticidad sináptica en el hipocampo de mamíferos.
La activación secuencial de receptores glutamatérgicos NMDA y AMPA facilita el ingreso de iones de calcio postsinápticos, desencadenando cascadas de señalización mediadas por quinasas que estabilizan las conexiones dendríticas.
Los experimentos comportamentales confirman que los intervalos de consolidación del sueño de ondas lentas son indispensables para la transferencia de información desde redes transitorias hipocampales hacia representaciones corticales permanentes.`
  },
  {
    id: 'ref-openweb-educacion',
    title: 'Integridad académica y buenas prácticas de citación en el siglo XXI',
    author: 'Observatorio Iberoamericano de Innovación Educativa',
    type: 'open_web',
    year: 2023,
    language: 'es',
    institutionOrJournal: 'Portal Educativo Abierto (EducAcción)',
    content: `Citar adecuadamente no es solo una exigencia formal de las normas APA o IEEE, sino un acto de honestidad intelectual que rinde tributo a la genealogía del conocimiento humano.
El parafraseo inadecuado, consistente en sustituir superficialmente algunas palabras por sinónimos manteniendo la estructura sintáctica idéntica de la fuente primaria, clasifica formalmente como plagio mosaico.
Para evitar transgresiones éticas, el investigador debe interiorizar el argumento original, contrastarlo con su propia perspectiva crítica y atribuir inequívocamente el crédito a los autores primarios.`
  },
  {
    id: 'ref-oxford-academic-integrity',
    title: 'Academic Integrity and Artificial Intelligence in Trilingual Education',
    author: 'Prof. Elizabeth Vance & Dr. Arthur Pendelton',
    type: 'academic_journal',
    year: 2023,
    language: 'en',
    institutionOrJournal: 'Oxford Review of Comparative Education',
    content: `The accelerated integration of generative artificial intelligence across bilingual and trilingual educational frameworks demands a profound re-evaluation of institutional originality standards. Students must understand that authentic scholarship is rooted in critical inquiry, synthesis of empirical evidence, and transparent attribution of intellectual precursors.
Direct verbatim reproduction of uncredited digital passages undermines the core ethical foundations of academic inquiry. Furthermore, automated paraphrasing tools that merely shuffle lexical synonyms without transforming intellectual argumentation represent a covert form of mosaic plagiarism. Educational institutions must foster an ethics-first environment where learners critically interrogate automated outputs rather than passively accepting algorithmic summaries.`
  },
  {
    id: 'ref-nature-climate-andes',
    title: 'Biodiversity and Tropical Ecosystem Dynamics in High-Altitude Neotropical Basins',
    author: 'Dr. Helen Richardson & Dr. Julian Thorne',
    type: 'academic_journal',
    year: 2022,
    language: 'en',
    institutionOrJournal: 'Nature Ecology & Environmental Conservation',
    content: `The high-altitude Andean ecosystems represent one of the world's most critical biodiversity hotspots, characterized by endemic flora and fragile hydrological regimes. Unregulated agricultural expansion and localized deforestation have disrupted contiguous migratory corridors for endangered avian and mammalian taxa.
Paramo sponge ecosystems regulate water yields supplying critical downstream urban centers. Comprehensive ecological stewardship necessitates cooperative regional management frameworks engaging rural stakeholders and indigenous communities under participatory conservation agreements.`
  },
  {
    id: 'ref-unesco-ethique-ia',
    title: "Recommandation sur l'éthique de l'intelligence artificielle et l'intégrité académique",
    author: "Commission d'éthique de l'UNESCO (Secteur des Sciences Humaines)",
    type: 'institutional_repository',
    year: 2023,
    language: 'fr',
    institutionOrJournal: 'UNESCO Publications - Paris, France',
    content: `L'adoption rapide des modèles de langage génératifs dans les établissements scolaires et universitaires transforme profondément les processus d'apprentissage et de création textuelle. L'intégrité intellectuelle et l'honnêteté scientifique doivent demeurer les principes directeurs de toute production académique rigoureuse.
La reproduction intégrale ou parcellaire d'écrits sans attribution claire et immédiate de leurs auteurs d'origine enfreint les règles fondamentales du droit moral d'auteur. De surcroît, le recours systématique aux synthèses automatisées sans démarche critique personnelle appauvrit la pensée réflexive et uniformise l'expression stylistique des apprenants.`
  },
  {
    id: 'ref-cnrs-biodiversite',
    title: 'Préservation des écosystèmes montagnards et gouvernance participative des ressources hydriques',
    author: 'Dr. Jean-Marc Duprès & Dre. Émilie Laurent',
    type: 'academic_journal',
    year: 2022,
    language: 'fr',
    institutionOrJournal: "Revue Française d'Écologie et Sciences de l'Environnement (CNRS)",
    content: `Les zones néotropicales de haute altitude abritent une richesse biologique exceptionnelle mais particulièrement vulnérable face aux dérèglements climatiques planétaires. La fragmentation des habitats naturels due aux activités agropastorales non régulées menace directement l'équilibre des bassins versants hydrographiques.
Les landes humides d'altitude jouent un rôle déterminant dans la régulation hydrologique en assurant l'approvisionnement en eau potable de millions d'habitants. En conséquence, les politiques de conservation environnementale doivent impérativement intégrer les savoirs traditionnels locaux au sein de projets de gestion concertée.`
  }
];

export const EKIRAYA_SOURCE_COLORS = [
  '#DC2626', // Red (Source 1)
  '#2563EB', // Navy / Blue (Source 2)
  '#0D9488', // Teal (Source 3)
  '#D97706', // Amber (Source 4)
  '#7C3AED', // Purple (Source 5)
  '#059669', // Emerald (Source 6)
  '#DB2777', // Pink (Source 7)
  '#4F46E5', // Indigo (Source 8)
];

// Alias for backward compatibility
export const TURNITIN_SOURCE_COLORS = EKIRAYA_SOURCE_COLORS;
