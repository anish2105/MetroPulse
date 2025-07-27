/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useLocationStore } from "@/store/location-store";
import MapHome from "./map-home";
import { getCityEvents, getLocalityEvents, getUserReports } from "@/lib/realtimeData";

// Extend the Location type with an optional city field.
export type UserLocation = Location;

const RADIUS_IN_METERS = 2000;

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

interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
}

const MapVS = () => {
  const { location, fetchLocation, locality, city } = useLocationStore();
  const [events, setEvents] = useState<EventData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setError(null);

      if (!location) await fetchLocation();

      if (!location?.latitude || !location?.longitude) {
        setError("No valid location found");
        return;
      }

      try {
        // 1. Firestore Events
        const firestoreReports = await getUserReports();
        const fsEvents: EventData[] = firestoreReports.map((report: any) => ({
          id: report.id,
          name: report.name || "Untitled Event",
          type: report.type || "neutral",
          latitude: report.latitude,
          longitude: report.longitude,
          description: report.description || "",
          date: report.date || "",
          time: report.time || "",
        }));

        // 2. Locality Events
        const localityRes = await getLocalityEvents(locality!);
        const localityEvents: EventData[] = localityRes?.events || [];

        // 3. City Events
        const cityRes = await getCityEvents(city!);
        const cityEvents: EventData[] = cityRes?.events || [];

        // Merge all events
        const allEvents: EventData[] = [
          ...fsEvents,
          ...localityEvents,
          ...cityEvents,
        ];

        setEvents(allEvents);

        // Generate heatmap data from all events
        const heatmap: HeatmapPoint[] = allEvents.map((e) => ({
          latitude: e.latitude,
          longitude: e.longitude,
          weight: e.type === "negative" ? 1.5 : e.type === "positive" ? 1 : 0.5,
        }));

        setHeatmapData(heatmap);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch event data");
      }
    };

    fetchAllData();
  }, [location, fetchLocation]);

  return (
    <div className="flex flex-col justify-center items-center">
      {error ? (
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
