/**
 * ============================================================================
 * REDIS SITE BANNER PROJECT - REVISION SHEET 3
 * ============================================================================
 * This application demonstrates how to use Redis as an in-memory cache/store
 * with an Express.js backend. It handles storing, retrieving, checking, and
 * deleting a global site banner message so that high-traffic reads don't hit
 * a primary database.
 */

import express from "express";
import Redis from "ioredis";

// Initialize Express application
const app = express();

// Middleware to parse incoming JSON payloads in request bodies (e.g., req.body)
app.use(express.json());

/**
 * Initialize Redis Client
 * Connects using the environment variable REDIS_URL if available,
 * otherwise defaults to the local Redis container running on port 6379.
 */
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Constant key used in Redis to store the site banner message consistently
const BANNER_KEY = "site:banner";

/**
 * 1. Save or Update the Banner Message
 * Route: POST /banner
 * Description: Takes a message from the request body and saves it into Redis.
 * Falls back to a default message if none is provided in the body.
 */
app.post("/banner", async (req, res) => {
  const message =
    req.body.message || "Welcome to the learning of Redis with Ankit";

  // redis.set is asynchronous, so we use 'await' to wait for completion
  await redis.set(BANNER_KEY, message);

  res.json({ success: true, message });
});

/**
 * 2. Read the Banner Message
 * Route: GET /banner
 * Description: Fetches the active banner message currently stored in Redis.
 * Returns a 404 error response if the key does not exist.
 */
app.get("/banner", async (req, res) => {
  const message = await redis.get(BANNER_KEY);

  // If message is null/empty, the key isn't set in Redis
  if (!message) {
    return res.status(404).json({ message: "No active banner found" });
  }

  res.json({ message });
});

/**
 * 3. Check Whether the Banner Exists
 * Route: GET /banner/exists
 * Description: Checks if the banner key exists in Redis without fetching its full value.
 * redis.exists() returns 1 (true) or 0 (false), which we cast to a Boolean.
 */
app.get("/banner/exists", async (req, res) => {
  const exists = await redis.exists(BANNER_KEY);

  res.json({ exists: Boolean(exists) });
});

/**
 * 4. Delete or Remove the Banner
 * Route: DELETE /banner
 * Description: Removes the banner key from Redis completely.
 */
app.delete("/banner", async (req, res) => {
  await redis.del(BANNER_KEY);
  res.json({ success: true, deleted: true });
});

/**
 * Root Route
 * Route: GET /
 * Description: A simple health-check or welcome route for the server.
 */
app.get("/", (req, res) => {
  res.send("Lets learn redis with ankit");
});

/**
 * Start the Express Server
 * Listens for incoming HTTP requests on port 3000.
 */
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is listening on http://localhost:3000");
});
