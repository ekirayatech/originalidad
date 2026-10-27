import {
  BibliographicReference,
  InTextCitation,
  CitationAnalysisSummary
} from '../types';

// Regex patterns for bibliography sections
const BIBLIOGRAPHY_HEADER_REGEX = /(?:^|\n)\s*(?:#{1,3}\s*)?(?:[0-9IVX]+\.?\s*)?(?:referencias\s+bibliogr[áa]ficas|referencias|bibliograf[íi]a|obras\s+citadas|fuentes\s+consultadas|references|bibliography|works\s+cited)\s*(?::|\n|$)/i;

// In-text parenthetical citations: (García, 2020), (Pérez & Gómez, 2018), (Smith et al., 2021), (López, 2019, p. 12)
const PARENTHETICAL_CITATION_REGEX = /\(([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:(?:\s+(?:y|and|e|&)\s+|,\s+)[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+|\s+et\s+al\.)?),\s*([12][0-9]{3})(?:,\s*(?:p\.|pp\.|p[áa]g\.)?\s*[0-9]+)?\)/g;

// In-text narrative citations: Pérez (2020), García et al. (2019), Smith and Jones (2021)
const NARRATIVE_CITATION_REGEX = /\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+et\s+al\.|\s+(?:y|and|e|&)\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)\s*\(([12][0-9]{3})\)/g;

// Numeric citations: [1], [2, 3], [4-6]
const NUMERIC_CITATION_REGEX = /\[([0-9]{1,3}(?:\s*,\s*[0-9]{1,3}|\s*-\s*[0-9]{1,3})*)\]/g;

// DOI or URL extraction regex
const DOI_OR_URL_REGEX = /(?:https?:\/\/[^\s]+|doi:\s*10\.[0-9]{4,9}\/[-._;()/:A-Za-z0-9]+|10\.[0-9]{4,9}\/[-._;()/:A-Za-z0-9]+)/i;

/**
 * Normalizes an author surname string for resilient matching
 */
function normalizeAuthor(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
}

/**
 * Extracts and analyzes citations and references in a document
 */
export function analyzeDocumentCitations(documentText: string): CitationAnalysisSummary {
  if (!documentText || documentText.trim().length === 0) {
    return {
      totalReferencesFound: 0,
      totalInTextCitationsFound: 0,
      matchedCitationsCount: 0,
      orphanReferencesCount: 0,
      unreferencedCitationsCount: 0,
      detectedStyle: 'APA / Autor-Año',
      citationHealthScore: 100,
      references: [],
      inTextCitations: []
    };
  }

  // 1. Separate Body from References section
  const bibMatch = documentText.match(BIBLIOGRAPHY_HEADER_REGEX);
  let bodyText = documentText;
  let bibText = '';

  if (bibMatch && bibMatch.index !== undefined) {
    bodyText = documentText.substring(0, bibMatch.index);
    bibText = documentText.substring(bibMatch.index + bibMatch[0].length);
  }

  // 2. Extract References from Bibliography
  const rawReferenceLines: string[] = [];
  if (bibText.trim().length > 0) {
    const rawParagraphs = bibText.split(/\n\s*\n|\r\n\s*\r\n/);
    for (const p of rawParagraphs) {
      const cleanP = p.trim().replace(/\s+/g, ' ');
      if (cleanP.length >= 15) {
        rawReferenceLines.push(cleanP);
      }
    }

    // If paragraphs weren't detected with double newlines, try by line breaks starting with author or bullet
    if (rawReferenceLines.length === 0) {
      const lines = bibText.split(/\n|\r\n/);
      let currentEntry = '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        // Check if line starts a new reference (e.g. starts with capital letters, brackets, or bullets)
        const isNewRef = /^[A-ZÁÉÍÓÚÑ]|^\[[0-9]+\]|^[0-9]+\./.test(trimmed);
        if (isNewRef && currentEntry.length > 20) {
          rawReferenceLines.push(currentEntry.trim());
          currentEntry = trimmed;
        } else {
          currentEntry = currentEntry ? `${currentEntry} ${trimmed}` : trimmed;
        }
      }
      if (currentEntry.trim().length >= 15) {
        rawReferenceLines.push(currentEntry.trim());
      }
    }
  }

  // Parse Reference Objects
  const parsedReferences: BibliographicReference[] = rawReferenceLines.map((raw, idx) => {
    // Extract year
    const yearMatch = raw.match(/\b([12][0-9]{3})\b/);
    const year = yearMatch ? yearMatch[1] : undefined;

    // Extract authors (take first 1-3 words before year or title)
    const authorMatch = raw.match(/^([^,(]+(?:,\s*[A-ZÁÉÍÓÚÑ]\.?)?(?:(?:\s+y\s+|\s+and\s+|,\s*)[^,(]+)?)/i);
    const authorLabel = authorMatch ? authorMatch[1].trim() : `Referencia #${idx + 1}`;

    // Extract DOI or URL
    const doiMatch = raw.match(DOI_OR_URL_REGEX);
    const doiOrUrl = doiMatch ? doiMatch[0] : undefined;

    return {
      id: `ref-${idx + 1}`,
      rawText: raw,
      authorLabel,
      year,
      titleSnippet: raw.length > 80 ? raw.substring(0, 80) + '...' : raw,
      doiOrUrl,
      citationCountInText: 0,
      isOrphan: true,
      status: year ? 'verified' : 'incomplete'
    };
  });

  // 3. Extract In-Text Citations from Body
  const parsedInTextCitations: InTextCitation[] = [];

  // 3a. Parenthetical citations
  let match: RegExpExecArray | null;
  while ((match = PARENTHETICAL_CITATION_REGEX.exec(bodyText)) !== null) {
    const rawText = match[0];
    const author = match[1].trim();
    const year = match[2];
    const startIndex = match.index;
    const endIndex = startIndex + rawText.length;

    parsedInTextCitations.push({
      id: `cit-${parsedInTextCitations.length + 1}`,
      rawText,
      authorKey: author,
      year,
      startIndex,
      endIndex,
      hasMatchingReference: false,
      citationType: 'parenthetical'
    });
  }

  // 3b. Narrative citations
  while ((match = NARRATIVE_CITATION_REGEX.exec(bodyText)) !== null) {
    const rawText = match[0];
    const author = match[1].trim();
    const year = match[2];
    const startIndex = match.index;
    const endIndex = startIndex + rawText.length;

    // Avoid duplicate if parenthetical was already caught
    const exists = parsedInTextCitations.some(
      (c) => Math.abs(c.startIndex - startIndex) < 5
    );

    if (!exists) {
      parsedInTextCitations.push({
        id: `cit-${parsedInTextCitations.length + 1}`,
        rawText,
        authorKey: author,
        year,
        startIndex,
        endIndex,
        hasMatchingReference: false,
        citationType: 'narrative'
      });
    }
  }

  // 3c. Numeric citations
  let numericMatchesCount = 0;
  while ((match = NUMERIC_CITATION_REGEX.exec(bodyText)) !== null) {
    numericMatchesCount++;
    if (numericMatchesCount <= 30) { // Limit to 30 for performance
      const rawText = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + rawText.length;

      parsedInTextCitations.push({
        id: `cit-${parsedInTextCitations.length + 1}`,
        rawText,
        authorKey: `Ref ${match[1]}`,
        startIndex,
        endIndex,
        hasMatchingReference: false,
        citationType: 'numeric'
      });
    }
  }

  // 4. Cross-Reference Matching (In-Text Citations vs References)
  for (const citation of parsedInTextCitations) {
    const citAuthorNorm = normalizeAuthor(citation.authorKey);

    for (const ref of parsedReferences) {
      const refAuthorNorm = normalizeAuthor(ref.authorLabel);
      const rawRefNorm = normalizeAuthor(ref.rawText);

      // Check author match
      const authorMatches =
        citAuthorNorm.length >= 3 &&
        (refAuthorNorm.includes(citAuthorNorm) || rawRefNorm.includes(citAuthorNorm));

      // Check year match
      const yearMatches = !citation.year || !ref.year || citation.year === ref.year;

      if (authorMatches && yearMatches) {
        citation.hasMatchingReference = true;
        ref.citationCountInText++;
        ref.isOrphan = false;
        break;
      }
    }
  }

  // Calculate statistics
  const matchedCitationsCount = parsedInTextCitations.filter((c) => c.hasMatchingReference).length;
  const unreferencedCitationsCount = parsedInTextCitations.length - matchedCitationsCount;
  const orphanReferencesCount = parsedReferences.filter((r) => r.isOrphan).length;

  // Determine citation style
  const detectedStyle: 'APA / Autor-Año' | 'IEEE / Numérico' | 'Estándar Académico' =
    numericMatchesCount > 2
      ? 'IEEE / Numérico'
      : parsedInTextCitations.length > 0 || parsedReferences.length > 0
      ? 'APA / Autor-Año'
      : 'Estándar Académico';

  // Calculate Citation Health Score (0 - 100)
  let healthScore = 100;
  if (parsedInTextCitations.length > 0 || parsedReferences.length > 0) {
    const citationPenalty = unreferencedCitationsCount * 15;
    const orphanPenalty = orphanReferencesCount * 8;
    const noBibPenalty = parsedInTextCitations.length > 0 && parsedReferences.length === 0 ? 40 : 0;
    healthScore = Math.max(10, Math.min(100, Math.round(100 - citationPenalty - orphanPenalty - noBibPenalty)));
  }

  return {
    totalReferencesFound: parsedReferences.length,
    totalInTextCitationsFound: parsedInTextCitations.length,
    matchedCitationsCount,
    orphanReferencesCount,
    unreferencedCitationsCount,
    detectedStyle,
    citationHealthScore: healthScore,
    references: parsedReferences,
    inTextCitations: parsedInTextCitations
  };
}
