import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import TripHero from '../../components/TripHero';
import ItenarySection from '../../components/ItenarySection';
import HotelSelection from '../../components/HotelSelection';
import BudgetSection from '../../components/BudgetSection';
import Expensetracker from '../../components/ExpenseTracker';
import RegenerateDayModal from '../../components/RegenerateDayModal';
import './index.css'

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

      const response = await fetch(`${API_URL}/api/trips/${id}`, {
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
      const response = await fetch(`${API_URL}/api/trips/${id}/itinerary`, {
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
      const response = await fetch(`${API_URL}/api/trips/${id}/regenerate-day`, {
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
      const response = await fetch(`${API_URL}/api/trips/${id}/expenses`, {
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
      const response = await fetch(`${API_URL}/api/trips/${id}/expenses/${expenseId}`, {
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
        <Navbar handleLogout={handleLogout} />
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
            <Link to="/" className="btn-back">
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
      <Navbar handleLogout={handleLogout} />

      {/* Printable Header */}
      <div className="print-only print-header">
        <h1 className="print-title">{trip.destination} Travel Guide</h1>
        <p className="print-meta">
          <strong>Duration:</strong> {trip.days} Days &nbsp;|&nbsp; <strong>Budget Tier:</strong> {trip.budgetType}
        </p>
        <p className="print-meta">
          <strong>Interests:</strong> {trip.interests.join(', ') || 'General'}
        </p>
      </div>

      {/* Main Details Wrapper */}
      <main className="dashboard-main">
        {/* Back Link & Export Controls */}
        <div className="trip-actions no-print">
          <Link to="/" className="trip-back-link">
              Back to Dashboard
          </Link>
          <button className="trip-print-btn">
             Print / Export PDF
          </button>
        </div>

        {/* Trip Hero Header */}
        <TripHero trip={trip} />

        {/* Dynamic Grid: Itinerary & Hotel Suggestions */}
        <div className="trip-details-grid">
          
          {/* 1. ITINERARY TIMELINE PANEL */}
          
          <ItenarySection
            trip={trip}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            activeDayObj={activeDayObj}
            showAddActForm={showAddActForm}
            setShowAddActForm={setShowAddActForm}
            actTime={actTime}
            setActTime={setActTime}
            actTitle={actTitle}
            setActTitle={setActTitle}
            actDesc={actDesc}
            setActDesc={setActDesc}
            handleAddActivity={handleAddActivity}
            handleDeleteActivity={handleDeleteActivity}
            setShowRegenModal={setShowRegenModal}
        />

          {/* 2. HOTEL RECOMMENDATIONS PANEL */}
          <HotelSelection hotels = {trip.hotels}/>
          
        </div>

        {/* Dynamic Grid: Estimated Budget vs. Real Expense Tracker */}
        <div className="budget-expense-grid">
          
          {/* 3. ESTIMATED BUDGET PANEL */}
          <BudgetSection
              estimatedBudget={trip.estimatedBudget}
              categories={categories}
          />

          {/* 4. EXPENSE TRACKER & BUDGET COMPARATIVE VISUALIZER (CREATIVE FEATURE) */}
          <Expensetracker
              trip={trip}
              categories={categories}
              expCategory={expCategory}
              setExpCategory={setExpCategory}
              expAmount={expAmount}
              setExpAmount={setExpAmount}
              expDesc={expDesc}
              setExpDesc={setExpDesc}
              expDate={expDate}
              setExpDate={setExpDate}
              handleAddExpenseSubmit={handleAddExpenseSubmit}
              handleDeleteExpense={handleDeleteExpense}
              getExpensesByCategory={getExpensesByCategory}
              getActualTotal={getActualTotal}
          />
        </div>
      </main>

      {/* REGENERATE DAY MODAL */}
      {showRegenModal && (
          <RegenerateDayModal
            activeDay={activeDay}
            regenRequest={regenRequest}
            setRegenRequest={setRegenRequest}
            handleRegenerateDaySubmit={handleRegenerateDaySubmit}
            regenerating={regenerating}
            onClose={() => setShowRegenModal(false)}
      />
      )}
    </div>
  );
};

export default TripDetails;
