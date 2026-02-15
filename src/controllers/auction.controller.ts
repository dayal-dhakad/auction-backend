import { Request, Response } from "express";
import Auction from "../models/auction.model";
import Player from "../models/player.model";
import Team from "../models/team.model";
import { generateDramaOrder } from "../utils/helpers";
import mongoose from "mongoose";
import {
  BASE_PRICE_MAP,
  BID_INCREMENT,
  TEAM_PLAYER_LIMIT,
} from "../utils/constants";

export const createAuction = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    const auction = await Auction.create({
      title,
      description,
      order: [],
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
    const auctions = await Auction.find();
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
    const auction = await Auction.findById(id)
      .populate("order")
      .populate("currentPlayer")
      .populate("bids.team", "teamName");
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

    const players = await Player.find({
      auction: id,
      isCaptain: { $ne: true },
    });
    if (players.length === 0) {
      return res.status(400).json({
        message: "No players found for this auction",
      });
    }

    const orderedPlayers = generateDramaOrder(players);
    const firstPlayer = orderedPlayers[0];

    auction.status = "LIVE";
    auction.currentIndex = 0;
    auction.order = orderedPlayers.map((p) => p._id);
    auction.currentPlayer = firstPlayer?._id;
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

export const endAuction = async (
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

    if (auction.status === "COMPLETED") {
      return res.status(400).json({
        message: "Auction Already Ended",
      });
    }
    if (auction.status !== "LIVE") {
      return res.status(400).json({
        message: "Auction Not Live",
      });
    }

    auction.status = "COMPLETED";

    const endedAuction = await auction.save();

    return res.status(200).json({
      message: "Auction Ended Successfully",
      auction: endedAuction,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error ending auction",
      error: error.message,
    });
  }
};

export const bidOnPlayer = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { teamId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        message: "Invalid Team ID",
      });
    }
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

    if (auction.status !== "LIVE") {
      return res.status(400).json({
        message: "Auction is not live",
      });
    }
    const biddingTeam = await Team.findById(teamId);
    if (!biddingTeam) {
      return res.status(404).json({
        message: "Bidding Team not found",
      });
    }

    if (!biddingTeam) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    if (
      auction.currentHighestTeam &&
      auction.currentHighestTeam.toString() === teamId
    ) {
      return res.status(400).json({
        message: "This team already has highest bid",
      });
    }

    const player = await Player.findById(auction.currentPlayer);
    if (!player) {
      return res.status(400).json({
        message: "Current Player not found",
      });
    }
    let nextBidAmount = 0;

    if (auction.currentBid === 0) {
      // First bid → base price
      nextBidAmount = player.basePrice;
    } else {
      nextBidAmount = auction.currentBid + BID_INCREMENT;
    }
    if (biddingTeam.remainingPurse < nextBidAmount) {
      return res.status(400).json({
        message: "Insufficient purse",
      });
    }
    //also we have to add validation if the team will be able to fullfill all the places or not
    auction.currentBid = nextBidAmount;
    auction.currentHighestTeam = biddingTeam._id;

    auction.bids.push({
      team: biddingTeam._id,
      amount: nextBidAmount,
      timestamp: new Date(),
    });

    // ✅ Count players already in team
    const currentPlayersCount = biddingTeam.players.length;

    // Remaining slots after buying THIS player
    const remainingSlots = TEAM_PLAYER_LIMIT - (currentPlayersCount + 1);

    // Minimum purse required to fill remaining slots
    const minimumRequiredPurse = remainingSlots * BASE_PRICE_MAP.beginner;

    // Purse after this bid
    const purseAfterBid = biddingTeam.remainingPurse - nextBidAmount;

    // ❌ Prevent invalid bidding
    if (purseAfterBid < minimumRequiredPurse) {
      return res.status(400).json({
        message: `Cannot bid. Team must retain at least ${minimumRequiredPurse} purse to complete squad.`,
      });
    }

    await auction.save();

    const updatedAuction = await Auction.findById(id)
      .populate("currentPlayer")
      .populate("currentHighestTeam");

    return res.status(200).json({
      success: true,
      message: "Bid placed successfully",
      auction: updatedAuction,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error Bidding",
      error: error.message,
    });
  }
};
export const sellPlayer = async (
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

    if (auction.status === "COMPLETED") {
      return res.status(400).json({
        message: "Auction Already Ended",
      });
    }
    if (auction.status !== "LIVE") {
      return res.status(400).json({
        message: "Auction Not Live",
      });
    }
    if (!auction.currentPlayer) {
      return res.status(400).json({
        message: "No active player",
      });
    }

    if (!auction.currentHighestTeam) {
      return res.status(400).json({
        message: "Cannot sell player without bid",
      });
    }

    const buyerTeam = await Team.findById(auction.currentHighestTeam);
    const player = await Player.findById(auction.currentPlayer);

    if (!buyerTeam) {
      return res.status(404).json({
        message: "Team not found",
      });
    }
    if (!player) {
      return res.status(400).json({
        message: "Player not found",
      });
    }
    player.isSold = true;
    player.soldPrice = auction.currentBid;
    player.team = buyerTeam?._id;
    await player.save();

    buyerTeam.players.push(player?._id);
    buyerTeam.remainingPurse = buyerTeam.remainingPurse - auction.currentBid;
    await buyerTeam.save();

    const nextIndex = auction.currentIndex + 1;
    if (nextIndex >= auction.order.length) {
      auction.status = "COMPLETED";
      auction.currentPlayer = null;
    } else {
      auction.currentIndex = nextIndex;
      auction.currentPlayer = auction.order[nextIndex];
    }

    auction.currentBid = 0;
    auction.currentHighestTeam = null;
    auction.bids = [];
    await auction.save();

    return res.status(200).json({
      success: true,
      message: "Player sold successfully",
      player,
      buyerTeam,
      auction,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error selling player",
      error: error.message,
    });
  }
};

export const undoLastBid = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;

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

    if (auction.status !== "LIVE") {
      return res.status(400).json({
        message: "Auction is not live",
      });
    }

    // ❌ No bids to undo
    if (!auction.bids || auction.bids.length === 0) {
      return res.status(400).json({
        message: "No bids to undo",
      });
    }

    // ✅ Remove last bid
    auction.bids.pop();

    // ✅ Restore previous bid state
    if (auction.bids.length === 0) {
      // No bids left → reset
      auction.currentBid = 0;
      auction.currentHighestTeam = null;
    } else {
      // Restore previous bid
      const lastBid = auction.bids[auction.bids.length - 1];

      auction.currentBid = lastBid.amount;
      auction.currentHighestTeam = lastBid.team;
    }

    await auction.save();

    // Populate for frontend
    const updatedAuction = await Auction.findById(id)
      .populate("currentPlayer")
      .populate("currentHighestTeam")
      .populate("bids.team", "teamName");

    return res.status(200).json({
      success: true,
      message: "Last bid undone successfully",
      auction: updatedAuction,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error undoing bid",
      error: error.message,
    });
  }
};
