import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User as FirebaseUser } from 'firebase/auth';
import {
  auth,
  db,
  loginWithGoogle,
  logoutUser,
  syncUserProfile,
  testFirestoreConnection,
  subscribeAdmins,
  addAdminUser,
  removeAdminUser,
  SUPERADMIN_EMAILS,
  type UserProfile,
  type AdminUser
} from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { InstitutionalUser } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  institutionalUser: InstitutionalUser | null;
  loading: boolean;
  isAdmin: boolean;
  adminsList: AdminUser[];
  login: () => Promise<void>;
  loginWithCredentials: (identifier: string, contrasena: string) => Promise<InstitutionalUser>;
  logout: () => Promise<void>;
  addAdmin: (email: string, displayName?: string) => Promise<AdminUser>;
  removeAdmin: (adminId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  institutionalUser: null,
  loading: true,
  isAdmin: false,
  adminsList: [],
  login: async () => {},
  loginWithCredentials: async () => { throw new Error('Not implemented'); },
  logout: async () => {},
  addAdmin: async () => { throw new Error('Not implemented'); },
  removeAdmin: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [institutionalUser, setInstitutionalUser] = useState<InstitutionalUser | null>(() => {
    try {
      const saved = localStorage.getItem('ekiraya_institutional_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [adminsList, setAdminsList] = useState<AdminUser[]>([]);

  // Compute admin status: either superadmin mebolanos@cem.edu.co, in admins collection, or marked as admin
  const effectiveEmail = user?.email || institutionalUser?.email || '';
  const isAdmin = Boolean(
    effectiveEmail &&
      (SUPERADMIN_EMAILS.includes(effectiveEmail.toLowerCase().trim()) ||
        adminsList.some((a) => a.email.toLowerCase().trim() === effectiveEmail.toLowerCase().trim()) ||
        userProfile?.role === 'admin')
  );

  useEffect(() => {
    // Initial connection test
    testFirestoreConnection();

    // Listen to Firebase Auth state
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await syncUserProfile(currentUser);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error sincronizando perfil de usuario:', error);
        }
      } else if (!institutionalUser) {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [institutionalUser]);

  // Synchronize institutional user as active profile if logged in via institutional credentials
  useEffect(() => {
    if (institutionalUser && !user) {
      setUserProfile({
        uid: institutionalUser.id,
        email: institutionalUser.email,
        displayName: institutionalUser.displayName,
        role: institutionalUser.rol === 'docente' ? 'teacher' : 'student',
        roleLabel: institutionalUser.rol === 'docente' ? `Docente (${institutionalUser.taller})` : `Estudiante (${institutionalUser.taller})`,
        institution: `Colegio Bilingüe Ekirayá - CEM (${institutionalUser.taller})`
      });
      setLoading(false);
    }
  }, [institutionalUser, user]);

  // Listen to Firestore admins list when any user is authenticated
  useEffect(() => {
    if (!user && !institutionalUser) {
      setAdminsList([]);
      return;
    }

    const unsubscribeAdmins = subscribeAdmins(
      (admins) => {
        setAdminsList(admins);
      },
      (err) => {
        console.warn('Información de administradores cargada en modo seguro:', err?.message || err);
      }
    );

    return () => unsubscribeAdmins();
  }, [user, institutionalUser]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      // Clear manual session if google was used
      setInstitutionalUser(null);
      localStorage.removeItem('ekiraya_institutional_session');
    } catch (err) {
      console.error('Fallo de inicio de sesión con Google:', err);
      throw err;
    }
  };

  const handleLoginWithCredentials = async (
    identifier: string,
    contrasena: string
  ): Promise<InstitutionalUser> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = contrasena.trim();

    if (!cleanId || !cleanPass) {
      throw new Error('Por favor ingresa usuario/correo y contraseña.');
    }

    try {
      // Special check for superadmin mebolanos@cem.edu.co
      if (
        (cleanId === 'mebolanos@cem.edu.co' || cleanId === 'mebolanos') &&
        cleanPass === '4dm1n3k1**y4'
      ) {
        const superAdminUser: InstitutionalUser = {
          id: 'usr_superadmin_mebolanos',
          nombre: 'Esteban',
          apellido: 'Bolaños',
          displayName: 'Esteban Bolaños (Superadministrador CEM)',
          taller: 'Administración General',
          contrasena: '4dm1n3k1**y4',
          rol: 'admin',
          email: 'mebolanos@cem.edu.co',
          createdAt: new Date().toISOString(),
          createdBy: 'Sistema'
        };
        setInstitutionalUser(superAdminUser);
        localStorage.setItem('ekiraya_institutional_session', JSON.stringify(superAdminUser));
        setUserProfile({
          uid: superAdminUser.id,
          email: superAdminUser.email,
          displayName: superAdminUser.displayName,
          role: 'admin',
          roleLabel: 'Superadministrador CEM',
          institution: 'Colegio Bilingüe Ekirayá - CEM (Administración)'
        });
        return superAdminUser;
      }

      // Query institutional_users collection
      const q = collection(db, 'institutional_users');
      const snap = await getDocs(q);

      let matchedUser: InstitutionalUser | null = null;

      snap.forEach((docSnap) => {
        const u = docSnap.data() as InstitutionalUser;
        const matchesIdentifier =
          u.email?.toLowerCase().trim() === cleanId ||
          u.displayName?.toLowerCase().trim() === cleanId ||
          u.nombre?.toLowerCase().trim() === cleanId ||
          `${u.nombre} ${u.apellido}`.toLowerCase().trim() === cleanId ||
          u.id.toLowerCase() === cleanId;

        if (matchesIdentifier && u.contrasena === cleanPass) {
          matchedUser = u;
        }
      });

      if (!matchedUser) {
        throw new Error('Credenciales incorrectas o usuario no encontrado en la base de datos de Ekirayá.');
      }

      setInstitutionalUser(matchedUser);
      localStorage.setItem('ekiraya_institutional_session', JSON.stringify(matchedUser));

      setUserProfile({
        uid: (matchedUser as InstitutionalUser).id,
        email: (matchedUser as InstitutionalUser).email,
        displayName: (matchedUser as InstitutionalUser).displayName,
        role: (matchedUser as InstitutionalUser).rol === 'docente' ? 'teacher' : 'student',
        roleLabel:
          (matchedUser as InstitutionalUser).rol === 'docente'
            ? `Docente (${(matchedUser as InstitutionalUser).taller})`
            : `Estudiante (${(matchedUser as InstitutionalUser).taller})`,
        institution: `Colegio Bilingüe Ekirayá - CEM (${(matchedUser as InstitutionalUser).taller})`
      });

      return matchedUser;
    } catch (err: any) {
      console.error('Error al iniciar sesión con credenciales:', err);
      throw new Error(err?.message || 'Error al verificar credenciales.');
    }
  };

  const handleLogout = async () => {
    try {
      if (user) {
        await logoutUser();
      }
      setUser(null);
      setInstitutionalUser(null);
      setUserProfile(null);
      setAdminsList([]);
      localStorage.removeItem('ekiraya_institutional_session');
    } catch (err) {
      console.error('Fallo al cerrar sesión:', err);
    }
  };

  const handleAddAdmin = async (email: string, displayName?: string): Promise<AdminUser> => {
    const result = await addAdminUser(email, displayName);
    return result;
  };

  const handleRemoveAdmin = async (adminId: string): Promise<void> => {
    await removeAdminUser(adminId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        institutionalUser,
        loading,
        isAdmin,
        adminsList,
        login: handleLogin,
        loginWithCredentials: handleLoginWithCredentials,
        logout: handleLogout,
        addAdmin: handleAddAdmin,
        removeAdmin: handleRemoveAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
