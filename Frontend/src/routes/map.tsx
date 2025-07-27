import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@/firebase/config";
import AppLayout from "@/components/layouts/AppLayout";
import { waitForFirebaseAuth } from "@/lib/waitForAuth";
import MapVS from "@/components/maps/Map";

export const Route = createFileRoute("/map")({
  beforeLoad: async () => {
    await waitForFirebaseAuth();
    const user = auth.currentUser;
    if (!user) throw redirect({ to: "/" });
  },
  component: () => (
    <AppLayout>
      <MapVS />
    </AppLayout>
  ),
});
