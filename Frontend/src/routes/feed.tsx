import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@/firebase/config";
import AppLayout from "@/components/layouts/AppLayout";
import FeedPage from "@/components/landing";
import { waitForFirebaseAuth } from "@/lib/waitForAuth";
import MapVS from "@/components/maps/Map";
import { useMapModeStore } from "@/store/map-mode-store";

export const Route = createFileRoute("/feed")({
  beforeLoad: async () => {
    await waitForFirebaseAuth();
    const user = auth.currentUser;
    if (!user) throw redirect({ to: "/" });
  },
  component: FeedComponent,
});

function FeedComponent() {
  const { isMapMode } = useMapModeStore();
  return <AppLayout>{isMapMode ? <MapVS /> : <FeedPage />}</AppLayout>;
}
