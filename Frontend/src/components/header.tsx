import { Bell,  Plus } from "lucide-react";

const Header = () => {
  return (
    <header className="flex justify-center items-center ml-auto px-4 h-[8vh]">
      <div className="flex items-center justify-center gap-3">
          <button className="relative p-2  ">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-blue-700 hover:to-purple-700 shadow-lg">
            <Plus className="w-4 h-4" />
            <span>Report Event</span>
          </button>
      </div>
    </header>
  );
};

export default Header;
