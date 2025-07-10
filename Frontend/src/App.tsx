import {AdvancedMarker, APIProvider, Map} from '@vis.gl/react-google-maps';

export function App() {
  const position = {lat: 53.54992, lng: 10.00678};

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string}>
      <Map defaultCenter={position} defaultZoom={10} mapId="DEMO_MAP_ID">
        <AdvancedMarker position={position} />
      </Map>
    </APIProvider>
  );
}

