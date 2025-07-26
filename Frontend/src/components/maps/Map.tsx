import { useEffect, useState } from "react";
import { useLocationStore } from "@/store/location-store";
import MapHome from "./map-home";

// Extend the Location type with an optional city field.
export type UserLocation = Location;

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
  const { location, fetchLocation } = useLocationStore();
  const [events, setEvents] = useState<EventData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      // setLoading(true);
      setError(null);

      // Only fetch location if we don't have it yet
      if (!location) {
        await fetchLocation();
      }

      try {
        // Fetch Events Data
        const fetchedEvents = await fetchEventsApi();
        setEvents(fetchedEvents);

        // Fetch Heatmap Data
        const fetchedHeatmapData = await fetchHeatmapApi();
        setHeatmapData(fetchedHeatmapData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data");
      }

      // setLoading(false);
    };

    fetchAllData();
  }, [location, fetchLocation]);

  return (
    <div className="flex flex-col justify-center items-center">
      {
      // loading ? (
      //   <p>Loading...</p>
      // ) : 
      error ? (
        <p style={{ color: "red", whiteSpace: "pre-wrap" }}>Error: {error}</p>
      ) : location ? (
        <MapHome
          location={location}
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
