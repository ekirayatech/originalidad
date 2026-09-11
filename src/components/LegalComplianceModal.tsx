import React from 'react';
import { LEGAL_REGULATIONS } from '../utils/legalGuidelines';
import {
  ShieldCheck,
  Scale,
  Lock,
  GraduationCap,
  Globe,
  FileCheck,
  X,
  CheckCircle2
} from 'lucide-react';

interface LegalComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalComplianceModal: React.FC<LegalComplianceModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const colombiaNorms = LEGAL_REGULATIONS.filter((r) => r.jurisdiction === 'Colombia');
  const intlNorms = LEGAL_REGULATIONS.filter((r) => r.jurisdiction === 'Internacional');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-xs shrink-0">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-lg text-white truncate">
                Marco Legal y Regulatorio
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 truncate">
                Legislación de Colombia (Ley 23 y 1581) y tratados internacionales
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Local Storage Privacy Highlight Banner */}
        <div className="bg-emerald-50 border-b border-emerald-200 px-3 sm:px-6 py-2.5 sm:py-3 flex items-start sm:items-center gap-2.5 sm:gap-3 text-xs text-emerald-900">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <span className="font-bold">Garantía Soberana de Privacidad (Ley 1581 de 2012 y GDPR): </span>
            A diferencia de plataformas comerciales externas que almacenan las tesis y trabajos de estudiantes en bases de datos extranjeras, este software procesa el 100% de la información en la <strong>memoria volátil (RAM) del navegador</strong>. Ningún borrador ni dato personal sale de su equipo.
          </div>
        </div>

        {/* Content Tabs / Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Colombia Regulations */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
                Colombia
              </span>
              <h4 className="font-bold text-sm text-slate-800">
                Normativa Nacional y Directrices del Ministerio de Educación (MEN)
              </h4>
            </div>

            <div className="space-y-3">
              {colombiaNorms.map((norm) => (
                <div key={norm.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h5 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      {norm.normName}
                    </h5>
                    <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {norm.authority}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 mt-2 space-y-1">
                    <p>
                      <strong className="text-slate-800">Disposiciones Clave:</strong> {norm.keyArticles}
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      <strong className="text-slate-800">Mecanismo de Cumplimiento:</strong> {norm.complianceReason}
                    </p>
                    <p className="text-slate-500 italic">
                      {norm.relevanceToOriginalityAndAI}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* International Regulations */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                Internacional
              </span>
              <h4 className="font-bold text-sm text-slate-800">
                Tratados de Propiedad Intelectual, Protección de Datos y Ética de IA
              </h4>
            </div>

            <div className="space-y-3">
              {intlNorms.map((norm) => (
                <div key={norm.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h5 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                      {norm.normName}
                    </h5>
                    <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {norm.authority}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 mt-2 space-y-1">
                    <p>
                      <strong className="text-slate-800">Disposiciones Clave:</strong> {norm.keyArticles}
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      <strong className="text-slate-800">Mecanismo de Cumplimiento:</strong> {norm.complianceReason}
                    </p>
                    <p className="text-slate-500 italic">
                      {norm.relevanceToOriginalityAndAI}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Este dictamen está avalado para usos docentes, editoriales y de investigación científica.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
          >
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
