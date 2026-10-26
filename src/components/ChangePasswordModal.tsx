import React, { useState, useEffect } from 'react';
import { X, Lock, KeyRound, CheckCircle2, AlertCircle, RefreshCw, User, School, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateInstitutionalUser } from '../lib/firebase';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TALLER_PRESETS = [
  'Taller 1 (Primaria Baja - Grados 1° a 3°)',
  'Taller 2 (Primaria Alta - Grados 4° a 6°)',
  'Taller 3 (Secundaria - Grados 7° a 9°)',
  'Taller Juvenil (Media Vocacional - Grados 10° y 11°)',
  'Cuerpo Docente Ekirayá',
  'Coordinación Académica',
  'Administración General'
];

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user, institutionalUser } = useAuth();
  
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [taller, setTaller] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (institutionalUser) {
      setNombre(institutionalUser.nombre || '');
      setApellido(institutionalUser.apellido || '');
      setTaller(institutionalUser.taller || TALLER_PRESETS[0]);
    }
  }, [institutionalUser, isOpen]);

  if (!isOpen) return null;

  const isGoogleUser = Boolean(user && !institutionalUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isGoogleUser) {
      setErrorMessage(
        'Tu cuenta está vinculada a Google OAuth. No requieres modificar perfil institucional local.'
      );
      return;
    }

    if (!institutionalUser?.id) {
      setErrorMessage('No hay una sesión institucional activa para editar perfil.');
      return;
    }

    const cleanNombre = nombre.trim();
    const cleanApellido = apellido.trim();
    const cleanTaller = taller.trim();

    if (!cleanNombre || !cleanApellido || !cleanTaller) {
      setErrorMessage('Nombre, Apellido y Taller son obligatorios.');
      return;
    }

    let passUpdate: { contrasena?: string } = {};
    if (newPassword.trim()) {
      if (newPassword.trim().length < 4) {
        setErrorMessage('La nueva contraseña debe tener al menos 4 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('Las contraseñas no coinciden.');
        return;
      }
      passUpdate.contrasena = newPassword.trim();
    }

    setIsSubmitting(true);
    try {
      await updateInstitutionalUser(institutionalUser.id, {
        nombre: cleanNombre,
        apellido: cleanApellido,
        displayName: `${cleanNombre} ${cleanApellido}`,
        taller: cleanTaller,
        ...passUpdate
      });

      // Update local storage session cache if present
      try {
        const saved = localStorage.getItem('ekiraya_institutional_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.nombre = cleanNombre;
          parsed.apellido = cleanApellido;
          parsed.displayName = `${cleanNombre} ${cleanApellido}`;
          parsed.taller = cleanTaller;
          if (passUpdate.contrasena) parsed.contrasena = passUpdate.contrasena;
          localStorage.setItem('ekiraya_institutional_session', JSON.stringify(parsed));
        }
      } catch {}

      setSuccessMessage('✓ Perfil y credenciales actualizados con éxito.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al actualizar perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Editar Perfil y Contraseña
              </h2>
              <p className="text-xs text-slate-400">
                Colegio Bilingüe Ekirayá - CEM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {isGoogleUser ? (
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sky-900">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Autenticación mediante Google</span>
              </div>
              <p>
                Estás conectado con una cuenta de Google institucional (<strong>{user?.email}</strong>). La gestión de tu perfil y credenciales se administra a través de tu cuenta de Google.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{successMessage}</span>
                </div>
              )}

              {/* Read-only Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Institucional (No modificable)
                </label>
                <input
                  type="email"
                  disabled
                  value={institutionalUser?.email || ''}
                  className="w-full px-3 py-2 text-xs bg-slate-100 text-slate-500 border border-slate-300 rounded-lg cursor-not-allowed font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    required
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Tu apellido"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Taller o Curso Institucional
                </label>
                <select
                  value={taller}
                  onChange={(e) => setTaller(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
                >
                  {TALLER_PRESETS.map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-slate-200 pt-3 mt-2">
                <p className="text-[11px] font-bold text-slate-700 mb-2">Cambiar Contraseña (Opcional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Nueva Contraseña</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Dejar en blanco si no se cambia"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Confirmar Contraseña</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repetir contraseña"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 mt-3"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Guardando Cambios...</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    <span>Guardar Cambios del Perfil</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 px-5 text-center text-[11px] text-slate-400">
          Colegio Bilingüe Ekirayá - CEM
        </div>
      </div>
    </div>
  );
};
