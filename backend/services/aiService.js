const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check if Gemini API key exists
const isApiKeyConfigured = !!process.env.GEMINI_API_KEY;

let genAI = null;
if (isApiKeyConfigured) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Mock database of local-sounding items for high-quality fallback generation
const mockInterestsActivities = {
  Food: [
    { title: "Culinary Walking Tour", description: "Join a local guide to sample traditional street foods, visit hidden alleyways, and learn the history of local cuisine." },
    { title: "Famous Food Market Exploration", description: "Wander through bustling food stalls, tasting fresh specialty ingredients and regional delicacies." },
    { title: "Fine Dining Experience", description: "Enjoy a curated multi-course chef's dinner highlighting modern interpretations of local signature dishes." }
  ],
  Culture: [
    { title: "Historic Landmark & Temple Visit", description: "Visit the destination's oldest historic temple, appreciating its architectural details and spiritual history." },
    { title: "National Art & History Museum", description: "Explore halls of preserved artifacts, sculpture galleries, and interactive exhibits depicting regional heritage." },
    { title: "Traditional Performance or Ceremony", description: "Attend a live performance showcasing traditional dances, folk music, or cultural tea ceremony rituals." }
  ],
  Adventure: [
    { title: "Scenic Ridge Hiking", description: "Embark on an early morning hike up a popular scenic trail, culminating in breathtaking panoramic views." },
    { title: "Thrilling Outdoor Action", description: "Experience local ziplining, white-water rafting, or rocky cliffs climbing depending on the regional landscape." },
    { title: "Ecology Forest Tour", description: "Take a guided eco-tour through nearby reserve parklands to spot unique local flora and fauna." }
  ],
  Shopping: [
    { title: "Local Craft Artisan Market", description: "Browse hand-woven garments, pottery, and unique handmade souvenirs crafted by local artisans." },
    { title: "Premium Fashion District Walk", description: "Stroll through the modern commercial center lined with department stores, boutiques, and flagship brands." },
    { title: "Quirky Antique Shops", description: "Hunt for vintage treasures, rare books, and memorabilia in the city's charming bohemian quarter." }
  ],
  Nature: [
    { title: "Botanical Garden Stroll", description: "Wander through tranquil glasshouses, themed flower beds, and koi ponds in a beautifully landscaped green sanctuary." },
    { title: "Coastal Beach Sunset View", description: "Walk along the scenic coastline, breathing in the sea air and taking photos of a gorgeous ocean sunset." },
    { title: "Tranquil Lake Boat Cruise", description: "Enjoy a relaxing boat ride across a peaceful local lake, surrounded by forested hills and crisp air." }
  ]
};

// Generates fallback trip
function generateFallbackTrip(destination, days, budgetType, interests) {
  const selectedInterests = interests.length > 0 ? interests : ['Food', 'Culture'];
  const formattedDestination = destination.charAt(0).toUpperCase() + destination.slice(1);
  
  // Calculate budget multipliers based on tier
  let budgetMultipliers = { flights: 300, accommodation: 80, food: 40, activities: 30 };
  if (budgetType === 'Medium') {
    budgetMultipliers = { flights: 600, accommodation: 180, food: 80, activities: 70 };
  } else if (budgetType === 'High') {
    budgetMultipliers = { flights: 1200, accommodation: 400, food: 180, activities: 150 };
  }

  const flightsCost = budgetMultipliers.flights;
  const accommodationCost = budgetMultipliers.accommodation * days;
  const foodCost = budgetMultipliers.food * days;
  const activitiesCost = budgetMultipliers.activities * days;
  const totalCost = flightsCost + accommodationCost + foodCost + activitiesCost;

  const itinerary = [];
  for (let d = 1; d <= days; d++) {
    // Pick activities cyclically from interest pool
    const dayActivities = [];
    const times = ['Morning', 'Afternoon', 'Evening'];
    
    times.forEach((time, index) => {
      const currentInterest = selectedInterests[(d + index) % selectedInterests.length];
      const itemsList = mockInterestsActivities[currentInterest] || mockInterestsActivities['Food'];
      const item = itemsList[(d + index) % itemsList.length];
      
      dayActivities.push({
        time,
        title: `${item.title} in ${formattedDestination}`,
        description: item.description
      });
    });

    itinerary.push({ day: d, activities: dayActivities });
  }

  const hotels = [
    {
      name: `${formattedDestination} Economy Lodgings`,
      tier: "Budget Friendly",
      priceRange: budgetType === 'Low' ? "$40 - $70 / night" : "$50 - $90 / night",
      description: "Clean, cozy, and highly rated budget option with convenient public transit links."
    },
    {
      name: `${formattedDestination} Central Plaza Hotel`,
      tier: "Mid Range",
      priceRange: budgetType === 'Low' ? "$100 - $140 / night" : "$130 - $180 / night",
      description: "Comfortable rooms, inclusive breakfast, and a central location walking distance to top sights."
    },
    {
      name: `Grand ${formattedDestination} Resort & Spa`,
      tier: "Luxury",
      priceRange: budgetType === 'Low' ? "$250 - $350 / night" : "$400 - $650 / night",
      description: "Five-star amenities, spectacular city views, a heated indoor pool, and world-class spa facilities."
    }
  ];

  return {
    itinerary,
    estimatedBudget: {
      flights: flightsCost,
      accommodation: accommodationCost,
      food: foodCost,
      activities: activitiesCost,
      total: totalCost
    },
    hotels
  };
}

/**
 * Generate itinerary using Gemini AI or fallback
 */
