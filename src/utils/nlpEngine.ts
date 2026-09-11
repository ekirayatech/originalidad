import {
  AnalysisFilters,
  AnalysisSummary,
  AISentenceAnalysis,
  FunnelColor,
  MatchedSegment,
  ReferenceDocument,
  SourceMatch,
  SupportedLanguage
} from '../types';
import { EKIRAYA_SOURCE_COLORS } from '../data/defaultCorpus';

// =========================================================================
// TRILINGUAL AI / LLM RHETORICAL FORMULAS & DISCOURSE CONNECTORS
// Spanish (ES), English (EN), French (FR)
// =========================================================================

export const AI_MARKERS_ES = [
  // Conclusiones y cierres típicos de LLMs en español
  'en conclusión, se puede afirmar',
  'en conclusión podemos decir',
  'en conclusión,',
  'en conclusión',
  'a modo de conclusión',
  'en conclusión podemos',
  'en resumen, se puede',
  'en resumen,',
  'en resumen',
  'en síntesis,',
  'en síntesis',
  'en resumidas cuentas',
  'en última instancia',
  'al fin y al cabo',
  'a fin de cuentas',
  'en definitiva,',
  'en definitiva',
  
  // Fórmulas de apertura y transición discursiva
  'en primer lugar',
  'en primera instancia',
  'en segundo lugar',
  'por otra parte',
  'por un lado',
  'por otro lado',
  'por ende,',
  'por ende',
  'por consiguiente',
  'por lo tanto,',
  'por lo tanto',
  'en este sentido',
  'en este orden de ideas',
  'en este contexto',
  'en el contexto actual',
  'en el panorama actual',
  'bajo esta perspectiva',
  'de igual manera',
  'de igual modo',
  'de la misma manera',
  'asimismo,',
  'asimismo',
  
  // Fórmulas de énfasis y cliché académico en español
  'juega un papel fundamental',
  'desempeña un papel fundamental',
  'juega un papel crucial',
  'desempeña un papel crucial',
  'juega un rol fundamental',
  'juega un rol crucial',
  'desempeña un rol crucial',
  'es importante destacar que',
  'es fundamental destacar que',
  'es crucial tener en cuenta',
  'es menester subrayar que',
  'es menester destacar',
  'es imperativo reconocer',
  'es imperativo destacar',
  'cabe resaltar que',
  'cabe destacar que',
  'cabe señalar que',
  'cabe mencionar que',
  'vale la pena destacar',
  'vale la pena mencionar',
  'vale la pena señalar',
  'resulta evidente que',
  'resulta imperioso',
  'resulta indispensable',
  'resulta fundamental',
  'es de vital importancia',
  'es de suma importancia',
  'no cabe duda de que',
  'se erige como',
  'se posiciona como',
  'un testimonio palpable',
  'un testimonio de',
  'un hito trascendental',
  'un pilar fundamental',
  'un impacto significativo',
  'un impacto multifacético',
  'un impacto transformador',
  'visión holística',
  'enfoque holístico',
  'de manera integral',
  'de forma integral',
  'un amplio abanico',
  'un sinnúmero de',
  'un tapiz de',
  'a lo largo de la historia',
  'a través de los años',
  'a medida que avanzamos',
  'en la era digital',
  'en un mundo cada vez más',
  'hoy en día,',
  'en la actualidad,',
  'a nivel global',
  'en constante evolución',
  'desafíos y oportunidades',
  'luces y sombras',
  'sentar las bases',
  'abrir la puerta a',
  'un catalizador de',
  'un catalizador para',
  'en consonancia con',
  'en aras de'
];

export const AI_MARKERS_EN = [
  // English Conclusions & Closings
  'in conclusion, it can be stated',
  'in conclusion, it is evident',
  'in conclusion,',
  'in conclusion',
  'to sum up,',
  'to sum up',
  'in summary,',
  'in summary',
  'to summarize,',
  'in the final analysis',
  'all in all,',
  'ultimately,',
  'ultimately',
  
  // English Discourse Openings & Transitions
  'first and foremost',
  'firstly,',
  'secondly,',
  'on the one hand',
  'on the other hand',
  'furthermore,',
  'furthermore',
  'moreover,',
  'moreover',
  'consequently,',
  'consequently',
  'in this regard',
  'in this context',
  'from this perspective',
  'in light of this',
  'as such,',
  'in today\'s world',
  'in today\'s rapidly evolving',
  'in an increasingly interconnected',
  'in an increasingly',
  'throughout history',
  'in the digital age',
  
  // English Rhetorical Clichés & Emphasis
  'delve into',
  'delving into',
  'testament to',
  'serves as a testament',
  'stands as a testament',
  'crucial role',
  'plays a crucial role',
  'plays a pivotal role',
  'plays a fundamental role',
  'plays a key role',
  'it is important to note',
  'it is worth noting',
  'it is crucial to recognize',
  'it is imperative to',
  'it is evident that',
  'it becomes apparent that',
  'ever-evolving',
  'multifaceted nature',
  'multifaceted impact',
  'multifaceted',
  'paramount importance',
  'tapestry of',
  'rich tapestry',
  'foster a sense',
  'fostering a culture',
  'seamlessly integrate',
  'underscores the need',
  'monumental milestone',
  'cornerstone of',
  'a wide array of',
  'a myriad of',
  'holistic approach',
  'holistic vision',
  'challenges and opportunities',
  'pave the way for',
  'catalyst for change',
  'catalyst for'
];

