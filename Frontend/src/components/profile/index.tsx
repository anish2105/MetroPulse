/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ModeToggle } from "../ui/mode-toggle";
import { MbtiModalForm } from "../mbti/mbti-modal-form";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { CustomBadge } from "../ui/custom-badge";

export function ProfilePage() {
  const { user, loading } = useAuth();
  const [showMbtiEditModal, setShowMbtiEditModal] = useState(false);
  const [mbtiEnabled, setMbtiEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [radius, setRadius] = useState<number>(2);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (user?.enableMbti !== undefined) {
      setMbtiEnabled(user.enableMbti);
    }
    if (user?.notificationsEnabled !== undefined) {
      setNotificationsEnabled(user.notificationsEnabled);
    }
    if (user?.preferences) {
      setCategories(user.preferences.categories || []);
      setRadius(user.preferences.radius || 2);
    }
  }, [user]);

  const handleMbtiEnabled = async () => {
    try {
      const newEnabledState = !mbtiEnabled;
      setMbtiEnabled(newEnabledState);

      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          enableMbti: newEnabledState,
        });
      }
    } catch (error) {
      console.error("Error updating MBTI preference:", error);
      setMbtiEnabled(mbtiEnabled);
    }
  };

  // const handleNotificationsEnabled = async () => {
  //   try {
  //     const newEnabledState = !notificationsEnabled;
  //     setNotificationsEnabled(newEnabledState);

  //     if (user) {
  //       const userRef = doc(db, "users", user.uid);
  //       await updateDoc(userRef, {
  //         notificationsEnabled: newEnabledState,
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error updating notifications preference:", error);
  //     setNotificationsEnabled(notificationsEnabled);
  //   }
  // };

  const handleAddCategory = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && newCategory.trim() !== "") {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      setNewCategory("");

      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          "preferences.categories": updatedCategories,
        });
      }
    }
  };

  const handleRemoveCategory = async (categoryToRemove: string) => {
    const updatedCategories = categories.filter(
      (category) => category !== categoryToRemove
    );
    setCategories(updatedCategories);

    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        "preferences.categories": updatedCategories,
      });
    }
  };

  const handleRadiusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = Number(event.target.value);
    if (newRadius >= 2) {
      setRadius(newRadius);
      setIsDirty(true);
    }
  };

  const handleSaveRadius = async () => {
    if (!isDirty) return;

    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          "preferences.radius": radius,
        });
        toast.success("Radius updated successfully");
        setIsDirty(false);
      } catch {
        toast.error("Failed to update radius");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-3 w-2/3 mx-auto">
      {/* Avatar and Name */}
      <div className="flex items-center space-x-6">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={`${user.name}'s avatar`}
            className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-5xl font-bold text-white">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
        )}
        <div className="flex-col ">
          <h1 className="text-2xl font-bold">{user.name || "Unnamed User"}</h1>
          <p className="text-lg">{user.email || "Unnamed User"}</p>
        </div>
      </div>

      <Separator />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Personality Type (MBTI)</h2>
        <Switch
          checked={mbtiEnabled}
          onCheckedChange={handleMbtiEnabled}
          aria-label="Enable MBTI"
        />
      </div>

      {mbtiEnabled ? (
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-blue-600">
            {user.mbtiType || "Not set yet"}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowMbtiEditModal(true)}
          >
            {user.mbtiType ? "Edit MBTI Type" : "Set MBTI Type"}
          </Button>
        </div>
      ) : (
        <p className="italic text-gray-500">MBTI is disabled.</p>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <p className="text-xl font-semibold">Dark Theme</p>
        <ModeToggle />
      </div>

      {/* <Separator />
      <div className="flex items-center justify-between">
        <p className="text-xl font-semibold">Notifications</p>
        <Switch
          checked={notificationsEnabled}
          onCheckedChange={handleNotificationsEnabled}
          aria-label="Enable Notifications"
        />
      </div> */}
      <Separator />

      {/* Categories Section */}
      <div>
        <h2 className="text-xl font-semibold">Categories</h2>

        <Input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={handleAddCategory}
          placeholder="Add a category and press Enter"
          className="border border-gray-300 rounded-md p-2 mt-2 w-full"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {categories.map((category, index) => (
            <CustomBadge
              key={index}
              onRemove={() => handleRemoveCategory(category)}
            >
              {category}
            </CustomBadge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Radius Input */}
      <div className="flex items-center justify-between">
        <p className="text-xl font-semibold">Radius (in km)</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={radius}
            onChange={handleRadiusChange}
            className="border border-gray-300 rounded-md p-1 w-24"
            min={2}
            placeholder="2"
          />
          <Button size="sm" onClick={handleSaveRadius} disabled={!isDirty}>
            Save
          </Button>
        </div>
      </div>
      {/* MBTI Edit Modal */}
      <MbtiModalForm
        isOpen={showMbtiEditModal}
        onClose={() => setShowMbtiEditModal(false)}
      />
    </div>
  );
}
