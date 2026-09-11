import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Play,
  ClipboardPaste,
  FileCode,
  FileType
} from 'lucide-react';
import { extractTextFromFile, ExtractedDocument } from '../utils/documentParser';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentAnalyzed: (title: string, author: string, content: string) => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onDocumentAnalyzed
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedDocument | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pastedText, setPastedText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const extracted = await extractTextFromFile(file);

      if (!extracted.text.trim() || extracted.wordCount < 10) {
        setErrorMessage(
          'El documento no contiene suficiente texto legible (mínimo 10 palabras). Si es un PDF escaneado sólo con imágenes, asegúrese de que cuente con texto seleccionable o cópielo y péguelo en la pestaña correspondiente.'
        );
        setIsLoading(false);
        return;
      }

      setExtractedData(extracted);
      setTitle(extracted.title);
      if (!author) {
        setAuthor('Estudiante Ekirayá');
      }
    } catch (err: any) {
      console.error('Error procesando archivo:', err);
      setErrorMessage(
        'No se pudo leer el archivo. Verifique que sea un formato compatible (.pdf, .docx, .doc, .txt, .odt).'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
    // Clear value to allow selecting the same file again if desired
    e.target.value = '';
  };

  const handleExecuteAnalysis = () => {
    if (activeMode === 'upload') {
      if (!extractedData) return;
      const finalTitle = title.trim() || extractedData.title || 'Documento sin título';
      const finalAuthor = author.trim() || 'Estudiante Ekirayá';
      onDocumentAnalyzed(finalTitle, finalAuthor, extractedData.text);
    } else {
      const words = pastedText.trim().split(/\s+/).filter(Boolean);
      if (words.length < 10) {
        setErrorMessage('El texto pegado debe contener al menos 10 palabras para ser analizado.');
        return;
      }
      const finalTitle = title.trim() || 'Documento de Evaluación';
      const finalAuthor = author.trim() || 'Estudiante Ekirayá';
      onDocumentAnalyzed(finalTitle, finalAuthor, pastedText.trim());
    }
    onClose();
  };

  const handleResetFile = () => {
    setExtractedData(null);
    setTitle('');
    setAuthor('');
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const pastedWordCount = pastedText.trim() ? pastedText.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh]">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md,.rtf,.odt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,text/markdown"
          onClick={(e) => e.stopPropagation()}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Subir o Cargar Documento para Verificación
              </h3>
              <p className="text-xs text-slate-300">
                Colegio Bilingüe Ekirayá • Procesamiento 100% en memoria privada (RAM)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-2 sm:px-6 pt-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setActiveMode('upload');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 py-2.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeMode === 'upload'
                ? 'border-red-600 text-red-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Subir Archivo (.PDF, .DOCX, .TXT)</span>
            <span className="sm:hidden">Subir Archivo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('paste');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 py-2.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeMode === 'paste'
                ? 'border-red-600 text-red-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardPaste className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Pegar Texto Directamente</span>
            <span className="sm:hidden">Pegar Texto</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {activeMode === 'upload' ? (
            !extractedData ? (
              /* Upload Drag & Drop Area */
              <div className="space-y-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-red-500 bg-red-50/60 scale-[1.01]'
                      : 'border-slate-300 hover:border-red-400 hover:bg-slate-50'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-3 py-6">
                      <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                      <p className="text-sm font-bold text-slate-800">
                        Extrayendo texto del documento en memoria...
                      </p>
                      <span className="text-xs text-slate-500">
                        Decodificando estructura localmente sin enviar datos a internet
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-3 shadow-xs">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-800">
                        Haz clic aquí o arrastra tu archivo para examinar
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Compatible con documentos de investigación, tareas y ensayos académicos.
                      </p>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Examinar Archivos de tu Dispositivo
                      </button>

                      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 text-[11px] font-semibold text-slate-600">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                          PDF (.pdf)
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                          Word (.docx, .doc)
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                          Texto (.txt, .md, .rtf)
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Privacy Guarantee */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Garantía de Privacidad Ekirayá:</strong> Los documentos se procesan exclusivamente en la memoria RAM del navegador, cumpliendo la Ley 1581 de 2012 (Habeas Data) y directrices del MEN.
                  </span>
                </div>
              </div>
            ) : (
              /* File Successfully Extracted - Configuration and Run */
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full">
                        Lectura Exitosa ({extractedData.sourceType.toUpperCase()})
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1 break-all">
                        {extractedData.fileName}
                      </h4>
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 mt-1 font-mono">
                        <span>{(extractedData.fileSize / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">
                          {extractedData.wordCount.toLocaleString()} palabras
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetFile}
                    className="text-xs text-slate-600 hover:text-red-600 underline font-medium cursor-pointer"
                  >
                    Cambiar archivo
                  </button>
                </div>

                {/* Title and Author Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Título del Trabajo:
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Título del documento"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Autor / Estudiante:
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Nombre del estudiante"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 shadow-xs"
                    />
                  </div>
                </div>

                {/* Text Snippet Preview */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vista previa del texto extraído:
                  </label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-32 overflow-y-auto text-xs text-slate-700 leading-relaxed font-sans">
                    {extractedData.text.slice(0, 500)}...
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Paste Text Mode */
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Título del Trabajo:
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Ensayo de Historia o Ciencias"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Autor / Estudiante:
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Ej: Sofía Gómez"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pega aquí el contenido a analizar:
                </label>
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Pega aquí el texto completo del ensayo o trabajo que deseas someter al análisis de similitud y patrones de Inteligencia Artificial..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 shadow-xs resize-y"
                />
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                  <span>Palabras: <strong className="text-slate-800">{pastedWordCount}</strong></span>
                  {pastedWordCount < 10 && pastedWordCount > 0 && (
                    <span className="text-amber-600">Mínimo 10 palabras requeridas</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-4 sm:px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          {(extractedData || (activeMode === 'paste' && pastedWordCount >= 10)) && (
            <button
              onClick={handleExecuteAnalysis}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Ejecutar Verificación y Ver Reporte</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
