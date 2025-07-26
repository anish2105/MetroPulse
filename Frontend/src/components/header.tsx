/* eslint-disable @typescript-eslint/no-unused-vars */
import { useLocationStore } from "@/store/location-store";
import { useMapModeStore } from "@/store/map-mode-store";
import { Bell, MapPin } from "lucide-react";
import { Switch } from "./ui/switch";
import { useRouter } from "@tanstack/react-router";
import { ReportEventDialog } from "./events/report-event";

const Header = () => {
  const { locality, loading } = useLocationStore();
  const { isMapMode, toggleMapMode } = useMapModeStore();
  const router = useRouter();
  const isFeedRoute = router.state.location.pathname === "/feed";
  return (
    <header className="flex justify-center items-center ml-auto px-4 h-[8vh]">
      <div className="flex items-center justify-center gap-3">
        {isFeedRoute && (
          <div className="flex justify-center items-center gap-1">
            <Switch checked={isMapMode} onCheckedChange={toggleMapMode} />
            <p>Map Mode</p>
          </div>
        )}

        <div className="flex justify-center items-center gap-1">
          <p>{locality}</p>
          {locality && <MapPin className="w-5 h-5" />}
        </div>

        {/* <button className="relative p-2  ">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button> */}

        <ReportEventDialog />
      </div>
    </header>
  );
};

export default Header;
