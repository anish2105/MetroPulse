import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@/firebase/config";
import AppLayout from "@/components/layouts/AppLayout";
import { waitForFirebaseAuth } from "@/lib/waitForAuth";
import EventsHome from "@/components/events/index";

export const Route = createFileRoute("/events")({
  beforeLoad: async () => {
    await waitForFirebaseAuth();
    const user = auth.currentUser;
    if (!user) throw redirect({ to: "/" });
  },
  component: () => (
    <AppLayout>
      <EventsHome />
    </AppLayout>
  ),
});
