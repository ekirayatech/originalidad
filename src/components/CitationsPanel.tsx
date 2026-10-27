import React, { useState } from 'react';
import { CitationAnalysisSummary } from '../types';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  Layers,
  Sparkles,
  Link2,
  BookmarkCheck,
  Search,
  Quote
} from 'lucide-react';

interface CitationsPanelProps {
  citationAnalysis?: CitationAnalysisSummary;
}

export const CitationsPanel: React.FC<CitationsPanelProps> = ({ citationAnalysis }) => {
  const [activeTab, setActiveTab] = useState<'references' | 'in_text'>('references');
  const [searchFilter, setSearchFilter] = useState('');

  if (!citationAnalysis) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-700">Sin datos de bibliografía</h3>
        <p className="text-xs text-slate-400 mt-1">
          No se detectaron referencias bibliográficas o citas en el texto analizado.
        </p>
      </div>
    );
  }

  const {
    totalReferencesFound,
    totalInTextCitationsFound,
    matchedCitationsCount,
    orphanReferencesCount,
    unreferencedCitationsCount,
    detectedStyle,
    citationHealthScore,
    references,
    inTextCitations
  } = citationAnalysis;

  const filteredReferences = references.filter((r) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return r.rawText.toLowerCase().includes(q) || r.authorLabel.toLowerCase().includes(q);
  });

  const filteredCitations = inTextCitations.filter((c) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return c.rawText.toLowerCase().includes(q) || c.authorKey.toLowerCase().includes(q);
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Score */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Salud Bibliográfica
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-slate-900">{citationHealthScore}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Estilo: <strong className="text-slate-700">{detectedStyle}</strong>
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold text-sm ${getScoreColor(citationHealthScore)}`}>
            {citationHealthScore}%
          </div>
        </div>

        {/* Card 2: References Count */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Referencias en Bibliografía
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{totalReferencesFound}</span>
            <span className="text-xs text-slate-500">fuentes listadas</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            {orphanReferencesCount === 0 ? (
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Todas citadas en texto
              </span>
            ) : (
              <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {orphanReferencesCount} huérfanas (no citadas)
              </span>
            )}
          </div>
        </div>

        {/* Card 3: In-Text Citations */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Citas en el Cuerpo
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{totalInTextCitationsFound}</span>
            <span className="text-xs text-slate-500">menciones en texto</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <BookmarkCheck className="w-3 h-3" /> {matchedCitationsCount} vinculadas a bibliografía
            </span>
          </div>
        </div>

        {/* Card 4: Discrepancies */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Discrepancias / Faltantes
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-black ${unreferencedCitationsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {unreferencedCitationsCount}
            </span>
            <span className="text-xs text-slate-500">citas sin entrada</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {unreferencedCitationsCount > 0
              ? 'Se citan autores que no aparecen en la lista final'
              : 'Correspondencia bibliográfica coherente'}
          </span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('references')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'references'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Bibliografía ({references.length})
            </button>
            <button
              onClick={() => setActiveTab('in_text')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'in_text'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Citas en el Texto ({inTextCitations.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filtrar por autor o texto..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Tab 1: References List */}
        {activeTab === 'references' && (
          <div className="divide-y divide-slate-100">
            {filteredReferences.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No se encontraron referencias que coincidan con la búsqueda.
              </div>
            ) : (
              filteredReferences.map((ref, idx) => (
                <div key={ref.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold text-slate-900">
                            {ref.authorLabel}
                          </span>
                          {ref.year && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
                              {ref.year}
                            </span>
                          )}
                          {!ref.isOrphan ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Citada en texto ({ref.citationCountInText} {ref.citationCountInText === 1 ? 'vez' : 'veces'})
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" />
                              Referencia huérfana (no citada)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 font-serif leading-relaxed pl-2 border-l-2 border-slate-200">
                          {ref.rawText}
                        </p>
                        {ref.doiOrUrl && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <a
                              href={ref.doiOrUrl.startsWith('http') ? ref.doiOrUrl : `https://${ref.doiOrUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-sky-600 hover:text-sky-800 underline font-mono flex items-center gap-1 truncate max-w-md"
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span>{ref.doiOrUrl}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: In-Text Citations List */}
        {activeTab === 'in_text' && (
          <div className="divide-y divide-slate-100">
            {filteredCitations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No se encontraron citas en el cuerpo que coincidan con la búsqueda.
              </div>
            ) : (
              filteredCitations.map((cit, idx) => (
                <div key={cit.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Quote className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 font-mono">
                            {cit.rawText}
                          </span>
                          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                            {cit.citationType === 'parenthetical'
                              ? 'Paréntesis'
                              : cit.citationType === 'narrative'
                              ? 'Narrativa'
                              : 'Numérica'}
                          </span>
                          {cit.hasMatchingReference ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Verificada en Bibliografía
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" />
                              Falta en la Bibliografía final
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Autor clave: <strong>{cit.authorKey}</strong> {cit.year && `(${cit.year})`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Methodological Guidance Note */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Guía metodológica de citas y referencias:</strong> El motor verifica la consistencia entre las menciones directas en el cuerpo del documento y el listado de referencias final conforme a las normas académicas (APA 7.ª ed. y estándares institucionales). Una referencia huérfana indica fuentes que no se citaron en el texto, y una cita sin entrada indica autores que requieren ser incorporados en la bibliografía.
        </p>
      </div>
    </div>
  );
};
