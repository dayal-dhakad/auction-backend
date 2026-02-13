import { Request, Response } from "express";
import Player from "../models/player.model";

export const createPlayer = async (req: Request, res: Response) => {
  try {
    const player = await Player.create(req.body);
    res.status(201).json({
      success: true,
      player,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating player", error });
  }
};

export const getAllPlayers = async (req: Request, res: Response) => {
  try {
    const players = await Player.find();
    res.status(201).json({
      success: true,
      players,
    });
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong", error });
  }
};

export const getPlayerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(id);
    const player = await Player.findById(id);
    res.status(201).json({
      success: true,
      player,
    });
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong", error });
  }
};

export const updatePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const player = await Player.findByIdAndUpdate(id, req.body, { new: true });
    if (!player) {
      res.status(404).json({ message: "Player Not Found" });
    }
    res.status(201).json({
      success: true,
      player,
      message: "Player Details Updated",
    });
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong", error });
  }
};
export const deletePlayer = async (req: Request, res: Response) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.json({ message: "Player deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting player" });
  }
};
