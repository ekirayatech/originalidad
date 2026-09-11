import React, { useState } from 'react';
import {
  AnalysisSummary,
  MatchedSegment,
  AISentenceAnalysis
} from '../types';
import {
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  Info,
  X,
  FileCheck,
  Cpu,
  Languages
} from 'lucide-react';

interface ReportViewerProps {
  analysis: AnalysisSummary;
  documentText: string;
  onSelectSource?: (sourceId: number) => void;
}

type LayerMode = 'all' | 'similarity' | 'ai' | 'plain';

export const ReportViewer: React.FC<ReportViewerProps> = ({
  analysis,
  documentText,
  onSelectSource
}) => {
  const [activeLayer, setActiveLayer] = useState<LayerMode>('all');
  const [selectedSegment, setSelectedSegment] = useState<MatchedSegment | null>(null);
  const [selectedAISentence, setSelectedAISentence] = useState<AISentenceAnalysis | null>(null);

  // Split document into paragraphs for pristine reading
  const paragraphs = documentText.split(/\n\n+/);

  // Find matches and AI flags for a given paragraph text offset
  const getRenderedParagraph = (para: string, paraIndex: number) => {
    // Find absolute start index of this paragraph in the document
    // We can locate it by indexOf or tracking offset
    const paraStart = documentText.indexOf(para);
    const paraEnd = paraStart + para.length;

    // Filter sentences in this paragraph
    const pAiSentences = analysis.aiSentences.filter(
      (s) => s.startIndex >= paraStart && s.endIndex <= paraEnd
    );

    return (
      <p key={paraIndex} className="text-slate-800 leading-relaxed text-sm sm:text-[15px] font-sans mb-4 relative">
        <span className="hidden sm:inline-block select-none w-8 -ml-9 text-slate-300 font-mono text-xs text-right pr-3">
          {paraIndex + 1}
        </span>
        {pAiSentences.length === 0 ? (
          <span>{para}</span>
        ) : (
          pAiSentences.map((sAnalysis, sIdx) => {
            const isAI = sAnalysis.isFlaggedAI && (activeLayer === 'all' || activeLayer === 'ai');
            const matchSeg = analysis.matchedSegments.find(
              (m) =>
                (m.startIndex >= sAnalysis.startIndex && m.startIndex < sAnalysis.endIndex) ||
                (sAnalysis.startIndex >= m.startIndex && sAnalysis.startIndex < m.endIndex)
            );
            const isMatch = matchSeg && (activeLayer === 'all' || activeLayer === 'similarity');

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

            let classes = 'transition-colors cursor-pointer rounded-xs px-0.5 relative inline ';

            if (isMatch && isAI) {
              // Both match and AI
              classes += 'bg-amber-100/90 hover:bg-amber-200 border-b-2 border-dashed border-purple-600 text-slate-900';
            } else if (isMatch) {
              // Plagiarism / Similarity Match
              classes += 'hover:opacity-85 text-slate-900 ';
            } else if (isAI) {
              // AI Only
              classes += 'bg-purple-100 hover:bg-purple-200/90 text-purple-950 border-b-2 border-dotted border-purple-500';
            } else {
              classes += 'hover:bg-slate-100';
            }

            return (
              <span
                key={sIdx}
                onClick={handleClick}
                className={classes}
                style={
                  isMatch
                    ? {
                        backgroundColor: `${sourceColor}22`, // 14% opacity tint
                        borderBottom: `2px solid ${sourceColor}`
                      }
                    : undefined
                }
              >
                {/* Source pill badge: [1], [2], etc. */}
                {isMatch && source && (
                  <span
                    className="inline-flex items-center justify-center text-[10px] font-bold text-white px-1 py-0.2 mx-0.5 rounded-sm select-none"
                    style={{ backgroundColor: sourceColor }}
                    title={`Fuente #${source.id}: ${source.sourceTitle}`}
                  >
                    {source.id}
                  </span>
                )}

                {/* AI sparkle badge */}
                {isAI && !isMatch && (
                  <span className="inline-flex items-center text-[10px] font-semibold text-purple-700 bg-purple-200/80 px-1 py-0.2 mx-0.5 rounded-sm select-none">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                    IA
                  </span>
                )}

                <span>{sAnalysis.sentence}</span>{' '}
              </span>
            );
          })
        )}
      </p>
    );
  };

  const activeSource = selectedSegment
    ? analysis.sources.find((s) => s.id === selectedSegment.sourceId)
    : null;

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

      {/* Main Document Paper Sheet */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-8 md:p-12 relative">
        {/* Document Header in Sheet */}
        <div className="border-b border-slate-100 pb-4 sm:pb-6 mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs text-slate-400 font-mono mb-2">
            <span className="font-semibold text-slate-600">COLEGIO BILINGÜE EKIRAYÁ</span>
            <span>ID: {analysis.documentId} • {analysis.submissionDate}</span>
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
        </div>

        {/* Document Body with Highlights */}
        <div className="pl-3 sm:pl-6 border-l border-slate-100">
          {paragraphs.map((para, idx) => getRenderedParagraph(para, idx))}
        </div>

        {/* Selected Match Card Modal / Flyout */}
        {selectedSegment && activeSource && (
          <div className="sticky bottom-3 sm:bottom-4 mt-6 sm:mt-8 bg-slate-900 text-white rounded-xl p-3 sm:p-4 shadow-2xl border border-slate-700 max-h-[60vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs text-white shadow-xs"
                  style={{ backgroundColor: activeSource.color }}
                >
                  #{activeSource.id}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-white">{activeSource.sourceTitle}</h4>
                  <p className="text-xs text-slate-300">
                    {activeSource.sourceAuthor} {activeSource.publicationYear ? `(${activeSource.publicationYear})` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSegment(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Side by side match comparison */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="font-semibold text-amber-400 uppercase text-[10px] tracking-wider block mb-1">
                  Texto del Estudiante:
                </span>
                <p className="text-slate-200 italic line-clamp-3">"{selectedSegment.text}"</p>
              </div>

              <div>
                <span className="font-semibold text-sky-400 uppercase text-[10px] tracking-wider block mb-1">
                  Fragmento Original en la Fuente ({activeSource.sourceType}):
                </span>
                <p className="text-slate-300 line-clamp-3">"{activeSource.sampleExcerpt}"</p>
              </div>
            </div>

            {/* Colombian Law Assessment */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  <strong>Ley 23 de 1982 (Art. 31):</strong>{' '}
                  {selectedSegment.isQuote
                    ? 'Cita formal entrecomillada. Requiere verificar mención expresa de autor y título.'
                    : 'Coincidencia literal sin comillas. Posible transcripción no citada.'}
                </span>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Coincidencia: <span className="text-emerald-400 font-bold">{selectedSegment.similarityScore}%</span> ({selectedSegment.wordCount} palabras)
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
