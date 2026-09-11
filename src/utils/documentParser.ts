import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import * as mammoth from 'mammoth';
import JSZip from 'jszip';
import pako from 'pako';

// Configure pdfjs worker safely for Vite/browser environment using local bundled asset
try {
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  }
} catch (e) {
  console.warn('No se pudo inicializar workerSrc de pdfjs:', e);
}

export interface ExtractedDocument {
  title: string;
  author?: string;
  text: string;
  fileName: string;
  fileSize: number;
  wordCount: number;
  sourceType: 'pdf' | 'docx' | 'odt' | 'txt' | 'rtf' | 'doc' | 'other';
}

/**
 * Normalizes text extracted from any document format.
 */
function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extracts text from PDF using pdfjs-dist with local worker.
 */
async function extractFromPdfWithPdfjs(arrayBuffer: ArrayBuffer): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: false,
    useSystemFonts: true
  });
  const pdfDoc = await loadingTask.promise;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .filter((s: string) => s && s.trim().length > 0);
    
    if (pageStrings.length > 0) {
      pageTexts.push(pageStrings.join(' '));
    }
  }

  return pageTexts.join('\n\n');
}

/**
 * Fallback parser for PDF in case Web Worker is blocked by iframe or browser sandbox.
 * Decompresses FlateDecode streams using pako and parses BT...ET text blocks.
 */
function extractFromPdfFallback(arrayBuffer: ArrayBuffer): string {
  try {
    const uint8 = new Uint8Array(arrayBuffer);
    let binaryStr = '';
    // Process in chunks to avoid call stack limits
    const chunkSize = 16384;
    for (let i = 0; i < uint8.length; i += chunkSize) {
      const chunk = uint8.subarray(i, i + chunkSize);
      binaryStr += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }

    const textPieces: string[] = [];
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let streamMatch: RegExpExecArray | null;

    while ((streamMatch = streamRegex.exec(binaryStr)) !== null) {
      const rawStream = streamMatch[1];
      let decoded = '';

      try {
        const streamBytes = new Uint8Array(rawStream.length);
        for (let j = 0; j < rawStream.length; j++) {
          streamBytes[j] = rawStream.charCodeAt(j);
        }
        const inflated = pako.inflate(streamBytes);
        let inflatedStr = '';
        for (let k = 0; k < inflated.length; k += chunkSize) {
          const sub = inflated.subarray(k, k + chunkSize);
          inflatedStr += String.fromCharCode.apply(null, sub as unknown as number[]);
        }
        decoded = inflatedStr;
      } catch {
        decoded = rawStream;
      }

      // Extract text inside BT (Begin Text) ... ET (End Text) blocks
      const btRegex = /BT[\s\S]*?ET/g;
      let btMatch: RegExpExecArray | null;

      while ((btMatch = btRegex.exec(decoded)) !== null) {
        const block = btMatch[0];

        // Parse individual (text) Tj or ' or "
        const singleTextRegex = /\(([^)]*)\)\s*(?:Tj|'|")/g;
        let singleMatch: RegExpExecArray | null;
        while ((singleMatch = singleTextRegex.exec(block)) !== null) {
          const raw = singleMatch[1]
            .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
            .replace(/\\([nrtbf\\()])/g, (_, esc) => {
              if (esc === 'n') return '\n';
              if (esc === 'r') return '\r';
              if (esc === 't') return '\t';
              return esc;
            });
          if (raw.trim()) textPieces.push(raw);
        }

        // Parse array text [(text) -10 (more text)] TJ
        const arrayTextRegex = /\[([\s\S]*?)\]\s*TJ/g;
        let arrMatch: RegExpExecArray | null;
        while ((arrMatch = arrayTextRegex.exec(block)) !== null) {
          const inner = arrMatch[1];
          const innerStrRegex = /\(([^)]*)\)/g;
          let sMatch: RegExpExecArray | null;
          const subPieces: string[] = [];
          while ((sMatch = innerStrRegex.exec(inner)) !== null) {
            const raw = sMatch[1]
              .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
              .replace(/\\([nrtbf\\()])/g, (_, esc) => esc);
            if (raw) subPieces.push(raw);
          }
          if (subPieces.length > 0) {
            textPieces.push(subPieces.join(''));
          }
        }
      }
    }

    return textPieces.join(' ');
  } catch (e) {
    console.error('Error en fallback de PDF:', e);
    return '';
  }
}

/**
 * Extracts text from Word DOCX file using mammoth with JSZip XML fallback.
 */
async function extractFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  // Strategy 1: Mammoth
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    if (result.value && result.value.trim().length > 10) {
      return result.value;
    }
  } catch (mammothErr) {
    console.warn('Mammoth falló, recurriendo al descompresor nativo JSZip:', mammothErr);
  }

  // Strategy 2: Direct JSZip XML extraction of word/document.xml
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXmlFile = zip.file('word/document.xml');
    if (docXmlFile) {
      const xml = await docXmlFile.async('text');
      // Replace paragraph breaks with newlines, remove XML tags
      const text = xml
        .replace(/<w:p[^>]*>/gi, '\n\n')
        .replace(/<w:tab[^>]*\/>/gi, '\t')
        .replace(/<w:br[^>]*\/>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
      if (text.trim().length > 10) {
        return text;
      }
    }
  } catch (zipErr) {
    console.error('Error al extraer DOCX vía JSZip:', zipErr);
  }

  return '';
}

