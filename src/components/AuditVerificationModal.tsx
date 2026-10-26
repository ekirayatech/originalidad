import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  FileCheck,
  Lock,
  Download,
  AlertTriangle,
  RefreshCw,
  Hash,
  Award,
  ExternalLink
} from 'lucide-react';
import { AnalysisSummary } from '../types';
import { EKIRAYA_CONFIG } from '../data/ekirayaConfig';
import { verifyDocumentIntegrity, formatHashShort, sha256Sync } from '../utils/cryptoAudit';

interface AuditVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisSummary | null;
  documentText: string;
  onExportPDF: () => void;
}

export const AuditVerificationModal: React.FC<AuditVerificationModalProps> = ({
  isOpen,
  onClose,
  analysis,
  documentText,
  onExportPDF
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedContentHash, setCopiedContentHash] = useState(false);
  const [testTamperText, setTestTamperText] = useState<string>('');
  const [isTamperMode, setIsTamperMode] = useState(false);

  // Perform live cryptographic check
  const verificationResult = useMemo(() => {
    if (!analysis) return null;

    const textToTest = isTamperMode ? testTamperText : documentText;

    return verifyDocumentIntegrity({
      title: analysis.title,
      author: analysis.author,
      content: textToTest,
      totalWords: analysis.totalWords,
      totalSentences: analysis.totalSentences,
      similarityIndex: analysis.similarityIndex,
      aiWritingIndex: analysis.aiWritingIndex,
      submissionDate: analysis.submissionDate,
      expectedHash: analysis.documentHash
    });
  }, [analysis, documentText, isTamperMode, testTamperText]);

  if (!isOpen || !analysis) return null;

  const handleCopyHash = async (text: string, type: 'document' | 'content') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'document') {
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2500);
      } else {
        setCopiedContentHash(true);
        setTimeout(() => setCopiedContentHash(false), 2500);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleToggleTamper = () => {
    if (!isTamperMode) {
      setTestTamperText(documentText + ' [alteración no autorizada de prueba]');
      setIsTamperMode(true);
    } else {
      setIsTamperMode(false);
      setTestTamperText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-4 sm:p-6 flex items-center justify-between border-b border-emerald-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                  Auditoría Académica Ekirayá
                </span>
                <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                  SHA-256 Acreditado
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
                Certificado de Integridad Criptográfica
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800">
          {/* Main Status Banner */}
          {verificationResult?.isValid ? (
            <div className="bg-emerald-50 border-2 border-emerald-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded-full">
                      ✓ VERIFICADO / VERIFIED
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold hidden sm:inline">
                      Inmutabilidad Matemática Acreditada
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    Documento Original no alterado ni manipulado
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    El hash criptográfico SHA-256 coincide al 100% con la evaluación académica oficial.
                  </p>
                </div>
              </div>
              <button
                onClick={onExportPDF}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF con Badge</span>
              </button>
            </div>
          ) : (
            <div className="bg-rose-50 border-2 border-rose-400 rounded-xl p-4 flex items-start gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-rose-900 bg-rose-200 px-2 py-0.5 rounded-full">
                  ⚠️ DISCREPANCIA DETECTADA (HASH MISMATCH)
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  El contenido o las métricas no coinciden con el certificado original
                </p>
                <p className="text-xs text-rose-800 mt-0.5">
                  El texto ha sido modificado o alterado después de la certificación inicial.
                </p>
              </div>
            </div>
          )}

          {/* Cryptographic Hash Details Box */}
          <div className="border border-slate-200 rounded-xl bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Firma Criptográfica SHA-256 (Análisis y Auditoría)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">256-bit Hex Digest</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between gap-2 shadow-2xs font-mono text-xs sm:text-[13px] text-slate-900 break-all select-all">
              <span className="font-semibold text-emerald-950">{analysis.documentHash}</span>
              <button
                onClick={() => handleCopyHash(analysis.documentHash, 'document')}
                className="shrink-0 p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Copiar Hash Completo"
              >
                {copiedHash ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Content Text Fingerprint */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  Huella Digital del Texto Original (Content SHA-256):
                </span>
                <button
                  onClick={() => handleCopyHash(analysis.contentHash, 'content')}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedContentHash ? (
                    <>
                      <Check className="w-3 h-3" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copiar huella
                    </>
                  )}
                </button>
              </div>
              <div className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-mono text-[11px] text-slate-700 truncate">
                {analysis.contentHash}
              </div>
            </div>
          </div>

          {/* Audit Metadata Grid */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
            <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 flex items-center justify-between">
              <span>Metadatos de Integridad Institucional</span>
              <span className="text-emerald-700 font-mono">{analysis.auditCertificateId}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 p-2">
              <div className="p-2 space-y-1.5">
                <div>
                  <span className="text-slate-500 block text-[11px]">Título del Documento</span>
                  <span className="font-semibold text-slate-900">{analysis.title}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Autor Certificado</span>
                  <span className="font-semibold text-slate-900">{analysis.author}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Fecha y Hora de Certificación</span>
                  <span className="font-semibold text-slate-900">
                    {analysis.verificationTimestamp
                      ? new Date(analysis.verificationTimestamp).toLocaleString('es-CO')
                      : analysis.submissionDate}
                  </span>
                </div>
              </div>
              <div className="p-2 space-y-1.5">
                <div>
                  <span className="text-slate-500 block text-[11px]">Palabras / Oraciones</span>
                  <span className="font-semibold text-slate-900">
                    {analysis.totalWords} palabras • {analysis.totalSentences} oraciones
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Índice de Similitud Académica</span>
                  <span className="font-semibold text-slate-900">
                    {analysis.similarityIndex}% ({analysis.similarityFunnelLabel})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Detección de Escritura IA (LLM)</span>
                  <span className="font-semibold text-slate-900">
                    {analysis.aiWritingIndex}% ({analysis.aiFlaggedSentencesCount} oraciones)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Tamper-Simulation Interactive Sandbox */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-800">
                  Prueba de Inmutabilidad para Auditores (Simulación de Alteración)
                </span>
              </div>
              <button
                onClick={handleToggleTamper}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  isTamperMode
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {isTamperMode ? 'Restaurar Texto Original' : 'Simular Alteración de Texto'}
              </button>
            </div>
            <p className="text-[11px] text-slate-600">
              {isTamperMode ? (
                <span className="text-rose-700 font-semibold">
                  Se ha añadido una alteración arbitraria al texto. Observa cómo el algoritmo criptográfico SHA-256 genera un hash completamente diferente e invalida la verificación.
                </span>
              ) : (
                'Demuestra a auditores y comités cómo cualquier modificación (incluso un solo espacio o caracter) altera radicalmente el hash criptográfico matemático.'
              )}
            </p>
          </div>

          {/* Legal and Institutional Accordance Notice */}
          <div className="p-3 bg-slate-100/70 rounded-xl text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-800 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              Garantía Institucional Colegio Bilingüe Ekirayá:
            </p>
            <p>
              El presente hash criptográfico SHA-256 es inalterable y se genera en el entorno de ejecución en memoria (RAM) conforme a la Ley Estatutaria 1581 de 2012 (Habeas Data) y la Ley 23 de 1982 sobre derechos morales de autor y cita lícita. Apto para auditorías curriculares y revisiones del Ministerio de Educación Nacional de Colombia (MEN) y el Bachillerato Internacional (IB).
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-mono">
            Certificado Oficial: <span className="text-slate-800 font-bold">{analysis.auditCertificateId}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onExportPDF();
                onClose();
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar PDF Verificado</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
