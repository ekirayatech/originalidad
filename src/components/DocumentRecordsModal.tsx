import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Search,
  Trash2,
  Calendar,
  User,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Save,
  Clock,
  Sparkles,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import {
  type SavedDocumentRecord,
  subscribeUserOrSchoolDocuments,
  deleteAnalyzedDocumentRecord,
  updateDocumentNotes,
  clearAllEvaluationAndCotejoRecords
} from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Database } from 'lucide-react';

interface DocumentRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocumentSnippet?: (snippet: string, title: string, author: string) => void;
}

export const DocumentRecordsModal: React.FC<DocumentRecordsModalProps> = ({
  isOpen,
  onClose,
  onSelectDocumentSnippet
}) => {
  const { user, userProfile, isAdmin } = useAuth();
  const [documents, setDocuments] = useState<SavedDocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'students' | 'mine'>('all');
  const [isPurging, setIsPurging] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isTeacher = userProfile?.role === 'teacher';

  useEffect(() => {
    if (!isOpen || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeUserOrSchoolDocuments(
      user.uid,
      isTeacher,
      (docs) => {
        setDocuments(docs);
        setLoading(false);
      },
      (err) => {
        console.error('Error al escuchar documentos:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, user, isTeacher]);

  if (!isOpen) return null;

  const filteredDocs = documents.filter((doc) => {
    // Filter by tab if teacher
    if (isTeacher) {
      if (activeFilter === 'students') {
        const isStudentEmail = doc.userEmail?.toLowerCase().includes('@est.cem.edu.co') || doc.author.toLowerCase().includes('estudiante');
        if (!isStudentEmail) return false;
      } else if (activeFilter === 'mine') {
        if (doc.userId !== user?.uid) return false;
      }
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.author.toLowerCase().includes(q) ||
      (doc.userEmail && doc.userEmail.toLowerCase().includes(q)) ||
      (doc.teacherNotes && doc.teacherNotes.toLowerCase().includes(q))
    );
  });

  const handleStartEditNotes = (doc: SavedDocumentRecord) => {
    setEditingNotesId(doc.id);
    setNotesText(doc.teacherNotes || '');
  };

  const handleSaveNotes = async (docId: string) => {
    setIsSavingNotes(true);
    try {
      await updateDocumentNotes(docId, notesText);
      setEditingNotesId(null);
      setStatusMessage('✓ Observaciones del docente guardadas correctamente en la nube.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      console.error('Error guardando notas:', error);
      alert('Error al guardar observaciones.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await deleteAnalyzedDocumentRecord(docId);
      setDeleteConfirmId(null);
      setStatusMessage('✓ Registro eliminado de Firebase.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      console.error('Error eliminando documento:', error);
      alert('No se pudo eliminar el registro.');
    }
  };

  const handlePurgeAll = async () => {
    const confirmation = window.prompt(
      '¿Deseas eliminar permanentemente TODOS los registros de análisis y cotejo guardados en Firebase?\n\nPara confirmar escribe "BORRAR":'
    );
    if (confirmation !== 'BORRAR') return;

    setIsPurging(true);
    try {
      const res = await clearAllEvaluationAndCotejoRecords();
      setStatusMessage(`✓ Se eliminaron todos los registros (${res.documentsCleared} evaluaciones).`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      alert(`Error al purgar registros: ${err?.message || err}`);
    } finally {
      setIsPurging(false);
    }
  };

  const avgOriginality =
    documents.length > 0
      ? Math.round(documents.reduce((acc, d) => acc + d.originalityScore, 0) / documents.length)
      : 0;

  const highRiskCount = documents.filter((d) => d.overallSimilarity >= 30).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-linear-to-r from-sky-950 via-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Historial de Evaluaciones y Cotejo
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    userProfile?.role === 'student'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-indigo-500 text-white'
                  }`}
                >
                  {userProfile?.roleLabel || (userProfile?.role === 'student' ? 'Estudiante CEM' : 'Docente CEM')}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Colegio Ekirayá CEM • Conectado como{' '}
                <span className="text-sky-300 font-semibold">{user?.displayName || user?.email}</span>
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

        {/* Quick Stats Bar & Role Filter */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 sm:gap-6">
            <div>
              <span className="text-slate-500 block text-[11px]">Trabajos Guardados</span>
              <span className="font-bold text-slate-900 text-sm sm:text-base">{documents.length}</span>
            </div>
            <div className="h-7 w-px bg-slate-300" />
            <div>
              <span className="text-slate-500 block text-[11px]">Originalidad Promedio</span>
              <span className="font-bold text-emerald-600 text-sm sm:text-base">
                {documents.length > 0 ? `${avgOriginality}%` : '--'}
              </span>
            </div>
            <div className="h-7 w-px bg-slate-300" />
            <div>
              <span className="text-slate-500 block text-[11px]">Alertas (&gt;30% Similitud)</span>
              <span className="font-bold text-amber-600 text-sm sm:text-base">{highRiskCount}</span>
            </div>
          </div>

          {/* Search box and purge button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isAdmin && documents.length > 0 && (
              <button
                onClick={handlePurgeAll}
                disabled={isPurging}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                title="Borrar todos los registros de la base de datos"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Borrar todo</span>
              </button>
            )}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por estudiante, título..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Teacher filter tabs (only shown for @cem.edu.co teachers) */}
        {isTeacher && (
          <div className="px-3 sm:px-6 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-xs overflow-x-auto no-scrollbar">
            <span className="text-slate-500 font-semibold mr-1 whitespace-nowrap shrink-0">Vista Docente:</span>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              Todas las entregas CEM ({documents.length})
            </button>
            <button
              onClick={() => setActiveFilter('students')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeFilter === 'students'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              Entregas Estudiantes (@est.cem.edu.co)
            </button>
            <button
              onClick={() => setActiveFilter('mine')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeFilter === 'mine'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              Mis revisiones
            </button>
          </div>
        )}

        {/* Feedback Message */}
        {statusMessage && (
          <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
              <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Cargando registros de Firestore...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-14 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 mx-auto flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800 mb-1">
                {searchQuery ? 'No hay registros que coincidan' : 'No hay documentos en este filtro'}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchQuery
                  ? 'Intenta con otro término de búsqueda.'
                  : 'Cada vez que revises un documento en el sistema, se almacenará automáticamente en la base de datos y en la biblioteca de cotejo institucional.'}
              </p>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const formattedDate = new Date(doc.createdAt).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              const isStudentDoc =
                doc.userEmail?.toLowerCase().includes('@est.cem.edu.co') ||
                doc.author.toLowerCase().includes('estudiante');

              const isEditingThisNotes = editingNotesId === doc.id;

              return (
                <div
                  key={doc.id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 hover:shadow-xs transition-all space-y-3"
                >
                  {/* Top row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{doc.title}</h4>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm">
                          {doc.wordCount} palabras
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isStudentDoc
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                          }`}
                        >
                          {isStudentDoc ? (
                            <>
                              <GraduationCap className="w-3 h-3" />
                              <span>Estudiante CEM</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3 h-3" />
                              <span>Docente CEM</span>
                            </>
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-sky-50 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                          <Database className="w-3 h-3 text-sky-600" />
                          <span>Cotejo Activo</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>VERIFICADO</span>
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formattedDate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{doc.author}</span>
                        {doc.userEmail && (
                          <span className="text-slate-400 font-mono text-[11px]">({doc.userEmail})</span>
                        )}
                      </p>
                      {doc.documentHash && (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-950 bg-emerald-50/90 border border-emerald-200/90 px-2 py-0.5 rounded-md max-w-fit">
                          <span className="text-slate-500 font-sans text-[10px] font-bold">Hash SHA-256:</span>
                          <span className="truncate max-w-[200px] sm:max-w-xs">{doc.documentHash}</span>
                        </div>
                      )}
                    </div>

                    {/* Scores */}
                    <div className="flex items-center gap-2 self-start shrink-0">
                      <div
                        className={`px-3 py-1.5 rounded-lg text-center ${
                          doc.originalityScore >= 80
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : doc.originalityScore >= 60
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        <span className="block text-[10px] font-bold uppercase tracking-wider">
                          Originalidad
                        </span>
                        <span className="text-sm font-extrabold">{doc.originalityScore}%</span>
                      </div>

                      <div
                        className={`px-3 py-1.5 rounded-lg text-center ${
                          doc.overallSimilarity <= 15
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className="block text-[10px] font-bold uppercase tracking-wider">
                          Similitud
                        </span>
                        <span className="text-sm font-bold">{doc.overallSimilarity}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Snippet */}
                  {doc.summary && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                      "{doc.summary}"
                    </p>
                  )}

                  {/* Teacher Notes Section */}
                  <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-950 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                        Observaciones del Docente / Retroalimentación
                      </span>
                      {!isEditingThisNotes && (
                        <button
                          onClick={() => handleStartEditNotes(doc)}
                          className="text-[11px] text-sky-700 hover:text-sky-900 font-semibold cursor-pointer"
                        >
                          {doc.teacherNotes ? 'Editar Notas' : '+ Agregar Notas'}
                        </button>
                      )}
                    </div>

                    {isEditingThisNotes ? (
                      <div className="space-y-2 mt-1">
                        <textarea
                          value={notesText}
                          onChange={(e) => setNotesText(e.target.value)}
                          placeholder="Escribe comentarios pedagógicos o acciones a seguir con el estudiante..."
                          className="w-full p-2.5 bg-white border border-sky-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                          rows={2}
                          maxLength={1800}
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveNotes(doc.id)}
                            disabled={isSavingNotes}
                            className="flex items-center gap-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-md font-semibold text-xs cursor-pointer shadow-xs"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{isSavingNotes ? 'Guardando...' : 'Guardar'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-700 text-xs">
                        {doc.teacherNotes || (
                          <span className="text-slate-400 italic">
                            Sin observaciones registradas todavía.
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    {onSelectDocumentSnippet && doc.contentSnippet ? (
                      <button
                        onClick={() => {
                          onSelectDocumentSnippet(doc.contentSnippet, doc.title, doc.author);
                          onClose();
                        }}
                        className="text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Cargar texto en analizador</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">ID: {doc.id}</span>
                    )}

                    {deleteConfirmId === doc.id ? (
                      <div className="flex items-center gap-2 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                        <span className="text-[11px] text-rose-800 font-semibold">¿Confirmar?</span>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                        >
                          Sí, eliminar
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-[10px] text-slate-600 hover:text-slate-800 cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(doc.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Eliminar este registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Registros sincronizados con Google Cloud Firestore de forma segura.</span>
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
