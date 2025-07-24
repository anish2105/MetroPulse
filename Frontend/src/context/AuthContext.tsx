import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  type User as FirebaseUser, // Renamed to avoid conflict with lucide-react User or your AppUser
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/firebase/config";
import type { AuthContextType } from "@/types/AuthContextType";
import type { AppUser } from "@/types/User"; // Import your AppUser type

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  // Add a check to ensure context is not null when used
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // useState should now hold AppUser | null
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to transform FirebaseUser to AppUser
  // This is crucial for maintaining type consistency
  const transformAndFetchAppUser = async (
    firebaseUser: FirebaseUser
  ): Promise<AppUser> => {
    // Basic AppUser transformation
    const baseAppUser: AppUser = {
      ...firebaseUser,
      name: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      avatar: firebaseUser.photoURL || "default-avatar.png",
      mbtiType: null, // Initialize to null
    };
    console.log("Transformed FirebaseUser to AppUser:", baseAppUser);
    // Fetch user's custom data (including mbtiType) from Firestore
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        // Merge Firestore data with baseAppUser, prioritizing Firestore data
        // Ensure mbtiType is explicitly handled
        console.log("Fetched user data from Firestore:", userData);
        return {
          ...baseAppUser,
          ...userData, // This will override name, email, avatar if present in Firestore
          mbtiType: userData.mbtiType || null, // Ensure mbtiType is from Firestore or null
        } as AppUser; // Cast to AppUser
      }
    } catch (error) {
      console.error("Error fetching user data from Firestore:", error);
    }
    return baseAppUser; // Return base AppUser if no Firestore doc or error
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Use the new async transformation function
        const appUser = await transformAndFetchAppUser(firebaseUser);
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []); // Depend on 'auth' if it could change, but usually static

  // Store user in Firestore on signup/login
  // This function should now expect a FirebaseUser and then transform it for Firestore
  async function saveUserToFirestore(firebaseUser: FirebaseUser) {
    try {
      const ref = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(
          ref,
          {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || "", // Ensure name is saved
            avatar: firebaseUser.photoURL || "", // Ensure avatar is saved
            provider: firebaseUser.providerData[0]?.providerId || "unknown",
            createdAt: new Date(), // Add a timestamp for new users
          },
          { merge: true } // Use merge:true for partial updates or if doc might exist with other fields
        );
        console.log("User saved to Firestore:", firebaseUser.uid);
      } else {
        // Optionally update existing user fields like lastLogin or display name changes
        await setDoc(
          ref,
          {
            lastLogin: new Date(),
            // You might want to update displayName/photoURL here if they can change
            name: firebaseUser.displayName || "",
            avatar: firebaseUser.photoURL || "",
          },
          { merge: true }
        );
        console.log(
          "User already exists in Firestore, updated last login:",
          firebaseUser.uid
        );
      }
    } catch (err) {
      console.error("Error saving user to Firestore:", err);
    }
  }
  async function updateMbtiTypeInFirestore(
    uid: string,
    mbtiType: string | null
  ) {
    try {
      const ref = doc(db, "users", uid);
      await setDoc(ref, { mbtiType }, { merge: true });
      // Update local state immediately after Firestore update
      setUser((prevUser) => {
        if (prevUser) {
          return { ...prevUser, mbtiType };
        }
        return null;
      });
      console.log("MBTI type updated in Firestore for:", uid, mbtiType);
    } catch (error) {
      console.error("Error updating MBTI type in Firestore:", error);
      throw error; // Re-throw to allow calling component to handle errors
    }
  }
  async function login(email: string, password: string) {
    const res = await signInWithEmailAndPassword(auth, email, password);
    await saveUserToFirestore(res.user);
    // After login, re-fetch and update user state to include any Firestore data
    const appUser = await transformAndFetchAppUser(res.user);
    setUser(appUser);
  }

  async function signup(email: string, password: string) {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await saveUserToFirestore(res.user);
    // After signup, re-fetch and update user state to include any Firestore data
    const appUser = await transformAndFetchAppUser(res.user);
    setUser(appUser);
  }

  async function loginWithGoogle() {
    const res = await signInWithPopup(auth, googleProvider);
    await saveUserToFirestore(res.user);
    // After Google login, re-fetch and update user state to include any Firestore data
    const appUser = await transformAndFetchAppUser(res.user);
    setUser(appUser);
  }

  async function logout() {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  // The value provided to context must match AuthContextType
  const authValue: AuthContextType = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateMbtiTypeInFirestore,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
}
