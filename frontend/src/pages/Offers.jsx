import React, { useState, useEffect } from 'react';
import { getCoupons } from '../services/couponService';
import { FiPercent, FiCopy, FiCheckCircle } from 'react-icons/fi';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

const Offers = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');

  const [locationTrigger, setLocationTrigger] = useState(0);

  useEffect(() => {
    const handleLocationChange = () => {
      setLocationTrigger(prev => prev + 1);
    };
    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, []);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await getCoupons();
        setCoupons(Array.isArray(res) ? res : []);
      } catch (err) {
        toast.error('Failed to load active promotions');
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [locationTrigger]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied!`);
    setTimeout(() => setCopiedCode(''), 3000);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-24 min-h-screen text-left">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-2">
          Exclusive <span className="text-amber-500">Offers</span> & Coupons
        </h1>
        <p className="text-gray-600 font-semibold">
          Unlock the best ticket pricing deals, cashbacks, and flat discount offers.
        </p>
      </div>

      {loading ? (
        <Loader type="chart" />
      ) : coupons.length === 0 ? (
        <EmptyState title="No Promotions Active" message="Currently there are no active discount coupons available. Check back soon!" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coupons.map((coupon) => (
            <div 
              key={coupon.id} 
              className="bg-white border border-gray-200 rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 to-amber-500" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                    <FiPercent size={24} />
                  </div>
                  <div>
                    <span className="bg-amber-400/20 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      {coupon.discount_type} Discount
                    </span>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                    </h3>
                  </div>
                </div>

                <p className="text-sm font-semibold text-gray-600">
                  Save flat {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`} on your order. Applies on minimum purchases of ₹{coupon.min_order_amount || 150}.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="bg-gray-100 border border-dashed border-gray-300 rounded-xl px-4 py-2 font-mono font-black text-gray-800 tracking-wider text-sm select-all">
                  {coupon.coupon_code}
                </div>
                <button
                  onClick={() => handleCopyCode(coupon.coupon_code)}
                  className="flex items-center gap-1.5 font-bold text-xs bg-amber-400 hover:bg-amber-500 text-gray-900 px-4 py-2 rounded-xl transition-colors shadow-xs"
                >
                  {copiedCode === coupon.coupon_code ? (
                    <>
                      <FiCheckCircle />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <FiCopy />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Offers;
