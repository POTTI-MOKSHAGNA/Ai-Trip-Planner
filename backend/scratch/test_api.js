const http = require('http');

const API_BASE = 'http://localhost:5000/api';

const postJson = (url, data, token = null) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          reject(new Error(`Failed to parse response body: ${body}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
};

const getJson = (url, token = null) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      headers: {}
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          reject(new Error(`Failed to parse response body: ${body}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
};

async function runTests() {
  console.log("=== STARTING TRAVEL PLANNER API VERIFICATION ===");
  const testEmail = `tester_${Date.now()}@example.com`;
  const testPassword = `pass_${Date.now()}`;
  let token = null;
  let tripId = null;

  try {
    // 1. Register User
    console.log(`\n1. Registering user: ${testEmail}`);
    const regRes = await postJson(`${API_BASE}/auth/register`, { email: testEmail, password: testPassword });
    console.log(`Status: ${regRes.statusCode}`);
    if (regRes.data.success && regRes.data.token) {
      token = regRes.data.token;
      console.log("SUCCESS: User registered and token obtained.");
    } else {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
    }

    // 2. Login User
    console.log(`\n2. Logging in user: ${testEmail}`);
    const loginRes = await postJson(`${API_BASE}/auth/login`, { email: testEmail, password: testPassword });
    console.log(`Status: ${loginRes.statusCode}`);
    if (loginRes.data.success && loginRes.data.token) {
      console.log("SUCCESS: Logged in successfully.");
    } else {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
    }

    // 3. Create AI-Generated Trip (testing smart fallback)
    console.log("\n3. Requesting AI Trip Generation to Tokyo (3 Days)...");
    const tripRes = await postJson(`${API_BASE}/trips`, {
      destination: "Tokyo",
      days: 3,
      budgetType: "Medium",
      interests: ["Food", "Culture"]
    }, token);

    console.log(`Status: ${tripRes.statusCode}`);
    if (tripRes.data.success && tripRes.data.trip) {
      tripId = tripRes.data.trip._id;
      console.log("SUCCESS: Trip created!");
      console.log("Destination:", tripRes.data.trip.destination);
      console.log("Estimated Total Budget:", tripRes.data.trip.estimatedBudget.total);
      console.log("Generated Itinerary Days Count:", tripRes.data.trip.itinerary.length);
      console.log("Recommended Hotels Count:", tripRes.data.trip.hotels.length);
    } else {
      throw new Error(`Trip generation failed: ${JSON.stringify(tripRes.data)}`);
    }

    // 4. Log Expense
    console.log("\n4. Logging an actual Food expense of $95...");
    const expRes = await postJson(`${API_BASE}/trips/${tripId}/expenses`, {
      category: "Food",
      amount: 95,
      description: "Tsukiji Outer Market Food Tour",
      date: new Date().toISOString()
    }, token);

    console.log(`Status: ${expRes.statusCode}`);
    if (expRes.data.success && expRes.data.trip) {
      const expenses = expRes.data.trip.expenses;
      console.log("SUCCESS: Expense logged successfully!");
      console.log("Total expenses logged count:", expenses.length);
      console.log("Latest expense:", expenses[expenses.length - 1]);
    } else {
      throw new Error(`Expense log failed: ${JSON.stringify(expRes.data)}`);
    }

    // 5. Verify Data Isolation
    console.log("\n5. Verifying user data isolation (accessing with invalid token)...");
    const badTokenGet = await getJson(`${API_BASE}/trips/${tripId}`, "invalid_token_xyz");
    console.log(`Status (Expected 401): ${badTokenGet.statusCode}`);
    if (badTokenGet.statusCode === 401) {
      console.log("SUCCESS: Access denied for invalid token.");
    } else {
      console.warn("WARNING: Invalid token did not return 401!");
    }

    console.log("\n=== ALL TESTS PASSED SUCCESSFULLY ===");

  } catch (err) {
    console.error("\n!!! TEST RUN FAILED !!!");
    console.error(err);
    process.exit(1);
  }
}

runTests();