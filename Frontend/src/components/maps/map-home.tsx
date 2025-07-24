/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import MapVS from "./Map";
import type { Location } from "@/types/Location";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

// Update User Location in Firestore with proper types
async function updateUserLocationInDB(
  userId: string,
  location: Location,
  cityName: string,
): Promise<void> {
  console.log(
    `Updating DB for user ${userId} with location:`,
    location,
    `and city: ${cityName}`,
  );
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    location: location,
    city: cityName,
  });
  
}

const RADIUS_IN_METERS = 2000; // 3 km radius

const MapHome = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [city, setCity] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationAndCity = async () => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords: Location = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setLocation(coords);

          let detectedCity = "";
          try {
            // Use reverse geocoding to get the city name
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
            );
            const data = await response.json();
            const addressComponents = data.results[0]?.address_components;
            const cityComponent = addressComponents?.find((c: any) =>
              c.types.includes("locality"),
            );
            if (cityComponent) {
              detectedCity = cityComponent.long_name;
              setCity(detectedCity);
            } else {
              console.warn("City component not found in geocoding results.");
            }
          } catch (geoError) {
            console.error("Error during reverse geocoding:", geoError);
          } finally {
            setLoading(false);
            // If current user exists, update location in DB
            const currentUser = auth.currentUser;
            if (currentUser && coords) {
              try {
                await updateUserLocationInDB(
                  currentUser.uid,
                  coords as Location,
                  detectedCity,
                );
                console.log("User location and city updated in DB!");
              } catch (dbError) {
                console.error("Failed to update user location in DB:", dbError);
              }
            } else {
              console.warn("No current user or location data to update in DB.");
            }
          }
        },
        (geoError) => {
          setError(
            `Geolocation error: ${geoError.message}. Please enable location services.`,
          );
          setLoading(false);
          console.error("Geolocation error:", geoError);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    };

    fetchLocationAndCity();
  }, []);

  return (
    <div>
      <h1>Google Maps Location Viewer</h1>
      {loading ? (
        <p>Fetching location and updating database...</p>
      ) : error ? (
        <p style={{ color: "red" }}>Error: {error}</p>
      ) : location ? (
        <>
          <p>
            Your city: <strong>{city || "Unknown"}</strong>
          </p>
          <MapVS location={location} radius={RADIUS_IN_METERS} />
        </>
      ) : (
        <p>No location available.</p>
      )}
    </div>
  );
};

export default MapHome;