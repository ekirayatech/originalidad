import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { ColorFunnel } from './components/ColorFunnel';
import { ReportViewer } from './components/ReportViewer';
import { SourcesPanel } from './components/SourcesPanel';
import { AIDetectionPanel } from './components/AIDetectionPanel';
import { DocumentEditor } from './components/DocumentEditor';
import { LegalComplianceModal } from './components/LegalComplianceModal';
import { CustomCorpusModal } from './components/CustomCorpusModal';
import { CommunityGuidanceModal } from './components/CommunityGuidanceModal';
import { UploadDocumentModal } from './components/UploadDocumentModal';
import { DocumentRecordsModal } from './components/DocumentRecordsModal';
import { AdminManagementModal } from './components/AdminManagementModal';
import { DEFAULT_CORPUS } from './data/defaultCorpus';
import { SAMPLE_DOCUMENTS } from './data/sampleDocuments';
import { EKIRAYA_CONFIG } from './data/ekirayaConfig';
import { AnalysisFilters, ReferenceDocument } from './types';
import { runOriginalityAnalysis } from './utils/nlpEngine';
import { exportAnalysisToPDF, exportAnalysisToCSV } from './utils/exportUtils';
import { useAuth } from './context/AuthContext';
import {
  saveAnalyzedDocumentRecord,
  saveReferenceCorpusDocToFirestore,
  subscribeReferenceDocuments,
  deleteReferenceDocFromFirestore,
  autoIndexAnalyzedDocument,
  subscribeUserOrSchoolDocuments,
  type SavedDocumentRecord
} from './lib/firebase';
import {
  FileText,
  Sparkles,
  Edit3,
  Scale,
  BookOpen,
  Download,
  FileSpreadsheet,
  UploadCloud,
  GraduationCap,
  CheckCircle2,
  ShieldCheck,
  Database,
  LogIn
} from 'lucide-react';