async function generateItinerary(destination, days, budgetType, interests) {
  if (!isApiKeyConfigured) {
    console.log("Gemini API key not found. Using high-quality fallback generator.");
    return generateFallbackTrip(destination, days, budgetType, interests);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const interestStr = interests.length > 0 ? interests.join(', ') : 'sightseeing, local food';
    
    const prompt = `
      You are a professional travel agent. Plan a trip to "${destination}" for ${days} days.
      The budget level is ${budgetType} (Low, Medium, or High) and the traveler's interests are: ${interestStr}.
      
      Provide:
      1. A day-by-day itinerary where each day contains exactly 3 activities: Morning, Afternoon, Evening. Each activity should have a specific title and a 1-2 sentence description.
      2. An estimated budget in USD (as whole numbers) for Flights, Accommodation, Food, and Activities, and their sum (Total).
      3. Three recommended hotel options (1 Budget Friendly, 1 Mid Range, 1 Luxury) with name, price range, and a brief description.

      You MUST respond with a single, raw JSON object. Do NOT wrap it in \`\`\`json markdown blocks. Do not add any text before or after the JSON.
      
      The JSON structure MUST follow this exact schema:
      {
        "itinerary": [
          {
            "day": 1,
            "activities": [
              {
                "time": "Morning",
                "title": "Activity Title",
                "description": "Activity description..."
              },
              {
                "time": "Afternoon",
                "title": "Activity Title",
                "description": "Activity description..."
              },
              {
                "time": "Evening",
                "title": "Activity Title",
                "description": "Activity description..."
              }
            ]
          }
        ],
        "estimatedBudget": {
          "flights": 450,
          "accommodation": 300,
          "food": 150,
          "activities": 100,
          "total": 1000
        },
        "hotels": [
          {
            "name": "Hotel Name",
            "tier": "Budget Friendly" | "Mid Range" | "Luxury",
            "priceRange": "$50 - $80 per night",
            "description": "Short description of the hotel..."
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Strip markdown code block wrapper if present
    if (text.startsWith('```')) {
      text = text.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/, '').trim();
    }

    try {
      const parsed = JSON.parse(text);
      // Validate structure basics
      if (parsed.itinerary && parsed.estimatedBudget && parsed.hotels) {
        return parsed;
      }
      throw new Error("Invalid structure returned from AI model");
    } catch (parseErr) {
      console.error("AI JSON parse error, falling back:", parseErr, text);
      return generateFallbackTrip(destination, days, budgetType, interests);
    }
  } catch (err) {
    console.error("Gemini API call failed, falling back:", err);
    return generateFallbackTrip(destination, days, budgetType, interests);
  }
}

/**
 * Regenerate activities for a single day based on user instructions
 */
async function regenerateDay(destination, dayNumber, interests, userRequest, currentDayActivities) {
  if (!isApiKeyConfigured) {
    console.log("Gemini API key not found. Performing mock day regeneration.");
    // Return a modified set of activities based on the request
    return {
      day: Number(dayNumber),
      activities: [
        {
          time: "Morning",
          title: `Modified Morning: Scenic Exploration`,
          description: `Customized morning activity for ${destination} based on request: "${userRequest}".`
        },
        {
          time: "Afternoon",
          title: `Modified Afternoon: Adventure Tour`,
          description: `We've updated this afternoon activity to match your preference: "${userRequest}".`
        },
        {
          time: "Evening",
          title: `Modified Evening: Cozy Dinner & Lounge`,
          description: `Relaxing local evening experience tailored to: "${userRequest}".`
        }
      ]
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const interestStr = interests.length > 0 ? interests.join(', ') : 'sightseeing';
    
    const prompt = `
      You are a professional travel agent. Modify Day ${dayNumber} of a trip to "${destination}".
      The traveler's interests are: ${interestStr}.
      The traveler wants to update Day ${dayNumber} with this specific instruction: "${userRequest}".
      
      Here are the current activities of Day ${dayNumber} that need to be replaced:
      ${JSON.stringify(currentDayActivities)}

      Generate 3 new activities for Day ${dayNumber} (Morning, Afternoon, Evening) that fit the destination and satisfy the request.
      
      You MUST respond with a single, raw JSON object. Do NOT wrap it in \`\`\`json markdown blocks. Do not add any text before or after the JSON.
      
      The JSON structure MUST follow this exact schema:
      {
        "day": ${dayNumber},
        "activities": [
          {
            "time": "Morning",
            "title": "Activity Title",
            "description": "Activity description..."
          },
          {
            "time": "Afternoon",
            "title": "Activity Title",
            "description": "Activity description..."
          },
          {
            "time": "Evening",
            "title": "Activity Title",
            "description": "Activity description..."
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    if (text.startsWith('```')) {
      text = text.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/, '').trim();
    }

    try {
      const parsed = JSON.parse(text);
      if (parsed.activities && parsed.activities.length > 0) {
        return parsed;
      }
      throw new Error("Invalid structure for day regeneration");
    } catch (parseErr) {
      console.error("AI Day Parse Error, falling back:", parseErr, text);
      throw parseErr;
    }
  } catch (err) {
    console.error("Gemini Day Regen failed:", err);
    // Return standard mock fallback
    return {
      day: Number(dayNumber),
      activities: [
        {
          time: "Morning",
          title: `Outdoor Activity in ${destination}`,
          description: `Customized morning activity addressing: "${userRequest}".`
        },
        {
          time: "Afternoon",
          title: `Artisanal Excursion in ${destination}`,
          description: `Updated afternoon activity addressing: "${userRequest}".`
        },
        {
          time: "Evening",
          title: `Local Gathering in ${destination}`,
          description: `Specialized evening dinner event addressing: "${userRequest}".`
        }
      ]
    };
  }
}

module.exports = {
  generateItinerary,
  regenerateDay
};
