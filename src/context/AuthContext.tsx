import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User as FirebaseUser } from 'firebase/auth';
import {
  auth,
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

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  adminsList: AdminUser[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
  addAdmin: (email: string, displayName?: string) => Promise<AdminUser>;
  removeAdmin: (adminId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  adminsList: [],
  login: async () => {},
  logout: async () => {},
  addAdmin: async () => { throw new Error('Not implemented'); },
  removeAdmin: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminsList, setAdminsList] = useState<AdminUser[]>([]);

  // Compute admin status
  const isAdmin = Boolean(
    user?.email &&
      (SUPERADMIN_EMAILS.includes(user.email.toLowerCase().trim()) ||
        adminsList.some((a) => a.email.toLowerCase().trim() === user.email?.toLowerCase().trim()) ||
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
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore admins list when user is authenticated
  useEffect(() => {
    if (!user) {
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
  }, [user]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Fallo de inicio de sesión:', err);
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setUserProfile(null);
      setAdminsList([]);
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
        loading,
        isAdmin,
        adminsList,
        login: handleLogin,
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
