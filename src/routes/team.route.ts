import express from "express";
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} from "../controllers/team.controller";

const router = express.Router();

router.post("/:auctionId", createTeam);

router.get("/all/:auctionId", getTeams);

router.get("/:id", getTeamById);

router.put("/:id", updateTeam);

router.delete("/:id", deleteTeam);

export default router;