export const AI_MARKERS_FR = [
  // French Conclusions & Closings
  'en conclusion, il apparaît clairement',
  'en conclusion, on peut affirmer',
  'en conclusion,',
  'en conclusion',
  'en résumé,',
  'en résumé',
  'en somme,',
  'en somme',
  'en définitive,',
  'en définitive',
  'pour conclure,',
  'pour conclure',
  'pour résumer,',
  'au bout du compte',
  'en dernière analyse',
  'tout compte fait',
  'en guise de conclusion',
  
  // French Discourse Openings & Transitions
  'en premier lieu,',
  'en premier lieu',
  'en premier point',
  'en deuxième lieu',
  'd\'une part,',
  'd\'une part',
  'd\'autre part,',
  'd\'autre part',
  'par conséquent,',
  'par conséquent',
  'dès lors,',
  'dès lors',
  'en outre,',
  'en outre',
  'de surcroît,',
  'de surcroît',
  'de plus,',
  'néanmoins,',
  'toutefois,',
  'dans cette optique,',
  'dans cette optique',
  'dans ce contexte,',
  'dans ce contexte',
  'sous cet angle,',
  'sous cet angle',
  'de la même manière,',
  'de la même manière',
  'de la même façon',
  'ainsi,',
  'à cet égard',
  'à l\'ère numérique',
  'à l\'ère du numérique',
  'dans un monde en constante évolution',
  'dans un monde de plus en plus',
  'au fil de l\'histoire',
  'au fil des ans',
  
  // French Rhetorical Clichés & Emphasis
  'joue un rôle fondamental',
  'joue un rôle crucial',
  'joue un rôle essentiel',
  'joue un rôle pivot',
  'joue un rôle prépondérant',
  'occupe une place centrale',
  'il est important de souligner que',
  'il est essentiel de noter',
  'il est essentiel de reconnaître que',
  'il convient de souligner que',
  'il convient de noter que',
  'il convient de rappeler que',
  'force est de constater que',
  'il va sans dire que',
  'il est impératif de',
  'il est primordial de',
  'il est crucial de prendre en compte',
  'constitue un témoignage de',
  'témoigne de manière tangible',
  'un jalon historique',
  'un pilier fondamental',
  'un impact significatif',
  'un impact multiforme',
  'un impact profond',
  'une approche holistique',
  'une vision holistique',
  'de manière intégrale',
  'de façon holistique',
  'un large éventail de',
  'un large éventail',
  'en constante évolution',
  'défis et opportunités',
  'poser les bases de',
  'ouvrir la voie à',
  'un catalyseur de',
  'un catalyseur pour',
  'en accord avec',
  'en vue de',
  'vers un avenir durable'
];

// Unified catalog
const AI_MARKERS = [
  ...AI_MARKERS_ES,
  ...AI_MARKERS_EN,
  ...AI_MARKERS_FR
];

// LLM-characteristic vocabulary roots for Spanish, English and French
const AI_KEYWORDS_ES = [
  'fundamental', 'crucial', 'vital', 'integral', 'holistico', 'holistica',
  'trascendental', 'sustancial', 'invaluable', 'meticuloso', 'meticulosa',
  'palpable', 'multifacetico', 'multifacetica', 'imperativo', 'imperativa',
  'evidente', 'optimizacion', 'proliferacion', 'equidad', 'testimonio',
  'catalizador', 'consonancia', 'paradigma', 'sinergia', 'relevancia',
  'dinamica', 'interaccion', 'envergadura', 'intrincado', 'intrincada',
  'innegable', 'sostenible', 'efectivo', 'efectiva', 'exhaustivo', 'exhaustiva',
  'protagónico', 'protagónica', 'fomentar', 'fomentando', 'garantizar', 'garantizando',
  'promover', 'promoviendo', 'desempeñar', 'desempeñando', 'contribuir', 'contribuyendo',
  'permitir', 'permitiendo', 'evidenciar', 'evidenciando', 'destacar', 'destacando',
  'resaltar', 'resaltando', 'subrayar', 'subrayando', 'recalcar', 'recalcando',
  'mitigar', 'mitigando', 'potenciar', 'potenciando', 'fortalecer', 'fortaleciendo',
  'abordar', 'abordando', 'articular', 'articulando', 'facilitar', 'facilitando',
  'transformador', 'transformadora'
];