export default function App() {
  const { user, userProfile, isAdmin, login } = useAuth();

  // Corpus state (default + custom stored in localStorage + Firebase cloud sync)
  const [corpus, setCorpus] = useState<ReferenceDocument[]>(() => {
    try {
      const saved = localStorage.getItem('veritas_custom_corpus');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...DEFAULT_CORPUS, ...parsed];
      }
    } catch {
      // fallback
    }
    return DEFAULT_CORPUS;
  });

  // Current document state (initialized with sample to show working app immediately)
  const [title, setTitle] = useState(SAMPLE_DOCUMENTS[0].title);
  const [author, setAuthor] = useState(SAMPLE_DOCUMENTS[0].author);
  const [content, setContent] = useState(SAMPLE_DOCUMENTS[0].content);

  // Analysis filters state
  const [filters, setFilters] = useState<AnalysisFilters>({
    excludeQuotes: false,
    excludeBibliography: true,
    minWordCountThreshold: 8
  });

  // Active view tab in analysis mode: 'report' | 'ai_diagnostics'
  const [activeTab, setActiveTab] = useState<'report' | 'ai_diagnostics'>('report');

  // Mode: Editor or Report
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  // Active selected source ID in sidebar
  const [activeSourceId, setActiveSourceId] = useState<number | null>(null);

  // Selected target AI sentence to highlight and focus in report
  const [targetSentenceId, setTargetSentenceId] = useState<string | null>(null);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isCorpusModalOpen, setIsCorpusModalOpen] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isRecordsModalOpen, setIsRecordsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Firebase records state
  const [savedRecordsCount, setSavedRecordsCount] = useState<number>(0);
  const [isSavingToFirebase, setIsSavingToFirebase] = useState(false);
  const [isSavedToFirebase, setIsSavedToFirebase] = useState(false);
  const [autoIndexMessage, setAutoIndexMessage] = useState<string | null>(null);
  const lastIndexedKeyRef = useRef<string>('');

  // If a student logs in, default their author name automatically
  useEffect(() => {
    if (userProfile?.role === 'student') {
      const studentName = userProfile.displayName || user?.displayName || 'Estudiante CEM';
      if (author === 'Sofía Gómez' || author === 'Estudiante Ekirayá' || !author.trim()) {
        setAuthor(studentName);
      }
    }
  }, [userProfile, user, author]);

  // Listen to saved records in Firestore (teachers see school-wide, students see their own)
  useEffect(() => {
    if (!user) {
      setSavedRecordsCount(0);
      return;
    }

    const isTeacher = userProfile?.role === 'teacher';
    const unsubscribe = subscribeUserOrSchoolDocuments(
      user.uid,
      isTeacher,
      (docs) => {
        setSavedRecordsCount(docs.length);
      },
      (err) => console.error('Error escuchando documentos de usuario:', err)
    );

    return () => unsubscribe();
  }, [user, userProfile]);

  // Sync reference corpus with Firebase Firestore - ONLY when logged in as ADMIN
  // "solo el admin puede ver la biblioteca de cotejo"
  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubscribe = subscribeReferenceDocuments(
      (cloudDocs) => {
        if (cloudDocs.length === 0) return;

        setCorpus((prev) => {
          const merged = [...prev];
          for (const cDoc of cloudDocs) {
            const index = merged.findIndex((d) => d.id === cDoc.id);
            if (index >= 0) {
              merged[index] = cDoc;
            } else {
              merged.push(cDoc);
            }
          }
          return merged;
        });
      },
      (err) => {
        console.warn('Acceso restringido a biblioteca de cotejo:', err?.message || err);
      }
    );

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Run analysis in browser memory (memoized on content, title, author, corpus, filters)
  const analysis = useMemo(() => {
    if (!content.trim() || content.trim().split(/\s+/).filter(Boolean).length < 5) {
      return null;
    }
    return runOriginalityAnalysis(content, title, author, corpus, filters);
  }, [content, title, author, corpus, filters]);

  // AUTOMATIC ARCHIVE & COTEJO REPOSITORY
  // "una vez haga la revisión de documentos, los almacene para ser la de la base de datos y sean cotejados en próximos usos o revisiones"
  useEffect(() => {
    if (!analysis || !user || !content.trim()) return;

    const currentKey = `${analysis.title}__${analysis.totalWords}__${analysis.similarityIndex}__${content.slice(0, 150)}`;
    if (lastIndexedKeyRef.current === currentKey) return;

    let isSubscribed = true;

    const performAutoArchive = async () => {
      try {
        setIsSavingToFirebase(true);
        await autoIndexAnalyzedDocument(analysis, content);
        if (isSubscribed) {
          lastIndexedKeyRef.current = currentKey;
          setIsSavedToFirebase(true);
          const roleLabel = userProfile?.role === 'student' ? 'Estudiante CEM' : 'Docente CEM';
          setAutoIndexMessage(`Documento indexado automáticamente en la Base de Datos de Cotejo CEM (${roleLabel})`);
          setTimeout(() => {
            if (isSubscribed) setAutoIndexMessage(null);
          }, 6000);
        }
      } catch (err) {
        console.error('Error durante indexación automática en Firestore:', err);
      } finally {
        if (isSubscribed) {
          setIsSavingToFirebase(false);
        }
      }
    };

    const timer = setTimeout(performAutoArchive, 700);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [analysis, user, content, userProfile]);

  // Handler to update filters
  const handleUpdateFilters = (newFilters: Partial<AnalysisFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Handler to add custom reference to corpus (both local and Firebase)
  const handleAddCorpusDoc = async (newDoc: ReferenceDocument) => {
    setCorpus((prev) => {
      // Avoid duplicate documents
      const alreadyExists = prev.some(
        (d) =>
          d.id === newDoc.id ||
          (d.title.trim().toLowerCase() === newDoc.title.trim().toLowerCase() &&
            d.content.trim() === newDoc.content.trim())
      );
      if (alreadyExists) return prev;

      const updated = [...prev, newDoc];
      try {
        const customDocs = updated.filter((d) => d.isCustomUploaded);
        localStorage.setItem('veritas_custom_corpus', JSON.stringify(customDocs));
      } catch (e) {
        console.error('Error saving custom corpus to localStorage', e);
      }
      return updated;
    });

    // If user is authenticated, also sync to Firestore
    if (user) {
      try {
        await saveReferenceCorpusDocToFirestore(newDoc);
      } catch (err) {
        console.error('Error guardando documento de referencia en Firestore:', err);
      }
    }
  };

  // Handler to delete custom reference
  const handleDeleteCorpusDoc = async (docId: string) => {
    setCorpus((prev) => {
      const updated = prev.filter((d) => d.id !== docId);
      try {
        const customDocs = updated.filter((d) => d.isCustomUploaded);
        localStorage.setItem('veritas_custom_corpus', JSON.stringify(customDocs));
      } catch (e) {
        console.error('Error deleting from localStorage', e);
      }
      return updated;
    });

    if (user) {
      try {
        await deleteReferenceDocFromFirestore(docId);
      } catch (err) {
        console.error('Error eliminando documento de referencia en Firestore:', err);
      }
    }
  };

  // Handler to save current analysis directly to Firebase
  const handleSaveCurrentToFirebase = async () => {
    if (!analysis) return;
    if (!user) {
      alert('Por favor ingresa con Google en la barra superior para guardar este registro en Firebase.');
      return;
    }

    setIsSavingToFirebase(true);
    try {
      await saveAnalyzedDocumentRecord(analysis, content);
      setIsSavedToFirebase(true);
      setTimeout(() => setIsSavedToFirebase(false), 5000);
    } catch (err) {
      console.error('Error al guardar registro en Firebase:', err);
      alert('No se pudo guardar el registro en Firebase.');
    } finally {
      setIsSavingToFirebase(false);
    }
  };

  // Handler to trigger verification from editor
  const handleRunAnalysis = () => {
    setIsEditorOpen(false);
    setActiveTab('report');
  };

  // Handler when a file is uploaded via modal or quick action
  const handleDocumentAnalyzed = async (
    newTitle: string,
    newAuthor: string,
    newContent: string,
    addToCorpus?: boolean,
    saveToFirebase?: boolean
  ) => {
    setTitle(newTitle);
    setAuthor(newAuthor);
    setContent(newContent);
    setIsSavedToFirebase(false);

    if (addToCorpus) {
      await handleAddCorpusDoc({
        id: `custom-${Date.now()}`,
        title: newTitle,
        author: newAuthor,
        type: 'student_paper',
        year: new Date().getFullYear(),
        institutionOrJournal: 'Colegio Bilingüe Ekirayá - Entregas de Estudiantes',
        content: newContent,
        isCustomUploaded: true
      });
    }

    // Run immediate analysis for Firebase persist if requested
    if (saveToFirebase && user) {
      try {
        const immediateAnalysis = runOriginalityAnalysis(newContent, newTitle, newAuthor, corpus, filters);
        await saveAnalyzedDocumentRecord(immediateAnalysis, newContent);
        setIsSavedToFirebase(true);
        setTimeout(() => setIsSavedToFirebase(false), 5000);
      } catch (err) {
        console.error('Error guardando documento inicial en Firebase:', err);
      }
    }

    setIsEditorOpen(false);
    setActiveTab('report');
  };

  const handleSelectSnippetFromHistory = (snippet: string, snippetTitle: string, snippetAuthor: string) => {
    setTitle(snippetTitle);
    setAuthor(snippetAuthor);
    setContent(snippet);
    setIsEditorOpen(false);
    setActiveTab('report');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-red-100 selection:text-red-900">
      {/* Top Navbar */}
      <Navbar
        analysis={analysis}
        onNewDocument={() => setIsEditorOpen(!isEditorOpen)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenCorpusModal={() => {
          if (isAdmin) {
            setIsCorpusModalOpen(true);
          } else {
            alert('Acceso restringido: únicamente los administradores pueden ver la biblioteca de cotejo.');
          }
        }}
        onOpenLegalModal={() => setIsLegalModalOpen(true)}
        onOpenCommunityModal={() => setIsCommunityModalOpen(true)}
        onOpenRecordsModal={() => setIsRecordsModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onExportPDF={() => analysis && exportAnalysisToPDF(analysis, content)}
        onExportCSV={() => analysis && exportAnalysisToCSV(analysis)}
        isEditorOpen={isEditorOpen}
        corpusCount={corpus.length}
        customCorpusCount={corpus.filter((d) => d.isCustomUploaded).length}
        savedRecordsCount={savedRecordsCount}
      />

      {/* Main Content Area */}
      {isEditorOpen ? (
        <main className="flex-1">
          <DocumentEditor
            title={title}
            author={author}
            content={content}
            onTitleChange={setTitle}
            onAuthorChange={setAuthor}
            onContentChange={setContent}
            onRunAnalysis={handleRunAnalysis}
            onOpenCommunityModal={() => setIsCommunityModalOpen(true)}
          />
        </main>
      ) : analysis ? (
        <main className="flex-1 flex flex-col">
          {/* Color Funnel Header Bar */}
          <ColorFunnel
            similarityScore={analysis.similarityIndex}
            similarityColor={analysis.similarityColor}
            aiScore={analysis.aiWritingIndex}
            aiFlaggedSentences={analysis.aiFlaggedSentencesCount}
            totalSentences={analysis.totalSentences}
            onOpenCommunityModal={() => setIsCommunityModalOpen(true)}
          />

          {/* Institutional Cotejo Status Banner */}
          {user ? (
            <div className="bg-sky-950 text-white px-4 py-2 text-xs border-b border-sky-800">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center flex-wrap gap-2">
                  <Database className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>
                    <strong>Repositorio de Cotejo CEM:</strong> Documento indexado automáticamente para cotejar contra futuras entregas.
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                      isAdmin
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-xs'
                        : userProfile?.role === 'student'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    }`}
                  >
                    {isAdmin ? (
                      <>
                        <ShieldCheck className="w-3 h-3 text-amber-400" />
                        <span>
                          {user.email?.toLowerCase() === 'mebolanos@cem.edu.co'
                            ? `Superadmin: ${user.email}`
                            : `Admin: ${user.email}`}
                        </span>
                      </>
                    ) : userProfile?.role === 'student' ? (
                      <>
                        <GraduationCap className="w-3 h-3" />
                        <span>Estudiante CEM: {user.email}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3 h-3" />
                        <span>Docente CEM: {user.email}</span>
                      </>
                    )}
                  </span>
                </div>
                {autoIndexMessage ? (
                  <div className="flex items-center gap-1.5 text-emerald-300 font-semibold bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-700/50 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{autoIndexMessage}</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-sky-300/80 hidden lg:inline">
                    Base de Datos en Tiempo Real (Firestore)
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-amber-950/90 text-amber-100 px-4 py-2 text-xs border-b border-amber-800/80">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Acceso Institucional CEM:</strong> Los estudiantes ingresan con <code>@est.cem.edu.co</code> y docentes con <code>@cem.edu.co</code> para almacenar y cotejar automáticamente en la base de datos.
                  </span>
                </div>
                <button
                  onClick={() => login()}
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md shadow-xs transition-all cursor-pointer text-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Ingresar con Google CEM</span>
                </button>
              </div>
            </div>
          )}

          {/* Subheader Tabs */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-4">
                <button
                  onClick={() => setActiveTab('report')}
                  className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
                    activeTab === 'report'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Reporte de Similitud y Fuentes</span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-mono">
                    {analysis.sources.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('ai_diagnostics')}
                  className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
                    activeTab === 'ai_diagnostics'
                      ? 'border-purple-600 text-purple-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Diagnóstico Detallado de IA</span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-mono font-bold">
                    {analysis.aiWritingIndex}%
                  </span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-red-700 hover:text-red-900 rounded-md hover:bg-red-50 border border-red-200 font-semibold cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Subir otro archivo</span>
                </button>
                <button
                  onClick={() => setIsCommunityModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-emerald-800 hover:text-emerald-950 rounded-md hover:bg-emerald-50 border border-emerald-200 cursor-pointer"
                >
                  <span>Normas y Embudo</span>
                </button>
                <button
                  onClick={() => setIsEditorOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Texto</span>
                </button>
              </div>
            </div>
          </div>

          {/* View Tab 1: Interactive Document Viewer + Sources Sidebar */}
          {activeTab === 'report' ? (
            <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-190px)]">
              <ReportViewer
                analysis={analysis}
                documentText={content}
                onSelectSource={(srcId) => setActiveSourceId(srcId)}
                targetSentenceId={targetSentenceId}
                onAddToCorpus={() => {
                  handleAddCorpusDoc({
                    id: `custom-${analysis.documentId}`,
                    title: analysis.title,
                    author: analysis.author,
                    type: 'student_paper',
                    year: new Date().getFullYear(),
                    institutionOrJournal: 'Colegio Bilingüe Ekirayá - Entregas de Estudiantes',
                    content: content,
                    isCustomUploaded: true
                  });
                }}
                isAlreadyInCorpus={corpus.some(
                  (d) =>
                    d.id === `custom-${analysis.documentId}` ||
                    (d.title.trim().toLowerCase() === analysis.title.trim().toLowerCase() &&
                      d.content.trim() === content.trim())
                )}
                onSaveToFirebase={handleSaveCurrentToFirebase}
                isSavedToFirebase={isSavedToFirebase}
                isSavingToFirebase={isSavingToFirebase}
              />
              <SourcesPanel
                sources={analysis.sources}
                similarityIndex={analysis.similarityIndex}
                totalWords={analysis.totalWords}
                activeSourceId={activeSourceId}
                onSelectSource={(srcId) => setActiveSourceId(srcId)}
                filters={filters}
                onUpdateFilters={handleUpdateFilters}
              />
            </div>
          ) : (
            /* View Tab 2: AI Writing Diagnostics Panel */
            <div className="flex-1 p-4 sm:p-6 bg-slate-50">
              <AIDetectionPanel
                analysis={analysis}
                onNavigateToSentence={(sentenceId) => {
                  setTargetSentenceId(sentenceId);
                  setActiveTab('report');
                }}
              />
            </div>
          )}
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              No hay documento cargado
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Sube un documento en formato PDF, Word (.docx) o texto plano para verificar su originalidad y patrones de IA en memoria local.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-xs cursor-pointer"
              >
                Subir Archivo
              </button>
              <button
                onClick={() => setIsEditorOpen(true)}
                className="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Escribir o Pegar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal (PDF, DOCX, TXT) */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDocumentAnalyzed={handleDocumentAnalyzed}
      />

      {/* Community Guidance & Funnel Explanation Modal for Ekirayá */}
      <CommunityGuidanceModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
        logoUrl={EKIRAYA_CONFIG.logoUrl}
      />

      {/* Legal & Regulatory Compliance Modal */}
      <LegalComplianceModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />

      {/* Custom Reference Corpus Modal */}
      <CustomCorpusModal
        isOpen={isCorpusModalOpen}
        onClose={() => setIsCorpusModalOpen(false)}
        corpus={corpus}
        onAddDocument={handleAddCorpusDoc}
        onDeleteDocument={handleDeleteCorpusDoc}
      />

      {/* Firebase Saved Document Records Modal */}
      <DocumentRecordsModal
        isOpen={isRecordsModalOpen}
        onClose={() => setIsRecordsModalOpen(false)}
        onSelectDocumentSnippet={handleSelectSnippetFromHistory}
      />

      {/* Admin Users & Permissions Management Modal */}
      <AdminManagementModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
}
