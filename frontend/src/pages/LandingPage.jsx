import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

import { getMovies } from '../services/movieService';
import { getEvents } from '../services/eventService';
import { getTheatres } from '../services/theatreService';
import { CITIES } from '../utils/constants';
import MovieCard from '../components/ui/MovieCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import { 
  FiStar, FiCalendar, FiMapPin, FiCompass, FiShield, FiSliders,
  FiSearch, FiTrendingUp, FiCheckCircle, FiClock, FiVideo, FiMap
} from 'react-icons/fi';
import useDocumentTitle from '../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

const LandingPage = () => {
  useDocumentTitle('Book Movie & Event Tickets Online', 'Discover latest movies, reserve cinema seats, book live events, and download digital tickets instantly with TicketShow.');

  const navigate = useNavigate();
  const [citiesList, setCitiesList] = useState(CITIES);
  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem('selectedCity') || CITIES[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  
  const [movies, setMovies] = useState([]);
  const [events, setEvents] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedState, setSelectedState] = useState(localStorage.getItem('selectedState') || '');
  const [selectedCityName, setSelectedCityName] = useState(() => {
    const cityId = localStorage.getItem('selectedCity') || '';
    const cityObj = CITIES.find(c => c.id === cityId);
    return cityObj ? cityObj.city_name : '';
  });

  const fetchData = async (stateVal, cityVal) => {
    setLoading(true);
    try {
      const [moviesRes, eventsRes, theatresRes] = await Promise.all([
        getMovies({ state: stateVal, city: cityVal }),
        getEvents({ state: stateVal, city: cityVal }),
        getTheatres({ state: stateVal, city: cityVal })
      ]);
      setMovies(Array.isArray(moviesRes) ? moviesRes : []);
      setEvents(Array.isArray(eventsRes) ? eventsRes : []);
      setTheatres(Array.isArray(theatresRes) ? theatresRes : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load portal content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCities = async () => {
      try {
        const { getCachedCities } = await import('../services/locationService');
        const list = await getCachedCities();
        if (list && list.length > 0) {
          setCitiesList(list);
          const currentId = localStorage.getItem('selectedCity') || list[0]?.id;
          const currentObj = list.find(c => c.id === currentId);
          if (currentObj) {
            setSelectedCityName(currentObj.city_name);
            setSelectedState(currentObj.state);
            fetchData(currentObj.state, currentObj.city_name);
          }
        }
      } catch (err) {
        console.error('Failed to load cities in LandingPage:', err);
      }
    };
    loadCities();

    const handleLocationChange = () => {
      const cityId = localStorage.getItem('selectedCity') || '';
      const listToSearch = JSON.parse(sessionStorage.getItem('cached_cities_list') || 'null') || CITIES;
      const cityObj = listToSearch.find(c => c.id === cityId);
      const cityName = cityObj ? cityObj.city_name : '';
      const stateName = localStorage.getItem('selectedState') || '';
      
      setSelectedCity(cityId);
      setSelectedCityName(cityName);
      setSelectedState(stateName);
      fetchData(stateName, cityName);
    };

    window.addEventListener('locationChanged', handleLocationChange);
    
    // Initial fetch
    const initCityId = localStorage.getItem('selectedCity') || CITIES[0]?.id;
    const initCityObj = CITIES.find(c => c.id === initCityId);
    fetchData(localStorage.getItem('selectedState') || initCityObj?.state || '', initCityObj?.city_name || '');

    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, []);

  const handleCityChange = (cityId) => {
    setSelectedCity(cityId);
    localStorage.setItem('selectedCity', cityId);
    window.dispatchEvent(new Event('locationChanged'));
    toast.success(`Switched ticketing zone successfully`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  const currentCityName = citiesList.find(c => c.id === selectedCity)?.city_name || 'Mumbai';

  // Filters for movie categories
  const nowShowingMovies = movies.filter(m => m.status === 'now_showing');
  const comingSoonMovies = movies.filter(m => m.status === 'coming_soon');
  
  // Slices for all requested movie sections
  const recommendedMovies = nowShowingMovies.slice(0, 5);
  const trendingMovies = nowShowingMovies.slice(5, 10);
  const popularMovies = nowShowingMovies.slice(10, 15);
  const topRatedMovies = nowShowingMovies.slice(15, 20);
  const latestReleases = nowShowingMovies.slice(20, 25);

  // Filter events in selected city or standard
  const cityEvents = events;
  
  // Category splits for events
  const concertsList = cityEvents.filter(e => e.category?.category_name === 'Concert');
  const sportsList = cityEvents.filter(e => e.category?.category_name === 'Sports');
  const comedyList = cityEvents.filter(e => e.category?.category_name === 'Standup Comedy');
  const dramaList = cityEvents.filter(e => e.category?.category_name === 'Theatre Play');
  const technologyList = cityEvents.filter(e => e.category?.category_name === 'Technology Summit');
  const collegeList = cityEvents.filter(e => e.category?.category_name === 'College Events');
  const festivalList = cityEvents.filter(e => e.category?.category_name === 'Music Festival');
  const workshopsList = cityEvents.filter(e => e.category?.category_name === 'Workshops');

  // Nearby theatres in selected city
  const cityTheatres = theatres;

  const renderEventGrid = (list, title, icon) => {
    if (!list || list.length === 0) return null;
    return (
      <div className="space-y-6 pt-4">
        <h3 className="text-xl font-black text-text-primary flex items-center gap-2">
          {icon} {title}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map(event => {
            const price = event.event_tickets?.[0]?.price || '499';
            const remainingTickets = event.event_tickets?.reduce((acc, t) => acc + t.available_quantity, 0) || 120;
            
            return (
              <Card key={event.id} className="p-0 overflow-hidden flex flex-col justify-between group rounded-3xl bg-white border border-border shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-48 bg-gray-100 overflow-hidden relative">
                  <img src={event.banner} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute top-4 left-4 bg-amber-400 text-text-primary px-3 py-1 rounded-full text-xs font-black shadow-md">
                    {event.category?.category_name}
                  </span>
                  <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                    {remainingTickets} tickets left
                  </span>
                </div>
                
                <div className="p-6 space-y-4">
                  <h4 className="font-black text-lg text-text-primary line-clamp-1 group-hover:text-amber-500 transition-colors">
                    {event.title}
                  </h4>
                  
                  <div className="space-y-1.5 text-xs text-text-secondary font-semibold">
                    <p className="flex items-center gap-1.5"><FiCalendar className="text-amber-500" /> {new Date(event.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="flex items-center gap-1.5"><FiMapPin className="text-amber-500" /> {event.venue}</p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-border/60 flex justify-between items-center bg-gray-50">
                  <div>
                    <p className="text-[10px] text-text-secondary uppercase font-bold">Starts from</p>
                    <p className="font-black text-base text-text-primary">₹{price}</p>
                  </div>
                  <Link to={`/event/${event.id}`}>
                    <Button variant="primary" size="sm" className="font-black px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-sm">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return <Loader type="chart" />;
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen text-text-primary text-left">

      {/* Large Hero Carousel */}
      {nowShowingMovies.length > 0 && (
        <section className="relative w-full overflow-hidden bg-white border-b border-border">
          <Swiper
            modules={[Autoplay, EffectFade, Pagination]}
            effect="fade"
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="h-[55vh] md:h-[65vh] w-full"
          >
            {nowShowingMovies.slice(0, 5).map((movie) => (
              <SwiperSlide key={movie.id}>
                <div 
                  className="w-full h-full relative flex items-center justify-start bg-cover bg-center"
                  style={{ backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.98) 35%, rgba(255,255,255,0.3) 100%), url(${movie.banner || movie.poster})` }}
                >
                  <div className="container mx-auto px-4 md:px-8 max-w-4xl z-10 space-y-4">
                    <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-600 font-bold text-xs uppercase tracking-wider">
                      ★ Featured now showing
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-text-primary tracking-tight leading-tight">
                      {movie.title}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-text-secondary font-bold flex-wrap">
                      <span className="text-amber-500 flex items-center gap-1">
                        <FiStar className="fill-amber-400 text-amber-500" /> 9.1/10
                      </span>
                      <span>•</span>
                      <span>{movie.duration} mins</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 border border-border rounded text-[10px] uppercase font-bold">{movie.age_rating}</span>
                      <span>•</span>
                      <span>{movie.language}</span>
                    </div>
                    <p className="text-sm md:text-base text-text-secondary max-w-lg line-clamp-3 leading-relaxed">
                      {movie.description}
                    </p>
                    <div className="flex gap-3 pt-2">
                      <Link to={`/movie/${movie.id}`}>
                        <Button variant="primary" className="font-black px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-md">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* Main portal layout grids */}
      <div className="container mx-auto px-4 md:px-8 py-16 space-y-20">
        
        {/* 1. RECOMMENDED MOVIES */}
        {recommendedMovies.length > 0 && (
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-2xl font-black text-text-primary tracking-tight">Recommended Movies</h2>
              <Link to="/search?type=movies" className="text-sm font-black text-amber-500 hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recommendedMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
            </div>
          </section>
        )}

        {/* 2. NOW SHOWING */}
        {nowShowingMovies.length > 0 && (
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-2xl font-black text-text-primary tracking-tight">Now Showing</h2>
              <span className="text-xs text-text-secondary font-semibold">Active listings in {currentCityName}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {nowShowingMovies.slice(0, 10).map(movie => <MovieCard key={movie.id} movie={movie} />)}
            </div>
          </section>
        )}

        {/* 3. COMING SOON */}
        {comingSoonMovies.length > 0 && (
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-2xl font-black text-text-primary tracking-tight">Coming Soon</h2>
              <span className="text-xs text-text-secondary font-semibold">Releasing shortly</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {comingSoonMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
            </div>
          </section>
        )}

        {/* 4. TRENDING */}
        {trendingMovies.length > 0 && (
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
                <FiTrendingUp className="text-amber-500" /> Trending Movies
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {trendingMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
            </div>
          </section>
        )}

        {/* 5. POPULAR */}
        {popularMovies.length > 0 && (
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-2xl font-black text-text-primary tracking-tight">Popular Collections</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {popularMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
            </div>
          </section>
        )}

        {/* 6. TOP RATED */}
        {topRatedMovies.length > 0 && (
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-2xl font-black text-text-primary tracking-tight">Top Rated Critics Choice</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {topRatedMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
            </div>
          </section>
        )}

        {/* 7. LATEST RELEASES */}
        {latestReleases.length > 0 && (
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-2xl font-black text-text-primary tracking-tight">Latest Releases</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {latestReleases.map(movie => <MovieCard key={movie.id} movie={movie} />)}
            </div>
          </section>
        )}

        {/* =======================================================
            EVENTS SECTIONS
           ======================================================= */}
        <section className="border-t border-border pt-16 space-y-12">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-text-primary tracking-tight">Popular Events</h2>
              <p className="text-xs text-text-secondary mt-1">Concerts, Sports, Standup Comedy, Workshops, and Theatre Shows near you</p>
            </div>
            <Link to="/search?type=events" className="text-sm font-black text-amber-500 hover:underline">View All</Link>
          </div>

          {cityEvents.length === 0 && (
            <EmptyState title="No events in city" description={`Currently no events listed in ${currentCityName}. Switch city to browse other events.`} />
          )}

          {/* Render event category grids programmatically */}

          {/* Group lists grids */}
          {renderEventGrid(concertsList, 'Live Concerts', <FiCompass className="text-amber-500" />)}
          {renderEventGrid(festivalList, 'Music Festivals', <FiCompass className="text-amber-500" />)}
          {renderEventGrid(comedyList, 'Standup Comedy Shows', <FiCompass className="text-amber-500" />)}
          {renderEventGrid(sportsList, 'Sports Matches', <FiCompass className="text-amber-500" />)}
          {renderEventGrid(dramaList, 'Theatre Plays', <FiCompass className="text-amber-500" />)}
          {renderEventGrid(technologyList, 'Technology Summits', <FiCompass className="text-amber-500" />)}
          {renderEventGrid(collegeList, 'College Fests', <FiCompass className="text-amber-500" />)}
          {renderEventGrid(workshopsList, 'Interactive Workshops', <FiCompass className="text-amber-500" />)}
        </section>

        {/* =======================================================
            NEARBY THEATRES
           ======================================================= */}
        <section className="border-t border-border pt-16 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-2">
                <FiMapPin className="text-amber-500" /> Nearby Theatres
              </h2>
              <p className="text-xs text-text-secondary mt-1">Cinema halls screening shows in {currentCityName}</p>
            </div>
            <Link to="/search" className="text-sm font-black text-amber-500 hover:underline">Browse All</Link>
          </div>

          {cityTheatres.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cityTheatres.map(theatre => {
                let desc = { facilities: '', gmapsLink: '', customDesc: '' };
                try {
                  desc = typeof theatre.description === 'string' ? JSON.parse(theatre.description) : theatre.description;
                } catch(e) {}
                
                const facilities = desc.facilities || theatre.facilities || 'Dolby Sound, Parking, Food Court';
                const gmapsLink = desc.gmapsLink || `https://www.google.com/maps?q=${theatre.latitude},${theatre.longitude}`;
                
                return (
                  <Card key={theatre.id} className="p-6 flex flex-col justify-between rounded-3xl bg-white border border-border shadow-md hover:shadow-xl transition-all duration-300">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-black text-lg text-text-primary tracking-tight">{theatre.theatre_name}</h3>
                        <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                          <FiMapPin className="text-gray-400" /> {theatre.address}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {facilities.split(',').map((f, i) => (
                          <span key={i} className="text-[10px] font-black bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">
                            {f.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-6 mt-6 border-t border-border/60">
                      <a 
                        href={gmapsLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 hover:underline"
                      >
                        <FiMap className="w-3.5 h-3.5" /> Google Maps Location
                      </a>
                      <Link to={`/search?query=${encodeURIComponent(theatre.theatre_name)}`}>
                        <Button variant="secondary" size="sm" className="text-xs font-black border-border hover:bg-gray-50">
                          Browse Shows
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No theatres registered" description={`We didn't find any theatres listed for ${currentCityName}.`} />
          )}
        </section>

      </div>
    </div>
  );
};

export default LandingPage;
