import express from "express";
import {
  createPlayer,
  deletePlayer,
  getAllPlayers,
  getPlayerById,
  updatePlayer,
} from "../controllers/player.controller";
const router = express.Router();

router.post("/:auctionId", createPlayer);
router.get("/all/:auctionId", getAllPlayers);
router.get("/:id", getPlayerById);
router.patch("/:id", updatePlayer);
router.delete("/:id", deletePlayer);

export default router;
