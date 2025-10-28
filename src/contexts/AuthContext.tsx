import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged, AuthError } from 'firebase/auth';
import { auth, googleProvider, ADMIN_EMAILS } from '@/lib/firebase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user ? ADMIN_EMAILS.includes(user.email || '') : false;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result.user) {
        toast.success(`Welcome, ${result.user.displayName || 'User'}!`);
      }
    } catch (error) {
      const authError = error as AuthError;
      
      // Handle specific error cases
      if (authError.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in cancelled. Please try again.');
      } else if (authError.code === 'auth/popup-blocked') {
        toast.error('Popup was blocked by your browser. Please allow popups for this site.');
      } else if (authError.code === 'auth/cancelled-popup-request') {
        // User cancelled, don't show error
        return;
      } else if (authError.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized. Please add it to Firebase Console.');
        // Domain needs to be added to Firebase Console
      } else if (authError.code === 'auth/operation-not-allowed') {
        toast.error('Google Sign-In is not enabled. Please enable it in Firebase Console.');
      } else if (authError.code === 'auth/invalid-api-key') {
        toast.error('Invalid Firebase API key. Please check your configuration.');
      } else {
        toast.error(`Failed to sign in: ${authError.message}`);
      }
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      // Error handled with toast
      toast.error('Failed to sign out');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}