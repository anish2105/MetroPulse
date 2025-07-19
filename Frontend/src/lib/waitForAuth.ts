import { auth } from "@/firebase/config";

export async function waitForFirebaseAuth(): Promise<void> {
  return new Promise((resolve) => {
    const unsub = auth.onAuthStateChanged(() => {
      unsub();
      resolve();
    });
  });
}

