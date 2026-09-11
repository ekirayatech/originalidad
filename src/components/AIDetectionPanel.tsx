import React, { useState } from 'react';
import { AnalysisSummary } from '../types';
import {
  Sparkles,
  AlertCircle,
  Scale,
  BrainCircuit,
  Activity,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface AIDetectionPanelProps {
  analysis: AnalysisSummary;
  onNavigateToSentence?: (sentenceId: string) => void;
}

export const AIDetectionPanel: React.FC<AIDetectionPanelProps> = ({ analysis, onNavigateToSentence }) => {
  const [filterMode, setFilterMode] = useState<'all_flagged' | 'high' | 'all'>('all_flagged');
  const [searchQuery, setSearchQuery] = useState('');

  const flaggedSentences = analysis.aiSentences.filter((s) => s.isFlaggedAI);

  const displayedSentences = analysis.aiSentences.filter((s) => {
    // Mode filter
    if (filterMode === 'all_flagged' && !s.isFlaggedAI) return false;
    if (filterMode === 'high' && s.aiProbability < 70) return false;

    // Text search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSentence = s.sentence.toLowerCase().includes(q);
      const matchesMarker = s.detectedMarkers.some((m) => m.toLowerCase().includes(q));
      return matchesSentence || matchesMarker;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs max-w-4xl mx-auto my-4 sm:my-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              Diagnóstico de Inteligencia Artificial (LLM)
            </h3>
            <p className="text-xs text-slate-500">
              Análisis estadístico y estilométrico de modelos de lenguaje (GPT-4, Claude, Gemini)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
            {analysis.aiWritingIndex}%
          </span>
          <span className="text-xs text-slate-500 leading-tight">
            Probabilidad global<br />estimada
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Burstiness */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Varianza Sintáctica (Burstiness)
            </span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {analysis.burstinessScore}<span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {analysis.burstinessScore < 25
              ? 'Longitud de oraciones muy uniforme (Típico de modelos sintéticos)'
              : analysis.burstinessScore < 50
              ? 'Variabilidad moderada (Prosa estructurada)'
              : 'Alta variabilidad rítmica (Característica natural de redacción humana)'}
          </p>
        </div>

        {/* Metric 2: Perplexity */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Perplejidad Léxica
            </span>
            <BrainCircuit className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {analysis.averagePerplexity}<span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {analysis.averagePerplexity < 35
              ? 'Baja perplejidad: oraciones altamente predecibles para un LLM'
              : analysis.averagePerplexity < 65
              ? 'Perplejidad media: vocabulario estándar académico'
              : 'Alta perplejidad: construcciones léxicas complejas y originales'}
          </p>
        </div>

        {/* Metric 3: Flagged Sentences */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Oraciones Señaladas
            </span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {analysis.aiFlaggedSentencesCount} <span className="text-xs font-normal text-slate-400">de {analysis.totalSentences}</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {analysis.totalSentences > 0
              ? `${Math.round((analysis.aiFlaggedSentencesCount / analysis.totalSentences) * 100)}% del texto presenta patrones de lenguaje asistido`
              : 'Sin oraciones evaluadas'}
          </p>
        </div>
      </div>

      {/* Synthetic Formulaic Connectors List */}
      <div>
        <h4 className="font-semibold text-xs text-slate-700 uppercase tracking-wider mb-3">
          Patrones y Conectores Cliché de IA Detectados en el Escrito:
        </h4>

        {analysis.detectedAIMarkersList.length === 0 ? (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No se detectaron conectores artificiales recurrentes. La prosa mantiene giros idiomáticos variados y naturales.</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {analysis.detectedAIMarkersList.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-xs font-medium text-purple-900"
              >
                <span className="font-mono italic font-semibold">"{item.marker}"</span>
                <span className="bg-purple-200/70 text-purple-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {item.occurrences} {item.occurrences === 1 ? 'vez' : 'veces'}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* DETAILED SENTENCE INVENTORY / LOCATIONS SECTION */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Ubicaciones y Oraciones con Coincidencia de Uso de LLM
            </h4>
            <p className="text-xs text-slate-500">
              Desglose detallado oración por oración con probabilidad sintética estimada y marcadores específicos
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setFilterMode('all_flagged')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterMode === 'all_flagged'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Señaladas ({flaggedSentences.length})
            </button>
            <button
              onClick={() => setFilterMode('high')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterMode === 'high'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Alta Probabilidad &gt;70%
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todas ({analysis.totalSentences})
            </button>
          </div>
        </div>

        {/* Search bar inside sentences list */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por fragmento de texto o conector de IA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
          />
        </div>

        {/* List of Sentences */}
        {displayedSentences.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            No se encontraron oraciones que coincidan con los filtros seleccionados.
          </div>
        ) : (
          <div className="space-y-3">
            {displayedSentences.map((s, idx) => {
              const originalIndex = analysis.aiSentences.findIndex((item) => item.id === s.id);
              const isHigh = s.aiProbability >= 70;
              const isMedium = s.aiProbability >= 40 && s.aiProbability < 70;

              return (
                <div
                  key={s.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    s.isFlaggedAI
                      ? 'bg-purple-50/60 border-purple-200 hover:border-purple-300'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-600 px-2 py-0.5 bg-white border border-slate-200 rounded-md">
                        Oración #{originalIndex + 1}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isHigh
                            ? 'bg-purple-200 text-purple-900 border border-purple-300'
                            : isMedium
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-purple-700" />
                        {s.aiProbability}% Probabilidad IA
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Perplejidad: {s.perplexityScore}/100
                      </span>
                    </div>

                    {onNavigateToSentence && (
                      <button
                        onClick={() => onNavigateToSentence(s.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline cursor-pointer"
                      >
                        <span>Ver en Documento</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Sentence Excerpt */}
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans bg-white p-2.5 rounded-lg border border-slate-200/80">
                    "{s.sentence}"
                  </p>

                  {/* Detected Markers in this sentence */}
                  {s.detectedMarkers.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[11px] font-semibold text-slate-500">Conectores identificados:</span>
                      {s.detectedMarkers.map((marker, mIdx) => (
                        <span
                          key={mIdx}
                          className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 text-[10px] font-mono border border-purple-200 font-medium"
                        >
                          "{marker}"
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ethical and Legal Warning (MEN Colombia & UNESCO) */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <Scale className="w-4 h-4 text-amber-600" />
          <span>Advertencia Ética y Pedagógica (Lineamientos MEN Colombia y UNESCO 2023):</span>
        </div>
        <p className="leading-relaxed">
          Los detectores de IA son modelos probabilísticos de orientación diagnóstica y <strong>nunca deben utilizarse como base única para imputar faltas disciplinarias o plagio</strong>. Conforme al principio de presunción de inocencia y las directivas del Ministerio de Educación Nacional de Colombia, cualquier indicio debe someterse a una revisión pedagógica formativa, permitiendo al estudiante explicar su proceso de investigación y fuentes de referencia.
        </p>
      </div>
    </div>
  );
};
