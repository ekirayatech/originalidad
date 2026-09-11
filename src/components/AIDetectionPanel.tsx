import React from 'react';
import { AnalysisSummary } from '../types';
import {
  Sparkles,
  Cpu,
  HelpCircle,
  AlertCircle,
  Scale,
  BrainCircuit,
  Activity
} from 'lucide-react';

interface AIDetectionPanelProps {
  analysis: AnalysisSummary;
}

export const AIDetectionPanel: React.FC<AIDetectionPanelProps> = ({ analysis }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-4xl mx-auto my-6">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
      <div className="mt-6">
        <h4 className="font-semibold text-xs text-slate-700 uppercase tracking-wider mb-3">
          Patrones y Conectores Cliché de IA Detectados en el Escrito:
        </h4>

        {analysis.detectedAIMarkersList.length === 0 ? (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs border border-emerald-200">
            No se detectaron conectores artificiales recurrentes. La prosa mantiene giros idiomáticos variados y naturales.
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

      {/* Ethical and Legal Warning (MEN Colombia & UNESCO) */}
      <div className="mt-6 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
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
