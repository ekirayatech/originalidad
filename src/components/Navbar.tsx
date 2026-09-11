import React, { useState } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  BookOpen,
  PlusCircle,
  HardDrive,
  Users,
  HelpCircle,
  ShieldCheck,
  UploadCloud
} from 'lucide-react';
import { AnalysisSummary } from '../types';
import { EKIRAYA_CONFIG } from '../data/ekirayaConfig';

interface NavbarProps {
  analysis: AnalysisSummary | null;
  onNewDocument: () => void;
  onOpenUploadModal: () => void;
  onOpenCorpusModal: () => void;
  onOpenLegalModal: () => void;
  onOpenCommunityModal: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  isEditorOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  analysis,
  onNewDocument,
  onOpenUploadModal,
  onOpenCorpusModal,
  onOpenLegalModal,
  onOpenCommunityModal,
  onExportPDF,
  onExportCSV,
  isEditorOpen
}) => {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 min-h-[64px] sm:h-18 py-2 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Logo container */}
          <div className="bg-white px-2 py-1 rounded-xl flex items-center justify-center shadow-xs shrink-0 h-10 sm:h-11 min-w-[40px] sm:min-w-[48px]">
            {!logoFailed ? (
              <img
                src={EKIRAYA_CONFIG.logoUrl}
                alt="Colegio Bilingüe Ekirayá"
                className="h-7 sm:h-9 w-auto object-contain max-w-[90px] sm:max-w-[130px]"
                referrerPolicy="no-referrer"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-base sm:text-lg">
                E
              </div>
            )}
          </div>

          <div className="leading-tight min-w-0">
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              <span className="text-sm sm:text-lg font-bold tracking-tight text-white truncate">
                Verificador de Originalidad
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800">
                Escala Ekirayá
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium truncate">
              Colegio Bilingüe Ekirayá <span className="text-slate-500 hidden md:inline">• Ley 23/1982 y Habeas Data</span>
            </p>
          </div>
        </div>

        {/* Center Pill: Local Memory / Privacy Guarantee */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-full text-xs text-slate-300 shadow-inner">
          <HardDrive className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Memoria Local del Navegador (RAM)</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 font-medium">100% Privado</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Direct Upload Document Button */}
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white shadow-sm transition-all cursor-pointer"
            title="Subir archivo PDF, Word (.docx) o Texto (.txt) para análisis instantáneo"
          >
            <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">Subir Documento</span>
            <span className="xs:hidden sm:hidden">Subir</span>
          </button>

          {/* Community Guidance Button (Embudo + Normativas) */}
          <button
            onClick={onOpenCommunityModal}
            className="flex items-center gap-1 min-h-[38px] sm:min-h-[40px] px-2 sm:px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-950/80 hover:bg-emerald-900 active:scale-95 text-emerald-300 border border-emerald-700 shadow-xs transition-all cursor-pointer"
            title="Guía para la comunidad Ekirayá: Cómo funciona el embudo y cumplimiento normativo"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Comunidad Ekirayá</span>
            <span className="hidden sm:inline md:hidden">Guía</span>
          </button>

          <button
            onClick={onOpenCorpusModal}
            className="hidden lg:flex items-center gap-1.5 min-h-[38px] sm:min-h-[40px] px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="Gestionar fuentes académicas y corpus en memoria local"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Biblioteca</span>
          </button>

          {analysis && !isEditorOpen && (
            <>
              <button
                onClick={onExportPDF}
                className="flex items-center gap-1 min-h-[38px] sm:min-h-[40px] px-2 sm:px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                title="Descargar reporte oficial en PDF para el Colegio Bilingüe Ekirayá"
              >
                <Download className="w-3.5 h-3.5 text-red-400" />
                <span>PDF</span>
              </button>

              <button
                onClick={onExportCSV}
                className="hidden xl:flex items-center gap-1.5 min-h-[38px] sm:min-h-[40px] px-2 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                title="Descargar matriz de coincidencias en CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSV</span>
              </button>
            </>
          )}

          <button
            onClick={onNewDocument}
            className="flex items-center gap-1 sm:gap-1.5 min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-white active:scale-95 text-slate-900 shadow-xs transition-all cursor-pointer"
          >
            {isEditorOpen ? (
              <>
                <FileText className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden xs:inline">Ver Reporte</span>
                <span className="xs:hidden">Reporte</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden sm:inline">Editar / Nuevo</span>
                <span className="sm:hidden">Editar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
