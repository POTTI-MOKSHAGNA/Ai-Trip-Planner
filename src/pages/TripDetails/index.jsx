import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useAuth } from '../../context/AuthContext';

const TripDetails = () => {
  const { id } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // API States
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab State
  const [activeDay, setActiveDay] = useState(1);

  // Add Activity Form State
  const [actTime, setActTime] = useState('Morning');
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [showAddActForm, setShowAddActForm] = useState(false);

  // Regenerate Day State
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [regenRequest, setRegenRequest] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  // Expense Tracker Form State
  const [expCategory, setExpCategory] = useState('Food');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch Trip Details
  const fetchTrip = useCallback(async () => {
    try {
      const token = Cookies.get('jwt_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/trips/${id}`, {
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
        setTrip(data.trip);
      } else {
        throw new Error(data.message || 'Failed to retrieve trip data');
      }
    } catch (err) {
      console.error('Fetch trip detail error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, navigate, API_URL, logout]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  // Set default expense date once trip loads
  useEffect(() => {
    if (trip) {
      const today = new Date().toISOString().split('T')[0];
      setExpDate(today);
    }
  }, [trip]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Direct Itinerary Modification Helper (sends updated itinerary to backend)
  const saveItinerary = async (updatedItinerary) => {
    try {
      const token = Cookies.get('jwt_token');
      const response = await fetch(`${API_URL}/trips/${id}/itinerary`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itinerary: updatedItinerary })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTrip(data.trip);
      } else {
        alert(data.message || 'Failed to update itinerary');
      }
    } catch (err) {
      console.error('Save itinerary error:', err);
      alert('Network error saving changes.');
    }
  };

  // Add custom activity
  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!actTitle.trim()) return;

    const updatedItinerary = [...trip.itinerary];
    const dayObj = updatedItinerary.find(d => d.day === activeDay);
    
    if (dayObj) {
      dayObj.activities.push({
        time: actTime,
        title: actTitle.trim(),
        description: actDesc.trim()
      });
      // Sort activities roughly: Morning first, Afternoon second, Evening third
      const timeOrder = { 'Morning': 0, 'Afternoon': 1, 'Evening': 2 };
      dayObj.activities.sort((a, b) => (timeOrder[a.time] ?? 3) - (timeOrder[b.time] ?? 3));
      
      saveItinerary(updatedItinerary);
      // Reset form
      setActTitle('');
      setActDesc('');
      setShowAddActForm(false);
    }
  };

  // Delete activity
  const handleDeleteActivity = (dayNum, activityId) => {
    if (!window.confirm("Delete this activity?")) return;

    const updatedItinerary = [...trip.itinerary];
    const dayObj = updatedItinerary.find(d => d.day === dayNum);
    if (dayObj) {
      dayObj.activities = dayObj.activities.filter(act => act._id !== activityId);
      saveItinerary(updatedItinerary);
    }
  };

  // Regenerate Day using AI
  const handleRegenerateDaySubmit = async (e) => {
    e.preventDefault();
    if (!regenRequest.trim()) return;

    setRegenerating(true);
    try {
      const token = Cookies.get('jwt_token');
      const response = await fetch(`${API_URL}/trips/${id}/regenerate-day`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          day: activeDay,
          userRequest: regenRequest.trim()
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTrip(data.trip);
        setShowRegenModal(false);
        setRegenRequest('');
      } else {
        alert(data.message || 'Failed to regenerate day');
      }
    } catch (err) {
      console.error(err);
      alert('Network error regenerating day.');
    } finally {
      setRegenerating(false);
    }
  };

  // Log Expense
  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expAmount || Number(expAmount) <= 0) return;

    try {
      const token = Cookies.get('jwt_token');
      const response = await fetch(`${API_URL}/trips/${id}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: expCategory,
          amount: Number(expAmount),
          description: expDesc.trim(),
          date: expDate
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTrip(data.trip);
        // Reset inputs except category and date for consecutive logs
        setExpAmount('');
        setExpDesc('');
      } else {
        alert(data.message || 'Failed to log expense');
      }
    } catch (err) {
      console.error(err);
      alert('Network error logging expense.');
    }
  };

  // Delete logged expense
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Remove this logged expense?")) return;

    try {
      const token = Cookies.get('jwt_token');
      const response = await fetch(`${API_URL}/trips/${id}/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTrip(data.trip);
      } else {
        alert(data.message || 'Failed to delete expense');
      }
    } catch (err) {
      console.error(err);
      alert('Network error removing expense.');
    }
  };

  // EXPENSE CALCULATIONS & GRAPHICS METRICS
  const getExpensesByCategory = (category) => {
    if (!trip || !trip.expenses) return 0;
    return trip.expenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getActualTotal = () => {
    if (!trip || !trip.expenses) return 0;
    return trip.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const categories = ['Flights', 'Accommodation', 'Food', 'Activities'];

  if (loading) {
    return (
      <div className="dashboard-container">
        <header className="navbar">
          <div className="navbar-brand">
            <span className="navbar-brand-link">✈️ TravelAgent AI</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
             Log out
          </button>
        </header>
        <main className="dashboard-main">
          <div className="state-container loading-state">
            <div className="spinner"></div>
            <p>Retrieving your personalized itinerary details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="dashboard-container">
        <header className="navbar">
          <div className="navbar-brand">
            <Link to="/" className="navbar-brand-link">✈️ TravelAgent AI</Link>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
             Log out
          </button>
        </header>
        <main className="dashboard-main">
          <div className="state-container error-state">
            <h2>Trip Plan Not Found</h2>
            <p className="error-text">{error || 'This travel plan does not exist or you do not have permission to view it.'}</p>
            <Link to="/" className="btn-back" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'var(--accent-gradient)', color: '#fff', borderRadius: 'var(--border-radius)', textDecoration: 'none', fontWeight: '600', marginTop: '20px' }}>
                Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const activeDayObj = trip.itinerary.find(d => d.day === activeDay);

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <header className="navbar no-print">
        <div className="navbar-brand">
          <Link to="/" className="navbar-brand-link">✈️ TravelAgent AI</Link>
        </div>
        <nav className="navbar-nav" style={{ display: 'flex', gap: '20px' }}>
          <Link to="/" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             Home
          </Link>
        </nav>
        <button className="btn-logout" onClick={handleLogout}>
           Log out
        </button>
      </header>

      {/* Printable Header */}
      <div className="print-only" style={{ display: 'none', borderBottom: '2px solid #ccc', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#111827', margin: '0 0 10px 0' }}>{trip.destination} Travel Guide</h1>
        <p style={{ margin: '5px 0', fontSize: '1.1rem', color: '#4b5563' }}>
          <strong>Duration:</strong> {trip.days} Days &nbsp;|&nbsp; <strong>Budget Tier:</strong> {trip.budgetType}
        </p>
        <p style={{ margin: '5px 0', fontSize: '1.1rem', color: '#4b5563' }}>
          <strong>Interests:</strong> {trip.interests.join(', ') || 'General'}
        </p>
      </div>

      {/* Main Details Wrapper */}
      <main className="dashboard-main">
        {/* Back Link & Export Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }} className="no-print">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Back to Dashboard
          </Link>
          <button className="btn-copy" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: 'var(--border-radius)', cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => window.print()}>
             Print / Export PDF
          </button>
        </div>

        {/* Trip Hero Header */}
        <section style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '30px', marginBottom: '35px', backdropFilter: 'blur(16px)', animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-color)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                 <span>Itinerary</span>
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '8px' }}>{trip.destination}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <span>{trip.days} Days Trip</span>
                <span>•</span>
                <span style={{ fontSize: '0.9rem', padding: '3px 10px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '20px', color: 'var(--accent-color)', fontWeight: '500' }}>
                  {trip.budgetType} Budget
                </span>
              </p>
            </div>
            {/* Interests checklist summary */}
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>Selected Focus</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {trip.interests && trip.interests.length > 0 ? (
                  trip.interests.map(interest => (
                    <span key={interest} style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                      {interest}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sightseeing</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Grid: Itinerary & Hotel Suggestions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px', alignItems: 'start', marginBottom: '35px' }} className="details-split-grid">
          
          {/* 1. ITINERARY TIMELINE PANEL */}
          <section style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '30px', backdropFilter: 'blur(16px)', position: 'relative' }}>
            
            {/* Header with actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '25px' }} className="no-print">
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Daily Itinerary</h2>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-color)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', fontWeight: '600', cursor: 'pointer' }} onClick={() => setShowRegenModal(true)}>
                   Regenerate Day {activeDay}
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: '600', cursor: 'pointer' }} onClick={() => setShowAddActForm(!showAddActForm)}>
                   Add Activity
                </button>
              </div>
            </div>

            {/* Days Tabs (Selector) */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '25px', borderBottom: '1px solid var(--border-color)' }} className="no-print">
              {trip.itinerary.map(dayObj => (
                <button key={dayObj.day} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid', borderColor: activeDay === dayObj.day ? 'var(--accent-color)' : 'var(--border-color)', background: activeDay === dayObj.day ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.01)', color: '#fff', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'var(--transition)', flexShrink: '0' }} onClick={() => {
                  setActiveDay(dayObj.day);
                  setShowAddActForm(false);
                }}>
                  Day {dayObj.day}
                </button>
              ))}
            </div>

            {/* PRINT ALL DAYS DIRECTLY */}
            <div className="print-only" style={{ display: 'none' }}>
              {trip.itinerary.map(dayObj => (
                <div key={dayObj.day} style={{ pageBreakAfter: 'always', marginBottom: '40px' }}>
                  <h2 style={{ fontSize: '1.6rem', borderBottom: '1px solid #ddd', paddingBottom: '8px', color: '#111827', marginBottom: '20px' }}>
                    Day {dayObj.day}
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {dayObj.activities.map((act) => (
                      <div key={act._id} style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ minWidth: '100px', fontWeight: 'bold', color: 'var(--accent-color)' }}>{act.time}</div>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', margin: '0 0 5px 0', color: '#111827' }}>{act.title}</h3>
                          <p style={{ margin: '0', color: '#4b5563' }}>{act.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Render Active Day Timeline */}
            <div className="no-print">
              {activeDayObj && activeDayObj.activities.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
                  {/* Timeline connecting line */}
                  <div style={{ position: 'absolute', top: '15px', bottom: '15px', left: '23px', width: '2px', background: 'var(--border-color)', zIndex: '0' }}></div>

                  {activeDayObj.activities.map((act) => (
                    <div key={act._id} style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: '1' }}>
                      
                      {/* Timeline Node Icon/Bullet */}
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--card-bg-solid)', border: '2px solid var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem', color: 'var(--accent-color)', flexShrink: '0' }} title={act.time}>
                        {act.time.charAt(0)}
                      </div>

                      {/* Card Content */}
                      <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px 22px', flexGrow: '1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'inline-block' }}>
                            {act.time}
                          </span>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>{act.title}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.4' }}>{act.description}</p>
                        </div>
                        
                        {/* Delete Activity */}
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '4px', transition: 'var(--transition)' }} className="btn-copy" onClick={() => handleDeleteActivity(activeDay, act._id)} title="Delete Activity">
                            Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <p>No activities planned for Day {activeDay}.</p>
                  <button className="btn-copy" style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', marginTop: '15px', cursor: 'pointer' }} onClick={() => setShowAddActForm(true)}>
                    Add Your First Activity
                  </button>
                </div>
              )}
            </div>

            {/* ADD CUSTOM ACTIVITY FORM (DOCKABLE) */}
            {showAddActForm && (
              <div style={{ marginTop: '25px', padding: '20px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', animation: 'fadeIn 0.3s ease-out' }} className="no-print">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '15px' }}>Add Activity to Day {activeDay}</h3>
                <form onSubmit={handleAddActivity}>
                  
                  {/* Time Option & Title inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginBottom: '15px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Time of Day</label>
                      <select value={actTime} onChange={(e) => setActTime(e.target.value)} style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', color: '#fff' }}>
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Activity Title</label>
                      <input type="text" required placeholder="e.g. Louvre Museum Visit" value={actTitle} onChange={(e) => setActTitle(e.target.value)} style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', color: '#fff' }} />
                    </div>
                  </div>

                  {/* Description input */}
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Short Description</label>
                    <textarea placeholder="Write details about reservation numbers, local tips, or plans..." value={actDesc} onChange={(e) => setActDesc(e.target.value)} style={{ width: '100%', minHeight: '60px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', color: '#fff', resize: 'none', fontFamily: 'var(--font-sans)' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setShowAddActForm(false)} style={{ padding: '8px 16px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button type="submit" style={{ padding: '8px 20px', background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                      Add Activity
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>

          {/* 2. HOTEL RECOMMENDATIONS PANEL */}
          <section style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '30px', backdropFilter: 'blur(16px)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '25px' }}>
              Suggested Hotels
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {trip.hotels && trip.hotels.length > 0 ? (
                trip.hotels.map((hotel) => (
                  <div key={hotel._id || hotel.name} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '18px 20px', transition: 'var(--transition)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', background: hotel.tier === 'Luxury' ? 'rgba(139, 92, 246, 0.15)' : hotel.tier === 'Mid Range' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: hotel.tier === 'Luxury' ? '#a78bfa' : hotel.tier === 'Mid Range' ? '#f59e0b' : 'var(--success-color)' }}>
                        {hotel.tier}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {hotel.priceRange}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>{hotel.name}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>{hotel.description}</p>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No hotel suggestions compiled.</p>
              )}
            </div>
          </section>
        </div>

        {/* Dynamic Grid: Estimated Budget vs. Real Expense Tracker */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '30px', alignItems: 'start' }} className="details-split-grid">
          
          {/* 3. ESTIMATED BUDGET PANEL */}
          <section style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '30px', backdropFilter: 'blur(16px)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '25px' }}>
              Estimated Budget
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {categories.map((cat) => {
                const estAmt = trip.estimatedBudget[cat.toLowerCase()] || 0;
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{cat}</span>
                      <span style={{ fontWeight: '600' }}>${estAmt}</span>
                    </div>
                    {/* Visual Meter bar */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ background: 'var(--accent-gradient)', height: '100%', width: `${Math.min(100, (estAmt / (trip.estimatedBudget.total || 1)) * 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Total Estimated</span>
                <span style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--accent-color)' }}>
                  ${trip.estimatedBudget?.total || 0}
                </span>
              </div>
            </div>
          </section>

          {/* 4. EXPENSE TRACKER & BUDGET COMPARATIVE VISUALIZER (CREATIVE FEATURE) */}
          <section style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '30px', backdropFilter: 'blur(16px)' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', gap: '15px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Expense Tracker</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Creative Feature: Track real spending against AI predictions</p>
              </div>

              {/* Expense budget status highlights */}
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Spend</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: getActualTotal() > (trip.estimatedBudget?.total || 0) ? 'var(--danger-color)' : 'var(--success-color)' }}>
                  ${getActualTotal()}
                </h3>
              </div>
            </div>

            {/* COMPARATIVE PROGRESS BARS */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '15px' }}>Estimated vs. Actual Comparisons</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {categories.map((cat) => {
                  const estAmt = trip.estimatedBudget[cat.toLowerCase()] || 0;
                  const actAmt = getExpensesByCategory(cat);
                  const isOver = actAmt > estAmt;
                  const diff = actAmt - estAmt;
                  // Percentage of estimate
                  const pct = estAmt === 0 ? 0 : Math.round((actAmt / estAmt) * 100);

                  return (
                    <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: '600' }}>{cat}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Est: ${estAmt} vs. Act: <strong style={{ color: isOver ? 'var(--danger-color)' : 'var(--success-color)' }}>${actAmt}</strong>
                        </span>
                      </div>
                      
                      {/* Comparative Meter Bar */}
                      <div style={{ background: 'rgba(255, 255, 255, 0.05)', height: '12px', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ background: isOver ? 'var(--danger-color)' : 'var(--success-color)', height: '100%', width: `${Math.min(100, (actAmt / (estAmt || 1)) * 100)}%`, transition: 'width 0.4s ease' }}></div>
                        {/* Target line for Estimated */}
                        <div style={{ position: 'absolute', top: '0', bottom: '0', left: '100%', transform: 'translateX(-2px)', width: '2px', background: '#fff', opacity: '0.5' }}></div>
                      </div>

                      {/* Variance Indicator */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>{pct}% of prediction spent</span>
                        <span>
                          {diff === 0 ? 'On budget' : diff > 0 ? `Over budget by $${diff}` : `Remaining: $${Math.abs(diff)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EXPENSE LOGGING SPLIT */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }} className="details-split-grid no-print">
              
              {/* Form to log expense */}
              <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>Log New Expense</h4>
                <form onSubmit={handleAddExpenseSubmit}>
                  
                  {/* Category select */}
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Category</label>
                    <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '0.9rem' }}>
                      <option value="Food">Food</option>
                      <option value="Accommodation">Accommodation</option>
                      <option value="Flights">Flights</option>
                      <option value="Activities">Activities</option>
                      <option value="Misc">Misc (Shopping/Gifts)</option>
                    </select>
                  </div>

                  {/* Amount input */}
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Amount (USD)</label>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <input type="number" required placeholder="0" min="1" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 8px 8px 28px', color: '#fff', fontSize: '0.9rem' }} />
                    </div>
                  </div>

                  {/* Description input */}
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Description</label>
                    <input type="text" placeholder="e.g. Local sushi bar dinner" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '0.9rem' }} />
                  </div>

                  {/* Date Input */}
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Date</label>
                    <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '0.9rem' }} />
                  </div>

                  <button type="submit" style={{ width: '100%', padding: '10px', background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                    Log Cost
                  </button>
                </form>
              </div>

              {/* Logged Expense History list */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>Logged Expense History</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                  {trip.expenses && trip.expenses.length > 0 ? (
                    [...trip.expenses].reverse().map((exp) => (
                      <div key={exp._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px' }}>
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {exp.description || `${exp.category} Expense`}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {exp.category} • {new Date(exp.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            ${exp.amount}
                          </span>
                          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} className="btn-copy" onClick={() => handleDeleteExpense(exp._id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '30px 0' }}>
                      No expenses logged yet. Add costs using the form to analyze your budget.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* REGENERATE DAY MODAL */}
      {showRegenModal && (
        <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(5, 7, 12, 0.85)', backdropFilter: 'blur(8px)', zIndex: '100', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-lg)', borderRadius: '24px', width: '100%', maxWidth: '480px', padding: '32px', position: 'relative' }}>
            
            {/* Spinner Cover */}
            {regenerating && (
              <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(17, 24, 39, 0.95)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', textAlign: 'center', zIndex: '10' }}>
                <div className="spinner" style={{ marginBottom: '20px' }}></div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px' }}>Regenerating Day {activeDay}</h3>
                <p style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Re-planning activities using AI...</p>
              </div>
            )}

            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>Modify Itinerary: Day {activeDay}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Tell our AI travel agent how you'd like to adjust this day's activities (e.g. "Regenerate Day {activeDay} with more outdoor exploration" or "Make this a museum day").
            </p>

            <form onSubmit={handleRegenerateDaySubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Your Modification Request</label>
                <textarea required placeholder="e.g. Include a sushi-making workshop and visit local temple parks instead of shopping centers" value={regenRequest} onChange={(e) => setRegenRequest(e.target.value)} style={{ width: '100%', minHeight: '80px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', color: '#fff', resize: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.95rem' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowRegenModal(false)} style={{ padding: '10px 18px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 22px', border: 'none', background: 'var(--accent-gradient)', color: '#fff', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Regenerate Day
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetails;
