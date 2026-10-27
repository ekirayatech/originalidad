import React, { useState, useEffect, useMemo } from 'react';
import {
  AnalysisSummary,
  MatchedSegment,
  AISentenceAnalysis
} from '../types';
import { EKIRAYA_CONFIG } from '../data/ekirayaConfig';
import {
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  Info,
  X,
  FileCheck,
  Cpu,
  Languages,
  Cloud,
  Check,
  ShieldCheck,
  CheckCircle2,
  Copy
} from 'lucide-react';

interface ReportViewerProps {
  analysis: AnalysisSummary;
  documentText: string;
  onSelectSource?: (sourceId: number) => void;
  targetSentenceId?: string | null;
  onAddToCorpus?: () => void;
  isAlreadyInCorpus?: boolean;
  onSaveToFirebase?: () => void;
  isSavedToFirebase?: boolean;
  isSavingToFirebase?: boolean;
  onOpenAuditModal?: () => void;
}

type LayerMode = 'all' | 'similarity' | 'ai' | 'plain';

export const ReportViewer: React.FC<ReportViewerProps> = ({
  analysis,
  documentText,
  onSelectSource,
  targetSentenceId,
  onAddToCorpus,
  isAlreadyInCorpus,
  onSaveToFirebase,
  isSavedToFirebase,
  isSavingToFirebase,
  onOpenAuditModal
}) => {
  const [activeLayer, setActiveLayer] = useState<LayerMode>('all');
  const [selectedSegment, setSelectedSegment] = useState<MatchedSegment | null>(null);
  const [selectedAISentence, setSelectedAISentence] = useState<AISentenceAnalysis | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  // Auto-select target sentence if passed from AI diagnostics panel
  useEffect(() => {
    if (targetSentenceId) {
      const found = analysis.aiSentences.find((s) => s.id === targetSentenceId);
      if (found) {
        setSelectedAISentence(found);
        setSelectedSegment(null);
        setTimeout(() => {
          const el = document.getElementById(`sentence-${found.id}`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    }
  }, [targetSentenceId, analysis.aiSentences]);

  // Group sentences into paragraphs robustly using exact offsets from aiSentences
  const paragraphsWithSentences = useMemo(() => {
    if (!analysis.aiSentences || analysis.aiSentences.length === 0) {
      return [];
    }

    const groups: {
      paraIndex: number;
      sentences: AISentenceAnalysis[];
    }[] = [];

    let currentGroup: AISentenceAnalysis[] = [];

    for (let i = 0; i < analysis.aiSentences.length; i++) {
      const s = analysis.aiSentences[i];
      currentGroup.push(s);

      // Check gap between this sentence and the next
      if (i < analysis.aiSentences.length - 1) {
        const nextS = analysis.aiSentences[i + 1];
        const gapText = documentText.substring(s.endIndex, nextS.startIndex);
        if (/\n\s*\n/.test(gapText) || (gapText.match(/\n/g) || []).length >= 2) {
          groups.push({
            paraIndex: groups.length,
            sentences: currentGroup,
          });
          currentGroup = [];
        }
      }
    }

    if (currentGroup.length > 0) {
      groups.push({
        paraIndex: groups.length,
        sentences: currentGroup,
      });
    }

    return groups;
  }, [analysis.aiSentences, documentText]);

  const flaggedAISentences = useMemo(() => {
    return analysis.aiSentences.filter((s) => s.isFlaggedAI);
  }, [analysis.aiSentences]);

  const activeSource = selectedSegment
    ? analysis.sources.find((s) => s.id === selectedSegment.sourceId)
    : null;

  const renderParagraphGroup = (sentences: AISentenceAnalysis[], paraIndex: number) => {
    return (
      <p key={paraIndex} className="text-slate-800 leading-relaxed text-sm sm:text-[15px] font-sans mb-5 relative">
        <span className="hidden sm:inline-block select-none w-8 -ml-9 text-slate-300 font-mono text-xs text-right pr-3">
          {paraIndex + 1}
        </span>
        {sentences.map((sAnalysis, sIdx) => {
          const isAI = sAnalysis.isFlaggedAI && (activeLayer === 'all' || activeLayer === 'ai');
          const matchSeg = analysis.matchedSegments.find(
            (m) =>
              (m.startIndex >= sAnalysis.startIndex && m.startIndex < sAnalysis.endIndex) ||
              (sAnalysis.startIndex >= m.startIndex && sAnalysis.startIndex < m.endIndex)
          );
          const isMatch = matchSeg && (activeLayer === 'all' || activeLayer === 'similarity');
          const isSelected = selectedAISentence?.id === sAnalysis.id || (selectedSegment && matchSeg?.id === selectedSegment.id);

          // Find source
          const source = isMatch ? analysis.sources.find((src) => src.id === matchSeg.sourceId) : null;
          const sourceColor = source ? source.color : '#DC2626';

          // Click handler
          const handleClick = () => {
            if (isMatch && matchSeg) {
              setSelectedSegment(matchSeg);
              setSelectedAISentence(null);
              if (onSelectSource) onSelectSource(matchSeg.sourceId);
            } else if (isAI) {
              setSelectedAISentence(sAnalysis);
              setSelectedSegment(null);
            }
          };

          let classes = 'transition-all cursor-pointer rounded-xs px-1 py-0.5 relative inline mx-0.5 ';

          if (activeLayer === 'ai' && !isAI) {
            // Dim non-AI text in pure AI layer
            classes += 'opacity-40 hover:opacity-90 text-slate-500 ';
          } else if (isMatch && isAI) {
            // Both match and AI
            classes += 'bg-amber-100/95 hover:bg-amber-200 border-b-2 border-dashed border-purple-600 text-slate-950 font-medium ';
          } else if (isMatch) {
            // Plagiarism / Similarity Match
            classes += 'hover:opacity-85 text-slate-900 ';
          } else if (isAI) {
            // AI Only - High visibility purple highlight
            classes += 'bg-purple-100/95 hover:bg-purple-200/95 text-purple-950 border-b-2 border-purple-600 font-medium ';
          } else {
            classes += 'hover:bg-slate-100 text-slate-800 ';
          }

          if (isSelected) {
            classes += ' ring-2 ring-purple-600 ring-offset-1 bg-purple-200/90 ';
          }

          return (
            <span
              key={sAnalysis.id || sIdx}
              id={`sentence-${sAnalysis.id}`}
              onClick={handleClick}
              className={classes}
              style={
                isMatch
                  ? {
                      backgroundColor: `${sourceColor}22`,
                      borderBottom: `2px solid ${sourceColor}`
                    }
                  : undefined
              }
            >
              {/* Source pill badge: [1], [2], etc. */}
              {isMatch && source && (
                <span
                  className="inline-flex items-center justify-center text-[10px] font-bold text-white px-1 py-0.2 mx-0.5 rounded-sm select-none shadow-2xs"
                  style={{ backgroundColor: sourceColor }}
                  title={`Fuente #${source.id}: ${source.sourceTitle}`}
                >
                  #{source.id}
                </span>
              )}

              {/* AI sparkle badge */}
              {isAI && (
                <span
                  className="inline-flex items-center gap-0.5 text-[10px] font-bold text-purple-900 bg-purple-200/90 border border-purple-300 px-1.5 py-0.2 mx-0.5 rounded-sm select-none shadow-2xs"
                  title={`Patrón sintético de IA detectado (${sAnalysis.aiProbability}% probabilidad)`}
                >
                  <Sparkles className="w-2.5 h-2.5 text-purple-700" />
                  IA {sAnalysis.aiProbability}%
                </span>
              )}

              <span>{sAnalysis.sentence}</span>{' '}
            </span>
          );
        })}
      </p>
    );
  };

  return (
    <div className="flex-1 bg-slate-100/80 p-2.5 sm:p-4 md:p-6 overflow-y-auto">
      {/* Top Toolbar */}
      <div className="max-w-4xl mx-auto mb-3 sm:mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">Capas:</span>
          </div>
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setActiveLayer('all')}
              className={`px-2 sm:px-2.5 py-1 rounded-md font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeLayer === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="hidden sm:inline">Todas las Capas</span>
              <span className="sm:hidden">Todas</span>
            </button>
            <button
              onClick={() => setActiveLayer('similarity')}
              className={`px-2 sm:px-2.5 py-1 rounded-md font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeLayer === 'similarity'
                  ? 'bg-white text-red-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="hidden sm:inline">Solo Similitud</span>
              <span className="sm:hidden">Similitud</span> ({analysis.similarityIndex}%)
            </button>
            <button
              onClick={() => setActiveLayer('ai')}
              className={`px-2 sm:px-2.5 py-1 rounded-md font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeLayer === 'ai'
                  ? 'bg-white text-purple-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="hidden sm:inline">Solo IA</span>
              <span className="sm:hidden">IA</span> ({analysis.aiWritingIndex}%)
            </button>
            <button
              onClick={() => setActiveLayer('plain')}
              className={`px-2 sm:px-2.5 py-1 rounded-md font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeLayer === 'plain'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="hidden sm:inline">Texto Limpio</span>
              <span className="sm:hidden">Limpio</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] sm:text-xs text-slate-500 flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-red-400 shrink-0"></span> Coincidencia de Fuente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-purple-300 shrink-0"></span> Patrón Sintético (IA)
          </span>
        </div>
      </div>

      {/* AI Sentences Quick Jump Bar */}
      {flaggedAISentences.length > 0 && (
        <div className="max-w-4xl mx-auto mb-3 sm:mb-4 bg-purple-50/90 border border-purple-200 rounded-xl p-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-purple-900 font-bold">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Ubicaciones con indicios de IA detectadas ({flaggedAISentences.length} oraciones):</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              {flaggedAISentences.map((s, idx) => {
                const isCurrent = selectedAISentence?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedAISentence(s);
                      setSelectedSegment(null);
                      const el = document.getElementById(`sentence-${s.id}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                      isCurrent
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-white text-purple-800 border border-purple-200 hover:bg-purple-100 hover:border-purple-300'
                    }`}
                    title={`Ir a la oración: "${s.sentence.substring(0, 70)}..."`}
                  >
                    <span>#{idx + 1}</span>
                    <span className="text-[10px] opacity-80">({s.aiProbability}%)</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Document Paper Sheet */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 sm:p-6 md:p-10 relative">
        {/* Active Layer Banner Notice */}
        {activeLayer === 'ai' && (
          <div className="mb-6 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between text-xs text-purple-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                <strong>Capa de Detección de IA Activa:</strong> Se resaltan en violeta las oraciones con patrones sintéticos algorítmicos. Haz clic en cualquiera para ver sus métricas y conectores.
              </span>
            </div>
            <span className="font-bold font-mono px-2 py-0.5 bg-purple-200 text-purple-900 rounded-md shrink-0">
              {flaggedAISentences.length} oraciones señaladas
            </span>
          </div>
        )}

        {/* Document Header in Sheet */}
        <div className="border-b border-slate-100 pb-4 sm:pb-6 mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <img
                src={EKIRAYA_CONFIG.logoUrl}
                alt="Colegio Bilingüe Ekirayá"
                className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800 block">
                  {EKIRAYA_CONFIG.institutionName}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {EKIRAYA_CONFIG.motto}
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-slate-400 font-mono">
              <span>ID: {analysis.documentId}</span>
              <span className="hidden sm:inline"> • {analysis.submissionDate}</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{analysis.title}</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-slate-500">
            <span>Autor: <strong className="text-slate-700">{analysis.author}</strong></span>
            <span>•</span>
            <span>Palabras: <strong className="text-slate-700">{analysis.totalWords}</strong></span>
            <span>•</span>
            <span>Oraciones: <strong className="text-slate-700">{analysis.totalSentences}</strong></span>
            {analysis.detectedLanguage && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-semibold text-blue-900 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                  <Languages className="w-3.5 h-3.5 text-blue-600" />
                  Idioma: {analysis.languageLabel || (analysis.detectedLanguage === 'es' ? 'Español' : analysis.detectedLanguage === 'fr' ? 'Français' : 'English')}
                </span>
              </>
            )}
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            {onAddToCorpus && (
              <button
                onClick={onAddToCorpus}
                disabled={isAlreadyInCorpus}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                  isAlreadyInCorpus
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default'
                    : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-300 cursor-pointer active:scale-95'
                }`}
                title={
                  isAlreadyInCorpus
                    ? 'Este documento está indexado en la base de datos de cotejo institucional CEM'
                    : 'Almacenar copia en la base de datos para contrastar contra próximas entregas'
                }
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>
                  {isAlreadyInCorpus
                    ? '✓ Indexado en Cotejo CEM'
                    : '+ Almacenar en Cotejo CEM'}
                </span>
              </button>
            )}

            {onSaveToFirebase && (
              <button
                onClick={onSaveToFirebase}
                disabled={isSavedToFirebase || isSavingToFirebase}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                  isSavedToFirebase
                    ? 'bg-indigo-50 text-indigo-800 border border-indigo-300 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white cursor-pointer'
                }`}
                title="Historial de evaluaciones de estudiantes y docentes en Firestore"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>
                  {isSavingToFirebase
                    ? 'Almacenando en Firestore...'
                    : isSavedToFirebase
                    ? '✓ Almacenado en Base de Datos'
                    : 'Almacenar en Base de Datos'}
                </span>
              </button>
            )}

            {onOpenAuditModal && (
              <button
                onClick={onOpenAuditModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-xs cursor-pointer active:scale-95 sm:ml-auto"
                title="Abrir panel de auditoría criptográfica SHA-256 e inmutabilidad"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Certificado de Integridad (SHA-256)</span>
              </button>
            )}
          </div>

          {/* Cryptographic Hash & Verified Badge */}
          <div className="mt-3.5 p-3 bg-gradient-to-r from-emerald-50/90 to-teal-50/70 border border-emerald-300/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 bg-emerald-200/90 border border-emerald-300 px-2 py-0.5 rounded-md">
                    ✓ VERIFICADO / VERIFIED
                  </span>
                  <span className="text-[11px] font-bold text-emerald-900">
                    Auditoría de Integridad Académica Ekirayá
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs text-slate-700 font-mono">
                  <span className="text-slate-500 font-sans text-[11px] shrink-0">Hash SHA-256:</span>
                  <span className="font-semibold text-emerald-950 break-all text-[11px]" title={analysis.documentHash}>
                    {analysis.documentHash}
                  </span>
                </div>
              </div>
            </div>

            {onOpenAuditModal && (
              <button
                onClick={onOpenAuditModal}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-bold underline decoration-emerald-500 underline-offset-2 shrink-0 cursor-pointer self-start md:self-center min-h-[36px] flex items-center"
              >
                Verificar Integridad →
              </button>
            )}
          </div>
        </div>

        {/* Document Body with Highlights */}
        <div className="pl-3 sm:pl-6 border-l border-slate-100">
          {paragraphsWithSentences.map((group) => renderParagraphGroup(group.sentences, group.paraIndex))}
        </div>

        {/* Selected Match Card Modal / Flyout */}
        {selectedSegment && activeSource && (
          <div className="sticky bottom-3 sm:bottom-4 mt-6 sm:mt-8 bg-slate-900 text-white rounded-xl p-3 sm:p-4 shadow-2xl border border-slate-700 max-h-[60vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0"
                  style={{ backgroundColor: activeSource.color }}
                >
                  #{activeSource.id}
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-white">{activeSource.sourceTitle}</h4>
                    {selectedSegment.matchType === 'exact' && (
                      <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        Coincidencia Exacta
                      </span>
                    )}
                    {selectedSegment.matchType === 'paraphrase' && (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        Paráfrasis Detectada
                      </span>
                    )}
                    {selectedSegment.matchType === 'semantic' && (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        Similitud Semántica
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {activeSource.sourceAuthor} {activeSource.publicationYear ? `(${activeSource.publicationYear})` : ''} • {activeSource.sourceUrl || activeSource.sourceType}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSegment(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Side by side match comparison */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="font-semibold text-amber-400 uppercase text-[10px] tracking-wider block mb-1">
                  Texto Analizado (Párrafo {selectedSegment.paragraphIndex || '1'} • Oración #{selectedSegment.sentenceIndex || '1'}):
                </span>
                <p className="text-slate-200 italic line-clamp-3">"{selectedSegment.text}"</p>
              </div>

              <div>
                <span className="font-semibold text-sky-400 uppercase text-[10px] tracking-wider block mb-1">
                  Fragmento en la Fuente ({activeSource.sourceType}):
                </span>
                <p className="text-slate-300 line-clamp-3">
                  "{selectedSegment.sourceExcerpt || activeSource.sampleExcerpt}"
                </p>
              </div>
            </div>

            {/* Colombian Law Assessment & Technical Coordinates */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Ley 23 de 1982 (Art. 31):</strong>{' '}
                  {selectedSegment.isQuote
                    ? 'Cita formal entrecomillada. Requiere verificar mención expresa de autor y título.'
                    : 'Coincidencia literal sin comillas. Posible transcripción no citada.'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                {activeSource.accessDate && (
                  <span className="text-slate-400 font-sans text-[10px]">
                    Consultado: {activeSource.accessDate}
                  </span>
                )}
                <span>
                  Coincidencia: <span className="text-emerald-400 font-bold">{selectedSegment.similarityScore}%</span> ({selectedSegment.wordCount} palabras)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Selected AI Sentence Card */}
        {selectedAISentence && (
          <div className="sticky bottom-4 mt-8 bg-purple-950 text-white rounded-xl p-4 shadow-2xl border border-purple-800 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-purple-100">
                    Patrón Generado por Inteligencia Artificial ({selectedAISentence.aiProbability}% Probabilidad)
                  </h4>
                  <p className="text-xs text-purple-300">
                    Perplejidad sintáctica: <strong className="text-white">{selectedAISentence.perplexityScore}/100</strong> (Previsibilidad algorítmica alta)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAISentence(null)}
                className="text-purple-300 hover:text-white p-1 rounded-md hover:bg-purple-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 bg-purple-900/60 p-3 rounded-lg border border-purple-800 text-xs">
              <span className="font-semibold text-purple-300 uppercase text-[10px] tracking-wider block mb-1">
                Oración Señalada:
              </span>
              <p className="text-white font-medium italic">"{selectedAISentence.sentence}"</p>

              {selectedAISentence.detectedMarkers.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-2 border-t border-purple-800/60">
                  <span className="text-[11px] text-purple-300">Conectores artificiales detectados:</span>
                  {selectedAISentence.detectedMarkers.map((marker, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-purple-800 text-purple-200 text-[10px] font-mono border border-purple-700"
                    >
                      "{marker}"
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-purple-200 pt-2 border-t border-purple-800/60">
              <Info className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                <strong>Orientación Formativa (UNESCO / MEN):</strong> Este indicador sugiere que la frase fue estructurada mediante asistencia algorítmica. No implica automáticamente una falta disciplinaria; se aconseja indagar en entrevista pedagógica.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
