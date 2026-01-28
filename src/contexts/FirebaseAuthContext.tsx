"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, database } from '@/utils/firebase';
import { ref, set } from 'firebase/database';

interface FirebaseAuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, username: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

interface FirebaseAuthProviderProps {
  children: React.ReactNode;
}

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = React.memo(({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log("Firebase signIn called for:", email);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("Firebase signIn successful");
      return result;
    } catch (error) {
      console.error("Firebase signIn error:", error);
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    console.log("Firebase signUp called for:", email);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Firebase user created, updating profile");

      // Update profile with username
      await updateProfile(userCredential.user, {
        displayName: username,
      });

      // Create username mapping
      const usernameRef = ref(database, `usernames/${username}`);
      await set(usernameRef, userCredential.user.uid);

      console.log("Firebase signUp completed successfully");
      return userCredential;
    } catch (error) {
      console.error("Firebase signUp error:", error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  useEffect(() => {
    console.log("Setting up Firebase auth listener");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "User signed in" : "User signed out");
      setUser(user);
      setLoading(false);

      // Update cookies when auth state changes
      if (user) {
        try {
          // Set auth cookies
          document.cookie = `firebase-auth-token=${await user.getIdToken()}; path=/; max-age=3600`;
          document.cookie = `firebase-user-id=${user.uid}; path=/; max-age=3600`;

          // Create/update user profile in database (only if it doesn't exist)
          const userProfileRef = ref(database, `users/${user.uid}`);
          await set(userProfileRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.warn('Failed to update user profile:', error);
        }
      } else {
        // Clear auth cookies
        document.cookie = 'firebase-auth-token=; path=/; max-age=0';
        document.cookie = 'firebase-user-id=; path=/; max-age=0';
      }
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo<FirebaseAuthContextType>(() => ({
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }), [user, loading, signIn, signUp, signOut, resetPassword]);

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
});

FirebaseAuthProvider.displayName = "FirebaseAuthProvider";