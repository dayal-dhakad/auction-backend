import express from "express";
import {
  createPlayer,
  deletePlayer,
  getAllPlayers,
  getPlayerById,
  updatePlayer,
} from "../controllers/player.controller";
import {
  createPlayerSchema,
  updatePlayerSchema,
} from "../validations/player.validation";
import validate from "../middlewares/validate.middleware";

const router = express.Router();

router.post("/create-player", validate(createPlayerSchema), createPlayer);
router.get("/get-all-players", getAllPlayers);
router.get("/get-player/:id", getPlayerById);
router.patch("/update-player/:id", validate(updatePlayerSchema), updatePlayer);
router.delete("/delete-player/:id", deletePlayer);

export default router;
