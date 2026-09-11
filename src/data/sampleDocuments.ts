import { SupportedLanguage } from '../types';

export interface SampleDoc {
  id: string;
  title: string;
  author: string;
  category: 'high_similarity' | 'high_ai' | 'authentic_academic';
  language: SupportedLanguage;
  languageLabel: string;
  flag: string;
  label: string;
  description: string;
  content: string;
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'sample-high-similarity',
    title: 'Análisis de la Protección Ambiental y Derechos de Autor en Colombia',
    author: 'Juan Camilo Pérez Daza (Estudiante Derecho)',
    category: 'high_similarity',
    language: 'es',
    languageLabel: 'Español',
    flag: '🇪🇸',
    label: 'Caso 1 (ES): Alta Coincidencia',
    description: 'Documento en español con fragmentos extensos de SciELO, Ley 23/1982 y UNAL sin citar.',
    content: `La región andina colombiana alberga uno de los mosaicos de biodiversidad más complejos y vulnerables del planeta, caracterizado por una alta tasa de endemismo y gradientes altitudinales pronunciados. Las dinámicas de deforestación asociadas a la expansión de la frontera agropecuaria y la minería no regulada han fragmentado corredores biológicos vitales para especies de flora y fauna emblemáticas.

En materia jurídica nacional, los autores de obras literarias, científicas y artísticas gozarán de protección para sus obras en la forma prescrita por la presente Ley. El derecho de autor comprende para su titular los derechos morales consagrados en el artículo 30 de esta ley y los derechos patrimoniales de reproducción, comunicación pública y transformación. El derecho moral del autor es inalienable, inembargable, imprescriptible e irrenunciable. La omisión del crédito de autoría en obras derivadas o transcripciones directas constituye una infracción a los derechos morales de paternidad e integridad de la obra.

Por otro lado, la incorporación acelerada de modelos de lenguaje a gran escala en los entornos universitarios latinoamericanos ha desencadenado un debate epistemológico fundamental respecto a la autenticidad de la producción académica. El aprendizaje autorregulado y el pensamiento crítico se ven amenazados cuando la síntesis automatizada sustituye el proceso deliberativo del estudiante.

En síntesis, este ensayo propone una reflexión sobre la sostenibilidad andina y el marco regulatorio del derecho moral.`
  },
  {
    id: 'sample-high-ai',
    title: 'El Papel Crucial de la Inteligencia Artificial en la Sociedad Moderna',
    author: 'Andrés Felipe Gómez',
    category: 'high_ai',
    language: 'es',
    languageLabel: 'Español',
    flag: '🇪🇸',
    label: 'Caso 2 (ES): Generado por IA',
    description: 'Texto en español generado por LLMs (ChatGPT/Claude) con cadencia uniforme y clichés conectores típicos.',
    content: `En el ámbito contemporáneo de la revolución digital, la inteligencia artificial juega un papel fundamental en la transformación de las dinámicas socioeconómicas globales. Es crucial tener en cuenta que la adopción de estas tecnologías emergentes representa un hito trascendental que no puede pasarse por alto en ninguna discusión académica rigurosa.

En primer lugar, es importante destacar que los algoritmos de aprendizaje automático han demostrado ser un testimonio palpable de la capacidad innovadora del intelecto humano. En efecto, facilitan la optimización de procesos complejos y agilizan la toma de decisiones estratégicas en diversos sectores industriales. Además, cabe resaltar que la automatización sistemática proporciona beneficios sustanciales en términos de eficiencia operativa y productividad medible.

Por otra parte, es menester subrayar que este fenómeno también plantea dilemas éticos significativos que requieren un examen meticuloso por parte de legisladores e investigadores. Resulta evidente que la proliferación de herramientas generativas demanda marcos regulatorios equilibrados que salvaguarden la integridad académica y la equidad social.

En conclusión, se puede afirmar con certeza que el impacto multifacético de la inteligencia artificial continuará moldeando el porvenir de la humanidad. En resumen, abordar estos desafíos con una visión holística y colaborativa es esencial para garantizar un desarrollo tecnológico sostenible y éticamente responsable.`
  },
  {
    id: 'sample-english-ai',
    title: 'The Pivotal Role of Artificial Intelligence in Higher Education',
    author: 'Sarah Jenkins (Grade 11 - IB Diploma)',
    category: 'high_ai',
    language: 'en',
    languageLabel: 'English',
    flag: '🇬🇧',
    label: 'Caso 4 (EN): English Academic Essay',
    description: 'Document in English combining AI rhetorical formulas with uncredited excerpts from Oxford and Nature journals.',
    content: `In the contemporary era of technological innovation, artificial intelligence plays a crucial role in reshaping pedagogical frameworks worldwide. It is important to note that the integration of large language models stands as a monumental milestone, offering both unparalleled opportunities and profound challenges for modern institutions.

First and foremost, generative models have demonstrated a remarkable capacity to synthesize vast volumes of information, facilitating personalized learning experiences and fostering critical inquiry across interdisciplinary domains. Furthermore, machine learning systems optimize institutional workflows, allowing educators to streamline evaluation metrics with unprecedented precision.

However, on the other hand, it is imperative to address the complex ethical dilemmas emerging from this technological transformation. Paramo sponge ecosystems regulate water yields supplying critical downstream urban centers. Comprehensive ecological stewardship necessitates cooperative regional management frameworks engaging rural stakeholders and indigenous communities under participatory conservation agreements. Direct verbatim reproduction of uncredited digital passages undermines the core ethical foundations of academic inquiry.

In conclusion, it is evident that artificial intelligence will continue to serve as a cornerstone of modern educational evolution. Ultimately, embracing a holistic and responsible perspective remains paramount to ensure that digital transformation promotes academic integrity and sustainable human development.`
  },
  {
    id: 'sample-french-academic',
    title: "L'Intelligence Artificielle et la Préservation des Écosystèmes Éducatifs",
    author: 'Claire Delacroix (Section Bilingue Française)',
    category: 'high_ai',
    language: 'fr',
    languageLabel: 'Français',
    flag: '🇫🇷',
    label: 'Caso 5 (FR): Essai Académique en Français',
    description: 'Texte en français avec connecteurs rhétoriques propres aux LLMs et citations de publications CNRS/UNESCO.',
    content: `À l'ère numérique contemporaine, l'intelligence artificielle joue un rôle fondamental dans la transformation des pratiques pédagogiques et scientifiques. Il convient de souligner que l'émergence des technologies génératives constitue un jalon historique majeur qui interpelle l'ensemble de la communauté éducative internationale.

En premier lieu, il est essentiel de reconnaître que ces dispositifs algorithmiques offrent un large éventail d'opportunités d'apprentissage personnalisé, permettant ainsi aux apprenants d'explorer des concepts interdisciplinaires avec une fluidité remarquable. De surcroît, les outils automatisés facilitent le traitement analytique de corpus volumineux, contribuant à optimiser les démarches de recherche documentaire.

Toutefois, d'autre part, force est de constater que cette mutation rapide suscite de sérieuses interrogations éthiques. La reproduction intégrale ou parcellaire d'écrits sans attribution claire et immédiate de leurs auteurs d'origine enfreint les règles fondamentales du droit moral d'auteur. De surcroît, les landes humides d'altitude jouent un rôle déterminant dans la régulation hydrologique en assurant l'approvisionnement en eau potable de millions d'habitants. En conséquence, les politiques de conservation environnementale doivent impérativement intégrer les savoirs traditionnels locaux.

En conclusion, il apparaît clairement que l'impact multiforme de l'intelligence artificielle exige une vigilance institutionnelle permanente. En définitive, adopter une approche holistique et concertée s'avère indispensable pour préserver l'intégrité intellectuelle et bâtir un avenir éthique et durable.`
  },
  {
    id: 'sample-authentic-academic',
    title: 'Evaluación Crítica de la Privacidad de Datos en Plataformas Educativas',
    author: 'Mariana Silva Quintero',
    category: 'authentic_academic',
    language: 'es',
    languageLabel: 'Español',
    flag: '🇪🇸',
    label: 'Caso 3 (ES): Investigación con Citas APA',
    description: 'Documento original con reflexiones personales, citas textuales debidamente entrecomilladas con formato APA y bibliografía separada.',
    content: `El vertiginoso desarrollo de los ecosistemas educativos digitales en las universidades colombianas ha situado la salvaguarda de la intimidad estudiantil en el centro de las deliberaciones iusfilosóficas actuales. Aunque las plataformas de gestión del aprendizaje facilitan el seguimiento pedagógico, con frecuencia recolectan metadatos conductuales sin una justificación proporcional clara.

Al examinar los fundamentos normativos colombianos, Varela y Mendez (2024) señalan con acierto que: "La Ley Estatutaria 1581 de 2012 consagró en el ordenamiento jurídico colombiano el derecho fundamental al habeas data, facultando a los ciudadanos para conocer, actualizar y rectificar las informaciones recogidas sobre ellos en bancos de datos." Esta premisa adquiere un cariz urgente en la educación superior, donde los borradores y ensayos son creaciones intelectuales protegidas.

Desde nuestra experiencia investigativa en el aula, observamos que los estudiantes a menudo desconocen el alcance de los términos y condiciones de las herramientas comerciales de supervisión. Ciertamente, como recuerda el Observatorio Iberoamericano (2023): "Citar adecuadamente no es solo una exigencia formal de las normas APA o IEEE, sino un acto de honestidad intelectual que rinde tributo a la genealogía del conocimiento humano."

Por consiguiente, proponemos que las instituciones educativas colombianas adopten infraestructuras analíticas de código abierto que operen estrictamente en la memoria local del usuario, evitando transferencias transfronterizas de propiedad intelectual sin consentimiento fundamentado.

Bibliografía:
- Observatorio Iberoamericano de Innovación Educativa. (2023). Integridad académica y buenas prácticas de citación en el siglo XXI. EducAcción.
- Varela, C. A., & Mendez, S. (2024). El principio de dignidad humana y la protección de datos en la era algorítmica. Universitas Jurídica, 71(2), 115-138.`
  }
];
