import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface Props {
  location: { lat: number; lng: number };
}

const containerStyle = {
  width: "100%",
  height: "500px",
};

const MapVS: React.FC<Props> = ({ location }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Replace this
  });

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={location}
      zoom={12}
    >
      <Marker position={location} />
    </GoogleMap>
  );
};



export default MapVS;
