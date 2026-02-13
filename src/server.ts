import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import playerRoutes from "./routes/player.route";
import teamRoutes from "./routes/team.route";

// connect database
connectDB();
const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

app.use("/api/players", playerRoutes);
app.use("/api/teams", teamRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Badminton Auction API Running 🏸");
});

app.listen(PORT, () => {
  console.log("App is running on PORT ", PORT);
});
