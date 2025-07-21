import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@/firebase/config";
import AppLayout from "@/components/layouts/AppLayout";
import { waitForFirebaseAuth } from "@/lib/waitForAuth";
import { ProfilePage } from "@/components/profile";



export const Route = createFileRoute('/profile')({
  beforeLoad: async () => {
    await waitForFirebaseAuth();
    const user = auth.currentUser;
    if (!user) throw redirect({ to: "/" });
  },
  component: () => (
    <AppLayout>
     <ProfilePage /> 
    </AppLayout>
  ),
})

