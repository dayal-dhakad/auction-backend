import express from "express";
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} from "../controllers/team.controller";

const router = express.Router();

router.post("/", createTeam);

router.get("/", getTeams);

router.get("/:id", getTeamById);

router.put("/:id", updateTeam);

router.delete("/:id", deleteTeam);

export default router;
