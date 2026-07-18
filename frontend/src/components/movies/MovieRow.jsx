import React, { useState, useEffect } from'react';
import { motion } from'framer-motion';
import { Link } from'react-router-dom';
import { FiStar, FiAlertCircle } from'react-icons/fi';
import GlassButton from'../ui/GlassButton';

const FALLBACK_POSTER ='https://placehold.co/300x450/1a1a1a/ffffff?text=No+Poster';

const MovieRow = ({ title, fetchFunction }) => {
 const [movies, setMovies] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
 let mounted = true;
 const fetchMovies = async () => {
 setLoading(true);
 try {
 const data = await fetchFunction();
 if (mounted) {
 setMovies(Array.isArray(data) ? data : data.data || []);
 }
 } catch (err) {
 if (mounted) setError('Failed to load movies.');
 } finally {
 if (mounted) setLoading(false);
 }
 };

 fetchMovies();
 return () => { mounted = false; };
 }, [fetchFunction]);

 if (loading) {
 return (
 <div className="py-10">
 <h2 className="text-3xl font-bold mb-6 px-4 md:px-8">{title}</h2>
 <div className="flex items-center justify-center h-48">
 <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
 </div>
 </div>
 );
 }

 if (error || movies.length === 0) {
 return null; // Don't show the row if there are no movies or an error
 }

 return (
 <section className="py-10">
 <div className="container mx-auto px-4 md:px-8">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-3xl font-bold">{title.split('')[0]} <span className="text-primary">{title.split('').slice(1).join('')}</span></h2>
 <Link to="/movies" className="text-primary hover:underline text-sm">View All</Link>
 </div>
 
 <div className="flex overflow-x-auto gap-6 pb-4 snap-x hide-scrollbar">
 {movies.map((movie, idx) => (
 <motion.div 
 key={movie.imdbID || movie.id || movie._id || idx}
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 transition={{ delay: Math.min(idx * 0.1, 0.5) }}
 className="group relative rounded-[14px] overflow-hidden cursor-pointer min-w-[200px] max-w-[200px] md:min-w-[260px] md:max-w-[260px] flex-shrink-0 snap-start transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
 >
 <Link to={`/movie/${movie.imdbID || movie.id || movie._id}`}>
 <div className="aspect-[2/3] overflow-hidden rounded-[14px] mb-4 relative bg-card">
 <img 
 src={movie.Poster !=='N/A' && movie.Poster ? movie.Poster : movie.poster || FALLBACK_POSTER} 
 alt={movie.Title || movie.title} 
 onError={(e) => { if (e.target.src !== FALLBACK_POSTER) e.target.src = FALLBACK_POSTER; }}
 className="w-full h-full object-cover transition-transform duration-300 ease-in-out"
 />
 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex items-center justify-center">
 <GlassButton variant="primary" className="scale-0 group-hover:scale-100 transition-transform duration-300 ease-in-out text-sm py-2 px-4">
 Watch Now
 </GlassButton>
 </div>
 </div>
 <h3 className="font-semibold text-base truncate mb-1 group-hover:text-primary transition-colors duration-300" title={movie.Title || movie.title}>
 {movie.Title || movie.title}
 </h3>
 <div className="flex items-center justify-between text-xs text-text-secondary">
 <span>{(movie.Genre || movie.genre ||'').split(',')[0] || (movie.Year || movie.year)}</span>
 <span className="flex items-center gap-1 text-primary">
 <FiStar className="fill-primary" size={12}/> {movie.imdbRating || movie.rating ||'N/A'}
 </span>
 </div>
 </Link>
 </motion.div>
 ))}
 </div>
 </div>
 </section>
 );
};

export default MovieRow;
