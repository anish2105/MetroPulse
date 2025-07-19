import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/firebase/config";
import type { AuthContextType } from "@/types/AuthContextType";

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      // Optionally fetch user data from Firestore here
    });
    return () => unsub();
  }, []);

  // Store user in Firestore on signup/login
  async function saveUserToFirestore(user: User) {
    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(
          ref,
          {
            uid: user.uid,
            email: user.email,
            name: user.displayName || "",
            provider: user.providerData[0]?.providerId || "unknown",
          },
          { merge: true }
        );
        console.log("User saved to Firestore:", user.uid);
      } else {
        console.log("User already exists in Firestore:", user.uid);
      }
    } catch (err) {
      console.error("Error saving user to Firestore:", err);
    }
  }

  async function login(email: string, password: string) {
    const res = await signInWithEmailAndPassword(auth, email, password);
    await saveUserToFirestore(res.user);
  }

  async function signup(email: string, password: string) {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await saveUserToFirestore(res.user);
  }

  async function loginWithGoogle() {
    const res = await signInWithPopup(auth, googleProvider);
    await saveUserToFirestore(res.user);
  }

  async function logout() {
    try {
      await signOut(auth); // wait for logout to complete
      setUser(null); // optional, forces immediate state update
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const authValue = { user, loading, login, signup, loginWithGoogle, logout };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
}
