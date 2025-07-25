import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ModeToggle } from "../ui/mode-toggle";
import { MbtiModalForm } from "../mbti/mbti-modal-form";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Separator } from "../ui/separator";

export function ProfilePage() {
  const { user, loading } = useAuth();
  const [showMbtiEditModal, setShowMbtiEditModal] = useState(false);
  const [mbtiEnabled, setMbtiEnabled] = useState(false);

  useEffect(() => {
    if (user?.enableMbti !== undefined) {
      setMbtiEnabled(user.enableMbti);
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
    <div className="flex flex-col gap-5 p-3">
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
        <p className="text-xl font-semibold">Theme</p>
        <ModeToggle />
      </div>

      <Separator />
      {/* MBTI Edit Modal */}
      <MbtiModalForm
        isOpen={showMbtiEditModal}
        onClose={() => setShowMbtiEditModal(false)}
      />
    </div>
  );
}