const AI_KEYWORDS_EN = [
  'crucial', 'pivotal', 'fundamental', 'vital', 'integral', 'holistic',
  'multifaceted', 'paramount', 'tapestry', 'delve', 'testament', 'seamlessly',
  'cornerstone', 'proactive', 'synergy', 'mitigate', 'foster', 'harness',
  'propel', 'unravel', 'underpin', 'robust', 'indispensable', 'monumental',
  'transformative', 'paradigm', 'catalyst', 'ever-evolving', 'unprecedented'
];

const AI_KEYWORDS_FR = [
  'fondamental', 'crucial', 'primordial', 'essentiel', 'indispensable',
  'imperatif', 'holistique', 'meticuleux', 'meticuleuse', 'omnipresent',
  'omnipresente', 'proliferer', 'proliferation', 'catalyseur', 'paradigme',
  'synergie', 'dynamique', 'perennite', 'durabilite', 'exhaustif',
  'exhaustive', 'promouvoir', 'garantir', 'favoriser', 'attenuer',
  'renforcer', 'faciliter', 'articuler', 'transcendantal', 'inevitable',
  'substantiel', 'preponderant', 'multiforme', 'precurseur'
];

const AI_KEYWORDS = [
  ...AI_KEYWORDS_ES,
  ...AI_KEYWORDS_EN,
  ...AI_KEYWORDS_FR
];

// =========================================================================
// AUTOMATIC LANGUAGE DETECTION (ESPAÑOL, ENGLISH, FRANÇAIS)
// =========================================================================

