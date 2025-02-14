import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import giftSuggestions from "./api/giftSuggestions";
import twitterVerifyRouter from "./api/twitterVerify";
import { TwitterHandler } from "../services/twitter/TwitterHandler";

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS to allow requests from Vite dev server
app.use(
  cors({
    origin: ["http://localhost:5173", "https://valentines.finance"],
    methods: ["POST"],
    credentials: true,
  })
);

// Existing API routes
app.use(express.json());
app.use("/api", giftSuggestions);
app.use("/api", twitterVerifyRouter);

// Initialize Twitter bot as additional feature
const twitterBot = new TwitterHandler();
twitterBot.startListening();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Twitter bot active`);
});
