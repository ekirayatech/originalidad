import React, { useState } from 'react';
import {
  X,
  LogIn,
  ShieldCheck,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Sparkles,
  RefreshCw,
  ExternalLink,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EKIRAYA_CONFIG } from '../data/ekirayaConfig';
import { recoverInstitutionalUserPassword } from '../lib/firebase';

interface InstitutionalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUserManagement?: () => void;
}

export const InstitutionalLoginModal: React.FC<InstitutionalLoginModalProps> = ({
  isOpen,
  onClose,
  onOpenUserManagement
}) => {
  const { login, loginWithCredentials, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'google' | 'credentials' | 'recover'>('google');
  const [identifier, setIdentifier] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoveredResult, setRecoveredResult] = useState<{ nombre: string; contrasena: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await login();
      setSuccessMessage('Sesión iniciada con éxito mediante Google.');
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1000);
    } catch (err: any) {
      console.error('Error Google Auth:', err);
      const code = err?.code || '';
      const msg = err?.message || '';

      if (code === 'auth/popup-blocked') {
        setErrorMessage(
          'El navegador bloqueó la ventana emergente de Google. Por favor haz clic en el ícono de ventana bloqueada en tu navegador para permitir ventanas emergentes, o inicia sesión usando la pestaña "Taller y Contraseña".'
        );
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMessage(
          'La ventana emergente de Google fue cerrada antes de completar el inicio de sesión.'
        );
      } else if (code === 'auth/unauthorized-domain') {
        setErrorMessage(
          `El dominio actual (${typeof window !== 'undefined' ? window.location.hostname : 'preview'}) no está en la lista de dominios autorizados de Firebase Console. Puedes ingresar inmediatamente mediante la pestaña "Taller y Contraseña" con tu correo y contraseña institucional.`
        );
      } else if (msg.includes('Acceso denegado') || msg.includes('no pertenece a los dominios')) {
        setErrorMessage(msg);
      } else {
        setErrorMessage(
          msg || 'No se pudo completar el acceso con Google. Intenta nuevamente o usa tu Taller y Contraseña.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !contrasena.trim()) {
      setErrorMessage('Por favor ingresa tu usuario/correo y tu contraseña.');
      return;
    }

    // If identifier is an email, check domain
    if (cleanIdentifier.includes('@')) {
      const lower = cleanIdentifier.toLowerCase();
      if (!lower.endsWith('@est.cem.edu.co') && !lower.endsWith('@cem.edu.co')) {
        setErrorMessage(
          'El correo ingresado no pertenece a la institución. Solo se admiten correos @est.cem.edu.co (Estudiantes) o @cem.edu.co (Docentes y Administradores).'
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const user = await loginWithCredentials(cleanIdentifier, contrasena);
      setSuccessMessage(`Bienvenido, ${user.displayName} (${user.rol.toUpperCase()} - ${user.taller})`);
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Credenciales inválidas. Verifica tu usuario y contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setRecoveredResult(null);

    const clean = recoverEmail.trim().toLowerCase();
    if (!clean) {
      setErrorMessage('Por favor ingresa tu correo institucional.');
      return;
    }

    if (!clean.endsWith('@est.cem.edu.co') && !clean.endsWith('@cem.edu.co')) {
      setErrorMessage('Solo se permiten correos @est.cem.edu.co o @cem.edu.co.');
      return;
    }



    setIsSubmitting(true);
    try {
      const res = await recoverInstitutionalUserPassword(clean);
      setRecoveredResult(res);
      setSuccessMessage(`¡Contraseña recuperada exitosamente para ${res.nombre}!`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'No se pudo recuperar la contraseña.');
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
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Ingreso Institucional Ekirayá
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

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              setActiveTab('google');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-[11px] sm:text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'google'
                ? 'border-red-600 text-red-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('credentials');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-[11px] sm:text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'credentials'
                ? 'border-red-600 text-red-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Contraseña</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('recover');
              setErrorMessage(null);
              setRecoveredResult(null);
            }}
            className={`flex-1 py-3 text-[11px] sm:text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'recover'
                ? 'border-red-600 text-red-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Recuperar</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
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

          {activeTab === 'google' ? (
            <div className="space-y-4 py-2">
              <div className="text-center">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Inicia sesión directamente con tu cuenta de Google.{' '}
                  <strong>No depende de la consola de administración del colegio.</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting || loading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-98 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                    <span>Conectando con Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continuar con Google</span>
                  </>
                )}
              </button>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Detección automática de rol institucional:</span>
                </div>
                <p>• <strong>@cem.edu.co:</strong> Docente Ekirayá</p>
                <p>• <strong>@est.cem.edu.co:</strong> Estudiante Ekirayá</p>
                <p>• <strong>mebolanos@cem.edu.co:</strong> Superadministrador</p>
              </div>
            </div>
          ) : activeTab === 'credentials' ? (
            <form onSubmit={handleCredentialsLogin} className="space-y-3.5 py-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Usuario, Nombre o Correo Institucional
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Ej. Sofia Gomez o sgomez@est.cem.edu.co"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Contraseña Asignada
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('recover');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="Contraseña del perfil"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Ingresar con mis Datos</span>
                  </>
                )}
              </button>


            </form>
          ) : (
            <form onSubmit={handleRecoverSubmit} className="space-y-4 py-1">
              <div className="text-center">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ingresa tu correo institucional <strong>@est.cem.edu.co</strong> o <strong>@cem.edu.co</strong> para recuperar o visualizar tu contraseña asignada en la base de datos.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Institucional
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={recoverEmail}
                    onChange={(e) => setRecoverEmail(e.target.value)}
                    placeholder="ej. sgomez@est.cem.edu.co"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {recoveredResult && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-950 font-mono">
                  <p className="font-bold font-sans text-amber-900">Credenciales Encontradas:</p>
                  <p>Usuario: <strong>{recoveredResult.nombre}</strong></p>
                  <p>Contraseña: <strong className="text-red-700 bg-white px-2 py-0.5 rounded border border-amber-300">{recoveredResult.contrasena}</strong></p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Buscando en la base de datos...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Recuperar Contraseña</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('credentials');
                    setErrorMessage(null);
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  ← Volver al inicio con contraseña
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 px-5 text-center text-[11px] text-slate-400">
          Sistema Verificador de Originalidad • Colegio Bilingüe Ekirayá
        </div>
      </div>
    </div>
  );
};
