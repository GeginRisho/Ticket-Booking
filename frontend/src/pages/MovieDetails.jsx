import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiStar, FiClock, FiPlay, FiHeart, FiMapPin, FiMessageSquare } from 'react-icons/fi';
import ReactPlayer from 'react-player';
import { useAuth } from '../context/AuthContext';
import { getMovieDetails } from '../services/movieService';
import { getShows } from '../services/showService';
import { addToWishlist } from '../services/wishlistService';
import { getMovieReviews, createReview } from '../services/reviewService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import useDocumentTitle from '../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [movie, setMovie] = useState(null);
  useDocumentTitle(movie?.title ? movie.title : 'Movie Details', movie?.description?.text || movie?.description);
  const [shows, setShows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  // Review inputs
  const [rating, setRating] = useState('10');
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const activeCityId = localStorage.getItem('selectedCity') || '';

  const loadDetails = async () => {
    setLoading(true);
    try {
      const [movieRes, showsRes, reviewsRes] = await Promise.all([
        getMovieDetails(id),
        getShows({ movie_id: id }),
        getMovieReviews(id)
      ]);
      setMovie(movieRes.data?.movie || movieRes.movie || movieRes);
      
      const showsList = Array.isArray(showsRes) ? showsRes : [];
      setShows(showsList);
      
      // Determine unique dates from shows in active city, or fallback to all shows for this movie
      let cityShows = showsList.filter(s => s.screen?.theatre?.city_id === activeCityId);
      if (cityShows.length === 0) {
        cityShows = showsList;
      }
      const uniqueDates = [...new Set(cityShows.map(s => s.show_date))].filter(Boolean).sort();
      if (uniqueDates.length > 0) {
        setSelectedDate(uniqueDates[0]);
      }

      setReviews(Array.isArray(reviewsRes) ? reviewsRes : []);
    } catch (err) {
      toast.error('Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
    window.scrollTo(0, 0);
  }, [id, activeCityId]);

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add to wishlist');
      return navigate('/login');
    }
    setWishlistLoading(true);
    try {
      await addToWishlist({ movie_id: id });
      toast.success('Added to wishlist!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Already in wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to write reviews');
      return navigate('/login');
    }
    setIsSubmittingReview(true);
    try {
      await createReview(id, {
        rating: parseInt(rating, 10),
        review: reviewText
      });
      toast.success('Review submitted successfully');
      setReviewText('');
      // Reload reviews
      const reviewsRes = await getMovieReviews(id);
      setReviews(reviewsRes.data || reviewsRes || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  // Group shows in active city by theatre for selected date
  let activeShowsList = shows.filter(s => s.screen?.theatre?.city_id === activeCityId);
  if (activeShowsList.length === 0) {
    activeShowsList = shows;
  }
  const showDates = [...new Set(activeShowsList.map(s => s.show_date))].filter(Boolean).sort();
  const effectiveDate = selectedDate || showDates[0];
  const filteredShows = activeShowsList.filter(s => s.show_date === effectiveDate);
  
  // Grouping structure: { theatreName: [shows] }
  const groupedShows = {};
  filteredShows.forEach(show => {
    const tName = show.screen?.theatre?.theatre_name || 'Partner Cinema';
    if (!groupedShows[tName]) {
      groupedShows[tName] = [];
    }
    groupedShows[tName].push(show);
  });

  const descObj = (() => {
    try {
      const parsed = JSON.parse(movie.description);
      if (parsed && typeof parsed === 'object') {
        return {
          text: parsed.text || '',
          thumbnail: parsed.thumbnail || '',
          gallery: parsed.gallery || []
        };
      }
    } catch (e) {}
    return { text: movie.description || '', thumbnail: '', gallery: [] };
  })();

  return (
    <div className="bg-background min-h-screen text-text-primary text-left">
      {/* Banner / Poster Hero */}
      <section 
        className="relative h-[45vh] bg-cover bg-center border-b border-border"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(248,249,250,0.3) 0%, rgba(248,249,250,0.95) 100%), url(${movie.banner || movie.poster})` }}
      >
        <div className="absolute inset-0 bg-white/10" />
      </section>

      {/* Main Metadata container */}
      <div className="container mx-auto px-4 md:px-8 mt-[-18vh] relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Movie Poster */}
          <div className="w-52 md:w-64 rounded-3xl overflow-hidden shadow-md border border-border bg-white flex-shrink-0 mx-auto md:mx-0 relative group">
            <img 
              src={movie.poster || FALLBACK_POSTER} 
              alt={movie.title} 
              className="w-full object-cover min-h-[280px]"
            />
            {movie.trailer_url && (
              <div 
                onClick={() => setIsTrailerPlaying(true)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <div className="w-14 h-14 bg-primary text-text-primary rounded-full flex items-center justify-center shadow-md">
                  <FiPlay size={20} className="ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Texts Info */}
          <div className="flex-grow space-y-4 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-text-primary">
              {movie.title}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap text-sm font-semibold text-text-secondary">
              <span className="flex items-center gap-1 text-primary">
                <FiStar className="fill-primary" /> 9.0/10
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 border border-border rounded text-xs uppercase">{movie.age_rating}</span>
              <span>•</span>
              <span>{movie.duration} mins</span>
              <span>•</span>
              <span>{movie.language}</span>
            </div>
            <p className="text-sm md:text-base text-text-secondary max-w-2xl leading-relaxed">
              {descObj.text}
            </p>

            <div className="flex justify-center md:justify-start gap-3 pt-2">
              <Button 
                variant="primary" 
                onClick={() => {
                  const target = document.getElementById('tickets-booking-box');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Book Tickets
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleAddToWishlist}
                isLoading={wishlistLoading}
                className="flex items-center gap-1.5"
              >
                <FiHeart />
                <span>Wishlist</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content Tabs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-16">
          {/* Left Columns (Schedules, Cast) */}
          <div className="lg:col-span-2 space-y-12">
            {/* Show Schedule box */}
            <Card id="tickets-booking-box" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-extrabold text-text-primary">Select Showtime</h2>
              
              {/* Date selection chips */}
              {showDates.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {showDates.map(date => {
                    const formatted = new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all whitespace-nowrap ${
                          selectedDate === date
                            ? 'bg-primary border-primary text-text-primary'
                            : 'border-border bg-white text-text-secondary hover:bg-hover-bg'
                        }`}
                      >
                        {formatted}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">No shows scheduled for this movie currently in your city.</p>
              )}

              {/* Timing grids grouped by Theatre */}
              <div className="divide-y divide-border pt-4">
                {Object.keys(groupedShows).length > 0 ? (
                  Object.entries(groupedShows).map(([theatreName, list]) => (
                    <div key={theatreName} className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="sm:w-1/3">
                        <h4 className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                          <FiMapPin className="text-primary flex-shrink-0" />
                          <span>{theatreName}</span>
                        </h4>
                        <p className="text-xs text-text-secondary mt-1">{list[0]?.screen?.theatre?.address}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:w-2/3">
                        {list.map(s => (
                          <button
                            key={s.id}
                            onClick={() => {
                              if (!isAuthenticated) {
                                toast.error('Please sign in to book tickets');
                                navigate('/login', { state: { from: { pathname: `/book-seat/${s.id}` } } });
                              } else {
                                navigate(`/book-seat/${s.id}`);
                              }
                            }}
                            className="px-4 py-2 text-xs font-bold rounded-xl border border-border hover:border-primary bg-white hover:bg-hover-bg text-primary transition-all"
                          >
                            {s.start_time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  showDates.length > 0 && <p className="text-sm text-text-secondary pt-4">Please select a date to browse show timings.</p>
                )}
              </div>
            </Card>

            {/* Cast circular list */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-extrabold text-text-primary">Cast members</h3>
                <div className="flex flex-wrap gap-6">
                  {movie.cast.map(c => (
                    <div key={c.id} className="flex flex-col items-center space-y-2">
                      <div className="w-20 h-20 rounded-full overflow-hidden border border-border bg-gray-100">
                        <img 
                          src={c.cast_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                          alt={c.cast_name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold text-text-primary">{c.cast_name}</span>
                      <span className="text-[10px] text-text-secondary leading-none">{c.role_in_movie}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Images block */}
            {descObj.gallery && descObj.gallery.length > 0 && (
              <div className="space-y-6 pt-6">
                <h3 className="text-2xl font-extrabold text-text-primary">Movie Showcase & Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {descObj.gallery.map((img, idx) => (
                    <div key={idx} className="aspect-video rounded-2xl overflow-hidden border border-border bg-gray-100 group relative">
                      <img src={img} alt={`Showcase ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Reviews) */}
          <div className="space-y-6">
            <h3 className="text-2xl font-extrabold text-text-primary">Reviews & Ratings</h3>
            
            {/* Submit review */}
            {isAuthenticated ? (
              <Card className="space-y-4">
                <h4 className="font-bold text-sm text-text-primary">Write a Review</h4>
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-text-secondary">Rating Score</span>
                    <select
                      value={rating}
                      onChange={e => setRating(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-border bg-white font-bold focus:outline-none"
                    >
                      {[10,9,8,7,6,5,4,3,2,1].map(n => (
                        <option key={n} value={n}>{n}/10 Stars</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    placeholder="Tell us what you liked/disliked about the movie..."
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    required
                  />
                  <Button type="submit" variant="primary" className="w-full text-xs font-bold" isLoading={isSubmittingReview}>
                    Submit Review
                  </Button>
                </form>
              </Card>
            ) : (
              <Card className="text-center py-6 text-sm text-text-secondary">
                <FiMessageSquare size={24} className="mx-auto text-primary mb-2 animate-bounce" />
                <p>Please <Link to="/login" className="font-bold text-primary hover:underline">Sign In</Link> to submit movie reviews.</p>
              </Card>
            )}

            {/* List reviews */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map(r => (
                  <Card key={r.id} className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary flex items-center justify-center font-bold text-xs text-primary">
                          {(r.user?.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-text-primary">{r.user?.full_name || 'Reviewer'}</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-primary font-bold">
                        <FiStar className="fill-primary" size={12} />
                        <span>{r.rating}/10</span>
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed font-medium">
                      {r.review}
                    </p>
                  </Card>
                ))
              ) : (
                <EmptyState
                  title="No reviews yet"
                  description="Be the first to share your thoughts on this movie!"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {isTrailerPlaying && movie.trailer_url && (
        <Modal
          isOpen={isTrailerPlaying}
          onClose={() => setIsTrailerPlaying(false)}
          title={`${movie.title} - Official Trailer`}
          size="xl"
        >
          <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-border">
            <ReactPlayer url={movie.trailer_url} width="100%" height="100%" controls playing />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MovieDetails;
