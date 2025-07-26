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

const getAreaName = (addressComponents: any[]): string => {
  // Try to find area name in this order:
  // 1. sublocality_level_1 (neighborhood)
  // 2. sublocality (general sublocality)
  // 3. locality (city/town)
  // 4. administrative_area_level_2 (district)
  // 5. administrative_area_level_1 (state)

  const areaTypes = [
    "sublocality_level_1",
    "sublocality",
    "locality",
    "administrative_area_level_2",
    "administrative_area_level_1",
  ];

  for (const type of areaTypes) {
    const component = addressComponents?.find((c: any) =>
      c.types.includes(type)
    );
    if (component) {
      return component.long_name;
    }
  }

  return "Unknown Area";
};

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
      console.log(data); // Log the response data
      const addressComponents = data.results[0]?.address_components;
      if (!addressComponents) throw new Error("No address components found");

      // Get city (locality)
      const cityComponent = addressComponents.find((c: any) =>
        c.types.includes("locality")
      );

      // Get area name using the new helper function
      const locality = getAreaName(addressComponents);

      const city = cityComponent ? cityComponent.long_name : "Unknown";

      set({ location, city, locality });
      console.log("Location set:", { location, city, locality }); // Debug log
    } catch (error) {
      console.error("Error fetching location:", error);
      set({
        location: null,
        city: null,
        locality: "Unknown Area",
      });
    }
  },
}));
