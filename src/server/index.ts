import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import giftSuggestions from "./api/giftSuggestions.js";

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS to allow requests from Vite dev server
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["POST"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api", giftSuggestions);

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
