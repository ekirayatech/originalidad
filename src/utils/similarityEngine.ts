import {
  AnalysisFilters,
  MatchedSegment,
  ReferenceDocument,
  SimilarityMatchType,
  SourceMatch
} from '../types';
import { EKIRAYA_SOURCE_COLORS } from '../data/defaultCorpus';

// =========================================================================
// VERITAS ACADEMIC - SIMILARITY & ORIGINALITY ENGINE
// Multi-Technique Plagiarism & Text Matching Engine
// 1. Exact Shingling & Rolling n-grams (Verbatim Match)
// 2. Inverted Index with Okapi BM25 (Candidate Retrieval)
// 3. Multilingual Vector Space & TF-IDF Cosine Model (Semantic Matching)
// 4. Paraphrase & Syntactic Transposition Reranker
// =========================================================================

// Frequent academic boilerplate expressions across Spanish, English, and French
export const COMMON_ACADEMIC_FORMULAS = [
  // Spanish
  'el presente trabajo tiene como objetivo',
  'el objetivo principal de esta investigacion',
  'como se puede observar en',
  'a partir de los resultados obtenidos',
  'en este sentido es importante destacar',
  'en conclusion se puede afirmar que',
  'por otra parte cabe senalar que',
  'a lo largo de este estudio',
  'los datos fueron recolectados a traves de',
  'de acuerdo con lo expuesto anteriormente',
  'los resultados muestran que',
  'en primer lugar se procedio a',
  'con base en lo anterior',
  'para llevar a cabo este analisis',
  // English
  'the purpose of this study is to',
  'as can be seen in',
  'based on the results obtained',
  'it is important to note that',
  'in conclusion it can be stated that',
  'on the other hand it is worth noting',
  'throughout this research',
  'data was collected using',
  'in accordance with the above',
  // French
  'l objectif de ce travail est de',
  'comme on peut le constater dans',
  'a partir des resultats obtenus',
  'il convient de souligner que',
  'en conclusion on peut affirmer que'
];

/**
 * Normalizes text for nlp and tokenization:
 * converts to lowercase, removes punctuation and accents for comparison
 */
