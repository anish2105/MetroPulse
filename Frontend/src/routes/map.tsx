import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@/firebase/config";
import AppLayout from "@/components/layouts/AppLayout";
import { waitForFirebaseAuth } from "@/lib/waitForAuth";
// import MapVS from "@/components/maps/Map";
import MapHome from "@/components/maps/map-home";
// import MapHome from "@/components/maps/map-home";

export const Route = createFileRoute("/map")({
  beforeLoad: async () => {
    await waitForFirebaseAuth();
    const user = auth.currentUser;
    if (!user) throw redirect({ to: "/" });
  },
  component: () => (
    <AppLayout>
      {/* <MapVS
        location={
          { lat: 12.9629, lng: 77.5775 } // Default location, can be replaced with dynamic data
        }
      /> */}
      <MapHome />
    </AppLayout>
  ),
});
