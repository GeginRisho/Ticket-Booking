import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilm, FiCalendar, FiMapPin, FiTrendingUp, FiActivity, FiTag } from 'react-icons/fi';
import { getMovies } from '../services/movieService';
import { getEvents } from '../services/eventService';
import { getTheatres } from '../services/theatreService';
import { CITIES } from '../utils/constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [movies, setMovies] = useState([]);
  const [events, setEvents] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [citiesList, setCitiesList] = useState(CITIES);

  const loadData = async () => {
    try {
      const [moviesRes, eventsRes, theatresRes] = await Promise.all([
        getMovies(),
        getEvents(),
        getTheatres()
      ]);
      setMovies(Array.isArray(moviesRes) ? moviesRes : []);
      setEvents(Array.isArray(eventsRes) ? eventsRes : []);
      setTheatres(Array.isArray(theatresRes) ? theatresRes : []);
      
      const { getCachedCities } = await import('../services/locationService');
      const list = await getCachedCities();
      if (list && list.length > 0) {
        setCitiesList(list);
      }
    } catch (err) {
      console.error('Failed to load search catalogs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const queryClean = query.trim().toLowerCase();

  // Search logic covering: Movies, Events, Theatres, Cities, Actors, Categories
  const filteredMovies = !queryClean ? [] : movies.filter(m => {
    const titleMatch = (m.title || '').toLowerCase().includes(queryClean);
    const genreMatch = (m.genre || '').toLowerCase().includes(queryClean);
    const langMatch = (m.language || '').toLowerCase().includes(queryClean);
    const castMatch = m.cast?.some(c => (c.actor_name || c.cast_name || '').toLowerCase().includes(queryClean));
    return titleMatch || genreMatch || langMatch || castMatch;
  });

  const filteredEvents = !queryClean ? [] : events.filter(e => {
    const titleMatch = (e.title || '').toLowerCase().includes(queryClean);
    const venueMatch = (e.venue || '').toLowerCase().includes(queryClean);
    const descMatch = (e.description || '').toLowerCase().includes(queryClean);
    const catMatch = (e.category?.category_name || '').toLowerCase().includes(queryClean);
    return titleMatch || venueMatch || descMatch || catMatch;
  });

  const filteredTheatres = !queryClean ? [] : theatres.filter(t => {
    const nameMatch = (t.theatre_name || '').toLowerCase().includes(queryClean);
    const addrMatch = (t.address || '').toLowerCase().includes(queryClean);
    const cityName = citiesList.find(c => c.id === t.city_id)?.city_name || '';
    const cityMatch = cityName.toLowerCase().includes(queryClean);
    return nameMatch || addrMatch || cityMatch;
  });

  const totalResults = filteredMovies.length + filteredEvents.length + filteredfilteredTheatresMatches();

  function filteredfilteredTheatresMatches() {
    return filteredTheatres.length;
  }

  const popularTags = ['Action', 'Comedy', 'Concert', 'Mumbai', 'Bangalore', 'Concerts', 'Standup Comedy'];

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-5xl py-12 min-h-[85vh] text-left text-text-primary bg-background">
      <div className="mb-10 relative">
        <input
          type="text"
          placeholder="Search for movies, events, theatres, cities, actors, or categories..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-white text-base shadow-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          autoFocus
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
      </div>

      {loading ? (
        <Loader type="spinner" size="lg" />
      ) : !query ? (
        <div className="space-y-12">
          {/* Popular Search tags */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-primary" /> Popular Searches
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-4 py-2 text-xs font-bold rounded-full bg-white border border-border hover:bg-hover-bg transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Categories list */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiTag className="text-primary" /> Browse Categories
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'Movies', path: '/search?type=movies', icon: FiFilm, bg: 'bg-amber-50 text-amber-700 border-amber-100' },
                { name: 'Concerts', path: '/search?query=concert', icon: FiActivity, bg: 'bg-purple-50 text-purple-700 border-purple-100' },
                { name: 'Standup Comedy', path: '/search?query=comedy', icon: FiActivity, bg: 'bg-green-50 text-green-700 border-green-100' },
                { name: 'Plays & Theatre', path: '/search?query=theatre', icon: FiActivity, bg: 'bg-blue-50 text-blue-700 border-blue-100' }
              ].map((item, idx) => (
                <Link key={idx} to={item.path}>
                  <Card className={`p-4 border flex flex-col items-center justify-center gap-3 text-center cursor-pointer ${item.bg}`}>
                    <item.icon size={24} />
                    <span className="font-extrabold text-sm">{item.name}</span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-text-primary">
            Search Results for "{query}" <span className="text-sm font-semibold text-text-secondary">({totalResults} items found)</span>
          </h2>

          {totalResults > 0 ? (
            <div className="space-y-8">
              {/* Movies results */}
              {filteredMovies.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                    <FiFilm className="text-primary" /> Movies ({filteredMovies.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredMovies.map(movie => (
                      <Card key={movie.id} className="p-0 overflow-hidden flex flex-col justify-between" hoverable>
                        <div className="h-44 bg-gray-100 relative">
                          <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                          <span className="absolute bottom-3 left-3 bg-primary text-text-primary text-xs font-bold px-2 py-0.5 rounded-lg shadow-sm">
                            ★ 9.0
                          </span>
                        </div>
                        <div className="p-4 space-y-2">
                          <h4 className="font-bold text-text-primary truncate">{movie.title}</h4>
                          <p className="text-xs text-text-secondary font-semibold">{movie.language} • {movie.genre}</p>
                        </div>
                        <div className="p-4 pt-0 border-t border-border/50 flex justify-end">
                          <Link to={`/movie/${movie.id}`}>
                            <Button size="sm" variant="primary">Book Now</Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Events results */}
              {filteredEvents.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                    <FiCalendar className="text-primary" /> Events ({filteredEvents.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredEvents.map(event => (
                      <Card key={event.id} className="p-0 overflow-hidden flex flex-col justify-between" hoverable>
                        <div className="h-40 bg-gray-100">
                          <img src={event.banner || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500'} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4 space-y-2">
                          <h4 className="font-bold text-text-primary truncate">{event.title}</h4>
                          <p className="text-xs text-text-secondary font-semibold">{event.venue}</p>
                        </div>
                        <div className="p-4 pt-0 border-t border-border/50 flex justify-end">
                          <Link to={`/event/${event.id}`}>
                            <Button size="sm" variant="secondary">Book Passes</Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Theatres results */}
              {filteredTheatres.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                    <FiMapPin className="text-primary" /> Theatres ({filteredTheatres.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredTheatres.map(theatre => {
                      const cityName = citiesList.find(c => c.id === theatre.city_id)?.city_name || '';
                      return (
                        <Card key={theatre.id} className="p-5 flex justify-between items-center gap-4">
                          <div>
                            <h4 className="font-bold text-text-primary">{theatre.theatre_name}</h4>
                            <p className="text-xs text-text-secondary mt-1">{theatre.address}, {cityName}</p>
                          </div>
                          <Link to="/">
                            <Button size="sm" variant="secondary">Select</Button>
                          </Link>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="No matches found"
              description="Try adjusting your keywords, searching for genre names, languages, or other locations."
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
