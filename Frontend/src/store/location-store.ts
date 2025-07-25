/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import type { Location } from "@/types/Location";

interface LocationState {
  location: Location | null;
  city: string | null;
  locality: string | null;
  setLocation: (location: Location) => void;
  setCity: (city: string) => void;
  setLocality: (locality: string) => void;
  fetchLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: null,
  city: null,
  locality: null,
  setLocation: (location) => set({ location }),
  setCity: (city) => set({ city }),
  setLocality: (locality) => set({ locality }),
  fetchLocation: async () => {
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      const addressComponents = data.results[0]?.address_components;

      // Get city (locality)
      const cityComponent = addressComponents?.find((c: any) =>
        c.types.includes("locality")
      );
      // Get neighborhood/sublocality
      const localityComponent = addressComponents?.find((c: any) =>
        c.types.includes("sublocality_level_1")
      );

      const city = cityComponent ? cityComponent.long_name : "Unknown";
      const locality = localityComponent ? localityComponent.long_name : "Unknown";

      set({ location, city, locality });
    } catch (error) {
      console.error("Error fetching location:", error);
      // Fallback to null values
      set({
        location: null,
        city: null,
        locality: null,
      });
    }
  },
}));
