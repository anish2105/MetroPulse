import type { User } from "firebase/auth";
import type { Location } from "./Location";

export interface AppUser extends User {
     name: string;
     email: string;
     avatar?: string;
     bio?: string;
     mbtiType?: string | null;
     location?: Location
}

export type AppUserWithLocation = Pick<AppUser, "location"| "uid">;