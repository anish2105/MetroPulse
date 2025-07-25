/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

import type { Location } from "@/types/Location";
// import { doc, updateDoc } from "firebase/firestore";
// import { auth, db } from "@/firebase/config";
import MapHome from "./map-home";

// Extend the Location type with an optional city field.
export type UserLocation = Location;

// Fallback location (Nagarbhavi)
const NAGARBHAVI_LOCATION: UserLocation = {
  latitude: 12.9644,
  longitude: 77.5147,
  city: "Bengaluru",
};

const RADIUS_IN_METERS = 2000;

// EventData interface (for events displayed on the map)
interface EventData {
  id: string;
  name: string;
  type: "positive" | "negative" | "neutral";
  latitude: number;
  longitude: number;
  description: string;
  date: string;
  time: string;
}

const mockEvents: EventData[] = [
  {
    id: "e1",
    name: "Community Cleanup",
    type: "positive",
    latitude: 12.966,
    longitude: 77.512,
    description: "Help clean up the local park!",
    date: "2025-08-01",
    time: "10:00 AM",
  },
  {
    id: "e2",
    name: "Road Construction Delay",
    type: "negative",
    latitude: 12.962,
    longitude: 77.518,
    description: "Major road work causing traffic jams.",
    date: "2025-07-25",
    time: "All Day",
  },
  {
    id: "e3",
    name: "Local Market Day",
    type: "neutral",
    latitude: 12.965,
    longitude: 77.515,
    description: "Weekly market with fresh produce.",
    date: "2025-07-27",
    time: "08:00 AM - 02:00 PM",
  },
  {
    id: "e4",
    name: "New Cafe Opening",
    type: "positive",
    latitude: 12.9635,
    longitude: 77.513,
    description: "Grand opening of 'Bean & Brew' coffee shop.",
    date: "2025-08-05",
    time: "09:00 AM",
  },
];

const fetchEventsApi = async (): Promise<EventData[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockEvents;
};

// Heatmap data interface and mock data
interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
}

const mockHeatmapData: HeatmapPoint[] = [
  { latitude: 12.964, longitude: 77.514, weight: 0.8 },

  { latitude: 12.967, longitude: 77.517, weight: 0.9 },

  { latitude: 12.9625, longitude: 77.5135, weight: 0.4 },

  { latitude: 12.9605, longitude: 77.5105, weight: 0.2 },
];

const fetchHeatmapApi = async (): Promise<HeatmapPoint[]> => {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return mockHeatmapData;
};

// Update user's location in Firestore.
// async function updateUserLocationInDB(
//   userId: string,
//   userLocation: UserLocation
// ): Promise<void> {
//   console.log(`Updating DB for user ${userId} with location:`, userLocation);
//   const userRef = doc(db, "users", userId);
//   await updateDoc(userRef, {
//     location: userLocation,
//   });
// }

const MapVS = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      let currentCoords: UserLocation | null = null;
      let detectedCity = "";

      // 1. Get Geolocation
      if (navigator.geolocation) {
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
          // Set currentCoords from geolocation
          currentCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          // 2. Reverse Geocode to get city
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentCoords.latitude},${currentCoords.longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();
          const addressComponents = data.results[0]?.address_components;
          const cityComponent = addressComponents?.find((c: any) =>
            c.types.includes("locality")
          );
          if (cityComponent) {
            detectedCity = cityComponent.long_name;
            currentCoords.city = detectedCity;
          } else {
            console.warn("City component not found in geocoding results.");
          }
        } catch (geoError: any) {
          console.error("Geolocation or reverse geocoding error:", geoError);
          setError(
            `Geolocation error: ${geoError.message || "Failed to get location."}. Using default.`
          );
          currentCoords = NAGARBHAVI_LOCATION;
        }
      } else {
        setError(
          "Geolocation is not supported by your browser. Using default."
        );
        currentCoords = NAGARBHAVI_LOCATION;
      }

      // Update state with the determined location (either real or fallback)
      setUserLocation(currentCoords);

      // 3. Update DB if user and location available
      // const currentUser = auth.currentUser;
      // if (currentUser && currentCoords) {
      //   try {
      //     await updateUserLocationInDB(currentUser.uid, currentCoords);
      //     console.log("User location updated in DB!");
      //   } catch (dbError) {
      //     console.error("Failed to update user location in DB:", dbError);
      //   }
      // } else {
      //   console.warn("No current user or location data to update in DB.");
      // }

      // 4. Fetch Events Data
      try {
        const fetchedEvents = await fetchEventsApi();
        setEvents(fetchedEvents);
      } catch (eventError) {
        console.error("Failed to fetch events:", eventError);
        setError(
          (prev) => (prev ? prev + "\n" : "") + "Failed to fetch events."
        );
      }

      // 5. Fetch Heatmap Data
      try {
        const fetchedHeatmapData = await fetchHeatmapApi();
        setHeatmapData(fetchedHeatmapData);
      } catch (heatmapError) {
        console.error("Failed to fetch heatmap data:", heatmapError);
        setError(
          (prev) => (prev ? prev + "\n" : "") + "Failed to fetch heatmap data."
        );
      }

      setLoading(false);
    };

    fetchAllData();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red", whiteSpace: "pre-wrap" }}>Error: {error}</p>
      ) : userLocation ? (
        <MapHome
          location={userLocation}
          radius={RADIUS_IN_METERS}
          events={events}
          heatmapData={heatmapData}
        />
      ) : (
        <p>No location available. Cannot display map.</p>
      )}
    </div>
  );
};

export default MapVS;
