import React, { useState, useRef, useEffect } from 'react';
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
  UploadCloud,
  Cloud,
  User,
  LogOut,
  FolderOpen,
  ChevronDown
} from 'lucide-react';
import { AnalysisSummary } from '../types';
import { EKIRAYA_CONFIG } from '../data/ekirayaConfig';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  analysis: AnalysisSummary | null;
  onNewDocument: () => void;
  onOpenUploadModal: () => void;
  onOpenCorpusModal: () => void;
  onOpenLegalModal: () => void;
  onOpenCommunityModal: () => void;
  onOpenRecordsModal: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  isEditorOpen: boolean;
  corpusCount?: number;
  customCorpusCount?: number;
  savedRecordsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  analysis,
  onNewDocument,
  onOpenUploadModal,
  onOpenCorpusModal,
  onOpenLegalModal,
  onOpenCommunityModal,
  onOpenRecordsModal,
  onExportPDF,
  onExportCSV,
  isEditorOpen,
  corpusCount = 0,
  customCorpusCount = 0,
  savedRecordsCount = 0
}) => {
  const { user, userProfile, login, logout, loading: authLoading } = useAuth();
  const [logoFailed, setLogoFailed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

          {/* Reference Corpus Modal Button */}
          <button
            onClick={onOpenCorpusModal}
            className="flex items-center gap-1.5 min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-950/80 hover:bg-sky-900 active:scale-95 text-sky-200 border border-sky-700 shadow-xs transition-all cursor-pointer"
            title="Biblioteca de Cotejo y Entregas Anteriores: Gestionar documentos para comparar"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="hidden sm:inline">Biblioteca Cotejo</span>
            <span className="sm:hidden">Cotejo</span>
            {customCorpusCount > 0 ? (
              <span className="bg-sky-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                {customCorpusCount}
              </span>
            ) : corpusCount > 0 ? (
              <span className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full hidden md:inline">
                {corpusCount}
              </span>
            ) : null}
          </button>

          {/* Firebase Saved Records Button (if user is authenticated) */}
          {user && (
            <button
              onClick={onOpenRecordsModal}
              className="flex items-center gap-1.5 min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-950/90 hover:bg-indigo-900 active:scale-95 text-indigo-200 border border-indigo-700 shadow-xs transition-all cursor-pointer"
              title="Ver historial de evaluaciones y documentos guardados en Firestore"
            >
              <Cloud className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="hidden sm:inline">Registros</span>
              {savedRecordsCount > 0 && (
                <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                  {savedRecordsCount}
                </span>
              )}
            </button>
          )}

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

          {/* User Profile / Firebase Auth Area */}
          <div className="relative" ref={userMenuRef}>
            {user ? (
              <div>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 min-h-[38px] sm:min-h-[40px] p-1 sm:px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
                  title={user.email || 'Usuario Firebase'}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Docente'}
                      className="w-7 h-7 rounded-full object-cover border border-slate-600"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                      {(user.displayName || user.email || 'D')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline max-w-[100px] truncate text-slate-200 font-semibold">
                    {user.displayName?.split(' ')[0] || 'Docente'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-xs text-slate-900 truncate">
                        {user.displayName || 'Docente Ekirayá'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-xs bg-sky-100 text-sky-800">
                          {userProfile?.role || 'Docente'}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Conectado a Firebase
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenRecordsModal();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <FolderOpen className="w-4 h-4 text-sky-600" />
                        <span>Historial de Evaluaciones</span>
                        {savedRecordsCount > 0 && (
                          <span className="ml-auto bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {savedRecordsCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenCorpusModal();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <BookOpen className="w-4 h-4 text-sky-600" />
                        <span>Biblioteca de Cotejo</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenCommunityModal();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <HelpCircle className="w-4 h-4 text-emerald-600" />
                        <span>Guía Ekirayá y Normas</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={async () => {
                  try {
                    await login();
                  } catch (e) {
                    console.error('Error logging in:', e);
                  }
                }}
                disabled={authLoading}
                className="flex items-center gap-1.5 min-h-[38px] sm:min-h-[40px] px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-95 text-white shadow-xs transition-all cursor-pointer"
                title="Acceder con Google para guardar y sincronizar documentos en Firebase"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline">Ingresar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
