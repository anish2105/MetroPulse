/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useLocationStore } from "@/store/location-store";
import {
  getCityEvents,
  getLocalityEvents,
  getUserReports,
} from "@/lib/realtimeData";
import { MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import { Link } from "@tanstack/react-router";

interface Movie {
  name: string;
  genre: string;
  compatible_mbti: string[];
  language: string;
  certificate: string;
  description: string;
  locations_available: {
    [key: string]: string[]; // Key is the location name, value is an array of showtimes
  };
}

interface Restaurant {
  name: string;
  cuisine: string;
  rating: number | null; // Rating can be a number or null
  address: string;
}

interface Concert {
  name: string;
  date: string; // You may want to use Date type if you parse it
  venue: string;
  description: string;
}

interface LocalityEvents {
  location: string; // e.g., "Whitefield"
  movies: Movie[];
  restaurants: {
    veg_restaurants: Restaurant[];
    nonveg_restaurants: Restaurant[];
  };
  concerts: Concert[];
}

// EventCard Component - only used for User Reports
const EventCard = ({ event }: { event: any }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const randomColor = () => {
    const colors = [
      "bg-gradient-to-br from-pink-50 to-rose-100",
      "bg-gradient-to-br from-emerald-50 to-teal-100",
      "bg-gradient-to-br from-amber-50 to-orange-100",
      "bg-gradient-to-br from-indigo-50 to-purple-100",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (!event?.title && !event?.Eventname) return null;

  const title = event.title || event.Eventname;
  const description = event.description || event.EventSummary;
  const location = event.location || event.Location;

  return (
    <div
      className={`${randomColor()} border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
      onClick={() => setIsDialogOpen(true)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm font-medium text-gray-900">{title}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-2">
        {description?.length > 250
          ? description.substring(0, 250) + "..."
          : description}
      </p>

      <div className="flex items-center space-x-2">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">{location}</span>
      </div>

      {isDialogOpen && (
        <EventDialog
          event={{ title, description, location }}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </div>
  );
};

// Helper function to transform data for EventCard
const transformMovieForEventCard = (movie: Movie) => ({
  title: movie.name,
  description: `${movie.genre} • ${movie.language} • ${movie.certificate}\n${movie.description}`,
  location:
    Object.keys(movie.locations_available || {}).join(", ") ||
    "Various locations",
  type: "movie",
});

const transformRestaurantForEventCard = (
  restaurant: Restaurant,
  type: "veg" | "nonveg"
) => ({
  title: restaurant.name,
  description: `${restaurant.cuisine} • ${type.toUpperCase()} Restaurant${restaurant.rating ? ` • Rating: ${restaurant.rating}★` : ""}`,
  location: restaurant.address,
  type: `${type}_restaurant`,
});

const transformConcertForEventCard = (concert: Concert) => ({
  title: concert.name,
  description: concert.description,
  location: `${concert.venue} • ${concert.date}`,
  type: "concert",
});

// Events Section Component - Using EventCard for all items (max 4)
const EventsSection = ({
  title,
  data,
  showMore = false,
  loading,
}: {
  title: string;
  data: LocalityEvents;
  showMore?: boolean;
  loading: boolean;
}) => {
  const allEvents = [
    ...(data.movies?.map((movie) => transformMovieForEventCard(movie)) || []),
    ...(data.concerts?.map((concert) =>
      transformConcertForEventCard(concert)
    ) || []),
    ...(data.restaurants?.veg_restaurants?.map((restaurant) =>
      transformRestaurantForEventCard(restaurant, "veg")
    ) || []),
    ...(data.restaurants?.nonveg_restaurants?.map((restaurant) =>
      transformRestaurantForEventCard(restaurant, "nonveg")
    ) || []),
  ];

  const displayEvents = showMore ? allEvents : allEvents.slice(0, 4);
  const hasMoreEvents = allEvents.length > 4;

  if (allEvents.length === 0 && loading) {
    return (
      <div className="text-gray-400 text-center py-8">
        Loading...
      </div>
    );
  }else if(allEvents.length == 0 && !loading){
     <div className="text-gray-400 text-center py-8">
        No {title.toLowerCase()} available at the moment
      </div>
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {displayEvents.map((event, index) => (
          <EventCard key={`${event.title}-${index}`} event={event} />
        ))}
      </div>
      {!showMore && hasMoreEvents && (
        <div className="flex justify-center mt-4">
          <a href="/events">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
              Show More Events ({allEvents.length - 4} more)
            </button>
          </a>
        </div>
      )}
    </div>
  );
};

// EventDialog Component using shadcn Dialog
const EventDialog = ({
  event,
  onClose,
}: {
  event: any;
  onClose: () => void;
}) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm">{event.description}</p>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span className="text-xs">{event.location}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// MetroPulse Component
export default function MetroPulse() {
  const { fetchLocation, city, locality } = useLocationStore();
  const [realtimeEvents, setRealtimeEvents] = useState<LocalityEvents>({
    location: "",
    movies: [],
    restaurants: {
      veg_restaurants: [],
      nonveg_restaurants: [],
    },
    concerts: [],
  });
  const [cityEvents, setCityEvents] = useState<LocalityEvents>({
    location: "",
    movies: [],
    restaurants: {
      veg_restaurants: [],
      nonveg_restaurants: [],
    },
    concerts: [],
  });
  const [userReps, setUserReps] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getLocation = async () => {
      setLoading(true);
      await fetchLocation();
      setLoading(false);
    };

    const userReports = async () => {
      try {
        const rep = await getUserReports();
        setUserReps(rep);
        console.log("User Reports:", rep);
      } catch (error) {
        console.error("Failed to fetch user reports:", error);
      }
    };

    const getRealTimeEvents = async () => {
      if (locality) {
        const events = await getLocalityEvents(locality);
        setRealtimeEvents(events);
        console.log("Real-time Events:", events);
      } else {
        console.warn(
          "Locality is not defined, skipping real-time events fetch."
        );
      }
    };

    const cityEventsFn = async () => {
      if (city) {
        const events = await getCityEvents(city);
        setCityEvents(events);
        console.log("City Events:", events);
      } else {
        console.warn("City is not defined, skipping city events fetch.");
      }
    };

    getLocation();
    userReports();
    cityEventsFn();
    getRealTimeEvents();
  }, [fetchLocation, locality, city]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 flex">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 pb-24">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* City Events */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                City Events
              </h2>
              <EventsSection
                title="City Events"
                data={cityEvents}
                loading={loading}
              />
            </div>

            {/* User Reports */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                User Reports
              </h2>
              {userReps.length > 0 ? (
                <div>
                  <div className="grid grid-cols-2 gap-2">
                    {userReps.slice(0, 4).map((event: any) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                  {userReps.length > 4 && (
                    <div className="flex justify-center mt-4">
                      <a href="/reports">
                        <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors">
                          Show More Reports ({userReps.length - 4} more)
                        </button>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  No user reports available
                </div>
              )}
            </div>

            {/* Locality Events */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                Locality Events
              </h2>
              <EventsSection
                title="Locality Events"
                data={realtimeEvents}
                loading={loading}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
