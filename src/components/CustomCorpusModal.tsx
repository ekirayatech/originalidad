import React, { useState } from 'react';
import { ReferenceDocument } from '../types';
import {
  BookOpen,
  Plus,
  Trash2,
  X,
  Upload,
  FileCheck,
  Building,
  GraduationCap
} from 'lucide-react';

interface CustomCorpusModalProps {
  isOpen: boolean;
  onClose: () => void;
  corpus: ReferenceDocument[];
  onAddDocument: (doc: ReferenceDocument) => void;
  onDeleteDocument: (docId: string) => void;
}

export const CustomCorpusModal: React.FC<CustomCorpusModalProps> = ({
  isOpen,
  onClose,
  corpus,
  onAddDocument,
  onDeleteDocument
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newType, setNewType] = useState<ReferenceDocument['type']>('academic_journal');
  const [newInstitution, setNewInstitution] = useState('');
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const [newContent, setNewContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const doc: ReferenceDocument = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Autor Anónimo',
      type: newType,
      year: newYear,
      institutionOrJournal: newInstitution.trim() || 'Repositorio Local',
      content: newContent.trim(),
      isCustomUploaded: true
    };

    onAddDocument(doc);
    setNewTitle('');
    setNewAuthor('');
    setNewContent('');
    setNewInstitution('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-600 flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-lg text-white truncate">
                Biblioteca de Referencia en RAM
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 truncate">
                Corpus de contraste: leyes, artículos científicos y trabajos locales
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Documentos en el Corpus ({corpus.length})
              </h4>
              <p className="text-xs text-slate-500">
                Todo documento que verifique se cotejará contra esta base de conocimiento local.
              </p>
            </div>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? 'Cancelar' : 'Agregar Referencia'}</span>
            </button>
          </div>

          {/* Form to add custom reference */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 space-y-4 animate-in fade-in">
              <h5 className="font-bold text-xs text-sky-950 uppercase tracking-wider">
                Nuevo Documento de Referencia
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Título de la Obra o Ley *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ej: Tesis de Grado sobre Bioética 2024"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Autor(es)</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="Ej: Dra. María Fernanda Roa"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipo de Fuente</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="academic_journal">Revista Científica / SciELO / Redalyc</option>
                    <option value="institutional_repository">Repositorio Universitario</option>
                    <option value="legal_statute">Ley / Estatuto Jurídico</option>
                    <option value="student_paper">Trabajo o Tesis Previa</option>
                    <option value="open_web">Publicación Web Abierta</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Institución / Revista / URL</label>
                  <input
                    type="text"
                    value={newInstitution}
                    onChange={(e) => setNewInstitution(e.target.value)}
                    placeholder="Ej: Universidad de los Andes"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 text-xs block mb-1">
                  Texto Completo o Extracto de Referencia *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Pegue aquí el texto que servirá como fuente de cotejo para detectar coincidencias..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs"
                >
                  Guardar en Memoria
                </button>
              </div>
            </form>
          )}

          {/* List of corpus items */}
          <div className="space-y-3">
            {corpus.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-slate-900">{doc.title}</h5>
                    {doc.isCustomUploaded && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                        Cargado por usuario
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    {doc.author} • {doc.year} • {doc.institutionOrJournal || 'Repositorio Abierto'}
                  </p>
                  <p className="text-xs text-slate-500 italic line-clamp-2 mt-1">
                    "{doc.content.slice(0, 200)}..."
                  </p>
                </div>

                {doc.isCustomUploaded && (
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Eliminar documento del corpus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
          >
            Cerrar Biblioteca
          </button>
        </div>
      </div>
    </div>
  );
};
