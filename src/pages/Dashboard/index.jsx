import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar'
import DashboardHeader from '../../components/DashboardHeader';
import EmptyState from '../../components/EmptyState';
import TripCard from '../../components/TripCard';
import CreateTripModal from '../../components/CreateTripModal';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // API States
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Trip Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budgetType, setBudgetType] = useState('Medium');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [creatingTrip, setCreatingTrip] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Interest options
  const interestOptions = ['Food', 'Culture', 'Adventure', 'Shopping', 'Nature'];

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch all trips for user
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = Cookies.get('jwt_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/trips`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setTrips(data.trips || []);
      } else {
        throw new Error(data.message || 'Failed to fetch trips');
      }
    } catch (err) {
      console.error('Fetch trips error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate, API_URL, logout]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Loading messages loop during AI generation
  useEffect(() => {
    let interval;
    if (creatingTrip) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [creatingTrip]);

  const getLoadingMessage = () => {
    switch (loadingStep) {
      case 0: return "Consulting our LLM travel agent...";
      case 1: return "Drafting customized day-by-day activities...";
      case 2: return "Estimating flights, lodging, and dining budgets...";
      case 3: return "Selecting popular local hotels and rating tiers...";
      default: return "Structuring your dream travel itinerary...";
    }
  };

  // Toggle interests selection
  const handleInterestChange = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Handle trip submission
  const handleCreateTripSubmit = async (e) => {
    e.preventDefault();
    if (!destination.trim() || !days) return;

    setCreatingTrip(true);
    setError(null);
    setLoadingStep(0);

    try {
      const token = Cookies.get('jwt_token');
      const response = await fetch(`${API_URL}/api/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          destination: destination.trim(),
          days: Number(days),
          budgetType,
          interests: selectedInterests
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsModalOpen(false);
        // Reset form
        setDestination('');
        setDays(3);
        setBudgetType('Medium');
        setSelectedInterests([]);
        // Navigate to details page
        navigate(`/trip/${data.trip._id}`);
      } else {
        throw new Error(data.message || 'Failed to generate itinerary');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Network error generating trip.');
      setCreatingTrip(false);
    }
  };

  // Delete trip
  const handleDeleteTrip = async (e, tripId) => {
    e.preventDefault(); // Stop navigation click
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
      return;
    }

    try {
      const token = Cookies.get('jwt_token');
      const response = await fetch(`${API_URL}/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTrips(prevTrips => prevTrips.filter(t => t._id !== tripId));
      } else {
        alert(data.message || 'Failed to delete trip');
      }
    } catch (err) {
      console.error(err);
      alert('Network error deleting trip.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <Navbar handleLogout={handleLogout} />

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header Hero Section */}
        <DashboardHeader onCreateTrip={() => setIsModalOpen(true)} />


        {/* Error Banner */}
        {error && (
          <div
            className="state-container error-state"
            role="alert"
          >
            <h3 className="error-title">
              Failed to complete request
            </h3>

            <p className="error-text">
              {error}
            </p>

            <button
              className="btn-retry"
              onClick={fetchTrips}
            >
              Retry Loading Dashboard
            </button>
          </div>
        )}

        {/* Loading Spinner for listing trips */}
        {loading && trips.length === 0 && (
          <div className="state-container loading-state">
            <div className="spinner"></div>
            <p>Loading your trips...</p>
          </div>
        )}

        {/* Trips Grid */}
        {!loading && trips.length === 0 ? (
          
          <EmptyState onCreateTrip={() => setIsModalOpen(true)} />
        ) : (
          <div
          className={`overview-grid ${
            trips.length > 0
              ? 'overview-grid-visible'
              : 'overview-grid-hidden'
          }`}>
            {trips.map((trip) => (

              <TripCard
                key={trip._id}
                trip={trip}
                onDelete={handleDeleteTrip}
                onView={() => navigate(`/trip/${trip._id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* CREATE TRIP MODAL */}
      {isModalOpen && (
          <CreateTripModal
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateTripSubmit}
            creatingTrip={creatingTrip}
            loadingMessage={getLoadingMessage()}
            destination={destination}
            setDestination={setDestination}
            days={days}
            setDays={setDays}
            budgetType={budgetType}
            setBudgetType={setBudgetType}
            interestOptions={interestOptions}
            selectedInterests={selectedInterests}
            handleInterestChange={handleInterestChange}
        />
      )}
    </div>
  );
};

export default Dashboard;
