import ChatPage from "@/components/chat/index";
import AppLayout from "@/components/layouts/AppLayout";
import { auth } from "@/firebase/config";
import { waitForFirebaseAuth } from "@/lib/waitForAuth";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/chat")({
  beforeLoad: async () => {
    await waitForFirebaseAuth();
    const user = auth.currentUser;
    if (!user) throw redirect({ to: "/" });
  },
  component: () => (
    <AppLayout>
      <ChatPage />
    </AppLayout>
  ),
});
