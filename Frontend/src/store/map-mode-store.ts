import { create } from "zustand";

interface MapModeState {
  isMapMode: boolean;
  toggleMapMode: () => void;
}

export const useMapModeStore = create<MapModeState>((set) => {
  // Retrieve the initial state from localStorage
  const storedMapMode = localStorage.getItem("isMapMode");
  const initialMapMode = storedMapMode ? JSON.parse(storedMapMode) : false;

  return {
    isMapMode: initialMapMode,
    toggleMapMode: () => {
      set((state) => {
        const newMapMode = !state.isMapMode;
        // Save the new state to localStorage
        localStorage.setItem("isMapMode", JSON.stringify(newMapMode));
        return { isMapMode: newMapMode };
      });
    },
  };
});