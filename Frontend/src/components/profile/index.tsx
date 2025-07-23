import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MbtiModalForm } from "../mbti/mbti-modal-form";

export function ProfilePage() {
  const { user, loading } = useAuth();
  const [showMbtiEditModal, setShowMbtiEditModal] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
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
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Details about your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Name:</strong> {user.name || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {user.email || "N/A"}
          </p>
         
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personality Type (MBTI)</CardTitle>
          <CardDescription>Your reported MBTI type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-semibold">
            Your MBTI Type:{" "}
            <span className="text-blue-600">
              {user.mbtiType || "Not set yet"}
            </span>
          </p>
          <Button onClick={() => setShowMbtiEditModal(true)}>
            {user.mbtiType ? "Edit MBTI Type" : "Set Your MBTI Type"}
          </Button>
        </CardContent>
      </Card>

      {/* MBTI Edit Modal (same component, different trigger) */}
      <MbtiModalForm
        isOpen={showMbtiEditModal}
        onClose={() => setShowMbtiEditModal(false)}
      />
    </div>
  );
}