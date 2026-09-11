import React from 'react';
import { SourceMatch, AnalysisFilters } from '../types';
import {
  ListFilter,
  SlidersHorizontal,
  ExternalLink,
  BookOpen,
  Scale,
  GraduationCap,
  Globe,
  FileCode
} from 'lucide-react';

interface SourcesPanelProps {
  sources: SourceMatch[];
  similarityIndex: number;
  totalWords: number;
  activeSourceId: number | null;
  onSelectSource: (sourceId: number) => void;
  filters: AnalysisFilters;
  onUpdateFilters: (newFilters: Partial<AnalysisFilters>) => void;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({
  sources,
  similarityIndex,
  totalWords,
  activeSourceId,
  onSelectSource,
  filters,
  onUpdateFilters
}) => {
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
            <ListFilter className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-sm text-slate-900">Fuentes Coincidentes</h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            {sources.length} {sources.length === 1 ? 'fuente' : 'fuentes'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Desglose porcentual ponderado del total de {totalWords} palabras
        </p>
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
              className="rounded-xs text-red-600 focus:ring-red-500 w-3.5 h-3.5"
            />
            <span>Excluir Citas entre comillas ("...")</span>
          </label>

          <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.excludeBibliography}
              onChange={(e) => onUpdateFilters({ excludeBibliography: e.target.checked })}
              className="rounded-xs text-red-600 focus:ring-red-500 w-3.5 h-3.5"
            />
            <span>Excluir Sección Bibliografía / Referencias</span>
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
                    ? 'border-slate-800 bg-slate-50/90 shadow-xs ring-1 ring-slate-800'
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

                {/* Words count */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{source.matchedWords} palabras coincidentes</span>
                  <span className="text-blue-600 font-medium hover:underline">Ver en documento</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
