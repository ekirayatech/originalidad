import React from 'react';
import { FunnelColor } from '../types';
import { ShieldCheck, AlertTriangle, Sparkles, Cpu, HelpCircle, ChevronRight } from 'lucide-react';

interface ColorFunnelProps {
  similarityScore: number;
  similarityColor: FunnelColor;
  aiScore: number;
  aiFlaggedSentences: number;
  totalSentences: number;
  onOpenCommunityModal?: () => void;
}

export const ColorFunnel: React.FC<ColorFunnelProps> = ({
  similarityScore,
  similarityColor,
  aiScore,
  aiFlaggedSentences,
  totalSentences,
  onOpenCommunityModal
}) => {
  const funnelSteps = [
    { range: '0%', color: 'blue', bg: 'bg-blue-600', text: 'Azul', desc: '0% Coincidencias' },
    { range: '1-24%', color: 'green', bg: 'bg-emerald-500', text: 'Verde', desc: 'Similitud Leve' },
    { range: '25-49%', color: 'yellow', bg: 'bg-amber-400', text: 'Amarillo', desc: 'Similitud Media' },
    { range: '50-74%', color: 'orange', bg: 'bg-orange-500', text: 'Naranja', desc: 'Similitud Alta' },
    { range: '75-100%', color: 'red', bg: 'bg-rose-600', text: 'Rojo', desc: 'Similitud Crítica' },
  ];

  // AI color tier
  const getAiBadge = (score: number) => {
    if (score < 20) return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Mínimo / Auténtico' };
    if (score < 50) return { bg: 'bg-sky-50 text-sky-700 border-sky-200', label: 'Asistencia Parcial de IA' };
    if (score < 80) return { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Alta Presencia de IA' };
    return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Predominio Sintético (LLM)' };
  };

  const aiBadgeInfo = getAiBadge(aiScore);

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto space-y-2.5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Similarity Score Card */}
          <div className="lg:col-span-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-slate-50 rounded-xl p-3 sm:p-3.5 border border-slate-200">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl text-white shadow-xs shrink-0 ${
                  similarityColor === 'blue'
                    ? 'bg-blue-600'
                    : similarityColor === 'green'
                    ? 'bg-emerald-500'
                    : similarityColor === 'yellow'
                    ? 'bg-amber-500 text-slate-900'
                    : similarityColor === 'orange'
                    ? 'bg-orange-500'
                    : 'bg-rose-600'
                }`}
              >
                {similarityScore}%
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Índice de Similitud</span>
                  <span className="text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                    Escala Ekirayá
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  {similarityScore === 0 && <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />}
                  {similarityScore > 0 && similarityScore < 25 && <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {similarityScore >= 25 && similarityScore < 50 && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                  {similarityScore >= 50 && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span className="truncate">
                    {similarityScore < 25
                      ? 'Aceptable / Citas y frases comunes'
                      : similarityScore < 50
                      ? 'Atención requerida (Revisar citas)'
                      : 'Alto riesgo de coincidencia no atribuida'}
                  </span>
                </p>
              </div>
            </div>

            {/* Institutional Funnel segments */}
            <div className="flex-1 w-full min-w-0 pt-1 sm:pt-0">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1">
                <span>Embudo de Originalidad</span>
                <span className="font-semibold text-slate-700 capitalize">{similarityColor} ({similarityScore}%)</span>
              </div>
              <div
                onClick={onOpenCommunityModal}
                className="grid grid-cols-5 gap-1 h-3 rounded-md overflow-hidden bg-slate-200 p-0.5 cursor-pointer"
                title="Haz clic para ver la explicación completa del embudo de colores para la comunidad Ekirayá"
              >
                {funnelSteps.map((step) => {
                  const isActive = step.color === similarityColor;
                  return (
                    <div
                      key={step.color}
                      className={`h-full rounded-xs transition-all ${step.bg} ${
                        isActive ? 'ring-2 ring-slate-900 ring-offset-1 scale-y-110' : 'opacity-65 hover:opacity-100'
                      }`}
                      title={`${step.text} (${step.range}): ${step.desc}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                <span>0%</span>
                <span>24%</span>
                <span>49%</span>
                <span>74%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* AI Writing Detector Card */}
          <div className="lg:col-span-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-purple-50/50 rounded-xl p-3 sm:p-3.5 border border-purple-100">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl text-white shadow-xs shrink-0 ${
                  aiScore < 20
                    ? 'bg-emerald-500'
                    : aiScore < 50
                    ? 'bg-sky-500'
                    : aiScore < 80
                    ? 'bg-purple-600'
                    : 'bg-rose-600'
                }`}
              >
                {aiScore}%
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    Detección IA
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${aiBadgeInfo.bg}`}>
                    {aiBadgeInfo.label}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  <span className="font-semibold text-purple-950">{aiFlaggedSentences}</span> de{' '}
                  <span className="font-semibold text-slate-700">{totalSentences}</span> oraciones sintéticas
                </p>
              </div>
            </div>

            <div className="sm:text-right text-xs text-slate-500 bg-white/70 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-purple-100 shrink-0">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 justify-start sm:justify-end">
                <Cpu className="w-3.5 h-3.5 text-purple-600" />
                <span>Heurístico RAM</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Perplejidad + Burstiness</p>
            </div>
          </div>
        </div>

        {/* Ekirayá Community Context Strip */}
        {onOpenCommunityModal && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 bg-emerald-50/80 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="leading-tight">
                <strong>Colegio Bilingüe Ekirayá:</strong> Sistema ajustado a Ley 23/1982, Ley 1581/2012 y lineamientos MEN.
              </span>
            </div>

            <button
              onClick={onOpenCommunityModal}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-950 font-bold hover:underline self-start sm:self-auto cursor-pointer"
            >
              <span>Explicación del Embudo y Normativas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
