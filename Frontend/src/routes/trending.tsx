import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@/firebase/config";
import AppLayout from "@/components/layouts/AppLayout";
import FeedPage from "@/components/landing"; 
import { waitForFirebaseAuth } from "@/lib/waitForAuth";

export const Route = createFileRoute('/trending')({
  beforeLoad: async () => {
    await waitForFirebaseAuth();
    const user = auth.currentUser;
    if (!user) throw redirect({ to: "/" });
  },
  component: () => (
    <AppLayout>
      <FeedPage />
    </AppLayout>
  ),
})



