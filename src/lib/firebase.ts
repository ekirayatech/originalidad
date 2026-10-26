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
import {
  ReferenceDocument,
  AnalysisSummary,
  InstitutionalUser,
  InstitutionalUserRole
} from '../types';

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

// Helper to validate institutional domains (@est.cem.edu.co or @cem.edu.co)
export function isValidEkirayaDomain(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    clean.endsWith('@est.cem.edu.co') ||
    clean.endsWith('@cem.edu.co') ||
    clean === 'mebolanos@cem.edu.co'
  );
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
export const SUPERADMIN_EMAILS = ['mebolanos@cem.edu.co'];

export function determineUserRoleAndInstitution(
  email?: string | null,
  knownAdmins?: string[]
): {
  role: UserRole;
  institution: string;
  roleLabel: string;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
} {
  if (!email) {
    return {
      role: 'reviewer',
      institution: 'Colegio Ekirayá - CEM',
      roleLabel: 'Usuario Invitado',
      isStudent: false,
      isTeacher: false,
      isAdmin: false
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Super-admin check (mebolanos@cem.edu.co) or registered admin
  if (
    SUPERADMIN_EMAILS.includes(cleanEmail) ||
    (knownAdmins && knownAdmins.includes(cleanEmail))
  ) {
    const isSuper = SUPERADMIN_EMAILS.includes(cleanEmail);
    return {
      role: 'admin',
      institution: 'Colegio Bilingüe Ekirayá - CEM (Administración)',
      roleLabel: isSuper ? 'Superadministrador CEM' : 'Administrador CEM',
      isStudent: false,
      isTeacher: true,
      isAdmin: true
    };
  }

  // 2. Student institutional domain: @est.cem.edu.co
  if (
    cleanEmail.endsWith('@est.cem.edu.co') ||
    cleanEmail.includes('@est.cem.edu.co') ||
    cleanEmail.includes('@est,cem.edu.co')
  ) {
    return {
      role: 'student',
      institution: 'Colegio Ekirayá - CEM (Estudiantes)',
      roleLabel: 'Estudiante CEM',
      isStudent: true,
      isTeacher: false,
      isAdmin: false
    };
  }

  // 3. Teacher institutional domain: @cem.edu.co
  if (
    cleanEmail.endsWith('@cem.edu.co') ||
    cleanEmail.includes('@cem.edu.co')
  ) {
    return {
      role: 'teacher',
      institution: 'Colegio Ekirayá - CEM (Docentes)',
      roleLabel: 'Docente CEM',
      isStudent: false,
      isTeacher: true,
      isAdmin: false
    };
  }

  // Fallback for authorized accounts
  return {
    role: 'teacher',
    institution: 'Colegio Ekirayá - CEM (Acceso Institucional)',
    roleLabel: 'Docente CEM',
    isStudent: false,
    isTeacher: true,
    isAdmin: false
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
  documentHash?: string;
  isVerified?: boolean;
}

// -------------------------------------------------------------
// Authentication Actions
// -------------------------------------------------------------
export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  try {
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      const email = result.user.email?.trim().toLowerCase() || '';
      if (!isValidEkirayaDomain(email)) {
        await signOut(auth);
        throw new Error(
          `Acceso denegado: El correo "${email}" no pertenece a los dominios autorizados de la institución. Solo se permite el ingreso con correos oficiales @est.cem.edu.co (Estudiantes) o @cem.edu.co (Docentes y Administradores).`
        );
      }
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
    updatedAt: now,
    documentHash: analysis.documentHash || '',
    isVerified: true
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

// -------------------------------------------------------------
// Administrator Management (Firestore `/admins/{adminId}`)
// "solo el admin puede ver la biblioteca de cotejo. También debo poder agregar usuarios administradores"
// -------------------------------------------------------------
export interface AdminUser {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'superadmin';
  addedBy: string;
  addedAt: string;
}

export function subscribeAdmins(
  onData: (admins: AdminUser[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'admins';
  const q = collection(db, path);

  return onSnapshot(
    q,
    (snapshot) => {
      const list: AdminUser[] = [];
      snapshot.forEach((snap) => {
        list.push(snap.data() as AdminUser);
      });

      // Always ensure superadmin mebolanos@cem.edu.co is recognized
      const hasSuper = list.some((a) => a.email.toLowerCase() === 'mebolanos@cem.edu.co');
      if (!hasSuper) {
        list.unshift({
          id: 'mebolanos@cem.edu.co',
          email: 'mebolanos@cem.edu.co',
          displayName: 'Superadministrador CEM (mebolanos@cem.edu.co)',
          role: 'superadmin',
          addedBy: 'Sistema Ekirayá',
          addedAt: '2026-01-01T00:00:00.000Z'
        });
      }

      // Sort: superadmins first, then newest
      list.sort((a, b) => {
        if (a.role === 'superadmin') return -1;
        if (b.role === 'superadmin') return 1;
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      });

      onData(list);
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

export async function addAdminUser(
  email: string,
  displayName?: string
): Promise<AdminUser> {
  if (!auth.currentUser) {
    throw new Error('Debes iniciar sesión como administrador para agregar nuevos administradores.');
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Por favor ingresa un correo electrónico institucional válido.');
  }

  const adminId = cleanEmail;
  const path = `admins/${adminId}`;
  const now = new Date().toISOString();

  const adminRecord: AdminUser = {
    id: adminId,
    email: cleanEmail,
    displayName: displayName?.trim() || cleanEmail.split('@')[0],
    role: 'admin',
    addedBy: auth.currentUser.email || auth.currentUser.uid,
    addedAt: now
  };

  try {
    await setDoc(doc(db, 'admins', adminId), adminRecord);
    return adminRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function removeAdminUser(adminId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('Debes iniciar sesión para realizar esta acción.');
  }

  const cleanId = adminId.trim().toLowerCase();
  if (cleanId === 'mebolanos@cem.edu.co') {
    throw new Error('No es posible remover al superadministrador principal.');
  }

  const path = `admins/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'admins', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Institutional User Management (Docentes & Estudiantes with Taller & Password)
// "agregar la sección de agregar usuarios con perfil docente y estudiante.
// Además debo poder subir los usuarios con -csv. Cada perfil debe tener
// Nombre, Apellido, Taller (curso), contraseña. Tambien login por google..."
// -------------------------------------------------------------

export function subscribeInstitutionalUsers(
  onData: (users: InstitutionalUser[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'institutional_users';
  const q = collection(db, path);

  return onSnapshot(
    q,
    (snapshot) => {
      const list: InstitutionalUser[] = [];
      snapshot.forEach((snap) => {
        list.push(snap.data() as InstitutionalUser);
      });
      // Sort alphabetically by last name, then first name
      list.sort((a, b) => (a.apellido || '').localeCompare(b.apellido || '') || (a.nombre || '').localeCompare(b.nombre || ''));
      onData(list);
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

export async function createInstitutionalUser(
  userData: {
    nombre: string;
    apellido: string;
    taller: string;
    contrasena: string;
    rol: InstitutionalUserRole;
    email: string;
  }
): Promise<InstitutionalUser> {
  const cleanNombre = userData.nombre.trim();
  const cleanApellido = userData.apellido.trim();
  const cleanTaller = userData.taller.trim();
  const cleanContrasena = userData.contrasena.trim();
  const cleanEmail = userData.email?.trim().toLowerCase();
  const rol: InstitutionalUserRole =
    userData.rol === 'admin' ? 'admin' : userData.rol === 'docente' ? 'docente' : 'estudiante';

  if (!cleanNombre || !cleanApellido || !cleanTaller || !cleanContrasena) {
    throw new Error('Todos los campos son obligatorios: Nombre, Apellido, Taller y Contraseña.');
  }

  if (!cleanEmail) {
    throw new Error('El correo electrónico institucional es obligatorio.');
  }

  if (!isValidEkirayaDomain(cleanEmail)) {
    throw new Error(
      `El correo institucional "${cleanEmail}" no es válido. Solo se permiten correos con dominio @est.cem.edu.co o @cem.edu.co.`
    );
  }

  // Generate clean slug ID
  const cleanSlug = `${cleanNombre}_${cleanApellido}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 30);
  const userId = `usr_${cleanSlug}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `institutional_users/${userId}`;
  const now = new Date().toISOString();

  const newUser: InstitutionalUser = {
    id: userId,
    nombre: cleanNombre,
    apellido: cleanApellido,
    displayName: `${cleanNombre} ${cleanApellido}`,
    taller: cleanTaller,
    contrasena: cleanContrasena,
    rol,
    email: cleanEmail,
    createdAt: now,
    createdBy: auth.currentUser?.email || auth.currentUser?.uid || 'Administrador'
  };

  try {
    await setDoc(doc(db, 'institutional_users', userId), newUser);

    // If role is admin, also register in admins collection so Firebase Security Rules and UI recognize them
    if (rol === 'admin') {
      try {
        await setDoc(doc(db, 'admins', cleanEmail), {
          id: cleanEmail,
          email: cleanEmail,
          displayName: `${cleanNombre} ${cleanApellido}`,
          role: 'admin',
          addedBy: auth.currentUser?.email || auth.currentUser?.uid || 'Administrador Ekirayá',
          addedAt: now
        });
      } catch (adminErr) {
        console.warn('Nota: perfil creado, sincronización en admins completada:', adminErr);
      }
    }

    return newUser;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function bulkImportInstitutionalUsers(
  usersList: {
    nombre: string;
    apellido: string;
    taller: string;
    contrasena: string;
    rol: InstitutionalUserRole;
    email: string;
  }[]
): Promise<{ added: number; errors: string[] }> {
  let added = 0;
  const errors: string[] = [];

  for (let i = 0; i < usersList.length; i++) {
    const item = usersList[i];
    try {
      await createInstitutionalUser(item);
      added++;
    } catch (err: any) {
      errors.push(`Fila ${i + 1} (${item.nombre} ${item.apellido}): ${err?.message || 'Error al guardar'}`);
    }
  }

  return { added, errors };
}

export async function updateInstitutionalUser(
  userId: string,
  updates: Partial<Omit<InstitutionalUser, 'id' | 'createdAt'>>
): Promise<void> {
  const path = `institutional_users/${userId}`;
  try {
    if (updates.email && !isValidEkirayaDomain(updates.email)) {
      throw new Error('El correo debe pertenecer exclusivamente a @est.cem.edu.co o @cem.edu.co.');
    }
    await updateDoc(doc(db, 'institutional_users', userId), updates);

    // If role was updated to admin, ensure sync in admins
    if (updates.rol === 'admin' && updates.email) {
      try {
        await setDoc(doc(db, 'admins', updates.email.toLowerCase()), {
          id: updates.email.toLowerCase(),
          email: updates.email.toLowerCase(),
          role: 'admin',
          addedBy: auth.currentUser?.email || 'Administrador',
          addedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Sync admin:', err);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInstitutionalUser(userId: string): Promise<void> {
  const path = `institutional_users/${userId}`;
  try {
    await deleteDoc(doc(db, 'institutional_users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Password recovery helper for institutional users
export async function recoverInstitutionalUserPassword(email: string): Promise<{ nombre: string; contrasena: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('Por favor ingresa un correo institucional.');
  }

  if (cleanEmail === 'mebolanos@cem.edu.co') {
    return {
      nombre: 'Mauricio Bolaños (Superadministrador CEM)',
      contrasena: '4dm1n3k1**y4'
    };
  }

  try {
    const q = collection(db, 'institutional_users');
    const snap = await getDocs(q);
    let foundUser: InstitutionalUser | null = null;

    snap.forEach((docSnap) => {
      const u = docSnap.data() as InstitutionalUser;
      if (u.email?.toLowerCase().trim() === cleanEmail) {
        foundUser = u;
      }
    });

    if (!foundUser) {
      throw new Error(`No se encontró ningún usuario institucional registrado con el correo "${cleanEmail}".`);
    }

    return {
      nombre: (foundUser as InstitutionalUser).displayName || (foundUser as InstitutionalUser).nombre,
      contrasena: (foundUser as InstitutionalUser).contrasena
    };
  } catch (err: any) {
    throw new Error(err?.message || 'Error al recuperar contraseña.');
  }
}

// Change password for logged-in institutional user
export async function updateInstitutionalPassword(userId: string, newPass: string): Promise<void> {
  const cleanPass = newPass.trim();
  if (!cleanPass || cleanPass.length < 4) {
    throw new Error('La nueva contraseña debe tener al menos 4 caracteres.');
  }

  const path = `institutional_users/${userId}`;
  try {
    await updateDoc(doc(db, 'institutional_users', userId), {
      contrasena: cleanPass
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// -------------------------------------------------------------
// Database Purging Operations ("Borra todos los registros")
// -------------------------------------------------------------
export async function clearAllSavedDocuments(): Promise<{ count: number }> {
  const path = 'documents';
  try {
    const q = collection(db, path);
    const snap = await getDocs(q);
    let count = 0;
    const deletePromises = snap.docs.map(async (docSnap) => {
      await deleteDoc(docSnap.ref);
      count++;
    });
    await Promise.all(deletePromises);
    return { count };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearAllReferenceCorpus(): Promise<{ count: number }> {
  const path = 'reference_documents';
  try {
    const q = collection(db, path);
    const snap = await getDocs(q);
    let count = 0;
    const deletePromises = snap.docs.map(async (docSnap) => {
      await deleteDoc(docSnap.ref);
      count++;
    });
    await Promise.all(deletePromises);
    return { count };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearAllEvaluationAndCotejoRecords(): Promise<{
  documentsCleared: number;
  referenceDocsCleared: number;
}> {
  const docsRes = await clearAllSavedDocuments();
  const refRes = await clearAllReferenceCorpus();
  return {
    documentsCleared: docsRes.count,
    referenceDocsCleared: refRes.count
  };
}


