import { Request, Response } from "express";
import Player from "../models/player.model";
import {
  createPlayerSchema,
  updatePlayerSchema,
} from "../validations/player.validation";
import { BASE_PRICE_MAP } from "../utils/constants";
import mongoose from "mongoose";

export const createPlayer = async (req: Request, res: Response) => {
  try {
    const parsed = createPlayerSchema.parse(req.body);
    const { auctionId } = req.params;
    const { name, skillLevel, gender, image } = parsed;

    const basePrice = BASE_PRICE_MAP[skillLevel];

    const player = await Player.create({
      name,
      skillLevel,
      gender,
      image,
      basePrice,
      auction: auctionId,
    });
    const populatedPlayer = await player.populate("auction");

    res.status(201).json({
      success: true,
      player: populatedPlayer,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Error creating player",
      error: error.message,
    });
  }
};

export const getAllPlayers = async (
  req: Request<{ auctionId: string }>,
  res: Response,
) => {
  try {
    const { auctionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return res.status(400).json({
        message: "Invalid auction ID",
      });
    }
    const players = await Player.find({ auction: auctionId })
      .populate("team")
      .sort({
        createdAt: 1,
      });
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
    const player = await Player.findById(id).populate("team");
    res.status(201).json({
      success: true,
      player,
    });
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong", error });
  }
};

export const updatePlayer = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Player ID" });
    }

    // ✅ Validate body
    const parsed = updatePlayerSchema.parse(req.body);
    let basePrice;
    if (parsed.skillLevel) {
      basePrice = BASE_PRICE_MAP[parsed.skillLevel];
    }

    const player = await Player.findByIdAndUpdate(
      id,
      { basePrice, ...parsed },
      { new: true },
    );

    if (!player) {
      return res.status(404).json({ message: "Player Not Found" });
    }

    return res.status(200).json({
      success: true,
      message: "Player Details Updated",
      player,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      message: "Something Went Wrong",
      error: error.message,
    });
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
