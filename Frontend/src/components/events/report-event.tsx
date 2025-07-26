/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Upload } from "lucide-react";
import { useLocationStore } from "@/store/location-store";
import { toast } from "sonner";
import { uploadFilesToStorage } from "@/lib/upload";
import { collection, addDoc, } from "firebase/firestore";
import type { Event } from "@/types/Event";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";

const MAX_IMAGES = 3;
const MAX_VIDEOS = 1;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export function ReportEventDialog() {
  const [selectedFiles, setSelectedFiles] = useState<{
    images: File[];
    videos: File[];
  }>({
    images: [],
    videos: [],
  });
  const { locality } = useLocationStore();
  const {user} = useAuth(); 
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log("selected files", selectedFiles);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      // 1. First handle the existing API call with byte data
      const { mediaFiles } = await uploadFilesToStorage(selectedFiles);

      const apiEventData = {
        event_name: formData.get("title") as string,
        event_description: formData.get("description") as string,
        event_location: locality ? locality : "Unknown",
        media_file: mediaFiles,
      };

      // Make the API call
      const response = await fetch("http://localhost:8000/event_summary/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiEventData),
      });

      if (!response.ok) {
        throw new Error("Failed to create event in API");
      }

     

      // 3. Store in Firestore
      const firestoreEventData: Event = {
        title: apiEventData.event_name,
        description: apiEventData.event_description,
        category: "general",
        location: {
          area: apiEventData.event_location,
        },
        creator: user ? {
          uid: user.uid,
          name: user.name,
          avatar: user.avatar
        } : null,
        source: user ? "user" : "ai",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, "events"), firestoreEventData);

      toast.success("Event reported successfully!");
      setIsOpen(false);
      setSelectedFiles({ images: [], videos: [] });
    } catch (error) {
      console.error("Error preparing event:", error);
      toast.error("Failed to prepare event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: File[] = [];
    const newVideos: File[] = [];

    Array.from(files).forEach((file) => {
      // Check if it's an image
      if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
        if (selectedFiles.images.length + newImages.length >= MAX_IMAGES) {
          toast.error(`You can only upload up to ${MAX_IMAGES} images`);
          return;
        }
        newImages.push(file);
      }
      // Check if it's a video
      else if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
        if (selectedFiles.videos.length + newVideos.length >= MAX_VIDEOS) {
          toast.error(`You can only upload ${MAX_VIDEOS} video`);
          return;
        }
        newVideos.push(file);
      } else {
        toast.error(`File type ${file.type} is not supported`);
      }
    });

    setSelectedFiles((prev) => ({
      images: [...prev.images, ...newImages],
      videos: [...prev.videos, ...newVideos],
    }));
  };

  const removeFile = (type: "image" | "video", index: number) => {
    setSelectedFiles((prev) => {
      if (type === "image") {
        return {
          ...prev,
          images: prev.images.filter((_, i) => i !== index),
        };
      } else {
        return {
          ...prev,
          videos: prev.videos.filter((_, i) => i !== index),
        };
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Report Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the event..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <div className="p-3 bg-muted rounded-md">
              {locality || "Loading location..."}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="files">Upload Media</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <Input
                id="files"
                type="file"
                multiple
                accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(
                  ","
                )}
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="files"
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Upload up to {MAX_IMAGES} images and {MAX_VIDEOS} video
                </span>
                <span className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, WEBP, MP4, WEBM, MOV
                </span>
              </label>
            </div>

            {/* Preview selected files */}
            {(selectedFiles.images.length > 0 ||
              selectedFiles.videos.length > 0) && (
              <div className="space-y-2">
                {selectedFiles.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.images.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile("image", index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedFiles.videos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.videos.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-xs">Video</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile("video", index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⌛</span>
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
