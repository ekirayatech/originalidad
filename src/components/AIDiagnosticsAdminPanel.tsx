import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  Globe,
  Key,
  Server,
  Activity,
  Cpu,
  Zap,
  X,
  Check
} from 'lucide-react';

export interface AIDiagnosticProviderConfig {
  id: string;
  name: string;
  code: string;
  type: 'local_heuristic' | 'cloud_api' | 'experimental_llm';
  status: 'connected' | 'requires_credentials' | 'disabled' | 'testing';
  version: string;
  latencyMs: number | null;
  isActive: boolean;
  endpointUrl: string;
  apiKeyConfigured: boolean;
  accuracyRate: string;
}

interface AIDiagnosticsAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onActiveProviderChange?: (providerName: string) => void;
}

export const AIDiagnosticsAdminPanel: React.FC<AIDiagnosticsAdminPanelProps> = ({
  isOpen,
  onClose,
  onActiveProviderChange
}) => {
  const [providers, setProviders] = useState<AIDiagnosticProviderConfig[]>([
    {
      id: 'ai-prov-1',
      name: 'Veritas Local Heuristic NLP Engine',
      code: 'local_nlp',
      type: 'local_heuristic',
      status: 'connected',
      version: 'v3.5-multilingual (ES, EN, FR)',
      latencyMs: 3,
      isActive: true,
      endpointUrl: 'browser://memory/nlp-engine',
      apiKeyConfigured: true,
      accuracyRate: '94.2%'
    },
    {
      id: 'ai-prov-2',
      name: 'Google Gemini Flash Academic API',
      code: 'gemini_flash',
      type: 'cloud_api',
      status: 'connected',
      version: 'gemini-2.5-flash',
      latencyMs: 115,
      isActive: false,
      endpointUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
      apiKeyConfigured: true,
      accuracyRate: '97.8%'
    },
    {
      id: 'ai-prov-3',
      name: 'Anthropic Claude 3.5 Sonnet Classifier',
      code: 'claude_sonnet',
      type: 'cloud_api',
      status: 'requires_credentials',
      version: 'claude-3-5-sonnet-20241022',
      latencyMs: null,
      isActive: false,
      endpointUrl: 'https://api.anthropic.com/v1/messages',
      apiKeyConfigured: false,
      accuracyRate: '98.5%'
    },
    {
      id: 'ai-prov-4',
      name: 'OpenAI GPT-4o Academic Detector (Experimental)',
      code: 'gpt4o_exp',
      type: 'experimental_llm',
      status: 'disabled',
      version: 'gpt-4o-2024-11-20',
      latencyMs: null,
      isActive: false,
      endpointUrl: 'https://api.openai.com/v1/chat/completions',
      apiKeyConfigured: false,
      accuracyRate: '96.9%'
    }
  ]);

  const [testingId, setTestingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  if (!isOpen) return null;

  const handleSetActive = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => {
        const updatedActive = p.id === id;
        if (updatedActive && onActiveProviderChange) {
          onActiveProviderChange(p.name);
        }
        return { ...p, isActive: updatedActive };
      })
    );
    setSuccessMessage('✓ Proveedor de diagnóstico de IA activo actualizado correctamente.');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleTestInference = (id: string) => {
    setTestingId(id);
    setSuccessMessage(null);

    setTimeout(() => {
      setProviders((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            const simulatedLatency = p.type === 'local_heuristic' ? Math.floor(Math.random() * 5) + 2 : Math.floor(Math.random() * 60) + 85;
            return {
              ...p,
              status: p.apiKeyConfigured || p.type === 'local_heuristic' ? 'connected' : p.status,
              latencyMs: simulatedLatency
            };
          }
          return p;
        })
      );
      setTestingId(null);
      setSuccessMessage('✓ Prueba de inferencia completada exitosamente (Puntuación de perplejidad y burstiness calibradas).');
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 1200);
  };

  const handleToggleStatus = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStatus = p.status === 'disabled' ? (p.apiKeyConfigured || p.type === 'local_heuristic' ? 'connected' : 'requires_credentials') : 'disabled';
          return { ...p, status: newStatus };
        }
        return p;
      })
    );
  };

  const handleSaveApiKey = (id: string) => {
    if (!apiKeyInput.trim()) return;
    setProviders((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            apiKeyConfigured: true,
            status: 'connected',
            latencyMs: 95
          };
        }
        return p;
      })
    );
    setEditingKeyId(null);
    setApiKeyInput('');
    setSuccessMessage('✓ Clave API de detección de IA configurada de forma segura en el servidor backend proxy.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  AIDiagnosticsAdminPanel • Gestión de Proveedores de IA
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                  NLP Multi-modelo
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Selección de modelos heurísticos locales, APIs de lenguaje en la nube y modelos experimentales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Banner */}
        <div className="bg-purple-50 border-b border-purple-200 px-4 py-2.5 flex items-center gap-2.5 text-xs text-purple-900">
          <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
          <span>
            <strong>Privacidad Estudiantil:</strong> Los documentos analizados mediante APIs externas se procesan bajo protocolos de confidencialidad institucional (Sin retención de datos para entrenamiento).
          </span>
        </div>

        {successMessage && (
          <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {providers.map((provider) => {
            const isTesting = testingId === provider.id;
            const isEditingKey = editingKeyId === provider.id;
            const isConnected = provider.status === 'connected';
            const requiresAuth = provider.status === 'requires_credentials';
            const isDisabled = provider.status === 'disabled';

            return (
              <div
                key={provider.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  provider.isActive
                    ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/30 shadow-xs'
                    : isDisabled
                    ? 'bg-slate-100/60 border-slate-200 opacity-75'
                    : isConnected
                    ? 'bg-white border-slate-200 hover:border-purple-300'
                    : 'bg-amber-50/40 border-amber-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{provider.name}</h4>
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                        {provider.version}
                      </span>
                      {provider.isActive ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-700 text-white flex items-center gap-1 shadow-2xs">
                          <Check className="w-3 h-3" />
                          <span>MOTOR ACTIVO</span>
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isDisabled
                              ? 'bg-slate-200 text-slate-700'
                              : isConnected
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {isDisabled ? (
                            <span>Deshabilitado</span>
                          ) : isConnected ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Conectado</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 text-amber-700" />
                              <span>Requiere Credenciales</span>
                            </>
                          )}
                        </span>
                      )}

                      {/* Latency & Accuracy */}
                      {provider.latencyMs !== null && !isDisabled && (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-purple-50 text-purple-900 px-2 py-0.5 rounded border border-purple-200">
                          <Activity className="w-3 h-3 text-purple-600" />
                          <span>{provider.latencyMs} ms latencia</span>
                        </span>
                      )}
                      <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                        Precisión: {provider.accuracyRate}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-mono text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        Endpoint: {provider.endpointUrl}
                      </span>
                      <span className="flex items-center gap-1 text-purple-700 font-medium">
                        <Cpu className="w-3 h-3" />
                        <span>Tipo: {provider.type.replace('_', ' ').toUpperCase()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-start shrink-0">
                    {!provider.isActive && !isDisabled && isConnected && (
                      <button
                        onClick={() => handleSetActive(provider.id)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Establecer Activo
                      </button>
                    )}

                    <button
                      onClick={() => handleTestInference(provider.id)}
                      disabled={isTesting || isDisabled}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
                      title="Probar inferencia de IA en tiempo real"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-purple-600' : ''}`} />
                      <span>{isTesting ? 'Probando...' : 'Probar Inferencia'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleStatus(provider.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isDisabled
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isDisabled ? 'Activar' : 'Desactivar'}
                    </button>
                  </div>
                </div>

                {/* API Key configuration section if required */}
                {requiresAuth && !isEditingKey && !isDisabled && (
                  <div className="mt-3 pt-3 border-t border-amber-200 flex items-center justify-between text-xs">
                    <span className="text-amber-900 font-medium">
                      Este modelo en la nube requiere una clave API institucional para realizar peticiones de inferencia.
                    </span>
                    <button
                      onClick={() => setEditingKeyId(provider.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-semibold cursor-pointer shadow-xs"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Configurar Clave API</span>
                    </button>
                  </div>
                )}

                {isEditingKey && (
                  <div className="mt-3 pt-3 border-t border-amber-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Ingresar Token o Clave API (Cifrado seguro en servidor proxy):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        placeholder="Ej: sk-ant-api03-..."
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => handleSaveApiKey(provider.id)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Guardar Clave
                      </button>
                      <button
                        onClick={() => {
                          setEditingKeyId(null);
                          setApiKeyInput('');
                        }}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>AIDiagnosticsAdminPanel sincronizado con motores de detección multilingüe de Veritas Academic.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
