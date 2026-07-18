import React from 'react';
import { FiCompass, FiShield, FiHeart, FiClock } from 'react-icons/fi';

const About = () => {
  return (
    <div className="container mx-auto px-4 md:px-8 py-24 min-h-screen text-left text-gray-900 bg-background">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black tracking-tight">
            About <span className="text-amber-500">TicketShow</span>
          </h1>
          <p className="text-xl text-gray-600 font-semibold max-w-2xl mx-auto">
            India's ultimate entertainment ticketing zone. Discover and book premium cinema shows, sports championships, concerts, and comedy performances instantly.
          </p>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl h-80 bg-gray-200">
          <img 
            src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200" 
            alt="about banner" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-8">
            <div className="text-white space-y-1">
              <h2 className="text-2xl font-black">Revolutionizing Live Entertainment</h2>
              <p className="text-sm font-semibold opacity-90">Seamless connections between ticketing screens and booking nodes since 2026.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-gray-800">Our Vision</h3>
            <p className="text-base text-gray-600 font-medium leading-relaxed">
              TicketShow was founded with a clear directive: to make booking event passes and cinema seating grids quick, transparent, and completely automated. By designing intuitive dashboards for screen owners and customers alike, we offer a world-class portal that powers local entertainment ticketing zones.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-gray-800">Why TicketShow?</h3>
            <p className="text-base text-gray-600 font-medium leading-relaxed">
              We leverage modern technology to safeguard user seat allocations, calculate transparent checkout packages, provide immediate digital ticket QR confirmations, and deliver robust developer metrics boards.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-gray-100">
          <div className="p-6 bg-white border border-gray-200 rounded-2xl text-center space-y-2">
            <FiCompass className="mx-auto text-amber-500" size={32} />
            <h4 className="font-extrabold text-sm text-gray-900">20+ Indian Cities</h4>
            <p className="text-xs text-gray-500 font-medium">Spanning ticketing zones nationwide.</p>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-2xl text-center space-y-2">
            <FiShield className="mx-auto text-amber-500" size={32} />
            <h4 className="font-extrabold text-sm text-gray-900">Secure Payments</h4>
            <p className="text-xs text-gray-500 font-medium">Fully encrypted gateway checkouts.</p>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-2xl text-center space-y-2">
            <FiHeart className="mx-auto text-amber-500" size={32} />
            <h4 className="font-extrabold text-sm text-gray-900">40+ Premium Catalog</h4>
            <p className="text-xs text-gray-500 font-medium">Handpicked shows and movies.</p>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-2xl text-center space-y-2">
            <FiClock className="mx-auto text-amber-500" size={32} />
            <h4 className="font-extrabold text-sm text-gray-900">24/7 Ticketing Support</h4>
            <p className="text-xs text-gray-500 font-medium">Dedicated support desk for entries.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
