import React, { useState, useEffect } from'react';
import { motion } from'framer-motion';
import { Link } from'react-router-dom';
import { FiStar, FiFilter, FiAlertCircle } from'react-icons/fi';
import GlassCard from'../components/ui/GlassCard';
import GlassButton from'../components/ui/GlassButton';
import { getPopularMovies, getActionMovies, getComedyMovies, getDramaMovies, getScifiMovies, getHorrorMovies, getAnimationMovies } from'../services/movieService';

const FALLBACK_POSTER ='https://placehold.co/300x450/1a1a1a/ffffff?text=No+Poster';

const GENRES = [
 { id:'all', label:'All Popular', fetcher: getPopularMovies },
 { id:'action', label:'Action', fetcher: getActionMovies },
 { id:'comedy', label:'Comedy', fetcher: getComedyMovies },
 { id:'drama', label:'Drama', fetcher: getDramaMovies },
 { id:'scifi', label:'Sci-Fi', fetcher: getScifiMovies },
 { id:'horror', label:'Horror', fetcher: getHorrorMovies },
 { id:'animation', label:'Animation', fetcher: getAnimationMovies },
];

import { CITIES } from '../utils/constants';

const MoviesPage = () => {
 const [activeGenre, setActiveGenre] = useState('all');
 const [movies, setMovies] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 const [selectedState, setSelectedState] = useState(localStorage.getItem('selectedState') || '');
 const [selectedCityName, setSelectedCityName] = useState(() => {
   const cityId = localStorage.getItem('selectedCity') || '';
   const cityObj = CITIES.find(c => c.id === cityId);
   return cityObj ? cityObj.city_name : '';
 });

 useEffect(() => {
   const handleLocationChange = () => {
     const cityId = localStorage.getItem('selectedCity') || '';
     const cityObj = CITIES.find(c => c.id === cityId);
     setSelectedCityName(cityObj ? cityObj.city_name : '');
     setSelectedState(localStorage.getItem('selectedState') || '');
   };
   window.addEventListener('locationChanged', handleLocationChange);
   return () => window.removeEventListener('locationChanged', handleLocationChange);
 }, []);

 useEffect(() => {
 const fetchMovies = async () => {
 setLoading(true);
 setError(null);
 
 const genreObj = GENRES.find(g => g.id === activeGenre);
 
 try {
 const data = await genreObj.fetcher({ state: selectedState, city: selectedCityName });
 setMovies(Array.isArray(data) ? data : []);
 } catch (err) {
 setError('Failed to fetch movies. Please try again later.');
 } finally {
 setLoading(false);
 }
 };

 fetchMovies();
 }, [activeGenre, selectedState, selectedCityName]);

 return (
 <div className="container mx-auto px-4 md:px-8 py-12 min-h-screen">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
 <div>
 <h1 className="text-4xl font-bold mb-2">Explore <span className="text-primary">Movies</span></h1>
 <p className="text-text-gray">Discover the best movies playing right now.</p>
 </div>

 {/* Genre Filters */}
 <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
 <FiFilter className="text-primary mr-2" />
 {GENRES.map(genre => (
 <button
 key={genre.id}
 onClick={() => setActiveGenre(genre.id)}
 className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
 activeGenre === genre.id 
 ? 'bg-primary text-primary-text font-bold' 
 :'dark:bg-gray-900 bg-gray-50 hover:dark:bg-gray-800 bg-gray-100 dark:text-white text-gray-900 border dark:border-gray-700 border-gray-300'
 }`}
 >
 {genre.label}
 </button>
 ))}
 </div>
 </div>

 {loading ? (
 <div className="flex justify-center items-center h-64">
 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
 </div>
 ) : error ? (
 <div className="flex flex-col items-center justify-center h-64 text-center">
 <FiAlertCircle size={48} className="text-red-500 mb-4" />
 <p className="text-xl font-bold">{error}</p>
 </div>
 ) : movies.length > 0 ? (
 <>
 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
 {movies.map((movie, idx) => (
 <motion.div 
 key={movie.imdbID || movie.id || movie._id || idx}
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: Math.min(idx * 0.05, 0.3) }}
 className="group relative rounded-2xl overflow-hidden cursor-pointer"
 >
 <Link to={`/movie/${movie.imdbID || movie.id || movie._id}`}>
 <div className="aspect-[2/3] overflow-hidden rounded-2xl mb-4 relative dark:bg-gray-800 bg-white">
 <img 
 src={movie.Poster !=='N/A' && movie.Poster ? movie.Poster : movie.poster || FALLBACK_POSTER} 
 alt={movie.Title || movie.title} 
 onError={(e) => { if (e.target.src !== FALLBACK_POSTER) e.target.src = FALLBACK_POSTER; }}
 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
 />
 <div className="absolute inset-0 dark:bg-gray-900 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
 <GlassButton variant="primary" className="scale-0 group-hover:scale-100 transition-transform duration-300">
 View Details
 </GlassButton>
 </div>
 </div>
 <h3 className="font-semibold text-lg truncate mb-1 group-hover:text-primary transition-colors" title={movie.Title || movie.title}>
 {movie.Title || movie.title}
 </h3>
 <div className="flex items-center justify-between text-sm text-text-gray">
 <span>{(movie.Genre || movie.genre ||'').split(',')[0] || (movie.Year || movie.year)}</span>
 <span className="flex items-center gap-1 text-primary"><FiStar className="fill-primary" size={14}/> {movie.imdbRating || movie.rating ||'N/A'}</span>
 </div>
 </Link>
 </motion.div>
 ))}
 </div>
 
 {/* Pagination / Load More (Placeholder) */}
 <div className="flex justify-center mt-12">
 <GlassButton variant="secondary" className="px-8">
 Load More
 </GlassButton>
 </div>
 </>
 ) : (
 <div className="text-center py-20 dark:text-gray-400 text-gray-500">
 <p className="text-xl">No movies found for this category.</p>
 </div>
 )}
 </div>
 );
};

export default MoviesPage;
