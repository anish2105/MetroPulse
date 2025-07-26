/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  MapPin,
  Search,
  Filter,
  Heart,
  MessageCircle,
  Share2,
  Zap,
  X,
  Send,
} from "lucide-react";
import { useLocationStore } from "@/store/location-store";

export default function MetroPulse() {
  const [activeTab] = useState("feed");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const { fetchLocation } = useLocationStore();

  useEffect(() => {
    const getLocation = async () => {
      await fetchLocation();
    };

    getLocation();
  }, [fetchLocation]);
  const events = [
    {
      id: 1,
      title: "Flash Mob at Brigade Road",
      description: "Large crowd gathering for surprise dance performance",
      location: "Brigade Road, MG Road",
      type: "event",
      priority: "high",
      time: "2 mins ago",
      likes: 24,
      comments: 8,
      image: true,
      tags: ["entertainment", "crowd"],
      mbtiMatch: "ENFP",
    },
    {
      id: 2,
      title: "Power Outage in Koramangala",
      description: "Multiple reports of power cuts affecting Blocks 3-5",
      location: "Koramangala, Bangalore",
      type: "alert",
      priority: "urgent",
      time: "5 mins ago",
      likes: 12,
      comments: 15,
      image: false,
      tags: ["infrastructure", "utility"],
      mbtiMatch: "ISTJ",
    },
    {
      id: 3,
      title: "Book Club Meetup",
      description: "Weekly discussion on 'The Alchemist' at cozy café",
      location: "Indiranagar, Bangalore",
      type: "event",
      priority: "medium",
      time: "15 mins ago",
      likes: 8,
      comments: 3,
      image: true,
      tags: ["books", "community"],
      mbtiMatch: "INFP",
    },
  ];

  const EventCard = ({ event }: { event: any }) => (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 mb-4 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
      onClick={() => setSelectedEvent(event)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full shadow-sm ${
              event.priority === "urgent"
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : event.priority === "high"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500"
                  : "bg-gradient-to-r from-blue-500 to-blue-600"
            }`}
          ></div>
          <span className="text-sm font-medium text-gray-900">
            {event.title}
          </span>
        </div>
        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
          {event.time}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-2">{event.description}</p>

      <div className="flex items-center space-x-2 mb-3">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">{event.location}</span>
      </div>

      {/* {event.image && (
        <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md mb-3 flex items-center justify-center">
          <span className="text-gray-500 text-sm">📸 Image attached</span>
        </div>
      )} */}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{event.likes}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{event.comments}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {event.tags.map((tag: undefined) => (
            <span
              key={tag}
              className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs px-2 py-1 rounded-full border border-blue-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const MapView = () => (
    <div className="h-full bg-gray-100 rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Interactive City Map
          </h3>
          <p className="text-sm text-gray-600">
            Real-time events and alerts visualization
          </p>
        </div>
      </div>

      {/* Map markers simulation */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
      <div className="absolute top-32 right-24 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 left-1/3 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
      <div className="absolute bottom-32 right-1/3 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-800 flex">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 pb-24">
          {activeTab === "feed" ? (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">
                  Live City Feed
                </h1>
                <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
              </div>

              {/* AI Summary Banner */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mb-6 shadow-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-semibold">AI-Powered City Pulse</span>
                </div>
                <p className="text-sm opacity-90">
                  High activity detected in Brigade Road area. Power outages
                  reported in Koramangala. 3 community events happening near you
                  based on your ENFP profile.
                </p>
              </div>

              {/* Events in Your Area */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Events in Koramangala
                </h2>
                <div className="relative">
                  <div className="flex space-x-4 overflow-x-auto scroll pb-4">
                    {/* Event Card 1 */}
                    <div className="min-w-[280px] bg-gradient-to-br from-pink-50 to-rose-100 border border-pink-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                          Tonight
                        </span>
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Jazz Night at Toit
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Live music and craft beer
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>0.5 km away</span>
                      </div>
                    </div>

                    {/* Event Card 2 */}
                    <div className="min-w-[280px] bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                          Tomorrow
                        </span>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Yoga in the Park
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Morning session at Lalbagh
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>1.2 km away</span>
                      </div>
                    </div>

                    {/* Event Card 3 */}
                    <div className="min-w-[280px] bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                          This Weekend
                        </span>
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Food Truck Festival
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Local cuisines and street food
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>0.8 km away</span>
                      </div>
                    </div>

                    {/* Event Card 4 */}
                    <div className="min-w-[280px] bg-gradient-to-br from-indigo-50 to-purple-100 border border-indigo-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                          Next Week
                        </span>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Tech Meetup
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        AI & Machine Learning talk
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>0.3 km away</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Updates */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Real-time Updates
                </h2>
              </div>

              {/* Events List */}
              <div className="space-y-4">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full pb-24">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">City Heatmap</h1>
                <div className="flex items-center space-x-4">
                  <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Events</option>
                    <option>Alerts Only</option>
                    <option>Entertainment</option>
                    <option>Infrastructure</option>
                  </select>
                </div>
              </div>

              <div className="h-[600px]">
                <MapView />
              </div>
            </div>
          )}
          {/* Floating Chat Search Bar */}
          <div className="fixed bottom-6 left-[57%] transform -translate-x-1/2 w-full max-w-3xl px-6 z-40">
            <div className="bg-gray-800 border border-gray-600 rounded-full shadow-2xl px-6 py-4 flex items-center space-x-4">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ask MetroPulse anything... 'What's happening near me?'"
                className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-400"
              />
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedEvent.title}
                </h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-600 mb-4">{selectedEvent.description}</p>

              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {selectedEvent.location}
                </span>
              </div>

              {selectedEvent.image && (
                <div className="w-full h-48 bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                  <span className="text-gray-400">📸 Event Image</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{selectedEvent.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{selectedEvent.comments}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* <span className="text-xs text-gray-500">
                  MBTI Match: {selectedEvent.mbtiMatch}
                </span> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
