import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useAuth } from '../context/AuthContext';
import { 
  FiLogOut, 
  FiPlus, 
  FiTrash2, 
  FiCalendar, 
  FiMapPin, 
  FiCompass, 
  FiAlertCircle, 
  FiX
} from 'react-icons/fi';

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

  const API_URL = process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

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

      const response = await fetch(`${API_URL}/trips`, {
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
      const response = await fetch(`${API_URL}/trips`, {
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
      const response = await fetch(`${API_URL}/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTrips(trips.filter(t => t._id !== tripId));
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
      <header className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="navbar-brand-link">
            ✈️ TravelAgent AI
          </Link>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <FiLogOut className="nav-icon" /> Log out
        </button>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header Hero Section */}
        <section className="dashboard-header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 className="dashboard-title">Your Travel Dashboard</h1>
            <p className="dashboard-subtitle">
              Plan new destinations and manage your tailored day-by-day itineraries.
            </p>
          </div>
          <button className="btn-copy" style={{ background: 'var(--accent-gradient)', color: '#fff', padding: '12px 24px', borderRadius: 'var(--border-radius)', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' }} onClick={() => setIsModalOpen(true)}>
            <FiPlus /> Plan New Trip
          </button>
        </section>

        {/* Error Banner */}
        {error && (
          <div className="state-container error-state" role="alert" style={{ marginBottom: '30px' }}>
            <FiAlertCircle className="error-state-icon" />
            <h3>Failed to complete request</h3>
            <p className="error-text">{error}</p>
            <button className="btn-retry" onClick={fetchTrips}>
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
          <div className="state-container" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '20px', padding: '60px 40px', textAlign: 'center', backdropFilter: 'blur(16px)', animation: 'fadeIn 0.5s ease-out' }}>
            <FiCompass style={{ fontSize: '4rem', color: 'var(--accent-color)', marginBottom: '20px', opacity: '0.8' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '10px' }}>No Trips Planned Yet</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 30px auto' }}>
              Where would you like to explore next? Enter your preferences and let our AI create a custom travel guide for you.
            </p>
            <button className="btn-copy" style={{ background: 'var(--accent-gradient)', color: '#fff', padding: '12px 28px', borderRadius: 'var(--border-radius)', fontWeight: '600', border: 'none', cursor: 'pointer' }} onClick={() => setIsModalOpen(true)}>
              Plan Your First Trip
            </button>
          </div>
        ) : (
          <div className="overview-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px', display: trips.length > 0 ? 'grid' : 'none' }}>
            {trips.map((trip) => (
              <div key={trip._id} className="metric-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '20px', padding: '0', display: 'flex', flexDirection: 'column', cursor: 'pointer', overflow: 'hidden', height: '100%', transition: 'var(--transition)' }} onClick={() => navigate(`/trip/${trip._id}`)}>
                {/* Visual Header */}
                <div style={{ background: 'linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.7)), #1e1b4b', padding: '24px', position: 'relative', minHeight: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <span style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '0.8rem', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', background: trip.budgetType === 'Low' ? 'var(--success-bg)' : trip.budgetType === 'Medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(139, 92, 246, 0.25)', color: trip.budgetType === 'Low' ? 'var(--success-color)' : trip.budgetType === 'Medium' ? '#f59e0b' : '#a78bfa', border: trip.budgetType === 'Low' ? '1px solid var(--success-color)' : trip.budgetType === 'Medium' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(139, 92, 246, 0.4)' }}>
                    {trip.budgetType} Budget
                  </span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.5)', marginBottom: '4px' }}>
                    {trip.destination}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <FiCalendar /> <span>{trip.days} Days</span>
                  </div>
                </div>

                {/* Details Section */}
                <div style={{ padding: '20px', flexGrow: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                  {/* Interests Tags */}
                  <div>
                    <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '8px' }}>Interests</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {trip.interests && trip.interests.length > 0 ? (
                        trip.interests.map(interest => (
                          <span key={interest} style={{ fontSize: '0.75rem', padding: '3px 8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                            {interest}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>General Sightseeing</span>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Action Split */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Cost</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--success-color)' }}>
                        ${trip.estimatedBudget?.total || 0}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-copy" style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)' }} onClick={(e) => handleDeleteTrip(e, trip._id)} title="Delete Trip">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE TRIP MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(5, 7, 12, 0.8)', backdropFilter: 'blur(8px)', zIndex: '100', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-lg)', borderRadius: '24px', width: '100%', maxWidth: '520px', padding: '32px', position: 'relative', animation: 'fadeIn 0.4s ease-out' }}>
            
            {/* Modal Loading Cover */}
            {creatingTrip && (
              <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(17, 24, 39, 0.95)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center', zIndex: '10' }}>
                <div className="spinner" style={{ width: '50px', height: '50px', borderWidth: '5px', marginBottom: '25px' }}></div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '10px' }}>Generating Trip Itinerary</h2>
                <p style={{ color: 'var(--accent-color)', fontWeight: '600', animation: 'pulse 1.5s infinite', minHeight: '24px' }}>
                  {getLoadingMessage()}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '20px', maxWidth: '300px' }}>
                  This takes a few seconds as the AI curates coordinates, activity descriptions, and local dining locations.
                </p>
              </div>
            )}

            <button style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.3rem' }} onClick={() => setIsModalOpen(false)}>
              <FiX />
            </button>

            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.02em' }}>Plan a New AI Trip</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '28px' }}>
              Fill in your specifications and the AI travel agent will draft your travel plan.
            </p>

            <form onSubmit={handleCreateTripSubmit}>
              {/* Destination Input */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Where do you want to go?</label>
                <div className="input-wrapper">
                  <FiMapPin className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tokyo, Paris, Rome"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', width: '100%', padding: '12px 16px 12px 42px', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Days & Budget Flex Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    required
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', width: '100%', padding: '12px 16px', color: '#fff' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Budget Level</label>
                  <select
                    value={budgetType}
                    onChange={(e) => setBudgetType(e.target.value)}
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', width: '100%', padding: '12px 16px', color: '#fff', cursor: 'pointer' }}
                  >
                    <option value="Low">Low (Backpacker)</option>
                    <option value="Medium">Medium (Balanced)</option>
                    <option value="High">High (Luxury)</option>
                  </select>
                </div>
              </div>

              {/* Interests Checklist */}
              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '0.9rem' }}>Travel Interests</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {interestOptions.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button key={interest} type="button" onClick={() => handleInterestChange(interest)} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid', borderColor: isSelected ? 'var(--accent-color)' : 'var(--border-color)', background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '500', fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition)' }}>
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '12px 20px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', borderRadius: 'var(--border-radius)', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '12px 24px', border: 'none', background: 'var(--accent-gradient)', color: '#fff', borderRadius: 'var(--border-radius)', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}>
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
