export type FunnelColor = 'blue' | 'green' | 'yellow' | 'orange' | 'red';

export type SupportedLanguage = 'es' | 'en' | 'fr';

export type SimilarityMatchType = 'exact' | 'paraphrase' | 'semantic';

export interface SourceMatch {
  id: number;
  sourceTitle: string;
  sourceAuthor: string;
  sourceType: 'academic_journal' | 'institutional_repository' | 'open_web' | 'student_paper' | 'legal_statute';
  sourceUrl?: string;
  publicationYear?: number;
  percentage: number;
  matchedWords: number;
  color: string; // Hex color for the source highlight badge (e.g., red, navy, teal, orange, etc.)
  sampleExcerpt: string;
  accessDate?: string;
  exactMatchesCount?: number;
  paraphraseMatchesCount?: number;
  semanticMatchesCount?: number;
  maxSegmentScore?: number;
}

export interface MatchedSegment {
  id: string;
  startIndex: number;
  endIndex: number;
  text: string;
  sourceId: number;
  sourceTitle: string;
  similarityScore: number;
  isQuote: boolean;
  isBibliography: boolean;
  wordCount: number;
  matchType?: SimilarityMatchType;
  sourceExcerpt?: string;
  sourceUrl?: string;
  paragraphIndex?: number;
  sentenceIndex?: number;
  verificationStatus?: 'verified' | 'suspected' | 'reviewed';
}

export interface AISentenceAnalysis {
  id: string;
  startIndex: number;
  endIndex: number;
  sentence: string;
  aiProbability: number; // 0 to 100
  perplexityScore: number; // Low perplexity = predictable = AI
  burstinessScore: number; // Low variation = AI
  detectedMarkers: string[];
  isFlaggedAI: boolean;
}

export interface AnalysisFilters {
  excludeQuotes: boolean;
  excludeBibliography: boolean;
  minWordCountThreshold: number; // default e.g. 8 words
  excludeCommonPhrases?: boolean;
}

export interface AnalysisSummary {
  documentId: string;
  title: string;
  author: string;
  submissionDate: string;
  totalWords: number;
  totalCharacters: number;
  totalSentences: number;
  
  // Multilingual Metadata
  detectedLanguage: SupportedLanguage;
  languageLabel: string;
  
  // Similarity Metrics (Institutional Scale)
  similarityIndex: number; // 0 to 100 (net similarity after applied filters)
  grossSimilarityIndex?: number; // 0 to 100 (raw similarity before exclusions)
  netSimilarityIndex?: number;
  exactMatchPercentage?: number;
  paraphrasePercentage?: number;
  semanticPercentage?: number;
  highestSingleSourcePercentage?: number;
  similarityColor: FunnelColor;
  similarityFunnelLabel: string;
  matchedWordsTotal: number;
  sources: SourceMatch[];
  matchedSegments: MatchedSegment[];
  similarityMethodology?: string;

  // AI Detection Metrics
  aiWritingIndex: number; // 0 to 100
  aiFlaggedSentencesCount: number;
  aiSentences: AISentenceAnalysis[];
  averagePerplexity: number;
  burstinessScore: number;
  detectedAIMarkersList: { marker: string; occurrences: number }[];

  // Execution
  executionTimeMs: number;
  activeFilters: AnalysisFilters;

  // Cryptographic Audit & Integrity
  documentHash: string; // 64-char Hex SHA-256 cryptographic signature
  contentHash: string; // 64-char Hex SHA-256 hash of document raw text
  verificationTimestamp: string; // Timestamp when hash was certified
  isVerified: boolean; // Integrity verification status for academic audits
  auditCertificateId: string; // Unique institutional audit ID

  // Citation & Reference Verification (APA / Standard Academic Verification)
  citationAnalysis?: CitationAnalysisSummary;
}

export interface BibliographicReference {
  id: string;
  rawText: string;
  authorLabel: string;
  year?: string;
  titleSnippet?: string;
  doiOrUrl?: string;
  citationCountInText: number;
  isOrphan: boolean;
  status: 'verified' | 'orphan' | 'incomplete';
}

export interface InTextCitation {
  id: string;
  rawText: string;
  authorKey: string;
  year?: string;
  startIndex: number;
  endIndex: number;
  hasMatchingReference: boolean;
  citationType: 'parenthetical' | 'narrative' | 'numeric';
}

export interface CitationAnalysisSummary {
  totalReferencesFound: number;
  totalInTextCitationsFound: number;
  matchedCitationsCount: number;
  orphanReferencesCount: number;
  unreferencedCitationsCount: number;
  detectedStyle: 'APA / Autor-Año' | 'IEEE / Numérico' | 'Estándar Académico';
  citationHealthScore: number;
  references: BibliographicReference[];
  inTextCitations: InTextCitation[];
}

export interface ReferenceDocument {
  id: string;
  title: string;
  author: string;
  type: 'academic_journal' | 'institutional_repository' | 'open_web' | 'student_paper' | 'legal_statute';
  year: number;
  content: string;
  institutionOrJournal?: string;
  language?: SupportedLanguage;
  isCustomUploaded?: boolean;
}

export interface LegalRegulation {
  id: string;
  jurisdiction: 'Colombia' | 'Internacional';
  normName: string;
  authority: string;
  keyArticles: string;
  complianceReason: string;
  relevanceToOriginalityAndAI: string;
}

export type InstitutionalUserRole = 'docente' | 'estudiante' | 'admin';

export interface InstitutionalUser {
  id: string;
  nombre: string;
  apellido: string;
  displayName: string;
  taller: string;
  contrasena: string;
  rol: InstitutionalUserRole;
  email: string;
  createdAt: string;
  createdBy?: string;
  uid?: string;
}
