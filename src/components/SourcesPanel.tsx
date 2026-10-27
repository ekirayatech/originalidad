import React, { useState } from 'react';
import { SourceMatch, AnalysisFilters } from '../types';
import {
  ListFilter,
  SlidersHorizontal,
  BookOpen,
  Scale,
  GraduationCap,
  Globe,
  Info,
  Layers,
  Sparkles,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface SourcesPanelProps {
  sources: SourceMatch[];
  similarityIndex: number;
  totalWords: number;
  activeSourceId: number | null;
  onSelectSource: (sourceId: number) => void;
  filters: AnalysisFilters;
  onUpdateFilters: (newFilters: Partial<AnalysisFilters>) => void;
  grossSimilarityIndex?: number;
  exactMatchPercentage?: number;
  paraphrasePercentage?: number;
  semanticPercentage?: number;
  similarityMethodology?: string;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({
  sources,
  similarityIndex,
  totalWords,
  activeSourceId,
  onSelectSource,
  filters,
  onUpdateFilters,
  grossSimilarityIndex,
  exactMatchPercentage = 0,
  paraphrasePercentage = 0,
  semanticPercentage = 0,
  similarityMethodology
}) => {
  const [showMethodology, setShowMethodology] = useState(false);

  const getSourceIcon = (type: SourceMatch['sourceType']) => {
    switch (type) {
      case 'legal_statute':
        return <Scale className="w-4 h-4 text-amber-600" />;
      case 'institutional_repository':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'academic_journal':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      default:
        return <Globe className="w-4 h-4 text-slate-500" />;
    }
  };

  const getSourceTypeLabel = (type: SourceMatch['sourceType']) => {
    switch (type) {
      case 'legal_statute':
        return 'Estatuto Legal / Ley';
      case 'institutional_repository':
        return 'Repositorio Universitario';
      case 'academic_journal':
        return 'Revista Indexada (SciELO/Redalyc)';
      case 'student_paper':
        return 'Trabajo de Estudiante';
      default:
        return 'Publicación Web Abierta';
    }
  };

  return (
    <aside className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-full shadow-xs shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-sky-700" />
            <h3 className="font-bold text-sm text-slate-900">Motor de Similitud</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowMethodology(!showMethodology)}
              className="text-[11px] text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              title="Ver metodología de las 4 técnicas de similitud"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Metodología</span>
            </button>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
              {sources.length} {sources.length === 1 ? 'fuente' : 'fuentes'}
            </span>
          </div>
        </div>

        {/* Multi-technique Breakdown Bar */}
        <div className="mt-3 pt-3 border-t border-slate-200/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700">Similitud Neta:</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {similarityIndex}%
              {grossSimilarityIndex !== undefined && grossSimilarityIndex !== similarityIndex && (
                <span className="text-[11px] font-normal text-slate-400 ml-1">
                  (Bruta: {grossSimilarityIndex}%)
                </span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-semibold">
            <div className="bg-sky-50 border border-sky-200 text-sky-800 rounded px-1 py-1">
              <span className="block text-slate-500 font-normal">Exacta</span>
              <span className="font-bold">{exactMatchPercentage}%</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded px-1 py-1">
              <span className="block text-slate-500 font-normal">Paráfrasis</span>
              <span className="font-bold">{paraphrasePercentage}%</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded px-1 py-1">
              <span className="block text-slate-500 font-normal">Semántica</span>
              <span className="font-bold">{semanticPercentage}%</span>
            </div>
          </div>
        </div>

        {showMethodology && (
          <div className="mt-2.5 p-2.5 bg-sky-50 border border-sky-200 rounded-lg text-[11px] text-sky-950 leading-relaxed animate-in fade-in">
            <div className="font-bold flex items-center gap-1 text-sky-900 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-700" />
              <span>4 Técnicas Independientes Veritas Academic</span>
            </div>
            <p className="text-[10px] text-sky-900">
              1. <strong>Rolling n-grams:</strong> Shingling exacto para detectar citas literales sin atribución.
              <br />
              2. <strong>BM25 Okapi:</strong> Recuperación ponderada sobre corpus universitario y cotejo.
              <br />
              3. <strong>Vectores TF-IDF:</strong> Similitud semántica con normalización de rareza léxica.
              <br />
              4. <strong>Reranker de paráfrasis:</strong> Análisis Jaccard y contención de proposiciones sintácticas.
            </p>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-3 bg-slate-100/70 border-b border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-2">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filtros Dinámicos de Exclusión:</span>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.excludeQuotes}
              onChange={(e) => onUpdateFilters({ excludeQuotes: e.target.checked })}
              className="rounded-xs text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
            />
            <span>Excluir Citas entre comillas ("...")</span>
          </label>

          <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.excludeBibliography}
              onChange={(e) => onUpdateFilters({ excludeBibliography: e.target.checked })}
              className="rounded-xs text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
            />
            <span>Excluir Sección Bibliografía / Referencias</span>
          </label>

          <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.excludeCommonPhrases || false}
              onChange={(e) => onUpdateFilters({ excludeCommonPhrases: e.target.checked })}
              className="rounded-xs text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
            />
            <span>Excluir fórmulas y expresiones académicas frecuentes</span>
          </label>

          <div className="pt-1 flex items-center justify-between text-slate-600">
            <span>Umbral mínimo de coincidencia:</span>
            <select
              value={filters.minWordCountThreshold}
              onChange={(e) => onUpdateFilters({ minWordCountThreshold: Number(e.target.value) })}
              className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-800 font-medium"
            >
              <option value={5}>5 palabras</option>
              <option value={8}>8 palabras (Recomendado)</option>
              <option value={12}>12 palabras</option>
              <option value={16}>16 palabras</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {sources.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">Sin coincidencias</h4>
            <p className="text-xs text-slate-500 mt-1">
              No se detectaron fragmentos de fuentes conocidas con los filtros actuales.
            </p>
          </div>
        ) : (
          sources.map((source) => {
            const isSelected = activeSourceId === source.id;
            return (
              <div
                key={source.id}
                onClick={() => onSelectSource(source.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-sky-800 bg-sky-50/70 shadow-xs ring-1 ring-sky-800'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {/* Source top info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0"
                      style={{ backgroundColor: source.color }}
                    >
                      {source.id}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                      {getSourceIcon(source.sourceType)}
                      {getSourceTypeLabel(source.sourceType)}
                    </span>
                  </div>

                  <span className="font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    {source.percentage}%
                  </span>
                </div>

                {/* Title and Author */}
                <h4 className="font-semibold text-xs text-slate-900 mt-2 line-clamp-2 leading-tight">
                  {source.sourceTitle}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {source.sourceAuthor} {source.publicationYear ? `(${source.publicationYear})` : ''}
                </p>

                {/* Institution or repo */}
                {source.sourceUrl && (
                  <p className="text-[10px] text-slate-400 font-mono mt-1 truncate">
                    {source.sourceUrl}
                  </p>
                )}

                {/* Match Type Counts Breakdown */}
                {(source.exactMatchesCount !== undefined ||
                  source.paraphraseMatchesCount !== undefined ||
                  source.semanticMatchesCount !== undefined) && (
                  <div className="mt-2 flex items-center gap-1.5 text-[9px] font-semibold">
                    {source.exactMatchesCount ? (
                      <span className="bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">
                        {source.exactMatchesCount} exacta{source.exactMatchesCount > 1 ? 's' : ''}
                      </span>
                    ) : null}
                    {source.paraphraseMatchesCount ? (
                      <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                        {source.paraphraseMatchesCount} paráfrasis
                      </span>
                    ) : null}
                    {source.semanticMatchesCount ? (
                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        {source.semanticMatchesCount} semántica{source.semanticMatchesCount > 1 ? 's' : ''}
                      </span>
                    ) : null}
                  </div>
                )}

                {/* Words count and date */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{source.matchedWords} palabras</span>
                  {source.accessDate && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {source.accessDate}
                    </span>
                  )}
                  <span className="text-sky-600 font-medium hover:underline">Ver en texto</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
