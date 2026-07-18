import React from 'react';
import { Link } from 'react-router-dom';
import { FiTwitter, FiInstagram, FiFacebook, FiYoutube, FiGithub } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border pt-16 pb-8 mt-auto shadow-sm">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 text-left">
          <div className="md:col-span-1">
            <Link to="/" className="text-3xl font-black tracking-tighter text-amber-500 block mb-6">
              Ticket<span className="text-text-primary">Show</span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed mb-6 font-medium">
              Your premium destination for movie tickets, events, sports, and live concerts. Experience entertainment like never before.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:text-amber-500 hover:bg-amber-50 transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:text-amber-500 hover:bg-amber-50 transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:text-amber-500 hover:bg-amber-50 transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:text-amber-500 hover:bg-amber-50 transition-colors">
                <FiYoutube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-text-primary font-black mb-6 uppercase tracking-wider text-xs">Company</h4>
            <ul className="flex flex-col gap-4 text-sm text-text-secondary font-bold">
              <li><Link to="/about" className="hover:text-amber-500 transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-amber-500 transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-amber-500 transition-colors">Contact Us</Link></li>
              <li><Link to="/press" className="hover:text-amber-500 transition-colors">Press & Media</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-text-primary font-black mb-6 uppercase tracking-wider text-xs">Help & Support</h4>
            <ul className="flex flex-col gap-4 text-sm text-text-secondary font-bold">
              <li><Link to="/faq" className="hover:text-amber-500 transition-colors">FAQs</Link></li>
              <li><Link to="/terms" className="hover:text-amber-500 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-amber-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cancellation" className="hover:text-amber-500 transition-colors">Cancellation Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-text-primary font-black mb-6 uppercase tracking-wider text-xs">Newsletter</h4>
            <p className="text-text-secondary text-sm mb-4 font-semibold">Subscribe to our newsletter to get latest updates and offers.</p>
            <div className="flex items-center gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-gray-50 border border-border rounded-xl px-4 py-2.5 w-full text-sm text-text-primary focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
              />
              <button className="bg-amber-400 hover:bg-amber-500 text-text-primary px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-text-secondary text-sm font-semibold">
            &copy; {new Date().getFullYear()} TicketShow. All rights reserved.
          </p>
          
          {/* GitHub badge & links */}
          <div className="flex items-center gap-6 text-sm text-text-secondary font-bold flex-wrap">
            <a 
              href="https://github.com/GeginRisho/Ticket-Booking" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-amber-500 transition-colors flex items-center gap-1.5"
            >
              <FiGithub size={16} />
              <span>⭐ GitHub Repository</span>
            </a>
            <a 
              href="https://github.com/GeginRisho/Ticket-Booking/issues" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-amber-500 transition-colors flex items-center gap-1"
            >
              <span>🐞 Report Issue</span>
            </a>
            <a 
              href="https://github.com/GeginRisho/Ticket-Booking#readme" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-amber-500 transition-colors flex items-center gap-1"
            >
              <span>📄 Documentation</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
