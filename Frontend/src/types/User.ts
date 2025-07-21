import type { User } from "firebase/auth";

export interface AppUser extends User {
     name: string;
     email: string;
     avatar: string;
     mbtiType?: string | null;
}