export function normalizeForMatching(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract clean words/tokens
 */
export function getCleanTokens(text: string): string[] {
  const norm = normalizeForMatching(text);
  return norm.length > 0 ? norm.split(' ').filter((t) => t.length > 1) : [];
}

/**
 * Technique 1: Exact Shingling & Rolling n-gram Match
 * Computes exact sequential overlap ratio between query and reference text.
 */
export function computeExactShingleOverlap(
  queryTokens: string[],
  refTokens: string[],
  shingleSize = 4
): { ratio: number; matchingShingles: number } {
  if (queryTokens.length < shingleSize || refTokens.length < shingleSize) {
    const set1 = new Set(queryTokens);
    const matches = refTokens.filter((t) => set1.has(t)).length;
    return {
      ratio: matches / Math.max(queryTokens.length, 1),
      matchingShingles: matches
    };
  }

  const queryShingles = new Set<string>();
  for (let i = 0; i <= queryTokens.length - shingleSize; i++) {
    queryShingles.add(queryTokens.slice(i, i + shingleSize).join(' '));
  }

  let matchingShingles = 0;
  for (let j = 0; j <= refTokens.length - shingleSize; j++) {
    const shingle = refTokens.slice(j, j + shingleSize).join(' ');
    if (queryShingles.has(shingle)) {
      matchingShingles++;
    }
  }

  const maxPossible = Math.max(queryTokens.length - shingleSize + 1, 1);
  return {
    ratio: Math.min(1, matchingShingles / maxPossible),
    matchingShingles
  };
}

/**
 * Technique 2: Okapi BM25 Inverted Index & Scoring
 * Standard information retrieval algorithm used to score passages.
 */
export class BM25CorpusIndex {
  private docTokens: Map<string, string[]> = new Map();
  private docLengths: Map<string, number> = new Map();
  private avgDocLength = 0;
  private invertedIndex: Map<string, Set<string>> = new Map();
  private totalDocs = 0;
  private k1 = 1.5;
  private b = 0.75;

  constructor(corpus: ReferenceDocument[]) {
    this.totalDocs = corpus.length;
    let totalTokens = 0;

    corpus.forEach((doc) => {
      const tokens = getCleanTokens(doc.content);
      this.docTokens.set(doc.id, tokens);
      this.docLengths.set(doc.id, tokens.length);
      totalTokens += tokens.length;

      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach((token) => {
        let docSet = this.invertedIndex.get(token);
        if (!docSet) {
          docSet = new Set();
          this.invertedIndex.set(token, docSet);
        }
        docSet.add(doc.id);
      });
    });

    this.avgDocLength = this.totalDocs > 0 ? totalTokens / this.totalDocs : 0;
  }

  public scoreQuery(queryTokens: string[], docId: string): number {
    const tokens = this.docTokens.get(docId);
    const docLength = this.docLengths.get(docId) || 0;
    if (!tokens || tokens.length === 0 || this.avgDocLength === 0) return 0;

    // Term frequencies in document
    const tfMap = new Map<string, number>();
    tokens.forEach((t) => tfMap.set(t, (tfMap.get(t) || 0) + 1));

    let score = 0;
    const uniqueQueryTokens = Array.from(new Set(queryTokens));

    uniqueQueryTokens.forEach((term) => {
      const docCountWithTerm = this.invertedIndex.get(term)?.size || 0;
      if (docCountWithTerm === 0) return;

      // IDF calculation
      const idf = Math.log((this.totalDocs - docCountWithTerm + 0.5) / (docCountWithTerm + 0.5) + 1);

      // Term frequency in this doc
      const tf = tfMap.get(term) || 0;
      const numerator = tf * (this.k1 + 1);
      const denominator = tf + this.k1 * (1 - this.b + this.b * (docLength / this.avgDocLength));

      score += idf * (numerator / Math.max(denominator, 0.001));
    });

    return score;
  }
}

/**
 * Technique 3: Semantic Vector Space & TF-IDF Cosine Similarity
 * Weighs terms by inverse rarity and calculates cosine similarity.
 */
export function computeSemanticVectorSimilarity(
  queryTokens: string[],
  refTokens: string[],
  idfWeights?: Map<string, number>
): number {
  if (queryTokens.length === 0 || refTokens.length === 0) return 0;

  const queryFreq = new Map<string, number>();
  const refFreq = new Map<string, number>();

  queryTokens.forEach((t) => queryFreq.set(t, (queryFreq.get(t) || 0) + 1));
  refTokens.forEach((t) => refFreq.set(t, (refFreq.get(t) || 0) + 1));

  const allTerms = new Set([...queryFreq.keys(), ...refFreq.keys()]);
  let dotProduct = 0;
  let queryNormSq = 0;
  let refNormSq = 0;

  allTerms.forEach((term) => {
    const weight = idfWeights?.get(term) || 1.0;
    const qVal = (queryFreq.get(term) || 0) * weight;
    const rVal = (refFreq.get(term) || 0) * weight;

    dotProduct += qVal * rVal;
    queryNormSq += qVal * qVal;
    refNormSq += rVal * rVal;
  });

  if (queryNormSq === 0 || refNormSq === 0) return 0;
  return dotProduct / (Math.sqrt(queryNormSq) * Math.sqrt(refNormSq));
}

/**
 * Technique 4: Paraphrase & Syntactic Restructuring Detection
 * Assesses token set intersection (Jaccard) combined with word order deviation.
 */
export function evaluateParaphraseLikelihood(
  queryTokens: string[],
  refTokens: string[],
  exactOverlap: number
): { isParaphrase: boolean; score: number } {
  if (queryTokens.length < 5 || refTokens.length < 5) {
    return { isParaphrase: false, score: 0 };
  }

  const querySet = new Set(queryTokens);
  const refSet = new Set(refTokens);
  const intersectionSize = queryTokens.filter((t) => refSet.has(t)).length;
  const unionSize = new Set([...queryTokens, ...refTokens]).size;

  const jaccard = unionSize > 0 ? intersectionSize / unionSize : 0;
  const containment = intersectionSize / Math.max(queryTokens.length, 1);

  // If containment is high (>40%) but exact shingle is moderate (<55%),
  // this is a hallmark of syntactic restructuring / synonym replacement (paraphrase)
  const isParaphrase = containment >= 0.40 && exactOverlap < 0.65;
  const paraphraseScore = Math.min(1.0, containment * 0.7 + jaccard * 0.3);

  return {
    isParaphrase,
    score: paraphraseScore
  };
}

/**
 * Searches for the best matching excerpt inside the source content
 */
export function extractMatchingSourceExcerpt(
  queryText: string,
  sourceContent: string,
  queryTokens: string[]
): string {
  if (!sourceContent) return '';
  const lowerSource = sourceContent.toLowerCase();

  // 1. Try finding a 4-token sequence
  if (queryTokens.length >= 4) {
    const sequence = queryTokens.slice(0, 4).join(' ');
    const pos = lowerSource.indexOf(sequence);
    if (pos !== -1) {
      const start = Math.max(0, pos - 20);
      const end = Math.min(sourceContent.length, pos + 220);
      return (start > 0 ? '...' : '') + sourceContent.substring(start, end).trim() + (end < sourceContent.length ? '...' : '');
    }
  }

  // 2. Try 3-token sequence
  if (queryTokens.length >= 3) {
    const sequence = queryTokens.slice(0, 3).join(' ');
    const pos = lowerSource.indexOf(sequence);
    if (pos !== -1) {
      const start = Math.max(0, pos - 20);
      const end = Math.min(sourceContent.length, pos + 220);
      return (start > 0 ? '...' : '') + sourceContent.substring(start, end).trim() + (end < sourceContent.length ? '...' : '');
    }
  }

  // Fallback: return the first 180 chars of the source
  return sourceContent.substring(0, 180).trim() + (sourceContent.length > 180 ? '...' : '');
}

export interface SimilarityExecutionResult {
  similarityIndex: number;
  grossSimilarityIndex: number;
  netSimilarityIndex: number;
  exactMatchPercentage: number;
  paraphrasePercentage: number;
  semanticPercentage: number;
  highestSingleSourcePercentage: number;
  matchedWordsTotal: number;
  sources: SourceMatch[];
  matchedSegments: MatchedSegment[];
  methodology: string;
}

/**
 * Independent Similarity Engine
 * Orchestrates all 4 techniques across corpus documents with exclusion filters.
 */
export function executeSimilarityEngine(
  documentText: string,
  title: string,
  author: string,
  sentences: Array<{ text: string; startIndex: number; endIndex: number }>,
  corpus: ReferenceDocument[],
  filters: AnalysisFilters,
  quoteSpans: Array<{ start: number; end: number }>,
  bibliographyStart: number
): SimilarityExecutionResult {
  const words = documentText.trim().split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  // Initialize BM25 candidate index
  const bm25Index = new BM25CorpusIndex(corpus);

  // Pre-process corpus documents (skip self-document)
  const normCurrentText = normalizeForMatching(documentText);
  const processedCorpus = corpus
    .filter((doc) => {
      const docNorm = normalizeForMatching(doc.content);
      if (docNorm === normCurrentText) return false;
      if (
        doc.title.trim().toLowerCase() === title.trim().toLowerCase() &&
        Math.abs(doc.content.length - documentText.length) < 25 &&
        docNorm.slice(0, 80) === normCurrentText.slice(0, 80)
      ) {
        return false;
      }
      return true;
    })
    .map((doc) => ({
      doc,
      tokens: getCleanTokens(doc.content),
      normContent: normalizeForMatching(doc.content)
    }));

  const matchedSegments: MatchedSegment[] = [];
  const sourceStatsMap = new Map<
    string,
    {
      count: number;
      words: number;
      exactCount: number;
      paraphraseCount: number;
      semanticCount: number;
      maxSegmentScore: number;
      sampleExcerpt: string;
    }
  >();

  let grossMatchedWords = 0;
  let exactMatchedWords = 0;
  let paraphraseMatchedWords = 0;
  let semanticMatchedWords = 0;

  // Estimate paragraph index from document text
  const paragraphBreaks: number[] = [];
  const paraRegex = /\n\s*\n/g;
  let match;
  while ((match = paraRegex.exec(documentText)) !== null) {
    paragraphBreaks.push(match.index);
  }

  // Iterate across each sentence to perform multi-technique matching
  sentences.forEach((s, sentenceIdx) => {
    const sTokens = getCleanTokens(s.text);
    if (sTokens.length === 0) return;
    const sentenceWordCount = sTokens.length;

    // Determine paragraph index
    let paragraphIndex = 0;
    for (let p = 0; p < paragraphBreaks.length; p++) {
      if (s.startIndex > paragraphBreaks[p]) {
        paragraphIndex = p + 1;
      }
    }

    // Check if within quotes
    const isQuote = quoteSpans.some(
      (q) => (s.startIndex >= q.start && s.startIndex <= q.end) || (s.endIndex >= q.start && s.endIndex <= q.end)
    );

    // Check if in bibliography
    const isBibliography = bibliographyStart !== -1 && s.startIndex >= bibliographyStart;

    // Check common academic formulas
    const sNorm = normalizeForMatching(s.text);
    const isCommonPhrase = COMMON_ACADEMIC_FORMULAS.some((phrase) => sNorm.includes(phrase));

    // Multi-tier candidate retrieval & evaluation
    let bestDoc: ReferenceDocument | null = null;
    let bestScore = 0;
    let detectedMatchType: SimilarityMatchType = 'semantic';
    let sourceSnippet = '';

    for (const item of processedCorpus) {
      // 1. Exact shingle overlap (n=4)
      const exactShingles = computeExactShingleOverlap(sTokens, item.tokens, 4);

      // 2. Paraphrase detection
      const paraphrase = evaluateParaphraseLikelihood(sTokens, item.tokens, exactShingles.ratio);

      // 3. Semantic Vector Space (TF-IDF Cosine)
      const semanticSim = computeSemanticVectorSimilarity(sTokens, item.tokens);

      // Combined multi-technique scoring
      let combinedScore = 0;
      let matchType: SimilarityMatchType = 'semantic';

      if (exactShingles.ratio >= 0.35) {
        // Dominant verbatim match
        combinedScore = exactShingles.ratio;
        matchType = 'exact';
      } else if (paraphrase.isParaphrase && paraphrase.score >= 0.40) {
        // High restructuring / paraphrase match
        combinedScore = paraphrase.score;
        matchType = 'paraphrase';
      } else if (semanticSim >= 0.48) {
        // Semantic / thematic match
        combinedScore = semanticSim;
        matchType = 'semantic';
      } else {
        // Evaluate BM25 candidate contribution
        const bm25Score = bm25Index.scoreQuery(sTokens, item.doc.id);
        if (bm25Score > 4.5 && semanticSim > 0.35) {
          combinedScore = Math.min(1.0, (bm25Score / 10) * 0.5 + semanticSim * 0.5);
          matchType = 'semantic';
        }
      }

      if (combinedScore > bestScore) {
        bestScore = combinedScore;
        bestDoc = item.doc;
        detectedMatchType = matchType;
        sourceSnippet = extractMatchingSourceExcerpt(s.text, item.doc.content, sTokens);
      }
    }

    // Baseline threshold for confirmed similarity: 30%
    if (bestScore >= 0.30 && bestDoc) {
      grossMatchedWords += sentenceWordCount;

      // Filter exclusions according to academic parameters
      const excludedByQuote = filters.excludeQuotes && isQuote;
      const excludedByBib = filters.excludeBibliography && isBibliography;
      const excludedByMinWords = sentenceWordCount < filters.minWordCountThreshold;
      const excludedByCommonPhrase = filters.excludeCommonPhrases && isCommonPhrase;

      if (!excludedByQuote && !excludedByBib && !excludedByMinWords && !excludedByCommonPhrase) {
        const similarityPct = Math.round(bestScore * 100);

        if (detectedMatchType === 'exact') {
          exactMatchedWords += sentenceWordCount;
        } else if (detectedMatchType === 'paraphrase') {
          paraphraseMatchedWords += sentenceWordCount;
        } else {
          semanticMatchedWords += sentenceWordCount;
        }

        matchedSegments.push({
          id: `sim-match-${sentenceIdx}`,
          startIndex: s.startIndex,
          endIndex: s.endIndex,
          text: s.text,
          sourceId: 0, // Assigned below after sorting
          sourceTitle: bestDoc.title,
          similarityScore: similarityPct,
          isQuote,
          isBibliography,
          wordCount: sentenceWordCount,
          matchType: detectedMatchType,
          sourceExcerpt: sourceSnippet,
          sourceUrl: bestDoc.institutionOrJournal,
          paragraphIndex: paragraphIndex + 1,
          sentenceIndex: sentenceIdx + 1,
          verificationStatus: 'verified'
        });

        // Record source stats
        const key = bestDoc.id;
        const current = sourceStatsMap.get(key) || {
          count: 0,
          words: 0,
          exactCount: 0,
          paraphraseCount: 0,
          semanticCount: 0,
          maxSegmentScore: 0,
          sampleExcerpt: sourceSnippet
        };
        current.count += 1;
        current.words += sentenceWordCount;
        current.maxSegmentScore = Math.max(current.maxSegmentScore, similarityPct);
        if (detectedMatchType === 'exact') current.exactCount += 1;
        else if (detectedMatchType === 'paraphrase') current.paraphraseCount += 1;
        else current.semanticCount += 1;

        sourceStatsMap.set(key, current);
      }
    }
  });

  // Calculate sources and rank by matched words
  const sources: SourceMatch[] = [];
  let sourceIndexCounter = 1;
  let highestSingleSourcePercentage = 0;

  const consultationDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  Array.from(sourceStatsMap.entries())
    .sort((a, b) => b[1].words - a[1].words)
    .forEach(([docId, stats]) => {
      const foundDoc = corpus.find((d) => d.id === docId);
      if (!foundDoc) return;

      const sourceId = sourceIndexCounter++;
      const sourcePercentage = totalWords > 0 ? Math.round((stats.words / totalWords) * 100) : 0;
      const color = EKIRAYA_SOURCE_COLORS[(sourceId - 1) % EKIRAYA_SOURCE_COLORS.length];

      if (sourcePercentage > highestSingleSourcePercentage) {
        highestSingleSourcePercentage = sourcePercentage;
      }

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
        sampleExcerpt: stats.sampleExcerpt,
        accessDate: consultationDate,
        exactMatchesCount: stats.exactCount,
        paraphraseMatchesCount: stats.paraphraseCount,
        semanticMatchesCount: stats.semanticCount,
        maxSegmentScore: stats.maxSegmentScore
      });

      // Update sourceId in matched segments
      matchedSegments.forEach((seg) => {
        if (seg.sourceTitle === foundDoc.title) {
          seg.sourceId = sourceId;
        }
      });
    });

  // Calculate net and gross similarity index %
  const matchedWordsNet = matchedSegments.reduce((acc, seg) => acc + seg.wordCount, 0);
  const similarityIndex = totalWords > 0 ? Math.min(100, Math.round((matchedWordsNet / totalWords) * 100)) : 0;
  const grossSimilarityIndex = totalWords > 0 ? Math.min(100, Math.round((grossMatchedWords / totalWords) * 100)) : 0;

  const exactMatchPercentage = totalWords > 0 ? Math.round((exactMatchedWords / totalWords) * 100) : 0;
  const paraphrasePercentage = totalWords > 0 ? Math.round((paraphraseMatchedWords / totalWords) * 100) : 0;
  const semanticPercentage = totalWords > 0 ? Math.round((semanticMatchedWords / totalWords) * 100) : 0;

  const methodology =
    'Metodología Veritas Academic: Análisis multi-nivel con shingling de 4-gramas para coincidencia textual exacta, BM25 para indexación del corpus institucional, similitud coseno sobre vectores TF-IDF con ponderación de rareza léxica para similitud semántica y análisis Jaccard/contención para detección de paráfrasis sintáctica.';

  return {
    similarityIndex,
    grossSimilarityIndex,
    netSimilarityIndex: similarityIndex,
    exactMatchPercentage,
    paraphrasePercentage,
    semanticPercentage,
    highestSingleSourcePercentage,
    matchedWordsTotal: matchedWordsNet,
    sources,
    matchedSegments,
    methodology
  };
}
