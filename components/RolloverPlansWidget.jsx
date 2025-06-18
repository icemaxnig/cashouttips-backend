import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../cot-frontend/src/api';

const RolloverPlansWidget = () => {
  const [plans, setPlans] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rollover/plans');
      const { plans: newPlans, metadata: newMetadata } = response.data;
      
      setPlans(newPlans);
      setMetadata(newMetadata);
      setCountdown(newMetadata.timeUntilNext);
    } catch (error) {
      console.error('Error fetching rollover plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    
    // Update countdown every second
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchPlans(); // Fetch new plans when countdown reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const PlanCard = ({ plan }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
        <span className="text-sm text-gray-500">Next rotation in {formatTime(countdown)}</span>
      </div>

      <div className="space-y-2 mb-4">
        {Object.entries(plan.metadata).map(([key, value]) => (
          <div key={key} className="flex items-center text-sm text-gray-600">
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate(plan.cta.link)}
        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors
          ${plan.cta.type === 'subscribe' 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gray-600 hover:bg-gray-700'}`}
      >
        {plan.cta.text}
      </button>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🔥 Popular Rollover Plans</h2>
        <button
          onClick={() => navigate('/rollover-plans')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          View All Plans
        </button>
      </div>

      <div className="relative">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
            style={{
              width: `${(metadata.currentSlot / Math.ceil(metadata.totalPlans / 4)) * 100}%`
            }}
          />
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="wait">
            {plans.map((plan) => (
              <PlanCard key={plan._id} plan={plan} />
            ))}
          </AnimatePresence>
        </div>

        {/* Tooltip */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          Plans rotate every 5 minutes to show different options
        </div>
      </div>
    </div>
  );
};

export default RolloverPlansWidget; 