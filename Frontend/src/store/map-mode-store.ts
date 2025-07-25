import { create } from "zustand";

interface MapModeState {
  isMapMode: boolean;
  toggleMapMode: () => void;
}

export const useMapModeStore = create<MapModeState>((set) => ({
  isMapMode: false,
  toggleMapMode: () => set((state) => ({ isMapMode: !state.isMapMode })),
}));