export function detectLanguage(text: string): {
  language: SupportedLanguage;
  label: string;
  flag: string;
  confidence: number;
} {
  const lower = text.toLowerCase();
  const tokens = cleanTokens(text);
  if (tokens.length === 0) {
    return { language: 'es', label: 'Español', flag: '🇪🇸', confidence: 100 };
  }

  // High-frequency stopwords per language
  const SPANISH_STOPWORDS = new Set([
    'de', 'la', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un',
    'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'mas', 'pero', 'sus',
    'le', 'ya', 'o', 'fue', 'este', 'ha', 'si', 'porque', 'esta', 'son', 'entre',
    'cuando', 'muy', 'sin', 'sobre', 'tambien', 'me', 'hasta', 'hay', 'donde',
    'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni',
    'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mi', 'antes'
  ]);

  const ENGLISH_STOPWORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
    'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his',
    'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
    'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
    'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like',
    'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
    'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look',
    'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
    'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
    'any', 'these', 'give', 'day', 'most', 'us', 'is', 'are', 'was', 'were', 'been'
  ]);

  const FRENCH_STOPWORDS = new Set([
    'de', 'la', 'le', 'et', 'les', 'des', 'en', 'un', 'une', 'du', 'dans', 'que',
    'qui', 'pour', 'pas', 'sur', 'ce', 'plus', 'est', 'sont', 'avec', 'il', 'elle',
    'par', 'au', 'aux', 'ne', 'se', 'son', 'sa', 'ses', 'comme', 'mais', 'nous',
    'vous', 'ils', 'elles', 'ont', 'cette', 'ces', 'tout', 'tous', 'toute', 'toutes',
    'faire', 'sans', 'leur', 'leurs', 'aussi', 'autre', 'autres', 'bien', 'ou',
    'si', 'ete', 'fait', 'etre', 'avoir', 'meme', 'encore', 'peut', 'peuvent',
    'sous', 'entre', 'apres', 'donc', 'ainsi', 'deux', 'car', 'dont', 'vers',
    'chez', 'devant', 'depuis', 'non', 'alors', 'tres', 'notamment', 'egalement'
  ]);

  let esScore = 0;
  let enScore = 0;
  let frScore = 0;

  for (const t of tokens) {
    if (SPANISH_STOPWORDS.has(t)) esScore += 1;
    if (ENGLISH_STOPWORDS.has(t)) enScore += 1;
    if (FRENCH_STOPWORDS.has(t)) frScore += 1;
  }

  // Orthographic and morphological signals
  // French elisions: d', l', c', qu', j', s', n', m', t'
  const frElisions = (lower.match(/\b(?:d|l|c|qu|j|s|n|m|t)['’]/g) || []).length;
  frScore += frElisions * 3;

  // French specific characters/accents: ç, œ, æ, è, ê, ë, à, â, î, ï, ô, ù, û
  const frAccents = (lower.match(/[çœæèêëâîïôùû]/g) || []).length;
  frScore += frAccents * 2;

  // Spanish specific characters: ñ, ¿, ¡, á, é, í, ó, ú
  const esAccents = (lower.match(/[ñ¿¡]/g) || []).length;
  esScore += esAccents * 3;

  // English characteristic tokens: the, with, which, this, that, their, there, would, should
  const enSpecific = (lower.match(/\b(?:the|with|which|this|that|their|there|would|should|could|between|through)\b/g) || []).length;
  enScore += enSpecific * 2;

  const total = esScore + enScore + frScore;
  if (total === 0) {
    return { language: 'es', label: 'Español', flag: '🇪🇸', confidence: 60 };
  }

  if (frScore > esScore && frScore > enScore) {
    const confidence = Math.min(99, Math.round((frScore / total) * 100));
    return { language: 'fr', label: 'Français', flag: '🇫🇷', confidence };
  } else if (enScore > esScore && enScore > frScore) {
    const confidence = Math.min(99, Math.round((enScore / total) * 100));
    return { language: 'en', label: 'English', flag: '🇬🇧', confidence };
  } else {
    const confidence = Math.min(99, Math.round((esScore / total) * 100));
    return { language: 'es', label: 'Español', flag: '🇪🇸', confidence };
  }
}

// Clean text for n-gram comparison
export function cleanTokens(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics for robust matching
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

// Split text into sentences with precise start/end indices in original text
export interface TextSentence {
  text: string;
  startIndex: number;
  endIndex: number;
}

export function splitIntoSentences(text: string): TextSentence[] {
  const sentences: TextSentence[] = [];
  // Regex to detect sentence boundaries while preserving position across multiline text and paragraphs
  const sentenceRegex = /(?:[^.!?\n]|\n(?!\s*\n))+?(?:[.!?]+(?=[\s"”»'’\n]|$)|(?:\n\s*\n+)|$)/g;
  let match;

  while ((match = sentenceRegex.exec(text)) !== null) {
    const raw = match[0];
    const trimmed = raw.trim();
    if (trimmed.length > 0) {
      const leadingSpaces = raw.indexOf(trimmed);
      const start = match.index + leadingSpaces;
      const end = start + trimmed.length;
      sentences.push({
        text: trimmed,
        startIndex: start,
        endIndex: end,
      });
    }
  }

  // Fallback if no punctuation is used
  if (sentences.length === 0 && text.trim().length > 0) {
    sentences.push({
      text: text.trim(),
      startIndex: 0,
      endIndex: text.length,
    });
  }

  return sentences;
}

// Check if a range is inside quotation marks ("..." or «...» or “...” or ‘...’)
export function detectQuotes(text: string): Array<{ start: number; end: number }> {
  const quotes: Array<{ start: number; end: number }> = [];
  const quoteRegex = /["“«]([^"”»]{4,})["”»]|‘([^’]{4,})’/g;
  let match;
  while ((match = quoteRegex.exec(text)) !== null) {
    quotes.push({
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return quotes;
}

// Detect bibliography / references section in Spanish, English, and French
export function detectBibliographyStart(text: string): number {
  const bibRegex = /(?:\n|\A)(?:bibliograf[ií]a|referencias|obras\s+citadas|references|bibliography|works\s+cited|bibliographie|r[ée]f[ée]rences|ouvrages\s+cit[ée]s|sources\s+consult[ée]es)[\s:]*\n/i;
  const match = bibRegex.exec(text);
  return match ? match.index : -1;
}

// Determine institutional originality funnel color based on percentage
export function getOriginalityFunnelColor(percentage: number): { color: FunnelColor; label: string } {
  if (percentage <= 0) {
    return {
      color: 'blue',
      label: 'Azul: 0% (Sin coincidencias detectadas)'
    };
  } else if (percentage < 25) {
    return {
      color: 'green',
      label: 'Verde: 1% - 24% (Similitud baja / citas y frases comunes)'
    };
  } else if (percentage < 50) {
    return {
      color: 'yellow',
      label: 'Amarillo: 25% - 49% (Similitud media / requiere revisión de citas)'
    };
  } else if (percentage < 75) {
    return {
      color: 'orange',
      label: 'Naranja: 50% - 74% (Similitud alta / reproducción sustancial)'
    };
  } else {
    return {
      color: 'red',
      label: 'Rojo: 75% - 100% (Similitud crítica / presunto plagio)'
    };
  }
}

// Alias for backwards compatibility
export const getTurnitinFunnelColor = getOriginalityFunnelColor;

// Compute n-gram shingle overlap between query tokens and reference tokens
function computeNGramMatches(
  queryTokens: string[],
  refTokens: string[],
  n = 4
): number {
  if (queryTokens.length < n || refTokens.length < n) {
    // Fallback to token intersection
    const set1 = new Set(queryTokens);
    const common = refTokens.filter((t) => set1.has(t));
    return common.length / Math.max(queryTokens.length, 1);
  }

  const queryShingles = new Set<string>();
  for (let i = 0; i <= queryTokens.length - n; i++) {
    queryShingles.add(queryTokens.slice(i, i + n).join(' '));
  }

  let matches = 0;
  for (let j = 0; j <= refTokens.length - n; j++) {
    const shingle = refTokens.slice(j, j + n).join(' ');
    if (queryShingles.has(shingle)) {
      matches++;
    }
  }

  const maxPossible = Math.max(queryTokens.length - n + 1, 1);
  return Math.min(1, matches / maxPossible);
}

// Advanced AI Detection heuristic analysis for an individual sentence
export function analyzeSentenceForAI(
  sentence: string,
  docContext?: {
    lowBurstiness: boolean;
    highConnectorDensity: boolean;
    highMarkerDensity: boolean;
  },
  lang?: SupportedLanguage
): {
  aiProbability: number;
  perplexityScore: number;
  detectedMarkers: string[];
} {
  const normalizedSentence = sentence.replace(/\s+/g, ' ').trim();
  const lower = normalizedSentence.toLowerCase();
  const tokens = cleanTokens(normalizedSentence);
  const detectedMarkers: string[] = [];

  // 1. Detect explicit rhetorical markers and transitions (language-tailored + general)
  const markersToTest = lang === 'fr' 
    ? [...AI_MARKERS_FR, ...AI_MARKERS]
    : lang === 'en'
    ? [...AI_MARKERS_EN, ...AI_MARKERS]
    : [...AI_MARKERS_ES, ...AI_MARKERS];

  for (const marker of markersToTest) {
    if (lower.includes(marker) && !detectedMarkers.includes(marker)) {
      detectedMarkers.push(marker);
    }
  }

  // Token count
  const wordCount = tokens.length;
  if (wordCount < 4) {
    return { aiProbability: 5, perplexityScore: 85, detectedMarkers: [] };
  }

  // 2. Detect synthetic tail clauses (Spanish, English, French)
  const syntheticTailRegex = /,\s*(?:lo que|lo cual|permitiendo|garantizando|facilitando|fomentando|contribuyendo|asegurando|promoviendo|resultando en|dando lugar a|which allows|which enables|allowing for|thereby ensuring|facilitating|fostering|contributing to|resulting in|paving the way for|underscoring the importance of|ce qui permet|ce qui favorise|permettant ainsi de|garantissant ainsi|facilitant|favorisant|contribuant à|assurant|promouvant|aboutissant à|ouvrant la voie à)\b/i;
  const hasSyntheticTail = syntheticTailRegex.test(normalizedSentence);
  if (hasSyntheticTail && !detectedMarkers.some((m) => m.includes('cláusula') || m.includes('clause'))) {
    detectedMarkers.push('cláusula subordinada conectiva (subordinate tail clause)');
  }

  // 3. Detect impersonal passive formulas (Spanish, English, French)
  const impersonalRegex = /\b(?:se puede|se debe|se observa|se concluye|se evidencia|se destaca|se resalta|se busca|se pretende|se requiere|se presenta como|se traduce en|it can be|it is evident|it should be|it is worth|it appears that|stands as|translates into|is widely regarded|it is widely acknowledged|il est possible|on peut affirmer|il convient de|il s'avère que|il apparaît clairement|on observe que|il est à noter|il est impératif|se présente comme|se traduit par|force est de constater)\b/gi;
  const impersonalMatches = normalizedSentence.match(impersonalRegex);
  const impersonalCount = impersonalMatches ? impersonalMatches.length : 0;

  // 4. Keyword matches from characteristic LLM vocabulary
  const foundKeywords = tokens.filter((t) => AI_KEYWORDS.includes(t));

  // 5. Syntactic balance & comma cadence
  const commas = (normalizedSentence.match(/,/g) || []).length;
  const isBalancedLength = wordCount >= 14 && wordCount <= 36;
  const hasBalancedClauses = isBalancedLength && commas >= 1 && commas <= 3;

  // 6. Base probability calculation
  let probability = 18; // baseline neutral

  // Marker points (strong direct evidence)
  if (detectedMarkers.length > 0) {
    probability += detectedMarkers.length * 30;
  }

  // Synthetic tail bonus
  if (hasSyntheticTail) {
    probability += 25;
  }

  // Characteristic keywords
  if (foundKeywords.length > 0) {
    probability += Math.min(38, foundKeywords.length * 14);
  }

  // Impersonal formulas
  if (impersonalCount > 0) {
    probability += Math.min(20, impersonalCount * 10);
  }

  // Cadence regularity
  if (hasBalancedClauses) {
    probability += 12;
  } else if (isBalancedLength) {
    probability += 6;
  }

  // 7. Contextual boost from document-level synthetic profile
  if (docContext) {
    if (docContext.lowBurstiness) probability += 10;
    if (docContext.highConnectorDensity) probability += 12;
    if (docContext.highMarkerDensity) probability += 12;
  }

  // Human conversational damping (first-person singular, questions, interjections in ES, EN, FR)
  const humanMarkers = /\b(?:yo|mi opinión|me parece|creo que|opino que|siento que|en mi experiencia|personalmente|quizás|acaso|¡|¿|\?|!|i think|i believe|in my opinion|in my view|i feel|maybe|perhaps|je pense|à mon avis|selon moi|à mon sens|je crois que|peut-être|sans doute|d'après moi)\b/i;
  if (humanMarkers.test(normalizedSentence)) {
    probability = Math.max(5, probability - 25);
  }

  // Cap probability between 5% and 99%
  const aiProbability = Math.min(99, Math.max(5, Math.round(probability)));
  
  // Perplexity score: inversely proportional to synthetic predictability
  const perplexityScore = Math.max(10, Math.min(95, Math.round(100 - aiProbability * 0.85)));

  return {
    aiProbability,
    perplexityScore,
    detectedMarkers
  };
}

// Main execution function in browser memory
export function runOriginalityAnalysis(
  documentText: string,
  title: string,
  author: string,
  corpus: ReferenceDocument[],
  filters: AnalysisFilters
): AnalysisSummary {
  const startTime = performance.now();

  const words = documentText.trim().split(/\s+/).filter(Boolean);
  const totalWords = words.length;
  const totalCharacters = documentText.length;
  const sentences = splitIntoSentences(documentText);
  const totalSentences = sentences.length;

  // Detect document language (Spanish, English, or French)
  const langInfo = detectLanguage(documentText);

  const quoteSpans = detectQuotes(documentText);
  const bibliographyStart = detectBibliographyStart(documentText);

  // Pre-tokenize corpus documents for speed
  const preprocessedCorpus = corpus.map((doc) => ({
    doc,
    tokens: cleanTokens(doc.content),
    lowerContent: doc.content.toLowerCase()
  }));

  const matchedSegments: MatchedSegment[] = [];
  const sourceStatsMap = new Map<string, { count: number; words: number; sampleExcerpt: string }>();

  // Process similarity by analyzing sentence chunks and sliding sequences
  sentences.forEach((s, idx) => {
    const sTokens = cleanTokens(s.text);
    if (sTokens.length === 0) return;

    // Check if within quotes
    const isQuote = quoteSpans.some(
      (q) => (s.startIndex >= q.start && s.startIndex <= q.end) || (s.endIndex >= q.start && s.endIndex <= q.end)
    );

    // Check if in bibliography
    const isBibliography = bibliographyStart !== -1 && s.startIndex >= bibliographyStart;

    // Search for best matching source in the reference corpus
    let bestMatchDoc: ReferenceDocument | null = null;
    let highestOverlap = 0;
    let matchingSnippet = '';

    for (const item of preprocessedCorpus) {
      const overlap = computeNGramMatches(sTokens, item.tokens, 4);
      if (overlap > highestOverlap) {
        highestOverlap = overlap;
        bestMatchDoc = item.doc;
        // Find approximate matching snippet from source
        const firstWords = sTokens.slice(0, 4).join(' ');
        const indexInDoc = item.lowerContent.indexOf(firstWords);
        if (indexInDoc !== -1) {
          matchingSnippet = item.doc.content.substring(Math.max(0, indexInDoc - 10), indexInDoc + 180) + '...';
        } else {
          matchingSnippet = item.doc.content.substring(0, 180) + '...';
        }
      }
    }

    // Similarity threshold: 0.32 (32% shingle match or more)
    if (highestOverlap >= 0.32 && bestMatchDoc) {
      const sentenceWordCount = sTokens.length;

      // Check if filtered out
      const excludedByQuote = filters.excludeQuotes && isQuote;
      const excludedByBib = filters.excludeBibliography && isBibliography;
      const excludedByMinWords = sentenceWordCount < filters.minWordCountThreshold;

      if (!excludedByQuote && !excludedByBib && !excludedByMinWords) {
        matchedSegments.push({
          id: `match-${idx}`,
          startIndex: s.startIndex,
          endIndex: s.endIndex,
          text: s.text,
          sourceId: 0, // will assign source id below
          sourceTitle: bestMatchDoc.title,
          similarityScore: Math.round(highestOverlap * 100),
          isQuote,
          isBibliography,
          wordCount: sentenceWordCount
        });

        // Record source stats
        const key = bestMatchDoc.id;
        const current = sourceStatsMap.get(key) || {
          count: 0,
          words: 0,
          sampleExcerpt: matchingSnippet || bestMatchDoc.content.slice(0, 150)
        };
        current.count += 1;
        current.words += sentenceWordCount;
        sourceStatsMap.set(key, current);
      }
    }
  });

  // Calculate sources and assign colors
  const sources: SourceMatch[] = [];
  let sourceIndexCounter = 1;

  Array.from(sourceStatsMap.entries())
    .sort((a, b) => b[1].words - a[1].words)
    .forEach(([docId, stats]) => {
      const foundDoc = corpus.find((d) => d.id === docId);
      if (!foundDoc) return;

      const sourceId = sourceIndexCounter++;
      const sourcePercentage = totalWords > 0 ? Math.round((stats.words / totalWords) * 100) : 0;
      const color = EKIRAYA_SOURCE_COLORS[(sourceId - 1) % EKIRAYA_SOURCE_COLORS.length];

      sources.push({
        id: sourceId,
        sourceTitle: foundDoc.title,
        sourceAuthor: foundDoc.author,
        sourceType: foundDoc.type,
        publicationYear: foundDoc.year,
        sourceUrl: foundDoc.institutionOrJournal,
        percentage: Math.max(1, sourcePercentage),
        matchedWords: stats.words,
        color,
        sampleExcerpt: stats.sampleExcerpt
      });

      // Update sourceId in matched segments
      matchedSegments.forEach((seg) => {
        if (seg.sourceTitle === foundDoc.title) {
          seg.sourceId = sourceId;
        }
      });
    });

  // Calculate Overall Similarity Index %
  const matchedWordsTotal = matchedSegments.reduce((acc, seg) => acc + seg.wordCount, 0);
  const similarityIndex = totalWords > 0 ? Math.min(100, Math.round((matchedWordsTotal / totalWords) * 100)) : 0;
  const { color: similarityColor, label: similarityFunnelLabel } = getOriginalityFunnelColor(similarityIndex);

  // --- DOCUMENT-LEVEL ANALYSIS FOR AI DETECTION ---
  // Pass 1: Gather raw sentence metrics to compute burstiness and connector density
  const sentenceWordCounts: number[] = [];
  let preliminaryMarkerCount = 0;
  let preliminarySyntheticTailCount = 0;

  sentences.forEach((s) => {
    const sWords = cleanTokens(s.text).length;
    sentenceWordCounts.push(sWords);

    const sLower = s.text.toLowerCase();
    for (const marker of AI_MARKERS) {
      if (sLower.includes(marker)) {
        preliminaryMarkerCount++;
        break;
      }
    }
    if (/,\s*(?:lo que|lo cual|permitiendo|garantizando|facilitando|fomentando|ce qui permet|ce qui favorise|permettant ainsi de|garantissant ainsi|which allows|which enables|allowing for|thereby ensuring)\b/i.test(s.text)) {
      preliminarySyntheticTailCount++;
    }
  });

  const meanWordCount = totalSentences > 0 ? totalWords / totalSentences : 0;
  const variance =
    totalSentences > 1
      ? sentenceWordCounts.reduce((acc, len) => acc + Math.pow(len - meanWordCount, 2), 0) / (totalSentences - 1)
      : 0;
  const stdDev = Math.sqrt(variance);

  // Low stdDev in sentence lengths indicates synthetic uniformity
  const lowBurstiness = totalSentences >= 3 && stdDev < 8.5;
  const highConnectorDensity = totalSentences >= 2 && preliminaryMarkerCount / totalSentences >= 0.3;
  const highMarkerDensity = totalSentences >= 2 && (preliminaryMarkerCount + preliminarySyntheticTailCount) >= 2;

  const docContext = {
    lowBurstiness,
    highConnectorDensity,
    highMarkerDensity
  };

  // Pass 2: Evaluate AI probability per sentence with calibrated document context and language
  const aiSentences: AISentenceAnalysis[] = [];
  const markerCounts: Record<string, number> = {};
  let totalPerplexity = 0;
  let totalProbabilisticWords = 0;
  let flaggedAIWordsCount = 0;

  sentences.forEach((s, idx) => {
    const { aiProbability, perplexityScore, detectedMarkers } = analyzeSentenceForAI(s.text, docContext, langInfo.language);
    const sWords = cleanTokens(s.text).length;

    detectedMarkers.forEach((m) => {
      markerCounts[m] = (markerCounts[m] || 0) + 1;
    });

    totalPerplexity += perplexityScore;
    totalProbabilisticWords += (aiProbability / 100) * sWords;

    // A sentence is flagged if probability >= 40% or has explicit detected markers
    const isFlaggedAI = aiProbability >= 40 || detectedMarkers.length > 0;
    if (isFlaggedAI) {
      flaggedAIWordsCount += sWords;
    }

    aiSentences.push({
      id: `ai-${idx}`,
      startIndex: s.startIndex,
      endIndex: s.endIndex,
      sentence: s.text,
      aiProbability,
      perplexityScore,
      burstinessScore: Math.round(stdDev * 5),
      detectedMarkers,
      isFlaggedAI
    });
  });

  // Calculate Burstiness Score (0 to 100, where higher = more human variance, lower = more AI-like uniformity)
  const burstinessScore = Math.min(100, Math.round((stdDev / Math.max(meanWordCount, 1)) * 100));

  // Compute Overall AI Writing Index (%)
  let aiWritingIndex = 0;
  if (totalWords > 0 && totalSentences > 0) {
    const flaggedRatio = flaggedAIWordsCount / totalWords;
    const probabilisticRatio = totalProbabilisticWords / totalWords;

    let score = 0;
    if (flaggedRatio > 0.35) {
      // High presence of flagged AI sentences
      score = Math.round((flaggedRatio * 0.7 + probabilisticRatio * 0.3) * 100);
    } else if (flaggedRatio > 0.1 || probabilisticRatio > 0.30) {
      // Moderate or diffuse presence
      score = Math.round((flaggedRatio * 0.5 + probabilisticRatio * 0.5) * 100);
    } else {
      // Predominantly human
      score = Math.round(probabilisticRatio * 45);
    }

    // Contextual boost if uniform sentence cadence and synthetic connectors
    if (docContext.lowBurstiness && (docContext.highConnectorDensity || docContext.highMarkerDensity)) {
      score = Math.max(score, Math.round(flaggedRatio * 100));
    }

    aiWritingIndex = Math.min(100, Math.max(0, score));
  }

  const averagePerplexity = totalSentences > 0 ? Math.round(totalPerplexity / totalSentences) : 50;

  const detectedAIMarkersList = Object.entries(markerCounts)
    .map(([marker, occurrences]) => ({ marker, occurrences }))
    .sort((a, b) => b.occurrences - a.occurrences);

  const endTime = performance.now();

  return {
    documentId: `DOC-${Date.now().toString().slice(-6)}`,
    title: title.trim() || 'Documento sin título',
    author: author.trim() || 'Autor no especificado',
    submissionDate: new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    totalWords,
    totalCharacters,
    totalSentences,
    similarityIndex,
    similarityColor,
    similarityFunnelLabel,
    matchedWordsTotal,
    sources,
    matchedSegments,
    aiWritingIndex,
    aiFlaggedSentencesCount: aiSentences.filter((s) => s.isFlaggedAI).length,
    aiSentences,
    averagePerplexity,
    burstinessScore,
    detectedAIMarkersList,
    executionTimeMs: Math.round(endTime - startTime),
    detectedLanguage: langInfo.language,
    languageLabel: langInfo.label,
    activeFilters: filters
  };
}

// Alias for backwards compatibility
export const runTurnitinAnalysis = runOriginalityAnalysis;
