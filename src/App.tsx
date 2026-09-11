import React, { useState, useMemo } from 'react';
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
import { DEFAULT_CORPUS } from './data/defaultCorpus';
import { SAMPLE_DOCUMENTS } from './data/sampleDocuments';
import { EKIRAYA_CONFIG } from './data/ekirayaConfig';
import { AnalysisFilters, ReferenceDocument } from './types';
import { runOriginalityAnalysis } from './utils/nlpEngine';
import { exportAnalysisToPDF, exportAnalysisToCSV } from './utils/exportUtils';
import {
  FileText,
  Sparkles,
  Edit3,
  Scale,
  BookOpen,
  Download,
  FileSpreadsheet,
  UploadCloud
} from 'lucide-react';

export default function App() {
  // Corpus state (default + custom stored in localStorage)
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

  // Run analysis in browser memory (memoized on content, title, author, corpus, filters)
  const analysis = useMemo(() => {
    if (!content.trim() || content.trim().split(/\s+/).filter(Boolean).length < 5) {
      return null;
    }
    return runOriginalityAnalysis(content, title, author, corpus, filters);
  }, [content, title, author, corpus, filters]);

  // Handler to update filters
  const handleUpdateFilters = (newFilters: Partial<AnalysisFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Handler to add custom reference to corpus
  const handleAddCorpusDoc = (newDoc: ReferenceDocument) => {
    setCorpus((prev) => {
      const updated = [...prev, newDoc];
      try {
        const customDocs = updated.filter((d) => d.isCustomUploaded);
        localStorage.setItem('veritas_custom_corpus', JSON.stringify(customDocs));
      } catch (e) {
        console.error('Error saving custom corpus to localStorage', e);
      }
      return updated;
    });
  };

  // Handler to delete custom reference
  const handleDeleteCorpusDoc = (docId: string) => {
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
  };

  // Handler to trigger verification from editor
  const handleRunAnalysis = () => {
    setIsEditorOpen(false);
    setActiveTab('report');
  };

  // Handler when a file is uploaded via modal or quick action
  const handleDocumentAnalyzed = (newTitle: string, newAuthor: string, newContent: string) => {
    setTitle(newTitle);
    setAuthor(newAuthor);
    setContent(newContent);
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
        onOpenCorpusModal={() => setIsCorpusModalOpen(true)}
        onOpenLegalModal={() => setIsLegalModalOpen(true)}
        onOpenCommunityModal={() => setIsCommunityModalOpen(true)}
        onExportPDF={() => analysis && exportAnalysisToPDF(analysis, content)}
        onExportCSV={() => analysis && exportAnalysisToCSV(analysis)}
        isEditorOpen={isEditorOpen}
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
                  className="flex items-center gap-1 px-2.5 py-1 text-red-700 hover:text-red-900 rounded-md hover:bg-red-50 border border-red-200 font-semibold"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Subir otro archivo</span>
                </button>
                <button
                  onClick={() => setIsCommunityModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-emerald-800 hover:text-emerald-950 rounded-md hover:bg-emerald-50 border border-emerald-200"
                >
                  <span>Normas y Embudo</span>
                </button>
                <button
                  onClick={() => setIsEditorOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
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
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-xs"
              >
                Subir Archivo
              </button>
              <button
                onClick={() => setIsEditorOpen(true)}
                className="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-200"
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
    </div>
  );
}
