export type FunnelColor = 'blue' | 'green' | 'yellow' | 'orange' | 'red';

export type SupportedLanguage = 'es' | 'en' | 'fr';

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
  similarityIndex: number; // 0 to 100
  similarityColor: FunnelColor;
  similarityFunnelLabel: string;
  matchedWordsTotal: number;
  sources: SourceMatch[];
  matchedSegments: MatchedSegment[];

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
