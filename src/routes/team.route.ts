import express from "express";
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} from "../controllers/team.controller";

import validate from "../middlewares/validate.middleware";
import {
  createTeamSchema,
  updateTeamSchema,
} from "../validations/team.validation";

const router = express.Router();

router.post("/create-team", validate(createTeamSchema), createTeam);

router.get("/get-all-teams", getTeams);

router.get("/get-team/:id", getTeamById);

router.put("/update-team/:id", validate(updateTeamSchema), updateTeam);

router.delete("/delete-team/:id", deleteTeam);

export default router;