/**
 * Extracts text from OpenDocument .odt file.
 */
async function extractFromOdt(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const contentXml = zip.file('content.xml');
    if (contentXml) {
      const xml = await contentXml.async('text');
      return xml
        .replace(/<text:p[^>]*>/gi, '\n\n')
        .replace(/<text:h[^>]*>/gi, '\n\n')
        .replace(/<text:tab[^>]*\/>/gi, '\t')
        .replace(/<text:line-break[^>]*\/>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
    }
  } catch (e) {
    console.error('Error al procesar archivo .odt:', e);
  }
  return '';
}

/**
 * Extracts readable strings from legacy Word 97-2003 .doc binary files.
 */
function extractFromLegacyDoc(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  let asciiChunks: string[] = [];
  let currentChunk = '';

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    // ASCII printable characters or Spanish accents in common encodings
    if ((b >= 32 && b <= 126) || b === 10 || b === 13 || (b >= 192 && b <= 255)) {
      currentChunk += String.fromCharCode(b);
    } else {
      if (currentChunk.length >= 4) {
        asciiChunks.push(currentChunk.trim());
      }
      currentChunk = '';
    }
  }

  if (currentChunk.length >= 4) {
    asciiChunks.push(currentChunk.trim());
  }

  // Filter out binary metadata noise
  const filtered = asciiChunks.filter(
    (c) => c.length > 5 && !c.startsWith('WordDocument') && !c.startsWith('CompObj')
  );

  return filtered.join('\n\n');
}

/**
 * Strips RTF syntax controls to extract plain text.
 */
function extractFromRtf(rtfText: string): string {
  return rtfText
    .replace(/\\par[d]?/g, '\n')
    .replace(/\\tab/g, '\t')
    .replace(/\\'[0-9a-fA-F]{2}/g, (match) => {
      const hex = match.slice(2);
      return String.fromCharCode(parseInt(hex, 16));
    })
    .replace(/\\[a-zA-Z]+-?[0-9]*\s?/g, '')
    .replace(/[{}]/g, '')
    .trim();
}

/**
 * Primary document extractor. Operates 100% in local browser memory (RAM).
 * Compliant with student data privacy (Habeas Data Ley 1581 / MEN Colombia).
 */
export async function extractTextFromFile(file: File): Promise<ExtractedDocument> {
  const fileName = file.name;
  const lastDot = fileName.lastIndexOf('.');
  const extension = lastDot !== -1 ? fileName.slice(lastDot).toLowerCase() : '';
  const rawTitle = (lastDot !== -1 ? fileName.slice(0, lastDot) : fileName)
    .replace(/[-_]/g, ' ')
    .trim();

  let extractedText = '';
  let sourceType: ExtractedDocument['sourceType'] = 'other';

  if (extension === '.pdf') {
    sourceType = 'pdf';
    const arrayBuffer = await file.arrayBuffer();

    try {
      extractedText = await extractFromPdfWithPdfjs(arrayBuffer);
    } catch (pdfErr) {
      console.warn('pdfjs-dist arrojó error, probando motor de respaldo:', pdfErr);
      extractedText = extractFromPdfFallback(arrayBuffer);
    }

    // If still empty or minimal, try fallback again
    if (!extractedText || extractedText.trim().split(/\s+/).length < 5) {
      const fallbackResult = extractFromPdfFallback(arrayBuffer);
      if (fallbackResult.trim().length > extractedText.trim().length) {
        extractedText = fallbackResult;
      }
    }
  } else if (extension === '.docx') {
    sourceType = 'docx';
    const arrayBuffer = await file.arrayBuffer();
    extractedText = await extractFromDocx(arrayBuffer);
  } else if (extension === '.odt') {
    sourceType = 'odt';
    const arrayBuffer = await file.arrayBuffer();
    extractedText = await extractFromOdt(arrayBuffer);
  } else if (extension === '.doc') {
    sourceType = 'doc';
    const arrayBuffer = await file.arrayBuffer();
    extractedText = extractFromLegacyDoc(arrayBuffer);
  } else if (extension === '.rtf') {
    sourceType = 'rtf';
    const rawRtf = await file.text();
    extractedText = extractFromRtf(rawRtf);
  } else {
    // Plain text, markdown, csv, or unknown text-based formats
    sourceType = extension === '.txt' || extension === '.md' ? 'txt' : 'other';
    try {
      extractedText = await file.text();
    } catch {
      const buffer = await file.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      extractedText = decoder.decode(buffer);
    }
  }

  const cleanText = normalizeExtractedText(extractedText);
  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];

  return {
    title: rawTitle ? rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1) : 'Documento Sin Título',
    fileName,
    fileSize: file.size,
    text: cleanText,
    wordCount: words.length,
    sourceType
  };
}
