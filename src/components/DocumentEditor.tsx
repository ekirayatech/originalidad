import React, { useState, useRef, useMemo } from 'react';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';
import {
  FileText,
  Upload,
  Play,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  FileCheck,
  UploadCloud,
  FileUp,
  Languages
} from 'lucide-react';
import { extractTextFromFile } from '../utils/documentParser';
import { detectLanguage } from '../utils/nlpEngine';

interface DocumentEditorProps {
  title: string;
  author: string;
  content: string;
  onTitleChange: (val: string) => void;
  onAuthorChange: (val: string) => void;
  onContentChange: (val: string) => void;
  onRunAnalysis: () => void;
  onOpenCommunityModal?: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  title,
  author,
  content,
  onTitleChange,
  onAuthorChange,
  onContentChange,
  onRunAnalysis,
  onOpenCommunityModal
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastUploadedFile, setLastUploadedFile] = useState<{
    name: string;
    size: number;
    wordCount: number;
    sourceType: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;

  const detectedLang = useMemo(() => {
    return wordCount >= 4 ? detectLanguage(content) : null;
  }, [content, wordCount]);

  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_DOCUMENTS.find((s) => s.id === sampleId);
    if (sample) {
      onTitleChange(sample.title);
      onAuthorChange(sample.author);
      onContentChange(sample.content);
      setLastUploadedFile(null);
      setUploadError(null);
    }
  };

  const processFile = async (file: File) => {
    setIsReadingFile(true);
    setUploadError(null);

    try {
      const extracted = await extractTextFromFile(file);

      if (!extracted.text.trim() || extracted.wordCount < 5) {
        setUploadError(
          'El archivo no contiene texto legible suficiente (mínimo 5 palabras). Si es un PDF escaneado sólo como imagen, asegúrese de que contenga texto seleccionable o péguelo en el recuadro inferior.'
        );
        setIsReadingFile(false);
        return;
      }

      onContentChange(extracted.text);
      if (!title || title.trim() === '') {
        onTitleChange(extracted.title);
      }
      setLastUploadedFile({
        name: extracted.fileName,
        size: extracted.fileSize,
        wordCount: extracted.wordCount,
        sourceType: extracted.sourceType
      });
    } catch (err: any) {
      console.error('Error al extraer texto del archivo:', err);
      setUploadError(
        'Ocurrió un error al procesar el archivo. Asegúrese de que sea un PDF, Word (.docx, .doc) o documento de texto válido.'
      );
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt,.md,.rtf,.odt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,text/markdown"
        onChange={handleFileInput}
        disabled={isReadingFile}
        onClick={(e) => e.stopPropagation()}
        className="hidden"
      />

      {/* Hero / Information Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                Colegio Bilingüe Ekirayá
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Escala Institucional
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                <Languages className="w-3 h-3 text-blue-600" />
                Trilingüe (ES / EN / FR)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Subir o Escribir Documento para Análisis
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Procesamiento <strong>100% en la memoria de su navegador (RAM)</strong>. Conforme a la Ley 23 de 1982, Habeas Data (Ley 1581) y directrices del MEN. Soporta español, inglés y francés.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {onOpenCommunityModal && (
              <button
                type="button"
                onClick={onOpenCommunityModal}
                className="px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-900 font-semibold text-xs transition-colors text-center cursor-pointer min-h-[42px] flex items-center justify-center"
              >
                Guía del Embudo y Normas
              </button>
            )}
            <button
              onClick={onRunAnalysis}
              disabled={wordCount < 10 || isReadingFile}
              className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all min-h-[42px] ${
                wordCount >= 10 && !isReadingFile
                  ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span>Ejecutar Verificación y Ver Reporte</span>
            </button>
          </div>
        </div>

        {/* Big File Upload Drag-and-Drop Area */}
        <div className="mt-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 transition-all cursor-pointer ${
              isDragging
                ? 'border-red-500 bg-red-50/60 scale-[1.005]'
                : 'border-slate-300 hover:border-red-400 bg-slate-50/70 hover:bg-slate-50'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
                  {isReadingFile ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {isReadingFile
                      ? 'Extrayendo texto del archivo en memoria...'
                      : 'Haz clic aquí o arrastra tu archivo (PDF, Word o Texto)'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Se procesará de forma inmediata y privada en tu navegador
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      PDF (.pdf)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      WORD (.docx, .doc)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      TEXTO (.txt, .md, .rtf)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={isReadingFile}
                  className="font-bold text-xs bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Examinar Archivos
                </button>
              </div>
            </div>

            {/* Last Uploaded File Badge */}
            {lastUploadedFile && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    Archivo cargado: <strong>{lastUploadedFile.name}</strong> (
                    {(lastUploadedFile.size / 1024).toFixed(1)} KB,{' '}
                    <strong className="text-emerald-800">{lastUploadedFile.wordCount.toLocaleString()} palabras</strong>)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRunAnalysis();
                  }}
                  className="font-bold text-emerald-700 hover:text-emerald-900 underline ml-2 cursor-pointer"
                >
                  Analizar ahora →
                </button>
              </div>
            )}

            {uploadError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Sample Selector */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">
              Casos de demostración trilingües (Español, Inglés y Francés):
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Haz clic para cargar texto de prueba
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {SAMPLE_DOCUMENTS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample.id)}
                className="text-left p-3 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50/40 transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      <span>{sample.flag || '📄'}</span>
                      <span className="uppercase text-[9px]">{sample.language}</span>
                    </span>
                    {sample.category === 'high_similarity' && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" title="Alta similitud de plagio" />
                    )}
                    {sample.category === 'high_ai' && (
                      <span className="w-2 h-2 rounded-full bg-purple-500" title="Generado con IA" />
                    )}
                    {sample.category === 'authentic_academic' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Auténtico académico" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-700 leading-snug">
                    {sample.label}
                  </h4>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2 mt-1.5 leading-tight">
                  {sample.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metadata Form: Title and Author */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Título del Trabajo / Ensayo / Tesis:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Ej: Análisis Sociojurídico de la Inteligencia Artificial"
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Autor / Estudiante / Investigador:
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => onAuthorChange(e.target.value)}
            placeholder="Ej: Juan Camilo Pérez"
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-xs"
          />
        </div>
      </div>

      {/* Text Area */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs bg-slate-50">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Contenido del documento a evaluar</span>
          </div>
          <span className="text-slate-500">
            Puedes editar o revisar el texto antes del informe
          </span>
        </div>

        <div className="p-4">
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            rows={14}
            placeholder="Pegue o escriba aquí el documento que desea someter a verificación de originalidad y detección de modelos de lenguaje..."
            className="w-full font-sans text-sm text-slate-800 focus:outline-hidden resize-y leading-relaxed border-0 p-2"
          />
        </div>

        {/* Counter and Footer */}
        <div className="bg-slate-50 px-3 sm:px-4 py-2.5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-slate-500 font-mono">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span>Palabras: <strong className="text-slate-800">{wordCount}</strong></span>
            <span>Caracteres: <strong className="text-slate-800">{charCount}</strong></span>
            {detectedLang && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/80 text-blue-900 font-sans font-semibold text-[11px]">
                <Languages className="w-3 h-3 text-blue-600" />
                <span>{detectedLang.flag} {detectedLang.label}</span>
              </span>
            )}
          </div>
          <div>
            {wordCount < 10 ? (
              <span className="text-amber-600 flex items-center gap-1 font-sans font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Se requieren al menos 10 palabras
              </span>
            ) : (
              <span className="text-emerald-600 flex items-center gap-1 font-sans font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Listo para análisis ({wordCount} palabras)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
