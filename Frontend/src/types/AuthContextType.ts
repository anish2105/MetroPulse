import type { AppUser } from "./User";

export interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateMbtiTypeInFirestore: (
    uid: string,
    mbtiType: string | null
  ) => Promise<void>;
}
