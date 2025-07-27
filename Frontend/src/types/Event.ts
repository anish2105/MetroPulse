import type { AppUser } from "./User";

export interface Event {
  title: string;
  description: string;
  category: string;
  // type: EVENT_TYPE;
  location: {
    latitude?: number;
    longitude?: number;
    area: string;
  };
  creator?: Pick<AppUser, "uid" | "name" | "avatar"> | null;
  media?: string[]; 
  // engagement: {
  //   likes: number;
  //   comments: Comment[];
  // };
  source: EVENT_SOURCE;
  createdAt: Date;
  updatedAt: Date;
}

type EVENT_SOURCE = "ai" | "user"

// type EVENT_CATEGORY =
//   | "entertainment"
//   | "utility"
//   | "food"
//   | "emergency"
//   | "traffic"
//   | "other";

// type EVENT_TYPE = "positive" | "negative" | "neutral";

// type Comment = {
//   id: string;
//   parentId?: string;
//   creator: Pick<AppUser, "uid" | "name" | "avatar">;
//   content: string;
//   createdAt: Timestamp;
//   updatedAt: Timestamp;
//   isEdited: boolean;
//   likes: number;
//   replies?: Comment[];
//   media?: {
//     images: string[];
//     videos: string[];
//   };
// };
