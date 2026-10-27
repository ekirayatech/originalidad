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
  Menu,
  X,
  FileCheck,
  GraduationCap,
  KeyRound
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
  onOpenChangePasswordModal: () => void;
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
  onOpenChangePasswordModal,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const activeUser = user || institutionalUser;

  const effectiveEmail = (user?.email || institutionalUser?.email || '').toLowerCase().trim();
  const isSuperEmail = effectiveEmail === 'mebolanos@cem.edu.co';

  const effectiveDisplayName = isSuperEmail
    ? 'Esteban Bolaños (Superadministrador CEM)'
    : userProfile?.displayName || institutionalUser?.displayName || user?.displayName || 'Usuario Ekirayá';

  const effectiveFirstName = isSuperEmail
    ? 'Esteban'
    : (userProfile?.displayName?.split(' ')[0] || institutionalUser?.nombre || user?.displayName?.split(' ')[0] || 'Usuario');

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
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Logo container */}
          <div className="bg-white p-1 rounded-xl flex items-center justify-center shadow-md ring-1 ring-white/20 shrink-0 h-10 sm:h-12 w-auto max-w-[120px] sm:max-w-[140px] px-1.5 sm:px-2 overflow-hidden">
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
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm sm:text-lg font-bold tracking-tight text-white truncate">
                Verificador Ekirayá
              </span>
              <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-semibold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 shrink-0">
                Escala CEM
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium truncate">
              Colegio Bilingüe Ekirayá <span className="text-slate-500 hidden md:inline">• Ley 23/1982</span>
            </p>
          </div>
        </div>

        {/* Desktop Action Controls (hidden on md and down, visible on lg) */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {/* Direct Upload Document Button */}
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white shadow-xs transition-all cursor-pointer"
            title="Subir archivo PDF, Word (.docx) o Texto (.txt) para análisis instantáneo"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Subir Documento</span>
          </button>

          {/* User Management Button - ONLY visible to Administrators */}
          {isAdmin && (
            <button
              onClick={onOpenUsersModal}
              className="flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-950/80 hover:bg-indigo-900 active:scale-95 text-indigo-200 border border-indigo-700 shadow-xs transition-all cursor-pointer"
              title="Gestión de Usuarios (Docentes y Estudiantes con Taller, Contraseña y Carga Masiva CSV)"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Usuarios</span>
              {usersCount > 0 && (
                <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                  {usersCount}
                </span>
              )}
            </button>
          )}

          {/* Admin Management Button - ONLY visible to Administrators */}
          {isAdmin && (
            <button
              onClick={onOpenAdminModal}
              className="flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-950/80 hover:bg-amber-900 active:scale-95 text-amber-200 border border-amber-700 shadow-xs transition-all cursor-pointer"
              title="Gestión de Administradores y Permisos Ekirayá"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Administración</span>
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
              className="flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-950/90 hover:bg-sky-900 active:scale-95 text-sky-200 border border-sky-700 shadow-xs transition-all cursor-pointer"
              title="Ver historial de evaluaciones y documentos guardados en Firestore"
            >
              <Cloud className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Registros</span>
              {savedRecordsCount > 0 && (
                <span className="bg-sky-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                  {savedRecordsCount}
                </span>
              )}
            </button>
          )}

          {analysis && !isEditorOpen && (
            <>
              {isAdmin && onOpenAuditModal && (
                <button
                  onClick={onOpenAuditModal}
                  className="flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-950/90 hover:bg-emerald-900 active:scale-95 text-emerald-200 border border-emerald-600 shadow-xs transition-all cursor-pointer"
                  title="Auditoría de integridad académica y verificación criptográfica SHA-256"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Auditoría</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/40">
                    SHA-256
                  </span>
                </button>
              )}

              <button
                onClick={onExportPDF}
                className="flex items-center gap-1 min-h-[40px] px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                title="Descargar reporte oficial en PDF para el Colegio Bilingüe Ekirayá con Badge Verificado"
              >
                <Download className="w-3.5 h-3.5 text-red-400" />
                <span>PDF</span>
              </button>

              {isAdmin && (
                <button
                  onClick={onExportCSV}
                  className="flex items-center gap-1.5 min-h-[40px] px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                  title="Descargar matriz de coincidencias en CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={onNewDocument}
            className="flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-white active:scale-95 text-slate-900 shadow-xs transition-all cursor-pointer"
          >
            {isEditorOpen ? (
              <>
                <FileText className="w-3.5 h-3.5 text-slate-700" />
                <span>Ver Reporte</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5 text-slate-700" />
                <span>Editar / Nuevo</span>
              </>
            )}
          </button>
        </div>

        {/* Compact Right Area for Mobile & Tablet + User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Upload CTA on Mobile/Tablet */}
          <button
            onClick={onOpenUploadModal}
            className="lg:hidden flex items-center justify-center min-h-[40px] min-w-[40px] px-2.5 py-1.5 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white shadow-xs transition-all cursor-pointer"
            title="Subir archivo"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden xs:inline ml-1 font-bold">Subir</span>
          </button>

          {/* User Profile / Firebase Auth Area */}
          <div className="relative" ref={userMenuRef}>
            {activeUser ? (
              <div>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-1.5 min-h-[40px] p-1 sm:px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
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
                  <div className="hidden sm:flex flex-col text-left leading-tight">
                    <span className="max-w-[100px] md:max-w-[120px] truncate text-white font-semibold text-xs">
                      {effectiveFirstName}
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
                  <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in">
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
                        {effectiveDisplayName}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        {user?.email || institutionalUser?.email}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Colegio Bilingüe Ekirayá - CEM
                      </p>
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenUsersModal();
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>Gestión de Usuarios</span>
                          {usersCount > 0 && (
                            <span className="ml-auto bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                              {usersCount}
                            </span>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenRecordsModal();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <FolderOpen className="w-4 h-4 text-sky-600 shrink-0" />
                        <span>Historial de Evaluaciones</span>
                        {savedRecordsCount > 0 && (
                          <span className="ml-auto bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {savedRecordsCount}
                          </span>
                        )}
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenAdminModal();
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-amber-900 hover:bg-amber-50 flex items-center gap-2 cursor-pointer font-medium"
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
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Normas Ekirayá y Escalas</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenChangePasswordModal();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <KeyRound className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Cambiar Contraseña</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await logout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
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
                className="flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-95 text-white shadow-xs transition-all cursor-pointer"
                title="Ingresar con Google o Contraseña Institucional Ekirayá"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline">Ingreso</span>
              </button>
            )}
          </div>

          {/* Mobile / Tablet Hamburger Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center justify-center min-h-[40px] min-w-[40px] p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Abrir menú de navegación móvil"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-red-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer / Slide-Down Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-150 max-h-[calc(100vh-64px)] overflow-y-auto">
          {/* Active User Quick Card in Mobile Drawer */}
          {activeUser ? (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full text-white font-bold flex items-center justify-center text-xs shrink-0 ${
                    isAdmin
                      ? 'bg-amber-600'
                      : userProfile?.role === 'student' || institutionalUser?.rol === 'estudiante'
                      ? 'bg-emerald-600'
                      : 'bg-indigo-600'
                  }`}
                >
                  {(userProfile?.displayName || user?.displayName || institutionalUser?.nombre || 'U')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {userProfile?.displayName || institutionalUser?.displayName || 'Usuario Ekirayá'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    {user?.email || institutionalUser?.email}
                  </p>
                </div>
              </div>
              <span
                className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                  isAdmin
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : userProfile?.role === 'student' || institutionalUser?.rol === 'estudiante'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    : 'bg-indigo-950 text-indigo-300 border-indigo-700'
                }`}
              >
                {isAdmin
                  ? 'Admin'
                  : institutionalUser
                  ? institutionalUser.rol
                  : userProfile?.roleLabel || 'Docente'}
              </span>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenLoginModal();
              }}
              className="w-full flex items-center justify-center gap-2 min-h-[44px] py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer active:scale-98"
            >
              <User className="w-4 h-4" />
              <span>Ingreso Institucional (@cem.edu.co / @est.cem.edu.co)</span>
            </button>
          )}

          {/* Action List with Touch Ergonomics (>= 44px min height) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenUploadModal();
              }}
              className="flex items-center gap-3 min-h-[46px] px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 shrink-0" />
              <span>Subir Archivo (PDF, DOCX, TXT)</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNewDocument();
              }}
              className="flex items-center gap-3 min-h-[46px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              {isEditorOpen ? (
                <>
                  <FileText className="w-4 h-4 text-slate-300 shrink-0" />
                  <span>Ver Reporte de Originalidad</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 text-slate-300 shrink-0" />
                  <span>Editar Texto / Nuevo Análisis</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenUsersModal();
              }}
              className="flex items-center justify-between min-h-[46px] px-3.5 py-2 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 text-indigo-200 text-xs font-semibold border border-indigo-800/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Gestión de Usuarios</span>
              </div>
              {usersCount > 0 && (
                <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {usersCount}
                </span>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAdminModal();
                }}
                className="flex items-center justify-between min-h-[46px] px-3.5 py-2 rounded-xl bg-amber-950/70 hover:bg-amber-900 text-amber-200 text-xs font-semibold border border-amber-800/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Administradores Ekirayá</span>
                </div>
                {adminsList.length > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {adminsList.length}
                  </span>
                )}
              </button>
            )}

            {activeUser && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenRecordsModal();
                }}
                className="flex items-center justify-between min-h-[46px] px-3.5 py-2 rounded-xl bg-sky-950/70 hover:bg-sky-900 text-sky-200 text-xs font-semibold border border-sky-800/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Historial de Evaluaciones</span>
                </div>
                {savedRecordsCount > 0 && (
                  <span className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {savedRecordsCount}
                  </span>
                )}
              </button>
            )}

            {analysis && !isEditorOpen && (
              <>
                {onOpenAuditModal && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuditModal();
                    }}
                    className="flex items-center justify-between min-h-[46px] px-3.5 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold border border-emerald-800/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Auditoría Criptográfica</span>
                    </div>
                    <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/50">
                      SHA-256
                    </span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onExportPDF();
                  }}
                  className="flex items-center gap-3 min-h-[46px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Descargar Reporte Oficial (PDF)</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onExportCSV();
                  }}
                  className="flex items-center gap-3 min-h-[46px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Descargar Matriz (CSV)</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenCommunityModal();
              }}
              className="flex items-center gap-3 min-h-[46px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Normas Ekirayá y Escalas</span>
            </button>
          </div>

          {activeUser && (
            <div className="pt-2 border-t border-slate-800/80">
              <button
                onClick={async () => {
                  setIsMobileMenuOpen(false);
                  await logout();
                }}
                className="w-full flex items-center justify-center gap-2 min-h-[44px] py-2 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión Institucional</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
