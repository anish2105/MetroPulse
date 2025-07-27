/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useLocationStore } from "@/store/location-store";
import { getCityEvents, getLocalityEvents } from "@/lib/realtimeData";
import { MapPin,  Search, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Movie {
  name: string;
  genre: string;
  compatible_mbti: string[];
  language: string;
  certificate: string;
  description: string;
  locations_available: {
    [key: string]: string[];
  };
}

interface Restaurant {
  name: string;
  cuisine: string;
  rating: number | null;
  address: string;
}

interface Concert {
  name: string;
  date: string;
  venue: string;
  description: string;
}

interface LocalityEvents {
  location: string;
  movies: Movie[];
  restaurants: {
    veg_restaurants: Restaurant[];
    nonveg_restaurants: Restaurant[];
  };
  concerts: Concert[];
}

// Enhanced EventCard for Events Page
const EventCard = ({ event, category }: { event: any; category: string }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'movie': return 'bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200';
      case 'concert': return 'bg-gradient-to-br from-orange-50 to-red-100 border-orange-200';
      case 'veg_restaurant': return 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200';
      case 'nonveg_restaurant': return 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200';
      default: return 'bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'movie': return '🎬';
      case 'concert': return '🎵';
      case 'veg_restaurant': return '🥗';
      case 'nonveg_restaurant': return '🍖';
      default: return '📅';
    }
  };

  if (!event?.title) return null;

  return (
    <div
      className={`${getCategoryColor(category)} border rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
      onClick={() => setIsDialogOpen(true)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getCategoryIcon(category)}</span>
          <div>
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{category.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3 line-clamp-3">
        {event.description}
      </p>

      <div className="flex items-center space-x-2 text-gray-600">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="text-xs line-clamp-1">{event.location}</span>
      </div>

      {event.rating && (
        <div className="flex items-center space-x-1 mt-2">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-xs font-medium text-gray-700">{event.rating}</span>
        </div>
      )}

      {isDialogOpen && (
        <EventDialog
          event={event}
          category={category}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </div>
  );
};

// Enhanced EventDialog
const EventDialog = ({
  event,
  category,
  onClose,
}: {
  event: any;
  category: string;
  onClose: () => void;
}) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-2xl">
              {category === 'movie' ? '🎬' : category === 'concert' ? '🎵' : category.includes('restaurant') ? '🍽️' : '📅'}
            </span>
            <span>{event.title}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm leading-relaxed">{event.description}</p>
          </div>
          
          <div className="flex items-start space-x-2">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Location</p>
              <p className="text-sm text-gray-600">{event.location}</p>
            </div>
          </div>

          {event.rating && (
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">Rating: {event.rating}/5</span>
            </div>
          )}

          {category === 'movie' && event.showtimes && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Show Times</p>
              <div className="grid grid-cols-2 gap-2">
                {event.showtimes.map((time: string, idx: number) => (
                  <div key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs text-center">
                    {time}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper functions
const transformMovieForEventCard = (movie: Movie) => ({
  title: movie.name,
  description: `${movie.genre} • ${movie.language} • ${movie.certificate}\n\n${movie.description}`,
  location: Object.keys(movie.locations_available || {}).join(', ') || 'Various locations',
  showtimes: Object.values(movie.locations_available || {}).flat(),
  type: 'movie'
});

const transformRestaurantForEventCard = (restaurant: Restaurant, type: 'veg' | 'nonveg') => ({
  title: restaurant.name,
  description: `${restaurant.cuisine} restaurant specializing in ${type === 'veg' ? 'vegetarian' : 'non-vegetarian'} cuisine.`,
  location: restaurant.address,
  rating: restaurant.rating,
  type: `${type}_restaurant`
});

const transformConcertForEventCard = (concert: Concert) => ({
  title: concert.name,
  description: concert.description,
  location: `${concert.venue} • ${concert.date}`,
  type: 'concert'
});

export default function EventsPage() {
  const { fetchLocation, city, locality } = useLocationStore();
  const [realtimeEvents, setRealtimeEvents] = useState<LocalityEvents>({
    location: "",
    movies: [],
    restaurants: { veg_restaurants: [], nonveg_restaurants: [] },
    concerts: [],
  });
  const [cityEvents, setCityEvents] = useState<LocalityEvents>({
    location: "",
    movies: [],
    restaurants: { veg_restaurants: [], nonveg_restaurants: [] },
    concerts: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await fetchLocation();
      setLoading(false);
    };

    const getRealTimeEvents = async () => {
      if (locality) {
        const events = await getLocalityEvents(locality);
        setRealtimeEvents(events);
      }
    };

    const getCityEventsFn = async () => {
      if (city) {
        const events = await getCityEvents(city);
        setCityEvents(events);
      }
    };

    initialize();
    getRealTimeEvents();
    getCityEventsFn();
  }, [fetchLocation, locality, city]);

  // Combine and filter events
  const allEvents = [
    ...(cityEvents.movies?.map(movie => ({ ...transformMovieForEventCard(movie), category: 'movie', source: 'city' })) || []),
    ...(cityEvents.concerts?.map(concert => ({ ...transformConcertForEventCard(concert), category: 'concert', source: 'city' })) || []),
    ...(cityEvents.restaurants?.veg_restaurants?.map(restaurant => ({ ...transformRestaurantForEventCard(restaurant, 'veg'), category: 'veg_restaurant', source: 'city' })) || []),
    ...(cityEvents.restaurants?.nonveg_restaurants?.map(restaurant => ({ ...transformRestaurantForEventCard(restaurant, 'nonveg'), category: 'nonveg_restaurant', source: 'city' })) || []),
    ...(realtimeEvents.movies?.map(movie => ({ ...transformMovieForEventCard(movie), category: 'movie', source: 'locality' })) || []),
    ...(realtimeEvents.concerts?.map(concert => ({ ...transformConcertForEventCard(concert), category: 'concert', source: 'locality' })) || []),
    ...(realtimeEvents.restaurants?.veg_restaurants?.map(restaurant => ({ ...transformRestaurantForEventCard(restaurant, 'veg'), category: 'veg_restaurant', source: 'locality' })) || []),
    ...(realtimeEvents.restaurants?.nonveg_restaurants?.map(restaurant => ({ ...transformRestaurantForEventCard(restaurant, 'nonveg'), category: 'nonveg_restaurant', source: 'locality' })) || [])
  ];

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesLocation = selectedLocation === "all" || event.source === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const categories = [
    { value: "all", label: "All Events", icon: "📅" },
    { value: "movie", label: "Movies", icon: "🎬" },
    { value: "concert", label: "Concerts", icon: "🎵" },
    { value: "veg_restaurant", label: "Veg Restaurants", icon: "🥗" },
    { value: "nonveg_restaurant", label: "Non-Veg Restaurants", icon: "🍖" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🎉 Discover Events
            </h1>
            <p className="text-purple-200 text-lg">
              Find the best movies, concerts, and restaurants in {city || 'your city'}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.value
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {category.icon} {category.label}
                </button>
              ))}
            </div>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="all">All Locations</option>
              <option value="city">City Events</option>
              <option value="locality">Local Events</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredEvents.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">
                {filteredEvents.length} Events Found
              </h2>
              <div className="text-purple-200">
                {selectedCategory !== 'all' && `Filtered by: ${categories.find(c => c.value === selectedCategory)?.label}`}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event, index) => (
                <EventCard
                  key={`${event.title}-${index}`}
                  event={event}
                  category={event.category}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-white mb-2">No Events Found</h3>
            <p className="text-purple-200">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}