/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  InfoWindow,
  // HeatmapLayer,
} from "@react-google-maps/api";
import type { Location } from "@/types/Location";

// Extend Location type for the UserLocation in AppUser, which includes city

// Define EventData and HeatmapPoint interfaces (must match MapHome)
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

interface Props {
  location: Location;
  radius?: number;
  events: EventData[]; // New prop for events
  heatmapData: HeatmapPoint[]; // New prop for heatmap data
}

const containerStyle = {
  width: "100%",
  height: "91vh", // Use viewport height to ensure the map fills the space
};

// Define map styles to hide labels (from previous step)
const mapStyles = [
  {
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];

// Function to calculate approximate bounds for a circle
const calculateBounds = (
  center: { lat: number; lng: number },
  radius: number // in meters
) => {
  const EARTH_RADIUS = 6378137; // meters
  const latRadian = (radius / EARTH_RADIUS) * (180 / Math.PI);
  const lngRadian =
    ((radius / EARTH_RADIUS) * (180 / Math.PI)) /
    Math.cos((center.lat * Math.PI) / 180);

  const southWest = {
    lat: center.lat - latRadian,
    lng: center.lng - lngRadian,
  };
  const northEast = {
    lat: center.lat + latRadian,
    lng: center.lng + lngRadian,
  };

  return { southWest, northEast };
};

const MapHome: React.FC<Props> = ({
  location,
  radius,
  events,
  // heatmapData,
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["visualization"], // Required for HeatmapLayer
  });

  const centerLatLng = location.latitude
    ? { lat: location.latitude, lng: location.longitude }
    : { lat: 0, lng: 0 };

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      // If events are available, extend bounds to include them
      if (events && events.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(centerLatLng);
        // events.forEach((event) => {
        //   bounds.extend(
        //     new google.maps.LatLng(event.latitude, event.longitude)
        //   );
        // });
        map.fitBounds(bounds);
      } else if (
        radius &&
        radius > 0 &&
        location.latitude != null &&
        location.longitude != null
      ) {
        const boundsData = calculateBounds(centerLatLng, radius);
        const bounds = new google.maps.LatLngBounds(
          boundsData.southWest,
          boundsData.northEast
        );
        map.fitBounds(bounds);
      } else {
        map.setZoom(12);
      }
    },
    [centerLatLng, events, location, radius]
  );
  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Heatmap layer options (customize colors, radius, opacity)
  // const heatmapOptions = {
  //   radius: 20, // Affects the size of the blurred area
  //   opacity: 0.6, // Overall opacity of the heatmap
  //   // gradient: [
  //   //   'rgba(0, 255, 255, 0)',
  //   //   'rgba(0, 255, 255, 1)',
  //   //   'rgba(0, 191, 255, 1)',
  //   //   'rgba(0, 127, 255, 1)',
  //   //   'rgba(0, 63, 255, 1)',
  //   //   'rgba(0, 0, 191, 1)',
  //   //   'rgba(0, 0, 127, 1)',
  //   //   'rgba(0, 0, 63, 1)'
  //   // ]
  // };

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={centerLatLng}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        keyboardShortcuts: false,
      }}
    >
      {/* User's Location Marker */}
      <Marker position={centerLatLng} />

      {/* Event Markers */}
      {events.map((event) => (
        <Marker
          key={event.id}
          position={{ lat: event.latitude, lng: event.longitude }}
          onClick={() => setSelectedEvent(event)} // Set selected event on click
        />
      ))}

      {/* Info Window for Selected Event */}
      {selectedEvent && (
        <InfoWindow
          position={{
            lat: selectedEvent.latitude,
            lng: selectedEvent.longitude,
          }}
          onCloseClick={() => setSelectedEvent(null)} // Close info window
        >
          <div style={{ padding: "10px" }}>
            <h3>{selectedEvent.name}</h3>
            <p>
              <strong>Type:</strong> {selectedEvent.type}
            </p>
            <p>
              <strong>Date:</strong> {selectedEvent.date}
            </p>
            <p>
              <strong>Time:</strong> {selectedEvent.time}
            </p>
            <p>{selectedEvent.description}</p>
            {/* Add more event details here */}
          </div>
        </InfoWindow>
      )}

      {/* Heatmap Layer */}
      {/* {heatmapData.length > 0 && (
        <HeatmapLayer
          options={heatmapOptions}
          data={heatmapData.map(
            (point) => new google.maps.LatLng(point.latitude, point.longitude)
          )}
        />
      )} */}
    </GoogleMap>
  );
};

export default MapHome;
