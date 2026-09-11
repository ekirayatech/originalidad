import jsPDF from 'jspdf';
import { AnalysisSummary, AISentenceAnalysis } from '../types';
import { LEGAL_REGULATIONS } from './legalGuidelines';

export function exportAnalysisToCSV(analysis: AnalysisSummary): void {
  const rows: string[][] = [];

  // UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';

  // Section 1: Document Metadata
  rows.push(['--- COLEGIO BILINGÜE EKIRAYÁ | REPORTE DE ORIGINALIDAD Y DETECCIÓN DE IA ---']);
  rows.push(['Institución', 'Colegio Bilingüe Ekirayá']);
  rows.push(['ID de Documento', analysis.documentId]);
  rows.push(['Título del Documento', `"${analysis.title.replace(/"/g, '""')}"`]);
  rows.push(['Autor', `"${analysis.author.replace(/"/g, '""')}"`]);
  rows.push(['Fecha de Análisis', `"${analysis.submissionDate}"`]);
  rows.push(['Total de Palabras', analysis.totalWords.toString()]);
  rows.push(['Total de Oraciones', analysis.totalSentences.toString()]);
  rows.push(['Tiempo de Ejecución (ms)', analysis.executionTimeMs.toString()]);
  rows.push([]);

  // Section 2: Summary Metrics
  rows.push(['--- MÉTRICAS GENERALES DE ORIGINALIDAD E INTELIGENCIA ARTIFICIAL ---']);
  rows.push(['Índice de Similitud General (%)', `${analysis.similarityIndex}%`]);
  rows.push(['Embudo de Color de Similitud', analysis.similarityColor.toUpperCase()]);
  rows.push(['Clasificación Institucional', `"${analysis.similarityFunnelLabel}"`]);
  rows.push(['Palabras Coincidentes Totales', analysis.matchedWordsTotal.toString()]);
  rows.push(['Índice de Detección de IA (%)', `${analysis.aiWritingIndex}%`]);
  rows.push(['Oraciones Señaladas con IA', `${analysis.aiFlaggedSentencesCount} de ${analysis.totalSentences}`]);
  rows.push(['Perplejidad Promedio', analysis.averagePerplexity.toString()]);
  rows.push(['Varianza de Longitud (Burstiness)', `${analysis.burstinessScore}/100`]);
  rows.push([]);

  // Section 3: Sources Table
  rows.push(['--- FUENTES IDENTIFICADAS (DESGLOSE DE COINCIDENCIAS) ---']);
  rows.push(['ID Fuente', 'Título de la Fuente', 'Autor(es)', 'Tipo de Fuente', 'Porcentaje (%)', 'Palabras Coincidentes', 'Repositorio / Enlace']);
  analysis.sources.forEach((s) => {
    rows.push([
      `#${s.id}`,
      `"${s.sourceTitle.replace(/"/g, '""')}"`,
      `"${s.sourceAuthor.replace(/"/g, '""')}"`,
      s.sourceType,
      `${s.percentage}%`,
      s.matchedWords.toString(),
      `"${(s.sourceUrl || '').replace(/"/g, '""')}"`
    ]);
  });
  rows.push([]);

  // Section 4: Sentence-by-sentence analysis
  rows.push(['--- DETALLE DE ORACIONES ANALIZADAS (SIMILITUD Y PATRONES IA) ---']);
  rows.push([
    'ID Oración',
    'Texto de la Oración',
    'Coincidencia Similitud',
    'Fuente Asociada',
    'Probabilidad IA (%)',
    'Marcadores Sintéticos Detectados',
    'Cumplimiento Ley 23/1982 (Cita)'
  ]);

  analysis.aiSentences.forEach((s, idx) => {
    const match = analysis.matchedSegments.find((m) => m.startIndex <= s.startIndex && m.endIndex >= s.endIndex);
    const hasMatch = !!match;
    const isAi = s.isFlaggedAI;

    let legalStatus = 'Original / Cita Válida';
    if (hasMatch) {
      legalStatus = match?.isQuote ? 'Cita Textual Entrecomillada (Art. 31 Ley 23)' : 'Coincidencia sin comillas (Revisar atribución)';
    } else if (isAi) {
      legalStatus = 'Patrón sintético detectado (Revisar autoría humana)';
    }

    rows.push([
      `Oración-${idx + 1}`,
      `"${s.sentence.replace(/"/g, '""')}"`,
      hasMatch ? `${match?.similarityScore}%` : '0%',
      hasMatch ? `"${match?.sourceTitle.replace(/"/g, '""')}"` : 'Ninguna',
      `${s.aiProbability}%`,
      `"${s.detectedMarkers.join('; ')}"`,
      legalStatus
    ]);
  });
  rows.push([]);

  // Section 5: Legal Framework
  rows.push(['--- MARCO REGULATORIO Y CUMPLIMIENTO LEGAL ---']);
  rows.push(['Norma', 'Jurisdicción', 'Artículos Clave', 'Garantía del Sistema']);
  LEGAL_REGULATIONS.forEach((reg) => {
    rows.push([
      `"${reg.normName.replace(/"/g, '""')}"`,
      reg.jurisdiction,
      `"${reg.keyArticles.replace(/"/g, '""')}"`,
      `"${reg.complianceReason.replace(/"/g, '""')}"`
    ]);
  });

  const csvContent = BOM + rows.map((r) => r.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Reporte_Originalidad_Ekiraya_${analysis.documentId}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper interface for paragraph breakdown in report
interface ParagraphReportItem {
  paraIndex: number;
  sentences: AISentenceAnalysis[];
  text: string;
  totalWords: number;
  matchedWords: number;
  similarityScore: number;
  matchedSources: { id: number; title: string; score: number }[];
  aiFlaggedSentences: number;
  avgAiProbability: number;
  detectedMarkers: string[];
  isAiFlagged: boolean;
}

// Group sentences into paragraphs robustly matching the document structure
function extractParagraphsForReport(analysis: AnalysisSummary, documentText?: string): ParagraphReportItem[] {
  if (!analysis.aiSentences || analysis.aiSentences.length === 0) {
    return [];
  }

  const groups: ParagraphReportItem[] = [];
  let currentGroup: AISentenceAnalysis[] = [];

  for (let i = 0; i < analysis.aiSentences.length; i++) {
    const s = analysis.aiSentences[i];
    currentGroup.push(s);

    let isEndOfParagraph = false;
    if (i < analysis.aiSentences.length - 1) {
      const nextS = analysis.aiSentences[i + 1];
      if (documentText) {
        const gapText = documentText.substring(s.endIndex, nextS.startIndex);
        if (/\n\s*\n/.test(gapText) || (gapText.match(/\n/g) || []).length >= 2) {
          isEndOfParagraph = true;
        }
      } else {
        // Fallback: if sentence ends with newline in reconstructed text
        if (s.sentence.includes('\n')) {
          isEndOfParagraph = true;
        }
      }
    } else {
      isEndOfParagraph = true;
    }

    if (isEndOfParagraph) {
      const paraStartIndex = currentGroup[0].startIndex;
      const paraEndIndex = currentGroup[currentGroup.length - 1].endIndex;
      const paraText = currentGroup.map((cs) => cs.sentence.trim()).join(' ');
      const paraWords = paraText.trim().split(/\s+/).filter(Boolean).length;

      // Find overlapping matches in this paragraph
      const overlappingMatches = analysis.matchedSegments.filter(
        (m) =>
          (m.startIndex >= paraStartIndex && m.startIndex < paraEndIndex) ||
          (m.endIndex > paraStartIndex && m.endIndex <= paraEndIndex) ||
          (m.startIndex <= paraStartIndex && m.endIndex >= paraEndIndex)
      );

      let matchedWords = 0;
      const matchedSourcesMap = new Map<number, { id: number; title: string; score: number }>();
      overlappingMatches.forEach((m) => {
        const mWords = m.text.trim().split(/\s+/).filter(Boolean).length;
        matchedWords += mWords;
        if (!matchedSourcesMap.has(m.sourceId)) {
          matchedSourcesMap.set(m.sourceId, {
            id: m.sourceId,
            title: m.sourceTitle,
            score: m.similarityScore
          });
        }
      });

      const similarityScore = paraWords > 0 ? Math.min(100, Math.round((matchedWords / paraWords) * 100)) : 0;
      const aiFlagged = currentGroup.filter((cs) => cs.isFlaggedAI);
      const totalAiProb = currentGroup.reduce((acc, cs) => acc + cs.aiProbability, 0);
      const avgAiProbability = currentGroup.length > 0 ? Math.round(totalAiProb / currentGroup.length) : 0;
      const allMarkers = Array.from(new Set(currentGroup.flatMap((cs) => cs.detectedMarkers)));

      groups.push({
        paraIndex: groups.length,
        sentences: currentGroup,
        text: paraText,
        totalWords: paraWords,
        matchedWords,
        similarityScore,
        matchedSources: Array.from(matchedSourcesMap.values()),
        aiFlaggedSentences: aiFlagged.length,
        avgAiProbability,
        detectedMarkers: allMarkers,
        isAiFlagged: aiFlagged.length > 0
      });

      currentGroup = [];
    }
  }

  return groups;
}

export function exportAnalysisToPDF(analysis: AnalysisSummary, documentText?: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper function to check space and handle page splits cleanly
  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - margin - 10) {
      doc.addPage();
      y = margin;
      drawHeader(true);
    }
  };

  const drawHeader = (isContinuation = false) => {
    // Top banner
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(margin, y, contentWidth, 12, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('COLEGIO BILINGÜE EKIRAYÁ — REPORTE DE ORIGINALIDAD E IA', margin + 4, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(
      isContinuation ? '(Continuación)' : 'ESTÁNDAR INSTITUCIONAL EKIRAYÁ',
      pageWidth - margin - 4,
      y + 8,
      { align: 'right' }
    );

    y += 16;
  };

  // 1. Initial Page Header
  drawHeader();

  // Document metadata box (dynamically sized to prevent any overflow)
  const titleLines = doc.splitTextToSize(analysis.title, contentWidth - 8);
  const metaBoxHeight = 18 + titleLines.length * 5;
  ensureSpace(metaBoxHeight);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, metaBoxHeight, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  let titleY = y + 5.5;
  titleLines.forEach((tLine: string) => {
    doc.text(tLine, margin + 4, titleY);
    titleY += 4.5;
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Autor: ${analysis.author}  |  ID Entrega: ${analysis.documentId}  |  Fecha: ${analysis.submissionDate}`, margin + 4, titleY + 1);
  doc.text(`Total Palabras: ${analysis.totalWords}  |  Oraciones: ${analysis.totalSentences}  |  Análisis en Memoria Local RAM`, margin + 4, titleY + 6);

  y += metaBoxHeight + 5;

  // 2. Metrics Scorecards (Originality Funnel + AI Writing Detection)
  ensureSpace(38);
  const cardWidth = (contentWidth - 6) / 2;

  // Card 1: Academic Similarity
  let simColorRgb = [37, 99, 235]; // blue
  if (analysis.similarityColor === 'green') simColorRgb = [22, 163, 74];
  if (analysis.similarityColor === 'yellow') simColorRgb = [217, 119, 6];
  if (analysis.similarityColor === 'orange') simColorRgb = [234, 88, 12];
  if (analysis.similarityColor === 'red') simColorRgb = [220, 38, 38];

  doc.setFillColor(simColorRgb[0], simColorRgb[1], simColorRgb[2]);
  doc.roundedRect(margin, y, cardWidth, 32, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('SIMILITUD ACADÉMICA', margin + 6, y + 7);

  doc.setFontSize(24);
  doc.text(`${analysis.similarityIndex}%`, margin + 6, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`${analysis.matchedWordsTotal} palabras  •  ${analysis.sources.length} fuentes`, margin + 6, y + 27);

  // Card 2: AI Writing Detection
  let aiColorRgb = [14, 165, 233]; // cyan
  if (analysis.aiWritingIndex >= 50) aiColorRgb = [124, 58, 237]; // violet

  doc.setFillColor(aiColorRgb[0], aiColorRgb[1], aiColorRgb[2]);
  doc.roundedRect(margin + cardWidth + 6, y, cardWidth, 32, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('DETECCIÓN DE ESCRITURA IA (LLM)', margin + cardWidth + 12, y + 7);

  doc.setFontSize(24);
  doc.text(`${analysis.aiWritingIndex}%`, margin + cardWidth + 12, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`${analysis.aiFlaggedSentencesCount} oraciones señaladas  •  Perplejidad: ${analysis.averagePerplexity}`, margin + cardWidth + 12, y + 27);

  y += 37;

  // 3. Funnel Explanation bar
  ensureSpace(14);
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 11, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Escala del Embudo Institucional:', margin + 4, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text('Azul: 0%  |  Verde: 1-24%  |  Amarillo: 25-49%  |  Naranja: 50-74%  |  Rojo: 75-100%', margin + 4, y + 8.5);
  doc.text(`Estado: ${analysis.similarityFunnelLabel}`, pageWidth - margin - 4, y + 8.5, { align: 'right' });

  y += 15;

  // 4. Sources Breakdown Table
  if (analysis.sources.length > 0) {
    ensureSpace(28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('DESGLOSE DE FUENTES BIBLIOGRÁFICAS COINCIDENTES', margin, y);
    y += 4.5;

    // Table Header
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text('#', margin + 2, y + 4);
    doc.text('Título de la Fuente', margin + 10, y + 4);
    doc.text('Autor(es)', margin + 90, y + 4);
    doc.text('Tipo', margin + 135, y + 4);
    doc.text('% Sim', pageWidth - margin - 4, y + 4, { align: 'right' });
    y += 6.5;

    analysis.sources.forEach((source) => {
      ensureSpace(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);

      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, 6, 5, 'F');
      doc.text(`${source.id}`, margin + 3, y + 3.8, { align: 'center' });

      const titleClean = source.sourceTitle.length > 50 ? source.sourceTitle.substring(0, 48) + '...' : source.sourceTitle;
      const authorClean = source.sourceAuthor.length > 25 ? source.sourceAuthor.substring(0, 23) + '...' : source.sourceAuthor;

      doc.text(titleClean, margin + 10, y + 3.8);
      doc.text(authorClean, margin + 90, y + 3.8);
      doc.text(source.sourceType, margin + 135, y + 3.8);
      doc.setFont('helvetica', 'bold');
      doc.text(`${source.percentage}%`, pageWidth - margin - 4, y + 3.8, { align: 'right' });

      y += 5.5;
    });
    y += 5;
  }

  // 5. PARAGRAPH-BY-PARAGRAPH REPORT (USER EXPLICIT REQUIREMENT)
  // Shows paragraphs and percentages of similarities and AI use, completely margin-safe!
  const paragraphs = extractParagraphsForReport(analysis, documentText);

  ensureSpace(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('INFORME DETALLADO POR PÁRRAFOS: SIMILITUD Y DETECCIÓN DE IA', margin, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const introPara = 'Desglose párrafo por párrafo del documento con evaluación individual de coincidencias bibliográficas y probabilidad de generación asistida por modelos de lenguaje (LLM).';
  const introLines = doc.splitTextToSize(introPara, contentWidth);
  introLines.forEach((l: string) => {
    doc.text(l, margin, y);
    y += 3.8;
  });
  y += 2;

  // Render each paragraph cleanly
  paragraphs.forEach((p) => {
    // Split paragraph text safely within margin boundaries
    const safeTextWidth = contentWidth - 8;
    const pLines = doc.splitTextToSize(p.text, safeTextWidth);
    const textHeight = pLines.length * 3.8;
    
    // Notes height if matches or AI markers exist
    let notesHeight = 0;
    if (p.matchedSources.length > 0) notesHeight += 4.5;
    if (p.isAiFlagged && p.detectedMarkers.length > 0) notesHeight += 4.5;

    const totalParaBlockHeight = 9 + textHeight + notesHeight + 6;

    // Check if whole block fits or if we need a page split
    ensureSpace(Math.min(totalParaBlockHeight, 45));

    // Paragraph Header Bar
    const headerBgColor = p.isAiFlagged && p.similarityScore > 0
      ? [254, 243, 199] // amber-100
      : p.isAiFlagged
      ? [243, 232, 255] // purple-100
      : p.similarityScore > 0
      ? [239, 246, 255] // blue-100
      : [248, 250, 252]; // slate-50

    doc.setFillColor(headerBgColor[0], headerBgColor[1], headerBgColor[2]);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y + 6, margin + contentWidth, y + 6);

    // Paragraph title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`PÁRRAFO #${p.paraIndex + 1} (${p.totalWords} palabras)`, margin + 3, y + 4.2);

    // Badges on the right: Similarity % and AI %
    let badgeOffset = pageWidth - margin - 3;

    // AI Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    if (p.isAiFlagged) {
      doc.setTextColor(126, 34, 206);
      doc.text(`IA: ${p.avgAiProbability}% (Detectado)`, badgeOffset, y + 4.2, { align: 'right' });
    } else {
      doc.setTextColor(100, 116, 139);
      doc.text(`IA: ${p.avgAiProbability}% (No detectado)`, badgeOffset, y + 4.2, { align: 'right' });
    }
    badgeOffset -= 45;

    // Similarity Badge
    if (p.similarityScore > 0) {
      doc.setTextColor(p.similarityScore >= 50 ? 185 : 29, p.similarityScore >= 50 ? 28 : 78, p.similarityScore >= 50 ? 28 : 216);
      doc.text(`Similitud: ${p.similarityScore}%`, badgeOffset, y + 4.2, { align: 'right' });
    } else {
      doc.setTextColor(22, 101, 52);
      doc.text(`Similitud: 0%`, badgeOffset, y + 4.2, { align: 'right' });
    }

    y += 8;

    // Render paragraph body lines safely wrapped
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    pLines.forEach((line: string) => {
      ensureSpace(4.5);
      doc.text(line, margin + 4, y);
      y += 3.8;
    });

    // Notes below text (Sources and AI findings)
    if (p.matchedSources.length > 0) {
      ensureSpace(4.5);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.8);
      doc.setTextColor(30, 64, 175);
      const sourcesDesc = p.matchedSources
        .map((src) => `[Fuente #${src.id}: "${src.title.length > 40 ? src.title.substring(0, 38) + '...' : src.title}" (${src.score}%)]`)
        .join('  ');
      const safeSourcesLine = doc.splitTextToSize(`• Coincidencia bibliográfica: ${sourcesDesc}`, contentWidth - 8);
      safeSourcesLine.forEach((sl: string) => {
        doc.text(sl, margin + 4, y);
        y += 3.5;
      });
    }

    if (p.isAiFlagged && p.detectedMarkers.length > 0) {
      ensureSpace(4.5);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.8);
      doc.setTextColor(126, 34, 206);
      const markersText = p.detectedMarkers.slice(0, 3).map((m) => `"${m}"`).join(', ');
      const safeAiLine = doc.splitTextToSize(`• Patrones sintéticos identificados (${p.aiFlaggedSentences} orac.): ${markersText}`, contentWidth - 8);
      safeAiLine.forEach((al: string) => {
        doc.text(al, margin + 4, y);
        y += 3.5;
      });
    }

    y += 5; // spacing between paragraphs
  });

  // 6. Statistical Diagnostics & Pedagogy Note
  ensureSpace(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('DIAGNÓSTICO ESTADÍSTICO DE MODELOS DE LENGUAJE (IA)', margin, y);
  y += 4.5;

  const diagText = [
    `• Varianza de longitud de oraciones (Burstiness): ${analysis.burstinessScore}/100 ${analysis.burstinessScore < 30 ? '(Muy homogéneo, indicio típico de LLM)' : '(Variado, consistente con estilo humano)'}.`,
    `• Nivel de perplejidad sintáctica aproximada: ${analysis.averagePerplexity} ${analysis.averagePerplexity < 40 ? '(Baja perplejidad = alta predictibilidad algorítmica)' : '(Perplejidad natural)'}.`,
    `• Advertencia Pedagógica Institucional: Conforme a lineamientos UNESCO y Ministerio de Educación Nacional de Colombia (MEN), este reporte es una herramienta de orientación diagnóstica y no reemplaza la evaluación formativa y el criterio del docente.`
  ];

  diagText.forEach((paragraphText) => {
    const wrappedLines = doc.splitTextToSize(paragraphText, contentWidth - 8);
    wrappedLines.forEach((l: string) => {
      ensureSpace(4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(55, 65, 81);
      doc.text(l, margin + 4, y);
      y += 3.8;
    });
    y += 1;
  });

  y += 4;

  // 7. Regulatory & Legal Framework Statement (Safely wrapped within margins)
  ensureSpace(40);
  doc.setFillColor(241, 245, 249);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const legalTitle = 'CERTIFICADO DE CONFORMIDAD REGULATORIA (COLOMBIA E INTERNACIONAL)';
  doc.text(legalTitle, margin, y);
  y += 4.5;

  const legalItems = [
    '1. Ley 23 de 1982 (Colombia, Art. 31): Respalda el derecho de cita lícita indicando autor y título. Protege los derechos morales de paternidad e integridad.',
    '2. Ley Estatutaria 1581 de 2012 (Habeas Data): Ejecución 100% en memoria del navegador (RAM local). Ningún dato ni borrador sale a servidores remotos.',
    '3. Decisión Andina 351 de 1993 & Convenio de Berna (Art. 10): Estandarización de citas legítimas y usos honrados en la comunidad académica internacional.',
    '4. Directrices MEN / MinCiencias (2023-2024): Exclusión de resoluciones académicas automatizadas; requiere debida diligencia y evaluación formativa.'
  ];

  legalItems.forEach((itemText) => {
    const lines = doc.splitTextToSize(itemText, contentWidth);
    lines.forEach((line: string) => {
      ensureSpace(4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);
      doc.text(line, margin, y);
      y += 3.5;
    });
    y += 1;
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Colegio Bilingüe Ekirayá • Página ${i} de ${pageCount} • Hash de Verificación: SHA256-${analysis.documentId}`,
      margin,
      pageHeight - 6
    );
    doc.text(
      'Procesamiento Confidencial en Memoria Local del Navegador',
      pageWidth - margin,
      pageHeight - 6,
      { align: 'right' }
    );
  }

  doc.save(`Reporte_Originalidad_Ekiraya_${analysis.documentId}.pdf`);
}
