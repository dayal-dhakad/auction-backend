import express from "express";
import {
  createPlayer,
  deletePlayer,
  getAllPlayers,
  getPlayerById,
  updatePlayer,
} from "../controllers/player.controller";
const router = express.Router();

router.post("/", createPlayer);
router.get("/", getAllPlayers);
router.get("/:id", getPlayerById);
router.patch("/:id", updatePlayer);
router.delete("/:id", deletePlayer);

export default router;
