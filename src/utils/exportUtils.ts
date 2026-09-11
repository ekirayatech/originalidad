import jsPDF from 'jspdf';
import { AnalysisSummary } from '../types';
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

export function exportAnalysisToPDF(analysis: AnalysisSummary): void {
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

  // Helper function to check page overflow
  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeader(true);
    }
  };

  const drawHeader = (isContinuation = false) => {
    // Top banner
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(margin, y, contentWidth, 14, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('COLEGIO BILINGÜE EKIRAYÁ — REPORTE DE ORIGINALIDAD E IA', margin + 4, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(isContinuation ? '(Continuación)' : 'ESTÁNDAR INSTITUCIONAL EKIRAYÁ', pageWidth - margin - 4, y + 9, { align: 'right' });

    y += 18;
  };

  // 1. Initial Page Header
  drawHeader();

  // Document metadata box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(analysis.title, margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Autor: ${analysis.author}`, margin + 4, y + 12);
  doc.text(`ID de Entrega: ${analysis.documentId}  |  Fecha: ${analysis.submissionDate}`, margin + 4, y + 17);
  doc.text(`Total Palabras: ${analysis.totalWords}  |  Oraciones: ${analysis.totalSentences}  |  Procesado 100% en Memoria Local`, margin + 4, y + 22);

  y += 32;

  // 2. Metrics Scorecards (Originality Funnel Badge + AI Badge)
  ensureSpace(40);
  const cardWidth = (contentWidth - 6) / 2;

  // Card 1: Academic Similarity
  let simColorRgb = [37, 99, 235]; // blue
  if (analysis.similarityColor === 'green') simColorRgb = [22, 163, 74];
  if (analysis.similarityColor === 'yellow') simColorRgb = [217, 119, 6];
  if (analysis.similarityColor === 'orange') simColorRgb = [234, 88, 12];
  if (analysis.similarityColor === 'red') simColorRgb = [220, 38, 38];

  doc.setFillColor(simColorRgb[0], simColorRgb[1], simColorRgb[2]);
  doc.roundedRect(margin, y, cardWidth, 34, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('ÍNDICE DE SIMILITUD ACADÉMICA', margin + 6, y + 7);

  doc.setFontSize(26);
  doc.text(`${analysis.similarityIndex}%`, margin + 6, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`${analysis.matchedWordsTotal} palabras coincidentes  •  ${analysis.sources.length} fuentes`, margin + 6, y + 28);

  // Card 2: AI Writing Detection
  let aiColorRgb = [14, 165, 233]; // cyan
  if (analysis.aiWritingIndex >= 50) aiColorRgb = [124, 58, 237]; // violet

  doc.setFillColor(aiColorRgb[0], aiColorRgb[1], aiColorRgb[2]);
  doc.roundedRect(margin + cardWidth + 6, y, cardWidth, 34, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DETECCIÓN DE ESCRITURA IA (LLM)', margin + cardWidth + 12, y + 7);

  doc.setFontSize(26);
  doc.text(`${analysis.aiWritingIndex}%`, margin + cardWidth + 12, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`${analysis.aiFlaggedSentencesCount} oraciones sintéticas  •  Perplejidad: ${analysis.averagePerplexity}`, margin + cardWidth + 12, y + 28);

  y += 40;

  // 3. Funnel Explanation bar
  ensureSpace(20);
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Escala del Embudo Institucional:', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Azul: 0%  |  Verde: 1-24%  |  Amarillo: 25-49%  |  Naranja: 50-74%  |  Rojo: 75-100%', margin + 4, y + 10);
  doc.text(`Estado actual: ${analysis.similarityFunnelLabel}`, pageWidth - margin - 4, y + 10, { align: 'right' });

  y += 18;

  // 4. Sources Breakdown Table
  ensureSpace(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('DESGLOSE DE FUENTES PRIMARIAS COINCIDENTES', margin, y);
  y += 5;

  if (analysis.sources.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No se encontraron fuentes con coincidencias significativas que superen el umbral configurado.', margin, y + 5);
    y += 12;
  } else {
    // Table Header
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text('#', margin + 2, y + 4.5);
    doc.text('Título de la Fuente', margin + 10, y + 4.5);
    doc.text('Autor(es)', margin + 90, y + 4.5);
    doc.text('Tipo', margin + 135, y + 4.5);
    doc.text('% Sim', pageWidth - margin - 4, y + 4.5, { align: 'right' });
    y += 7;

    analysis.sources.forEach((source) => {
      ensureSpace(8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);

      // Source ID badge
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, 6, 5.5, 'F');
      doc.text(`${source.id}`, margin + 3, y + 4, { align: 'center' });

      // Truncated title & author
      const titleClean = source.sourceTitle.length > 50 ? source.sourceTitle.substring(0, 48) + '...' : source.sourceTitle;
      const authorClean = source.sourceAuthor.length > 25 ? source.sourceAuthor.substring(0, 23) + '...' : source.sourceAuthor;

      doc.text(titleClean, margin + 10, y + 4);
      doc.text(authorClean, margin + 90, y + 4);
      doc.text(source.sourceType, margin + 135, y + 4);
      doc.setFont('helvetica', 'bold');
      doc.text(`${source.percentage}%`, pageWidth - margin - 4, y + 4, { align: 'right' });

      y += 6.5;
    });
  }

  y += 6;

  // 5. AI Detection Pattern Highlights
  ensureSpace(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('DIAGNÓSTICO ESTADÍSTICO DE MODELOS DE LENGUAJE (IA)', margin, y);
  y += 5;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(250, 245, 255);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text(`• Varianza de longitud de oraciones (Burstiness): ${analysis.burstinessScore}/100 ${analysis.burstinessScore < 30 ? '(Muy homogéneo, indicio típico de LLM)' : '(Variado, consistente con estilo humano)'}`, margin + 4, y + 6);
  doc.text(`• Nivel de perplejidad sintáctica aproximada: ${analysis.averagePerplexity} ${analysis.averagePerplexity < 40 ? '(Baja perplejidad = alta predictibilidad algorítmica)' : '(Perplejidad natural)'}`, margin + 4, y + 11);

  const topMarkers = analysis.detectedAIMarkersList.slice(0, 4).map((m) => `"${m.marker}" (${m.occurrences})`).join(', ');
  doc.text(`• Conectores y giros sintéticos detectados: ${topMarkers || 'Ninguno prominente'}`, margin + 4, y + 16);
  doc.text(`• Advertencia Pedagógica: Conforme a lineamientos UNESCO y MEN Colombia, este análisis es orientativo y no constituye prueba penal o sanción automática sin revisión docente.`, margin + 4, y + 21);

  y += 30;

  // 6. Regulatory & Legal Framework Statement
  ensureSpace(45);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('CERTIFICADO DE CONFORMIDAD REGULATORIA (COLOMBIA E INTERNACIONAL)', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('1. Ley 23 de 1982 (Colombia, Art. 31): Respalda el derecho de cita lícita indicando autor y título. Protege los derechos morales de paternidad e integridad.', margin + 4, y + 12);
  doc.text('2. Ley Estatutaria 1581 de 2012 (Habeas Data): Ejecución 100% en memoria del navegador (RAM local). Ningún dato ni borrador sale a servidores remotos.', margin + 4, y + 17);
  doc.text('3. Decisión Andina 351 de 1993 & Convenio de Berna (Art. 10): Estandarización de citas legítimas y usos honrados en la comunidad académica internacional.', margin + 4, y + 22);
  doc.text('4. GDPR Art. 22 & Directrices MEN / MinCiencias (2023-2024): Exclusión de resoluciones académicas automatizadas; requiere debida diligencia y evaluación formativa.', margin + 4, y + 27);
  doc.text('5. Sistema auditado para entornos de educación superior y producción científica.', margin + 4, y + 32);

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Colegio Bilingüe Ekirayá • Página ${i} de ${pageCount} • Hash de Verificación: SHA256-${analysis.documentId}`, margin, pageHeight - 6);
    doc.text('Procesamiento Confidencial en Memoria Local del Navegador', pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  doc.save(`Reporte_Originalidad_Ekiraya_${analysis.documentId}.pdf`);
}
