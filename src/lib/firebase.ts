import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ReferenceDocument, AnalysisSummary } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must use firestoreDatabaseId specified in firebaseConfig
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection as required by Skill
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore: el cliente está offline o no se pudo contactar el servidor.');
    }
  }
}

// User Role Definition
export type UserRole = 'student' | 'teacher' | 'admin' | 'reviewer';

// User Profile Interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: UserRole;
  institution?: string;
  roleLabel?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

// Helper to determine role & institution from school email
export function determineUserRoleAndInstitution(email?: string | null): {
  role: UserRole;
  institution: string;
  roleLabel: string;
  isStudent: boolean;
  isTeacher: boolean;
} {
  if (!email) {
    return {
      role: 'reviewer',
      institution: 'Colegio Ekirayá - CEM',
      roleLabel: 'Usuario Invitado',
      isStudent: false,
      isTeacher: false
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  // Student institutional domains: @est.cem.edu.co or typo with comma @est,cem.edu.co
  if (
    cleanEmail.endsWith('@est.cem.edu.co') ||
    cleanEmail.includes('@est.cem.edu.co') ||
    cleanEmail.includes('@est,cem.edu.co') ||
    cleanEmail.endsWith('@est.ekiraya.edu.co')
  ) {
    return {
      role: 'student',
      institution: 'Colegio Ekirayá - CEM (Estudiantes)',
      roleLabel: 'Estudiante CEM',
      isStudent: true,
      isTeacher: false
    };
  }

  // Teacher institutional domains: @cem.edu.co or @ekiraya.edu.co
  if (
    cleanEmail.endsWith('@cem.edu.co') ||
    cleanEmail.includes('@cem.edu.co') ||
    cleanEmail.endsWith('@ekiraya.edu.co')
  ) {
    return {
      role: 'teacher',
      institution: 'Colegio Ekirayá - CEM (Docentes)',
      roleLabel: 'Docente CEM',
      isStudent: false,
      isTeacher: true
    };
  }

  // Default fallback for external or personal Google accounts during testing
  return {
    role: 'teacher',
    institution: 'Colegio Ekirayá - CEM (Acceso Institucional)',
    roleLabel: 'Docente CEM (Externo)',
    isStudent: false,
    isTeacher: true
  };
}

// Analyzed Document Record in Firestore
export interface SavedDocumentRecord {
  id: string;
  title: string;
  author: string;
  wordCount: number;
  contentSnippet: string;
  overallSimilarity: number;
  originalityScore: number;
  studentPaperSimilarity: number;
  matchesCount: number;
  summary: string;
  teacherNotes: string;
  userId: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------------------------
// Authentication Actions
// -------------------------------------------------------------
export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await syncUserProfile(result.user);
    }
    return result.user;
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Sync user profile in Firestore collection /users/{userId}
export async function syncUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const now = new Date().toISOString();
  const path = `users/${user.uid}`;

  const roleInfo = determineUserRoleAndInstitution(user.email);

  try {
    const existingDoc = await getDoc(userRef);
    if (!existingDoc.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || 'sin-correo@cem.edu.co',
        displayName: user.displayName || user.email?.split('@')[0] || (roleInfo.isStudent ? 'Estudiante CEM' : 'Docente CEM'),
        photoURL: user.photoURL || '',
        role: roleInfo.role,
        institution: roleInfo.institution,
        createdAt: now,
        lastLoginAt: now
      };
      await setDoc(userRef, newProfile);
      return { ...newProfile, roleLabel: roleInfo.roleLabel };
    } else {
      const existingData = existingDoc.data() as UserProfile;
      const updatedProfile: UserProfile = {
        ...existingData,
        role: roleInfo.role,
        institution: roleInfo.institution,
        lastLoginAt: now,
        displayName: user.displayName || existingData.displayName,
        photoURL: user.photoURL || existingData.photoURL || ''
      };
      await setDoc(userRef, updatedProfile, { merge: true });
      return { ...updatedProfile, roleLabel: roleInfo.roleLabel };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// Document Evaluation Records (Firestore `/documents/{id}`)
// -------------------------------------------------------------
export async function saveAnalyzedDocumentRecord(
  analysis: AnalysisSummary,
  fullText: string,
  teacherNotes: string = ''
): Promise<SavedDocumentRecord> {
  if (!auth.currentUser) {
    throw new Error('Debes iniciar sesión para guardar el registro en la nube.');
  }

  const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();
  const path = `documents/${docId}`;

  // Calculate student paper similarity share
  const studentSources = analysis.sources.filter((s) => s.sourceType === 'student_paper');
  const studentPaperSim = studentSources.reduce((acc, s) => acc + s.percentage, 0);

  const summaryText = `${analysis.similarityFunnelLabel}. ${analysis.sources.length} fuentes contrastadas, ${analysis.matchedSegments.length} fragmentos coincidentes. Detección de IA: ${analysis.aiWritingIndex}%.`;

  const newDocRecord: SavedDocumentRecord = {
    id: docId,
    title: analysis.title || 'Trabajo sin título',
    author: analysis.author || 'Estudiante Ekirayá',
    wordCount: analysis.totalWords || 0,
    contentSnippet: fullText.slice(0, 8000), // snippet up to 8k chars
    overallSimilarity: Math.round(analysis.similarityIndex),
    originalityScore: Math.round(Math.max(0, 100 - analysis.similarityIndex)),
    studentPaperSimilarity: Math.round(studentPaperSim),
    matchesCount: analysis.matchedSegments.length,
    summary: summaryText.slice(0, 1800),
    teacherNotes: teacherNotes.slice(0, 1800),
    userId: auth.currentUser.uid,
    userEmail: auth.currentUser.email || '',
    createdAt: now,
    updatedAt: now
  };

  try {
    await setDoc(doc(db, 'documents', docId), newDocRecord);
    return newDocRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeUserDocuments(
  userId: string,
  onData: (docs: SavedDocumentRecord[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'documents';
  const q = query(collection(db, path), where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: SavedDocumentRecord[] = [];
      snapshot.forEach((snap) => {
        records.push(snap.data() as SavedDocumentRecord);
      });
      // Sort newest first
      records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(records);
    },
    (error) => {
      if (onError) {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (e: any) {
          onError(e);
        }
      } else {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }
  );
}

export async function deleteAnalyzedDocumentRecord(docId: string): Promise<void> {
  const path = `documents/${docId}`;
  try {
    await deleteDoc(doc(db, 'documents', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateDocumentNotes(docId: string, notes: string): Promise<void> {
  const path = `documents/${docId}`;
  try {
    await updateDoc(doc(db, 'documents', docId), {
      teacherNotes: notes.slice(0, 1800),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// -------------------------------------------------------------
// Reference Corpus in Firestore `/reference_documents/{id}`
// -------------------------------------------------------------
export async function saveReferenceCorpusDocToFirestore(
  refDoc: ReferenceDocument
): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('Debes iniciar sesión para guardar en la biblioteca en la nube.');
  }

  // Clean ID if needed
  const cleanId = refDoc.id.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 120);
  const path = `reference_documents/${cleanId}`;

  const payload = {
    id: cleanId,
    title: refDoc.title.slice(0, 300),
    author: refDoc.author.slice(0, 200),
    type: refDoc.type || 'student_paper',
    year: refDoc.year || new Date().getFullYear(),
    institutionOrJournal: (refDoc.institutionOrJournal || 'Colegio Bilingüe Ekirayá').slice(0, 250),
    content: refDoc.content.slice(0, 190000),
    wordCount: refDoc.content.split(/\s+/).filter(Boolean).length,
    createdBy: auth.currentUser.uid,
    createdByName: auth.currentUser.displayName || auth.currentUser.email || 'Docente Ekirayá',
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'reference_documents', cleanId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeReferenceDocuments(
  onData: (docs: ReferenceDocument[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'reference_documents';
  const q = collection(db, path);

  return onSnapshot(
    q,
    (snapshot) => {
      const docs: ReferenceDocument[] = [];
      snapshot.forEach((snap) => {
        const data = snap.data();
        docs.push({
          id: data.id,
          title: data.title,
          author: data.author,
          type: data.type,
          year: data.year,
          institutionOrJournal: data.institutionOrJournal,
          content: data.content,
          isCustomUploaded: true
        });
      });
      onData(docs);
    },
    (error) => {
      if (onError) {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (e: any) {
          onError(e);
        }
      } else {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }
  );
}

export async function deleteReferenceDocFromFirestore(refDocId: string): Promise<void> {
  const cleanId = refDocId.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `reference_documents/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'reference_documents', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Automatic Cotejo & Evaluation Dual-Storage
// "una vez haga la revisión de documentos, los almacene para ser
// la de la base de datos y sean cotejados en próximos usos o revisiones"
// -------------------------------------------------------------
export async function autoIndexAnalyzedDocument(
  analysis: AnalysisSummary,
  fullText: string,
  teacherNotes: string = ''
): Promise<{
  savedRecord: SavedDocumentRecord;
  referenceDocId: string;
}> {
  if (!auth.currentUser) {
    throw new Error('Debes iniciar sesión con tu cuenta institucional para indexar en la nube.');
  }

  // 1. Save document record in evaluations history
  const savedRecord = await saveAnalyzedDocumentRecord(analysis, fullText, teacherNotes);

  // 2. Automatically save copy to reference corpus (Biblioteca de Cotejo Compartida CEM)
  const simpleHash = Math.abs(
    fullText.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0)
  ).toString(36);
  const cleanTitleSlug = (analysis.title || 'trabajo')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 30);
  const refDocId = `cem_${cleanTitleSlug}_${simpleHash}`.slice(0, 100);

  const refPayload: ReferenceDocument = {
    id: refDocId,
    title: analysis.title || 'Entrega de Estudiante CEM',
    author: analysis.author || auth.currentUser.displayName || 'Estudiante CEM',
    type: 'student_paper',
    year: new Date().getFullYear(),
    institutionOrJournal: 'Colegio Ekirayá - CEM (Repositorio Institucional de Cotejo)',
    content: fullText,
    isCustomUploaded: true
  };

  await saveReferenceCorpusDocToFirestore(refPayload);

  return {
    savedRecord,
    referenceDocId: refDocId
  };
}

// Subscribe to documents: teachers see school-wide submissions, students see their own
export function subscribeUserOrSchoolDocuments(
  userId: string,
  isTeacher: boolean,
  onData: (docs: SavedDocumentRecord[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'documents';
  const q = isTeacher
    ? collection(db, path)
    : query(collection(db, path), where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: SavedDocumentRecord[] = [];
      snapshot.forEach((snap) => {
        records.push(snap.data() as SavedDocumentRecord);
      });
      records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(records);
    },
    (error) => {
      if (onError) {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (e: any) {
          onError(e);
        }
      } else {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }
  );
}

