/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
 
  useJsApiLoader,
} from "@react-google-maps/api";
import type { Location } from "@/types/Location";

interface Props {
  location: Location;
  radius?: number;
}

const containerStyle = {
  width: "30%",
  height: "500px",
};



/**
 * Helper function to determine an appropriate zoom level for a given radius.
 * This formula is a rough approximation and uses a default container width.
 * Adjust mapWidth as needed to better fit your use case.
 *
 * @param center center of the map (lat: number)
 * @param radius in meters
 * @returns number Zoom level as an integer
 */
const getZoomLevel = (
  center: { lat: number },
  radius: number,
  mapWidth: number = 800 // default pixel width of map container
): number => {
  // The ground resolution (m/px) at zoom level 0 at the equator is about 156543.03392.
  // Resolution at zoom level z is: resolution = 156543.03392 * cos(lat) / (2^z)
  // We want the map to show diameter = 2 * radius in pixels.
  // Rearranging: 2^z = (156543.03392 * cos(lat) * mapWidth) / (2 * radius)
  // That gives z = log2((156543.03392 * cos(lat) * mapWidth) / (2 * radius))
  const latRad = (center.lat * Math.PI) / 180;
  const zoomLevel = Math.log2(
    (156543.03392 * Math.cos(latRad) * mapWidth) / (2 * radius)
  );
  return Math.floor(zoomLevel);
};

const MapVS: React.FC<Props> = ({ location, radius }) => {
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Convert your custom Location to Google Maps LatLngLiteral
  const centerLatLng =
    location.latitude && location.longitude
      ? { lat: location.latitude, lng: location.longitude }
      : { lat: 0, lng: 0 };

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      if (radius && centerLatLng.lat !== 0 && centerLatLng.lng !== 0) {
        // Instead of using fitBounds, calculate an appropriate zoom level.
        const zoom = getZoomLevel(centerLatLng, radius);
        map.setZoom(zoom);
        map.setCenter(centerLatLng);
      } else {
        map.setZoom(12);
      }
    },
    [centerLatLng, radius]
  );

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  if (!isLoaded) return <p>Loading map...</p>;

  const mapStyles = [
    {
      featureType: "poi", // Points of interest (e.g., parks, schools, restaurants)
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit", // Transit stations (e.g., bus stops, train stations)
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road", // Roads
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative", // Political boundaries, localities, countries
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      // If you want to be super comprehensive, you can target all elements of type 'labels'
      // This is often the most direct way to get rid of everything
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ];

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={centerLatLng}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: mapStyles,
        disableDefaultUI: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        keyboardShortcuts: false,
        
      }}
      // Do not set a fixed zoom level; we adjust it in onLoad
    >
      <Marker position={centerLatLng} />
    </GoogleMap>
  );
};

export default React.memo(MapVS);
