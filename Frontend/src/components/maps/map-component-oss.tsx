/* eslint-disable @typescript-eslint/no-explicit-any */
// MapComponent.tsx
import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import {
  Tile as TileLayer,
  Vector as VectorLayer,
  Heatmap as HeatmapLayer,
} from "ol/layer";
import { OSM, Vector as VectorSource, XYZ } from "ol/source";
import { fromLonLat } from "ol/proj";
import { Point } from "ol/geom";
import { Feature } from "ol";
import { Style, Circle, Fill, Stroke } from "ol/style";
import "ol/ol.css";

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

interface MapComponentProps {
  height?: string;
  width?: string;
}

type MapStyle =
  | "osm"
  | "satellite"
  | "dark"
  | "light"
  | "terrain"
  | "watercolor"
  | "toner";

const MapComponent: React.FC<MapComponentProps> = ({
  height = "400px",
  width = "100%",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const heatmapLayerRef = useRef<HeatmapLayer | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [mapStyle, setMapStyle] = useState<MapStyle>("osm");

  // Different map tile sources
  const getMapSource = (style: MapStyle) => {
    switch (style) {
      case "osm":
        return new OSM();

      case "satellite":
        return new XYZ({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attributions:
            "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        });

      case "dark":
        return new XYZ({
          url: "https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          attributions: "© OpenStreetMap contributors © CARTO",
        });

      case "light":
        return new XYZ({
          url: "https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          attributions: "© OpenStreetMap contributors © CARTO",
        });

      case "terrain":
        return new XYZ({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
          attributions:
            "Tiles © Esri — Source: USGS, Esri, TANA, DeLorme, and NPS",
        });

      case "watercolor":
        return new XYZ({
          url: "https://stamen-tiles-{a-d}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
          attributions:
            "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.",
        });

      case "toner":
        return new XYZ({
          url: "https://stamen-tiles-{a-d}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png",
          attributions:
            "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.",
        });

      default:
        return new OSM();
    }
  };

  // Change map style
  const changeMapStyle = (newStyle: MapStyle) => {
    if (!mapInstance.current) return;

    setMapStyle(newStyle);

    // Get the current tile layer (should be the first layer)
    const layers = mapInstance.current.getLayers();
    const tileLayer = layers.item(0) as TileLayer<any>;

    if (tileLayer) {
      // Update the source of the existing tile layer
      tileLayer.setSource(getMapSource(newStyle));
    }
  };

  // Generate random heatmap data around user's location
  const generateHeatmapData = (
    centerLat: number,
    centerLon: number,
    count: number = 50
  ): Feature[] => {
    const features: Feature[] = [];

    // Generate random points within ~5km radius of user location
    for (let i = 0; i < count; i++) {
      // Random offset in degrees (roughly 0.05 degrees = ~5.5km)
      const offsetLat = (Math.random() - 0.5) * 0.05;
      const offsetLon = (Math.random() - 0.5) * 0.05;

      const lat = centerLat + offsetLat;
      const lon = centerLon + offsetLon;

      const feature = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        weight: Math.random() * 0.8 + 0.2, // Random weight between 0.2 and 1.0
      });

      features.push(feature);
    }

    // Add some hotspots with higher intensity
    const hotspots = [
      { lat: centerLat + 0.01, lon: centerLon + 0.01, weight: 1.0 },
      { lat: centerLat - 0.015, lon: centerLon + 0.02, weight: 0.9 },
      { lat: centerLat + 0.02, lon: centerLon - 0.01, weight: 0.8 },
      { lat: centerLat - 0.01, lon: centerLon - 0.015, weight: 0.7 },
    ];

    hotspots.forEach((spot) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([spot.lon, spot.lat])),
        weight: spot.weight,
      });
      features.push(feature);
    });

    return features;
  };

  // Create and add heatmap layer
  const addHeatmapLayer = (latitude: number, longitude: number) => {
    if (!mapInstance.current) return;

    // Remove existing heatmap layer if it exists
    if (heatmapLayerRef.current) {
      mapInstance.current.removeLayer(heatmapLayerRef.current);
    }

    // Generate heatmap data
    const heatmapFeatures = generateHeatmapData(latitude, longitude);

    // Create vector source for heatmap
    const heatmapSource = new VectorSource({
      features: heatmapFeatures,
    });

    // Create heatmap layer
    const heatmapLayer = new HeatmapLayer({
      source: heatmapSource,
      blur: 15,
      radius: 20,
      weight: (feature) => {
        // Use the weight property from the feature
        return feature.get("weight") || 0.5;
      },
      gradient: ["#00f", "#0ff", "#0f0", "#ff0", "#f00"],
      opacity: 0.6,
    });

    heatmapLayerRef.current = heatmapLayer;
    mapInstance.current.addLayer(heatmapLayer);
  };

  // Toggle heatmap visibility
  const toggleHeatmap = () => {
    if (heatmapLayerRef.current) {
      const newVisibility = !showHeatmap;
      heatmapLayerRef.current.setVisible(newVisibility);
      setShowHeatmap(newVisibility);
    }
  };
  const getCityFromCoordinates = async (
    lat: number,
    lon: number
  ): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
      );
      const data = await response.json();

      const address = data.address;
      const city =
        address?.city ||
        address?.town ||
        address?.village ||
        address?.municipality ||
        address?.county ||
        "Unknown Location";

      return city;
    } catch (error) {
      console.error("Error fetching city name:", error);
      return "Unknown Location";
    }
  };

  // Request location permission and get coordinates
  const requestLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
      }

      // Request location with high accuracy
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Get city name from coordinates
      const city = await getCityFromCoordinates(latitude, longitude);

      const locationData: LocationData = {
        latitude,
        longitude,
        city,
      };

      setLocation(locationData);
      setPermissionStatus("granted");

      // Center map on user's location
      if (mapInstance.current) {
        const view = mapInstance.current.getView();
        const coordinates = fromLonLat([longitude, latitude]);

        view.animate({
          center: coordinates,
          zoom: 12,
          duration: 1000,
        });

        // Add marker at user's location
        addLocationMarker(longitude, latitude);

        // Add heatmap layer around user's location
        addHeatmapLayer(latitude, longitude);
      }
    } catch (error) {
      console.error("Error getting location:", error);

      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError("Location access denied by user");
            setPermissionStatus("denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setError("Location information is unavailable");
            break;
          case error.TIMEOUT:
            setError("Location request timed out");
            break;
          default:
            setError("An unknown error occurred while retrieving location");
            break;
        }
      } else {
        setError(
          error instanceof Error ? error.message : "Failed to get location"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Add marker at user's location
  const addLocationMarker = (longitude: number, latitude: number) => {
    if (!mapInstance.current) return;

    // Create marker feature
    const markerFeature = new Feature({
      geometry: new Point(fromLonLat([longitude, latitude])),
      name: "Your Location",
    });

    // Style for the marker
    const markerStyle = new Style({
      image: new Circle({
        radius: 10,
        fill: new Fill({
          color: "#3399CC",
        }),
        stroke: new Stroke({
          color: "#fff",
          width: 2,
        }),
      }),
    });

    markerFeature.setStyle(markerStyle);

    // Create vector source and layer
    const vectorSource = new VectorSource({
      features: [markerFeature],
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    // Remove existing marker layers
    const layers = mapInstance.current.getLayers();
    layers.forEach((layer) => {
      // Remove all VectorLayers except the heatmap layer
      // HeatmapLayer is a subclass of VectorLayer, so check for HeatmapLayer explicitly
      if (
        layer instanceof VectorLayer &&
        !(layer instanceof HeatmapLayer)
      ) {
        mapInstance.current?.removeLayer(layer);
      }
    });

    // Add new marker layer
    mapInstance.current.addLayer(vectorLayer);
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create map instance
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: getMapSource(mapStyle),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]), // Default center
        zoom: 2,
      }),
    });

    mapInstance.current = map;

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
      heatmapLayerRef.current = null;
    };
  }, []);

  // Check permission status on mount
  useEffect(() => {
    if ("permissions" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setPermissionStatus(result.state as "granted" | "denied" | "prompt");
      });
    }
  }, []);

  return (
    <div className="map-container">
      <div className="map-controls" style={{ marginBottom: "10px" }}>
        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={requestLocation}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: loading ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              marginRight: "10px",
            }}
          >
            {loading ? "Getting Location..." : "Get My Location"}
          </button>

          {location && (
            <button
              onClick={toggleHeatmap}
              style={{
                padding: "10px 20px",
                backgroundColor: showHeatmap ? "#28a745" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
            </button>
          )}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label
            style={{
              marginRight: "10px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Map Style:
          </label>
          <select
            value={mapStyle}
            onChange={(e) => changeMapStyle(e.target.value as MapStyle)}
            style={{
              padding: "5px 10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              backgroundColor: "white",
            }}
          >
            <option value="osm">OpenStreetMap</option>
            <option value="satellite">Satellite</option>
            <option value="dark">Dark Theme</option>
            <option value="light">Light Theme</option>
            <option value="terrain">Terrain</option>
            <option value="watercolor">Watercolor</option>
            <option value="toner">Toner (B&W)</option>
          </select>
        </div>

        {location && (
          <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
            <strong>Your Location:</strong> {location.city}
            <br />
            <small>
              Coordinates: {location.latitude.toFixed(6)},{" "}
              {location.longitude.toFixed(6)}
            </small>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              border: "1px solid #f5c6cb",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {permissionStatus === "denied" && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#fff3cd",
              color: "#856404",
              border: "1px solid #ffeaa7",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            <strong>Location Access Denied:</strong> Please enable location
            permissions in your browser settings to use this feature.
          </div>
        )}
      </div>

      <div
        ref={mapRef}
        style={{
          height,
          width,
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
    </div>
  );
};

export default MapComponent;
