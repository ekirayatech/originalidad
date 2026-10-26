/**
 * Cryptographic Hash & Document Integrity Utility for Colegio Bilingüe Ekirayá
 * Implements deterministic SHA-256 hashing for academic audits and document verification.
 */

// Pure TypeScript SHA-256 implementation (synchronous, zero external dependencies)
export function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i = 0;
  let j = 0; // Used as a counter across the whole file
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  // Initial hash values (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19)
  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isPrime = (candidate: number) => {
    for (let factor = 2, maxFactor = Math.sqrt(candidate); factor <= maxFactor; factor++) {
      if (candidate % factor === 0) return false;
    }
    return true;
  };

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      }
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter++;
    }
  }

  // Pre-processing
  const utf8: number[] = [];
  for (i = 0; i < ascii[lengthProperty]; i++) {
    let charCode = ascii.charCodeAt(i);
    if (charCode < 0x80) {
      utf8.push(charCode);
    } else if (charCode < 0x800) {
      utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      utf8.push(
        0xe0 | (charCode >> 12),
        0x80 | ((charCode >> 6) & 0x3f),
        0x80 | (charCode & 0x3f)
      );
    } else {
      // surrogate pair
      i++;
      charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (ascii.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charCode >> 18),
        0x80 | ((charCode >> 12) & 0x3f),
        0x80 | ((charCode >> 6) & 0x3f),
        0x80 | (charCode & 0x3f)
      );
    }
  }

  const utf8BitLength = utf8.length * 8;
  utf8.push(0x80);
  while ((utf8.length % 64) !== 56) {
    utf8.push(0);
  }

  for (i = 0; i < utf8.length; i += 4) {
    words.push(
      (utf8[i] << 24) |
      (utf8[i + 1] << 16) |
      (utf8[i + 2] << 8) |
      utf8[i + 3]
    );
  }

  words.push((utf8BitLength / maxWord) | 0);
  words.push(utf8BitLength | 0);

  // Process the message in successive 512-bit chunks
  for (j = 0; j < words[lengthProperty]; j += 16) {
    const w = words.slice(j, j + 16);
    const oldHash = [...hash];

    for (i = 0; i < 64; i++) {
      if (i >= 16) {
        const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (((w[i - 16] + s0) | 0) + ((w[i - 7] + s1) | 0)) | 0;
      }

      const s1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (((((hash[7] + s1) | 0) + ch) | 0) + ((k[i] + w[i]) | 0)) | 0;
      const s0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0 + maj) | 0;

      hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (let b = 3; b >= 0; b--) {
      const byte = (hash[i] >> (b * 8)) & 255;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }

  return result;
}

/**
 * Asynchronous SHA-256 calculation leveraging Web Crypto API when available,
 * falling back seamlessly to sha256Sync.
 */
export async function computeSha256(data: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const buffer = encoder.encode(data);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback to sync
      return sha256Sync(data);
    }
  }
  return sha256Sync(data);
}

export interface AuditVerificationRecord {
  documentHash: string; // SHA-256 of analysis audit payload
  contentHash: string; // SHA-256 of normalized text content
  verificationTimestamp: string;
  isVerified: boolean;
  institution: string;
  auditCertificateId: string;
}

/**
 * Build canonical string for hashing to ensure deterministic audit results.
 */
export function buildCanonicalAuditPayload(params: {
  title: string;
  author: string;
  content: string;
  totalWords: number;
  totalSentences: number;
  similarityIndex: number;
  aiWritingIndex: number;
  submissionDate: string;
  institution?: string;
}): { canonicalString: string; contentHash: string } {
  // Normalize content for text hash
  const normalizedText = params.content.trim().replace(/\r\n/g, '\n');
  const contentHash = sha256Sync(normalizedText);

  const canonicalObj = {
    institution: params.institution || 'Colegio Bilingüe Ekirayá',
    title: params.title.trim(),
    author: params.author.trim(),
    contentHash,
    totalWords: params.totalWords,
    totalSentences: params.totalSentences,
    similarityIndex: Math.round(params.similarityIndex),
    aiWritingIndex: Math.round(params.aiWritingIndex),
    submissionDate: params.submissionDate
  };

  return {
    canonicalString: JSON.stringify(canonicalObj),
    contentHash
  };
}

/**
 * Generate full audit verification record with unique SHA-256 hash.
 */
export function generateAuditRecord(params: {
  title: string;
  author: string;
  content: string;
  totalWords: number;
  totalSentences: number;
  similarityIndex: number;
  aiWritingIndex: number;
  submissionDate: string;
}): AuditVerificationRecord {
  const { canonicalString, contentHash } = buildCanonicalAuditPayload(params);
  const documentHash = sha256Sync(canonicalString);
  const auditCertificateId = `EKIRAYA-AUDIT-${documentHash.slice(0, 10).toUpperCase()}`;

  return {
    documentHash,
    contentHash,
    verificationTimestamp: new Date().toISOString(),
    isVerified: true,
    institution: 'Colegio Bilingüe Ekirayá',
    auditCertificateId
  };
}

/**
 * Verify if a document and its metrics match a given cryptographic hash.
 */
export function verifyDocumentIntegrity(params: {
  title: string;
  author: string;
  content: string;
  totalWords: number;
  totalSentences: number;
  similarityIndex: number;
  aiWritingIndex: number;
  submissionDate: string;
  expectedHash: string;
}): {
  isValid: boolean;
  calculatedHash: string;
  expectedHash: string;
  contentHash: string;
  matchedProperties: boolean;
} {
  const { canonicalString, contentHash } = buildCanonicalAuditPayload(params);
  const calculatedHash = sha256Sync(canonicalString);
  const isValid = calculatedHash.toLowerCase() === params.expectedHash.toLowerCase();

  return {
    isValid,
    calculatedHash,
    expectedHash: params.expectedHash,
    contentHash,
    matchedProperties: isValid
  };
}

/**
 * Format 64-char hash for display (e.g., "7f83b165...e48a12")
 */
export function formatHashShort(hash: string, lead: number = 8, trail: number = 6): string {
  if (!hash || hash.length <= lead + trail) return hash || '';
  return `${hash.slice(0, lead)}...${hash.slice(-trail)}`;
}
