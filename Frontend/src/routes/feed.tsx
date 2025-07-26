/* eslint-disable @typescript-eslint/no-unused-vars */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@/firebase/config";
import AppLayout from "@/components/layouts/AppLayout";
import { waitForFirebaseAuth } from "@/lib/waitForAuth";
import MapVS from "@/components/maps/Map";
import { useMapModeStore } from "@/store/map-mode-store";
import { useLocationStore } from "@/store/location-store"; // Import the location store
import { useEffect, useState } from "react";
import MetroPulse from "@/components/feed";

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
  const { location, fetchLocation } = useLocationStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      setLoading(true);
      setError(null);

      // Only fetch location if we don't have it yet
      if (!location) {
        console.log("Fetching location..."); // Log when fetching location
        try {
          await fetchLocation();
          console.log("Location fetched successfully."); // Log on successful fetch
        } catch (fetchError) {
          console.error("Error fetching location:", fetchError);
          setError("Failed to fetch location");
        }
      } else {
        console.log("Location already available:", location); // Log if location is already available
      }

      setLoading(false);
    };

    fetchLocationData();
  }, [location, fetchLocation]);

  return (
    <AppLayout>
      {error && <div>Error: {error}</div>}
      {isMapMode ? <MapVS /> : <MetroPulse />}
    </AppLayout>
  );
}