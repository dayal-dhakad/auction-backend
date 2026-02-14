import { Request, Response } from "express";
import Auction from "../models/auction.model";
import Player from "../models/player.model";
import { generateDramaOrder } from "../utils/helpers";
import mongoose from "mongoose";

export const createAuction = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const players = await Player.find();
    if (!players) {
      res.status(400).json({ message: "No Player Found" });
    }

    const orderedPlayers = generateDramaOrder(players);

    const auction = Auction.create({
      title,
      description,
      order: orderedPlayers.map((p) => p._id),
    });

    res.status(201).json({
      message: "Auction created successfully",
      auction,
    });
  } catch (e) {
    res.status(500).json({ message: "Error Starting Auction", e });
  }
};

export const getAllAuction = async (req: Request, res: Response) => {
  try {
    const auctions = await Auction.find().populate("order");
    if (!auctions) {
      res.status(400).json({ message: "No Auction Found" });
    }
    res.status(201).json({
      message: "Auctions fetched successfully",
      auctions,
    });
  } catch (e) {
    res.status(500).json({ message: "Something Went Wrong", e });
  }
};

export const getAuctionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findById(id).populate("order");
    if (!auction) {
      res.status(400).json({ message: "Auction Not Found" });
    }
    res.status(201).json({
      message: "Auction fetched successfully",
      auction,
    });
  } catch (e) {
    res.status(500).json({ message: "Something Went Wrong", e });
  }
};

export const startAuction = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    // ✅ Validate auction ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Auction ID",
      });
    }

    const auction = await Auction.findById(id);

    if (!auction) {
      return res.status(404).json({
        message: "Auction not found",
      });
    }

    if (auction.status === "LIVE") {
      return res.status(400).json({
        message: "Auction already started",
      });
    }

    if (!auction.order.length) {
      return res.status(400).json({
        message: "Auction order is empty",
      });
    }

    // 🔥 Get first player
    const firstPlayerId = auction.order[0];
    const player = await Player.findById(firstPlayerId);

    if (!player) {
      return res.status(404).json({
        message: "First player not found",
      });
    }

    // 🎯 Set initial state
    auction.status = "LIVE";
    auction.currentIndex = 0;
    auction.currentPlayer = player._id;
    auction.currentBid = 0;
    auction.currentHighestTeam = null;
    auction.bids = []; // clear history

    await auction.save();

    const populatedAuction = await Auction.findById(id)
      .populate("currentPlayer")
      .populate("currentHighestTeam");

    return res.status(200).json({
      message: "Auction started successfully",
      auction: populatedAuction,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error starting auction",
      error: error.message,
    });
  }
};
