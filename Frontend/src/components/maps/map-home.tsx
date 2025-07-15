/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import MapVS from "./Map";

const MapHome = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [city, setCity] = useState<string>("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocation(coords);

        // Get city name using reverse geocoding
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        const addressComponents = data.results[0]?.address_components;
        const cityComponent = addressComponents?.find((c: any) =>
          c.types.includes("locality")
        );
        console.log("City Component:", cityComponent);
        if (cityComponent) setCity(cityComponent.long_name);
      });
    } else {
      alert("Geolocation is not supported by your browser");
    }
  }, []);

  return (
    <div>
      <h1>Google Maps Location Viewer</h1>
      {location ? (
        <>
          <p>Your city: <strong>{city}</strong></p>
          <MapVS location={location} />
        </>
      ) : (
        <p>Fetching location...</p>
      )}
    </div>
  );
}

export default MapHome
