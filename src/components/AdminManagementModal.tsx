import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Trash2,
  X,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUPERADMIN_EMAILS, clearAllEvaluationAndCotejoRecords } from '../lib/firebase';

interface AdminManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminManagementModal: React.FC<AdminManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user, isAdmin, adminsList, addAdmin, removeAdmin } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isPurgingDatabase, setIsPurgingDatabase] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState<string | null>(null);
  const [confirmPurgeMode, setConfirmPurgeMode] = useState(false);

  if (!isOpen) return null;

  const handlePurgeDatabase = async () => {
    setIsPurgingDatabase(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await clearAllEvaluationAndCotejoRecords();
      setPurgeSuccess(`✓ Base de datos purgada: ${res.documentsCleared} evaluaciones e historial eliminados de Firestore.`);
      setConfirmPurgeMode(false);
      setTimeout(() => setPurgeSuccess(null), 6000);
    } catch (err: any) {
      console.error('Error purgando base de datos:', err);
      setErrorMsg(err.message || 'No se pudo purgar la base de datos.');
    } finally {
      setIsPurgingDatabase(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (adminsList.some((a) => a.email.toLowerCase() === cleanEmail)) {
      setErrorMsg(`El correo "${cleanEmail}" ya está registrado como administrador.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await addAdmin(cleanEmail, nameInput.trim() || undefined);
      setSuccessMsg(`✓ Administrador "${cleanEmail}" agregado exitosamente.`);
      setEmailInput('');
      setNameInput('');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Error agregando admin:', err);
      setErrorMsg(err.message || 'No se pudo registrar el usuario administrador.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (adminId: string, email: string) => {
    if (SUPERADMIN_EMAILS.includes(email.toLowerCase())) {
      setErrorMsg('No es posible remover al Superadministrador principal del sistema.');
      return;
    }

    if (!window.confirm(`¿Estás seguro de revocar los privilegios de administrador a ${email}?`)) {
      return;
    }

    setDeletingId(adminId);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await removeAdmin(adminId);
      setSuccessMsg(`Privilegios de administrador revocados para ${email}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Error removiendo admin:', err);
      setErrorMsg(err.message || 'No se pudo remover al administrador.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Gestión de Administradores
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Acceso Restringido
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Colegio Bilingüe Ekirayá • Solo los administradores tienen acceso a la Biblioteca de Cotejo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Security Banner */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-5 sm:px-6 py-3 flex items-start gap-3 text-xs text-amber-950">
          <BookOpen className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <p className="font-semibold text-amber-900">
              Regla Institucional de Privacidad y Cotejo
            </p>
            <p className="text-amber-800 text-[11px] mt-0.5">
              Por disposición del Colegio Ekirayá, <strong>únicamente los usuarios administradores</strong> pueden ver y administrar la <em>Biblioteca de Cotejo</em> (repositorio central de trabajos anteriores y referencias). Los estudiantes y docentes continúan enviando y comparando sus documentos con total normalidad.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Add New Admin Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
              <UserPlus className="w-4 h-4 text-slate-600" />
              Agregar Nuevo Usuario Administrador
            </h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Correo Institucional *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="ejemplo@cem.edu.co"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-white"
                    />
                  </div>
                  {/* Quick Domain Helpers */}
                  <div className="flex gap-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const prefix = emailInput.split('@')[0] || '';
                        setEmailInput(`${prefix}@cem.edu.co`);
                      }}
                      className="text-[10px] text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                    >
                      + @cem.edu.co
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const prefix = emailInput.split('@')[0] || '';
                        setEmailInput(`${prefix}@ekiraya.edu.co`);
                      }}
                      className="text-[10px] text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                    >
                      + @ekiraya.edu.co
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nombre o Cargo (Opcional)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="p. ej. Coordinación Académica"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Se mostrará en la lista de administradores institucionales
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !emailInput.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Agregar Administrador</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Admins List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Administradores con Acceso a la Biblioteca de Cotejo ({adminsList.length})
              </h3>
              <span className="text-[11px] text-slate-400">
                Sincronización en tiempo real
              </span>
            </div>

            <div className="space-y-2.5">
              {adminsList.map((admin) => {
                const isSuper = SUPERADMIN_EMAILS.includes(admin.email.toLowerCase()) || admin.role === 'superadmin';
                const isCurrentUser = user?.email?.toLowerCase() === admin.email.toLowerCase();

                return (
                  <div
                    key={admin.id || admin.email}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isSuper
                        ? 'bg-amber-50/70 border-amber-200'
                        : isCurrentUser
                        ? 'bg-sky-50/70 border-sky-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSuper
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-800 text-slate-100'
                        }`}
                      >
                        {(admin.displayName || admin.email)[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 leading-tight">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {admin.displayName || admin.email.split('@')[0]}
                          </span>
                          {isSuper ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                              <Lock className="w-2.5 h-2.5" />
                              Superadministrador
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              Administrador
                            </span>
                          )}
                          {isCurrentUser && (
                            <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded">
                              Tú
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-600 truncate mt-0.5">
                          {admin.email}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Agregado por: {admin.addedBy || 'Sistema'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {isSuper ? (
                        <div
                          className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-lg border border-amber-200/80"
                          title="El superadministrador no puede ser eliminado"
                        >
                          <Lock className="w-3 h-3 text-amber-700" />
                          <span>Principal</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRemove(admin.id, admin.email)}
                          disabled={deletingId === admin.id}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                          title={`Revocar acceso de administrador a ${admin.email}`}
                        >
                          {deletingId === admin.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          )}
                          <span>Revocar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Database Purge Action Block for Administrators */}
          <div className="pt-4 border-t border-slate-200 bg-rose-50/50 p-4 rounded-xl border border-rose-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Vaciar Base de Datos de Evaluaciones y Cotejo</span>
                </h4>
                <p className="text-[11px] text-rose-800/80 mt-0.5">
                  Elimina permanentemente los documentos e historial de prueba almacenados en Firestore.
                </p>
              </div>
            {!confirmPurgeMode ? (
              <button
                onClick={() => setConfirmPurgeMode(true)}
                disabled={isPurgingDatabase}
                className="px-3.5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Borrar Documentos de Prueba</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-100 border border-rose-300 p-2 rounded-xl animate-in fade-in shrink-0">
                <span className="text-xs font-bold text-rose-950">¿Confirmar borrado total?</span>
                <button
                  onClick={handlePurgeDatabase}
                  disabled={isPurgingDatabase}
                  className="px-3 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  {isPurgingDatabase ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Purgando...</span>
                    </>
                  ) : (
                    <span>SÍ, BORRAR TODO</span>
                  )}
                </button>
                <button
                  onClick={() => setConfirmPurgeMode(false)}
                  className="px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}
            </div>
            {purgeSuccess && (
              <div className="mt-2.5 p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{purgeSuccess}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 sm:px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Los cambios surten efecto de manera inmediata en toda la plataforma.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
