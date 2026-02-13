import { Request, Response } from "express";
import Team from "../models/team.model";

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { teamName, captain, purse, logo } = req.body;

    const team = await Team.create({
      teamName,
      captain,
      purse,
      remainingPurse: purse,
      logo,
      players: [],
    });

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: "Error creating team", error });
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
