import { Request, Response } from "express";
import Team from "../models/team.model";
import { TEAM_PURSE } from "../utils/constants";
import { createTeamSchema } from "../validations/team.validation";
import mongoose from "mongoose";
import Player from "../models/player.model";

export const createTeam = async (req: Request, res: Response) => {
  try {
    // ✅ Validate body
    const parsed = createTeamSchema.parse(req.body);
    const { teamName, captain, logo } = parsed;

    // ✅ Validate captain ID format
    if (!mongoose.Types.ObjectId.isValid(captain)) {
      return res.status(400).json({
        message: "Invalid captain ID",
      });
    }

    // ✅ Check if captain exists
    const captainPlayer = await Player.findById(captain);
    if (!captainPlayer) {
      return res.status(404).json({
        message: "Captain player not found",
      });
    }

    // ✅ Prevent duplicate team names
    const existingTeam = await Team.findOne({ teamName });
    if (existingTeam) {
      return res.status(400).json({
        message: "Team name already exists",
      });
    }

    const purse = TEAM_PURSE;

    const team = await Team.create({
      teamName,
      captain,
      purse,
      remainingPurse: purse,
      logo,
      players: [],
    });

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      team,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      message: "Error creating team",
      error: error.message,
    });
  }
};
export const getTeams = async (req: Request, res: Response) => {
  try {
    const teams = await Team.find().populate("players").populate("captain");

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teams" });
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id).populate("players");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Error fetching team" });
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Error updating team" });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting team" });
  }
};
