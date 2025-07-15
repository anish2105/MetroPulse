import { Bell, MapPin, Plus } from "lucide-react";

const Header = () => {
  return (
    <header className="ml-auto px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-blue-400" />
            <span className="text-sm font-medium ">
              Bengaluru, Karnataka
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2  ">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-blue-700 hover:to-purple-700 shadow-lg">
            <Plus className="w-4 h-4" />
            <span>Report Event</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
