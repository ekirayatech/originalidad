import React, { useState, useRef } from 'react';
import { ReferenceDocument } from '../types';
import {
  BookOpen,
  Plus,
  Trash2,
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GraduationCap,
  Sparkles,
  Info,
  Layers,
  Search,
  Check
} from 'lucide-react';
import { extractTextFromFile } from '../utils/documentParser';

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
  const [addMode, setAddMode] = useState<'upload' | 'manual'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Batch progress state
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; filename: string } | null>(
    null
  );

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newType, setNewType] = useState<ReferenceDocument['type']>('student_paper');
  const [newInstitution, setNewInstitution] = useState('Colegio Bilingüe Ekirayá - Entregas Anteriores');
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const [newContent, setNewContent] = useState('');
  const [extractedWordCount, setExtractedWordCount] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesProcess = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setSuccessMessage(null);

    // If single file, extract and populate form so user can review/edit or save
    if (fileArray.length === 1) {
      const file = fileArray[0];
      try {
        const extracted = await extractTextFromFile(file);
        if (!extracted.text.trim() || extracted.wordCount < 10) {
          setUploadError(
            'El archivo no contiene suficiente texto legible (mínimo 10 palabras). Verifica que sea un PDF o DOCX con texto seleccionable.'
          );
          setIsUploading(false);
          return;
        }

        setNewTitle(extracted.title || file.name.replace(/\.[^/.]+$/, ''));
        setNewAuthor(extracted.author || 'Estudiante Ekirayá (Entrega Previa)');
        setNewContent(extracted.text);
        setExtractedWordCount(extracted.wordCount);
        setNewType('student_paper');
        setNewInstitution('Colegio Bilingüe Ekirayá - Repositorio de Trabajos');
      } catch (err: any) {
        console.error('Error procesando archivo para corpus:', err);
        setUploadError('No se pudo procesar el archivo. Formatos admitidos: PDF, Word (.docx), TXT, ODT.');
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // Multiple files: Batch extract & add automatically
    let addedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setBatchProgress({ current: i + 1, total: fileArray.length, filename: file.name });

      try {
        const extracted = await extractTextFromFile(file);
        if (extracted.text.trim() && extracted.wordCount >= 10) {
          const doc: ReferenceDocument = {
            id: `custom-${Date.now()}-${i}`,
            title: extracted.title || file.name.replace(/\.[^/.]+$/, ''),
            author: extracted.author || 'Estudiante Ekirayá (Entrega Previa)',
            type: 'student_paper',
            year: new Date().getFullYear(),
            institutionOrJournal: 'Colegio Bilingüe Ekirayá - Entregas Anteriores',
            content: extracted.text.trim(),
            isCustomUploaded: true
          };
          onAddDocument(doc);
          addedCount++;
        } else {
          errors.push(`${file.name}: texto no legible.`);
        }
      } catch {
        errors.push(`${file.name}: error de formato.`);
      }
    }

    setIsUploading(false);
    setBatchProgress(null);

    if (addedCount > 0) {
      setSuccessMessage(`✓ Se agregaron exitosamente ${addedCount} documentos al Corpus de Referencia.`);
      setIsAdding(false);
    }
    if (errors.length > 0) {
      setUploadError(`Algunos archivos no se pudieron procesar (${errors.length}): ${errors.slice(0, 2).join(', ')}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesProcess(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesProcess(e.target.files);
    }
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const doc: ReferenceDocument = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Autor Registrado',
      type: newType,
      year: newYear,
      institutionOrJournal: newInstitution.trim() || 'Repositorio Local',
      content: newContent.trim(),
      isCustomUploaded: true
    };

    onAddDocument(doc);
    setSuccessMessage(`✓ Documento "${newTitle.trim()}" guardado en la biblioteca.`);
    setNewTitle('');
    setNewAuthor('');
    setNewContent('');
    setExtractedWordCount(null);
    setIsAdding(false);
  };

  const customDocsCount = corpus.filter((d) => d.isCustomUploaded).length;

  const filteredCorpus = corpus.filter((doc) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.author.toLowerCase().includes(q) ||
      (doc.institutionOrJournal && doc.institutionOrJournal.toLowerCase().includes(q)) ||
      doc.content.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.odt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain"
          onClick={(e) => e.stopPropagation()}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Header */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-600 flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-lg text-white truncate">
                Biblioteca de Cotejo y Corpus de Referencia
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 truncate">
                Coteja trabajos nuevos contra entregas anteriores de estudiantes, leyes y publicaciones
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Informative Explanation Banner */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 sm:p-4 text-xs text-sky-950 flex items-start gap-3 shadow-xs">
            <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm text-sky-900">
                ¿Cómo funciona la comparación con documentos previamente cargados?
              </p>
              <p className="text-sky-800 leading-relaxed text-xs">
                Todos los documentos añadidos a esta biblioteca quedan guardados en la memoria local segura (RAM y almacenamiento de tu navegador).
                Cada vez que analices un nuevo trabajo, el sistema descompondrá sus oraciones y n-gramas y los <strong>comparará simultáneamente contra todas estas obras previas</strong>,
                señalando el porcentaje de coincidencia exacta y la fuente correspondiente.
              </p>
            </div>
          </div>

          {/* Success Notification */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-700 hover:text-emerald-950 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>Documentos en el Corpus ({corpus.length})</span>
                {customDocsCount > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    {customDocsCount} cargados por ti
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-500">
                Leyes colombianas, artículos científicos y trabajos previos de estudiantes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsAdding(true);
                  setAddMode('upload');
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Subir Archivo(s) (.pdf, .docx)</span>
              </button>
              <button
                onClick={() => {
                  setIsAdding(true);
                  setAddMode('manual');
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0 border border-slate-300"
              >
                <Plus className="w-4 h-4" />
                <span>Pegar Texto</span>
              </button>
            </div>
          </div>

          {/* Form / Upload to add custom reference */}
          {isAdding && (
            <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/70 space-y-4 animate-in fade-in shadow-xs">
              <div className="flex items-center justify-between border-b border-sky-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-sky-950 uppercase tracking-wider">
                    {addMode === 'upload' ? 'Subir Documentos Previos para Cotejo' : 'Pegar Referencia Manualmente'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setAddMode('upload')}
                    className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${
                      addMode === 'upload'
                        ? 'bg-sky-700 text-white'
                        : 'bg-white text-sky-800 border border-sky-200'
                    }`}
                  >
                    Subir Archivos
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddMode('manual')}
                    className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${
                      addMode === 'manual'
                        ? 'bg-sky-700 text-white'
                        : 'bg-white text-sky-800 border border-sky-200'
                    }`}
                  >
                    Escribir/Pegar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="text-slate-500 hover:text-slate-800 p-1 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {addMode === 'upload' && !newContent && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-xl p-6 text-center cursor-pointer bg-white transition-all group"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center py-4 text-sky-700">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <span className="text-xs font-semibold">
                        {batchProgress
                          ? `Procesando archivo ${batchProgress.current} de ${batchProgress.total}: ${batchProgress.filename}...`
                          : 'Extrayendo texto del archivo en memoria...'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-sm text-slate-800 mb-1">
                        Haz clic o arrastra uno o varios archivos previos de estudiantes
                      </p>
                      <p className="text-xs text-slate-500 mb-2">
                        Formatos compatibles: PDF, Word (.docx, .doc), TXT o ODT • <strong className="text-sky-700">¡Soporta selección múltiple en lote!</strong>
                      </p>
                      <span className="text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">
                        Se guardarán como fuentes para contrastar futuras entregas
                      </span>
                    </div>
                  )}
                </div>
              )}

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Form fields (populated automatically if uploaded single file, or filled manually) */}
              {(newContent || addMode === 'manual') && (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Título de la Obra o Trabajo *
                      </label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Ej: Ensayo sobre el Conflicto Armado - Juan Pérez 2024"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Autor(es)</label>
                      <input
                        type="text"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        placeholder="Ej: Juan Pérez (Grado 11A)"
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
                        <option value="student_paper">Trabajo o Tesis Previa de Estudiante</option>
                        <option value="academic_journal">Revista Científica / SciELO / Redalyc</option>
                        <option value="institutional_repository">Repositorio Universitario / Institucional</option>
                        <option value="legal_statute">Ley / Estatuto Jurídico</option>
                        <option value="open_web">Publicación Web Abierta</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Institución / Asignatura</label>
                      <input
                        type="text"
                        value={newInstitution}
                        onChange={(e) => setNewInstitution(e.target.value)}
                        placeholder="Ej: Colegio Bilingüe Ekirayá - Ciencias Sociales"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <label className="font-semibold text-slate-700">
                        Contenido Completo de Cotejo *
                      </label>
                      {extractedWordCount !== null && (
                        <span className="text-slate-500 font-mono">
                          {extractedWordCount} palabras extraídas
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={5}
                      required
                      value={newContent}
                      onChange={(e) => {
                        setNewContent(e.target.value);
                        setExtractedWordCount(e.target.value.trim().split(/\s+/).filter(Boolean).length);
                      }}
                      placeholder="Pega o revisa el texto extraído que servirá como fuente de cotejo para detectar coincidencias..."
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 font-sans"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setNewContent('');
                        setNewTitle('');
                        setNewAuthor('');
                        setExtractedWordCount(null);
                        setIsAdding(false);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      Guardar en la Biblioteca de Cotejo
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Search bar for registered corpus */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar en la biblioteca por título, estudiante, palabras clave..."
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-hidden text-xs"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List of corpus items */}
          <div className="space-y-3">
            {filteredCorpus.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                No se encontraron documentos que coincidan con "{searchFilter}".
              </div>
            ) : (
              filteredCorpus.map((doc) => {
                const wordsCount = doc.content.split(/\s+/).filter(Boolean).length;
                return (
                  <div
                    key={doc.id}
                    className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="font-bold text-sm text-slate-900 truncate">{doc.title}</h5>
                        {doc.isCustomUploaded ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                            Cargado previamente
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 shrink-0">
                            Fuente Base
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-xs">
                          {wordsCount} palabras
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {doc.author} • {doc.year} • {doc.institutionOrJournal || 'Repositorio Ekirayá'}
                      </p>
                      <p className="text-xs text-slate-500 italic line-clamp-2 mt-1 font-serif">
                        "{doc.content.slice(0, 220)}..."
                      </p>
                    </div>

                    {doc.isCustomUploaded && (
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                        title="Eliminar documento del corpus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Los cotejos se procesan localmente según la Ley 1581 de 2012 (Habeas Data).
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Cerrar Biblioteca
          </button>
        </div>
      </div>
    </div>
  );
};
