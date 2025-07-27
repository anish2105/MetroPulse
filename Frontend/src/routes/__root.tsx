import { useLocationStore } from "@/store/location-store";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createRootRoute({
  component: RouteComponent,
});

function RouteComponent() {
  const { location, fetchLocation } = useLocationStore();

  useEffect(() => {
    const initLocation = async () => {
      try {
        if (!location) {
          await fetchLocation();
        }
      } catch (error) {
        console.error('Failed to fetch location:', error);
      }
    };

    initLocation();
  }, [location, fetchLocation]); // Add proper dependencies

  return <Outlet />;
}