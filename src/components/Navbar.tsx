import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  PlusCircle,
  Users,
  HelpCircle,
  ShieldCheck,
  UploadCloud,
  Cloud,
  User,
  LogOut,
  FolderOpen,
  ChevronDown,
  GraduationCap
} from 'lucide-react';
import { AnalysisSummary } from '../types';
import { EKIRAYA_CONFIG } from '../data/ekirayaConfig';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  analysis: AnalysisSummary | null;
  onNewDocument: () => void;
  onOpenUploadModal: () => void;
  onOpenUsersModal: () => void;
  onOpenLegalModal: () => void;
  onOpenCommunityModal: () => void;
  onOpenRecordsModal: () => void;
  onOpenAdminModal: () => void;
  onOpenLoginModal: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onOpenAuditModal?: () => void;
  isEditorOpen: boolean;
  usersCount?: number;
  savedRecordsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  analysis,
  onNewDocument,
  onOpenUploadModal,
  onOpenUsersModal,
  onOpenLegalModal,
  onOpenCommunityModal,
  onOpenRecordsModal,
  onOpenAdminModal,
  onOpenLoginModal,
  onExportPDF,
  onExportCSV,
  onOpenAuditModal,
  isEditorOpen,
  usersCount = 0,
  savedRecordsCount = 0
}) => {
  const { user, userProfile, institutionalUser, isAdmin, adminsList, logout } = useAuth();
  const [logoFailed, setLogoFailed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const activeUser = user || institutionalUser;

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
          <div className="bg-white p-1 rounded-xl flex items-center justify-center shadow-md ring-1 ring-white/20 shrink-0 h-10 sm:h-12 w-auto max-w-[140px] px-2 overflow-hidden">
            {!logoFailed ? (
              <img
                src={EKIRAYA_CONFIG.logoUrl}
                alt="Logo Institucional Colegio Bilingüe Ekirayá"
                className="h-full w-auto max-h-8 sm:max-h-10 object-contain hover:scale-105 transition-transform duration-200"
                referrerPolicy="no-referrer"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-black text-amber-400 text-base sm:text-lg">
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

          {/* User Management Button (Docentes / Estudiantes / CSV) */}
          <button
            onClick={onOpenUsersModal}
            className="flex items-center gap-1.5 min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-950/80 hover:bg-indigo-900 active:scale-95 text-indigo-200 border border-indigo-700 shadow-xs transition-all cursor-pointer"
            title="Gestión de Usuarios (Docentes y Estudiantes con Taller, Contraseña y Carga Masiva CSV)"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">Usuarios</span>
            <span className="sm:hidden">Users</span>
            {usersCount > 0 && (
              <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                {usersCount}
              </span>
            )}
          </button>

          {/* Admin Management Button - ONLY visible to Administrators */}
          {isAdmin && (
            <button
              onClick={onOpenAdminModal}
              className="flex items-center gap-1.5 min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-950/80 hover:bg-amber-900 active:scale-95 text-amber-200 border border-amber-700 shadow-xs transition-all cursor-pointer"
              title="Gestión de Administradores y Permisos Ekirayá"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Administración</span>
              <span className="sm:hidden">Admin</span>
              {adminsList.length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                  {adminsList.length}
                </span>
              )}
            </button>
          )}

          {/* Firebase Saved Records Button (if user is authenticated) */}
          {activeUser && (
            <button
              onClick={onOpenRecordsModal}
              className="flex items-center gap-1.5 min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-950/90 hover:bg-sky-900 active:scale-95 text-sky-200 border border-sky-700 shadow-xs transition-all cursor-pointer"
              title="Ver historial de evaluaciones y documentos guardados en Firestore"
            >
              <Cloud className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="hidden sm:inline">Registros</span>
              {savedRecordsCount > 0 && (
                <span className="bg-sky-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                  {savedRecordsCount}
                </span>
              )}
            </button>
          )}

          {analysis && !isEditorOpen && (
            <>
              {onOpenAuditModal && (
                <button
                  onClick={onOpenAuditModal}
                  className="flex items-center gap-1.5 min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-950/90 hover:bg-emerald-900 active:scale-95 text-emerald-200 border border-emerald-600 shadow-xs transition-all cursor-pointer"
                  title="Auditoría de integridad académica y verificación criptográfica SHA-256"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden lg:inline">Auditoría</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/40">
                    SHA-256
                  </span>
                </button>
              )}

              <button
                onClick={onExportPDF}
                className="flex items-center gap-1 min-h-[38px] sm:min-h-[40px] px-2 sm:px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                title="Descargar reporte oficial en PDF para el Colegio Bilingüe Ekirayá con Badge Verificado"
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
            {activeUser ? (
              <div>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-1.5 min-h-[38px] sm:min-h-[40px] p-1 sm:px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    isAdmin
                      ? 'bg-amber-950/80 hover:bg-amber-900 border-amber-600 text-amber-200'
                      : userProfile?.role === 'student' || institutionalUser?.rol === 'estudiante'
                      ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-700 text-emerald-200'
                      : 'bg-indigo-950/80 hover:bg-indigo-900 border-indigo-700 text-indigo-200'
                  }`}
                  title={`${userProfile?.email || institutionalUser?.email || ''} (${
                    isAdmin ? 'Administrador' : userProfile?.roleLabel || 'Docente CEM'
                  })`}
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={userProfile?.displayName || 'Usuario'}
                      className="w-7 h-7 rounded-full object-cover border border-slate-600 shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-7 h-7 rounded-full text-white font-bold flex items-center justify-center text-xs shrink-0 ${
                        isAdmin
                          ? 'bg-amber-600'
                          : userProfile?.role === 'student' || institutionalUser?.rol === 'estudiante'
                          ? 'bg-emerald-600'
                          : 'bg-indigo-600'
                      }`}
                    >
                      {(userProfile?.displayName || user?.displayName || institutionalUser?.nombre || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden md:flex flex-col text-left leading-tight">
                    <span className="max-w-[110px] truncate text-white font-semibold text-xs">
                      {userProfile?.displayName?.split(' ')[0] || institutionalUser?.nombre || 'Usuario'}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        isAdmin
                          ? 'text-amber-400'
                          : userProfile?.role === 'student' || institutionalUser?.rol === 'estudiante'
                          ? 'text-emerald-400'
                          : 'text-indigo-400'
                      }`}
                    >
                      {isAdmin
                        ? user?.email?.toLowerCase() === 'mebolanos@cem.edu.co'
                          ? 'Superadmin'
                          : 'Admin CEM'
                        : institutionalUser
                        ? `${institutionalUser.rol.toUpperCase()}`
                        : userProfile?.roleLabel || 'Docente CEM'}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            isAdmin
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : userProfile?.role === 'student' || institutionalUser?.rol === 'estudiante'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}
                        >
                          {isAdmin
                            ? user?.email?.toLowerCase() === 'mebolanos@cem.edu.co'
                              ? 'Superadministrador CEM'
                              : 'Administrador CEM'
                            : institutionalUser
                            ? `${institutionalUser.rol.toUpperCase()} - ${institutionalUser.taller}`
                            : userProfile?.roleLabel || 'Docente CEM'}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Activo
                        </span>
                      </div>
                      <p className="font-bold text-xs text-slate-900 truncate">
                        {userProfile?.displayName || institutionalUser?.displayName || 'Usuario Ekirayá'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        {user?.email || institutionalUser?.email}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Colegio Bilingüe Ekirayá - CEM
                      </p>
                    </div>

                    <div className="py-1">
                      {/* Direct access to User Management */}
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenUsersModal();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Gestión de Usuarios (Docentes/Estudiantes)</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenRecordsModal();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <FolderOpen className="w-4 h-4 text-sky-600 shrink-0" />
                        <span>Historial de Evaluaciones</span>
                        {savedRecordsCount > 0 && (
                          <span className="ml-auto bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {savedRecordsCount}
                          </span>
                        )}
                      </button>

                      {/* Admin Management Option */}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenAdminModal();
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-amber-900 hover:bg-amber-50 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Gestión de Administradores</span>
                          <span className="ml-auto text-[10px] text-amber-700 font-semibold bg-amber-100 px-1.5 py-0.2 rounded">
                            {adminsList.length} admins
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenCommunityModal();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Normas Ekirayá y Escalas</span>
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
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 min-h-[38px] sm:min-h-[40px] px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-95 text-white shadow-xs transition-all cursor-pointer"
                title="Ingresar con Google o Contraseña Institucional Ekirayá"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline">Ingreso Institucional</span>
                <span className="xs:hidden">Ingreso</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
