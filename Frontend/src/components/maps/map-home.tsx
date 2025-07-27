/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  InfoWindow,
  HeatmapLayer,
} from "@react-google-maps/api";
import type { Location } from "@/types/Location";

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
  events: EventData[];
  heatmapData: HeatmapPoint[];
}

const containerStyle = {
  width: "100%",
  height: "91vh",
};

const mapStyles = [
  {
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];

const calculateBounds = (
  center: { lat: number; lng: number },
  radius: number
) => {
  const EARTH_RADIUS = 6378137;
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
  heatmapData,
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
    libraries: ["visualization"],
  });

  const centerLatLng = location.latitude
    ? { lat: location.latitude, lng: location.longitude }
    : { lat: 0, lng: 0 };

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      if (events && events.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(centerLatLng);
        events.forEach((event) => {
          bounds.extend(
            new google.maps.LatLng(event.latitude, event.longitude)
          );
        });
        map.fitBounds(bounds);
      } else if (radius && location.latitude && location.longitude) {
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

  const heatmapOptions = {
    radius: 20,
    opacity: 0.6,
    // gradient: [...] // Optional custom gradient
  };

  // const getMarkerIcon = (type: string) => {
  //   switch (type) {
  //     case "positive":
  //       return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  //     case "negative":
  //       return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
  //     case "neutral":
  //     default:
  //       return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
  //   }
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
      {/* User Location */}
      <Marker position={centerLatLng} />

      {/* Radius Circle */}
      {/* {radius && (
        <Circle
          center={centerLatLng}
          radius={radius}
          options={{
            strokeColor: "#4285F4",
            strokeOpacity: 0.5,
            strokeWeight: 1,
            fillColor: "#4285F4",
            fillOpacity: 0.2,
          }}
        />
      )} */}

      {/* Event Markers */}
      {events.map((event) => (
        <Marker
          key={event.id}
          position={{ lat: event.latitude, lng: event.longitude }}
          icon={{
            url:
              event.type === "positive"
                ? "/green-marker.png"
                : event.type === "negative"
                  ? "/red-marker.png"
                  : "/yellow-marker.png",
            scaledSize: new window.google.maps.Size(30, 30),
          }}
          onClick={() => setSelectedEvent(event)}
        />
      ))}

      {/* Info Window */}
      {selectedEvent && (
        <InfoWindow
          position={{
            lat: selectedEvent.latitude,
            lng: selectedEvent.longitude,
          }}
          onCloseClick={() => setSelectedEvent(null)}
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
          </div>
        </InfoWindow>
      )}

      {/* Heatmap Layer */}
      {heatmapData.length > 0 && (
        <HeatmapLayer
          options={heatmapOptions}
          data={heatmapData.map(
            (point) =>
              ({
                location: new google.maps.LatLng(
                  point.latitude,
                  point.longitude
                ),
                weight: point.weight,
              }) as google.maps.visualization.WeightedLocation
          )}
        />
      )}
    </GoogleMap>
  );
};

export default MapHome;
