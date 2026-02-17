import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db";
import playerRoutes from "./routes/player.route";
import teamRoutes from "./routes/team.route";
import auctionRoutes from "./routes/auction.route";

dotenv.config();
// connect database
const app = express();
// app.use(
//   cors({
//     origin:
//       process.env.APP_ENV === "production"
//         ? "https://auction-frontend-navy.vercel.app"
//         : "http://localhost:5173",
//     credentials: true,
//   }),
// );

const allowedOrigins = [
  "https://auction-frontend-navy.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
connectDB();

app.use("/api/player", playerRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/auction", auctionRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Badminton Auction API Running 🏸");
});

app.listen(PORT, () => {
  console.log("App is running on PORT ", PORT);
});
