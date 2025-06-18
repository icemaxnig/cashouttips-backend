import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DashboardRolloverWidget Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 rounded-xl p-6">
          <div className="text-red-600 text-center">
            <p className="font-medium">Something went wrong loading the rollover plans.</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 text-sm text-red-500 hover:text-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const DashboardRolloverWidget = () => {
  const [plans, setPlans] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/rollover/plans');
      
      // Ensure we have the correct data structure
      if (response?.data?.plans && Array.isArray(response.data.plans)) {
        // Ensure each plan has the required properties
        const validPlans = response.data.plans.filter(plan => 
          plan && 
          typeof plan === 'object' && 
          plan._id && 
          plan.name && 
          plan.cta && 
          plan.cta.link && 
          plan.cta.text
        );
        
        setPlans(validPlans);
        setMetadata(response.data.metadata || {});
        setCountdown(response.data.metadata?.timeUntilNext || 0);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching rollover plans:', error);
      setError('Failed to load rollover plans');
      setPlans([]); // Reset plans to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      if (mounted) {
        await fetchPlans();
      }
    };
    
    fetchData();
    
    // Update countdown every second
    const countdownInterval = setInterval(() => {
      if (mounted) {
        setCountdown(prev => {
          if (prev <= 1) {
            fetchPlans(); // Fetch new plans when countdown reaches 0
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(countdownInterval);
    };
  }, []);

  const formatTime = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const PlanCard = ({ plan }) => {
    if (!plan || typeof plan !== 'object') return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">{plan.name || 'Unnamed Plan'}</h3>
          <span className="text-sm text-gray-500">Next rotation in {formatTime(countdown)}</span>
        </div>

        <div className="space-y-2 mb-4">
          {plan.metadata && typeof plan.metadata === 'object' && 
            Object.entries(plan.metadata).map(([key, value]) => (
              <div key={key} className="flex items-center text-sm text-gray-600">
                <span className="font-medium">{value}</span>
              </div>
            ))
          }
        </div>

        {plan.cta && plan.cta.link && plan.cta.text && (
          <button
            onClick={() => navigate(plan.cta.link)}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors
              ${plan.cta.type === 'subscribe' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            {plan.cta.text}
          </button>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-6">
        <div className="text-red-600 text-center">
          <p className="font-medium">{error}</p>
          <button 
            onClick={fetchPlans}
            className="mt-2 text-sm text-red-500 hover:text-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(plans) || plans.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="text-center text-gray-500">
          <p>No rollover plans available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
          {metadata && typeof metadata === 'object' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${(metadata.currentSlot / Math.ceil(metadata.totalPlans / 4)) * 100}%`
                }}
              />
            </div>
          )}

          {/* Plans grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="wait">
              {plans.map((plan) => (
                <PlanCard key={plan._id || Math.random()} plan={plan} />
              ))}
            </AnimatePresence>
          </div>

          {/* Tooltip */}
          <div className="mt-4 text-sm text-gray-500 text-center">
            Plans rotate every 5 minutes to show different options
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DashboardRolloverWidget; 