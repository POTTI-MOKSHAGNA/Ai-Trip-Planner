const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  time: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' }
});

const DaySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  activities: [ActivitySchema]
});

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tier: { type: String, required: true }, // e.g. "Budget Friendly", "Mid Range", "Luxury"
  priceRange: { type: String, default: '' },
  description: { type: String, default: '' }
});

const ExpenseSchema = new mongoose.Schema({
  category: { 
    type: String, 
    required: true,
    enum: ['Flights', 'Accommodation', 'Food', 'Activities', 'Misc']
  },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

const TripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  days: {
    type: Number,
    required: true,
    min: 1
  },
  budgetType: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High']
  },
  interests: {
    type: [String],
    default: []
  },
  itinerary: [DaySchema],
  estimatedBudget: {
    flights: { type: Number, default: 0 },
    accommodation: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    activities: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  hotels: [HotelSchema],
  expenses: [ExpenseSchema]
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
