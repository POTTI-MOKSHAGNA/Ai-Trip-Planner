const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');

// Helper to verify trip ownership
const getOwnedTrip = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw { status: 404, message: 'Trip not found' };
  }
  if (trip.user.toString() !== userId) {
    throw { status: 403, message: 'Not authorized to access this trip' };
  }
  return trip;
};

// @desc    Create a new AI-generated trip
// @access  Private
router.post('/', auth, async (req, res) => {
  const { destination, days, budgetType, interests } = req.body;

  if (!destination || !days || !budgetType) {
    return res.status(400).json({ success: false, message: 'Destination, days, and budget level are required' });
  }

  try {
    // Generate AI Itinerary, Budget and Hotels
    const aiData = await aiService.generateItinerary(destination, days, budgetType, interests || []);

    const newTrip = new Trip({
      user: req.user.id,
      destination,
      days,
      budgetType,
      interests: interests || [],
      itinerary: aiData.itinerary,
      estimatedBudget: aiData.estimatedBudget,
      hotels: aiData.hotels,
      expenses: []
    });

    const savedTrip = await newTrip.save();
    res.status(201).json({ success: true, trip: savedTrip });
  } catch (err) {
    console.error('Create trip error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate trip. Please try again.' });
  }
});

// @desc    Get all trips of the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // strict isolation
    const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, trips });
  } catch (err) {
    console.error('Fetch trips error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch trips' });
  }
});

// @desc    Get a single trip by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const trip = await getOwnedTrip(req.params.id, req.user.id);
    res.json({ success: true, trip });
  } catch (err) {
    console.error('Fetch single trip error:', err);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
});

// @desc    Delete a trip
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const trip = await getOwnedTrip(req.params.id, req.user.id);
    await trip.deleteOne();
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (err) {
    console.error('Delete trip error:', err);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
});

// @desc    Update a trip's itinerary directly (add/delete activities)
// @access  Private
router.put('/:id/itinerary', auth, async (req, res) => {
  const { itinerary } = req.body;

  if (!itinerary || !Array.isArray(itinerary)) {
    return res.status(400).json({ success: false, message: 'Valid itinerary array is required' });
  }

  try {
    const trip = await getOwnedTrip(req.params.id, req.user.id);
    trip.itinerary = itinerary;
    const updatedTrip = await trip.save();
    res.json({ success: true, trip: updatedTrip });
  } catch (err) {
    console.error('Update itinerary error:', err);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
});

// @desc    Regenerate a specific day of the itinerary using AI
// @access  Private
router.post('/:id/regenerate-day', auth, async (req, res) => {
  const { day, userRequest } = req.body;

  if (!day || !userRequest) {
    return res.status(400).json({ success: false, message: 'Day number and description request are required' });
  }

  try {
    const trip = await getOwnedTrip(req.params.id, req.user.id);
    
    // Find the day in the current itinerary
    const dayObj = trip.itinerary.find(d => d.day === Number(day));
    if (!dayObj) {
      return res.status(400).json({ success: false, message: `Day ${day} does not exist in this itinerary` });
    }

    // Call AI to regenerate activities for this day
    const regenerated = await aiService.regenerateDay(
      trip.destination,
      day,
      trip.interests,
      userRequest,
      dayObj.activities
    );

    // Update in Mongoose
    dayObj.activities = regenerated.activities;
    const savedTrip = await trip.save();

    res.json({ success: true, trip: savedTrip });
  } catch (err) {
    console.error('Regenerate day error:', err);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Failed to regenerate day' });
  }
});

// @desc    Log a new expense
// @access  Private
router.post('/:id/expenses', auth, async (req, res) => {
  const { category, amount, description, date } = req.body;

  if (!category || !amount) {
    return res.status(400).json({ success: false, message: 'Category and amount are required' });
  }

  try {
    const trip = await getOwnedTrip(req.params.id, req.user.id);
    
    const newExpense = {
      category,
      amount: Number(amount),
      description: description || '',
      date: date ? new Date(date) : new Date()
    };

    trip.expenses.push(newExpense);
    const updatedTrip = await trip.save();

    res.status(201).json({ success: true, trip: updatedTrip });
  } catch (err) {
    console.error('Add expense error:', err);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
});

// @desc    Delete a logged expense
// @access  Private
router.delete('/:id/expenses/:expenseId', auth, async (req, res) => {
  try {
    const trip = await getOwnedTrip(req.params.id, req.user.id);
    
    // Pull the subdocument
    trip.expenses.pull({ _id: req.params.expenseId });
    const updatedTrip = await trip.save();

    res.json({ success: true, trip: updatedTrip });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
});

module.exports = router;
