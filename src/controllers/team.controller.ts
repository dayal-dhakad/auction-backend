import { Request, Response } from "express";
import Team from "../models/team.model";
import { BASE_PRICE_MAP, TEAM_PURSE } from "../utils/constants";
import { createTeamSchema } from "../validations/team.validation";
import mongoose from "mongoose";
import Player from "../models/player.model";

// export const createTeam = async (req: Request, res: Response) => {
//   try {
//     // ✅ Validate body
//     const parsed = createTeamSchema.parse(req.body);
//     const { auctionId } = req.params;
//     const { teamName, captain, logo } = parsed;

//     // ✅ Validate captain ID format
//     if (!mongoose.Types.ObjectId.isValid(captain)) {
//       return res.status(400).json({
//         message: "Invalid captain ID",
//       });
//     }

//     // ✅ Check if captain exists
//     const captainPlayer = await Player.findById(captain);
//     if (!captainPlayer) {
//       return res.status(404).json({
//         message: "Captain player not found",
//       });
//     }

//     captainPlayer.isSold = true;
//     captainPlayer.basePrice = BASE_PRICE_MAP[captainPlayer.skillLevel];
//     captainPlayer.isCaptain = true;
//     captainPlayer.team = team._id;

//     await captainPlayer.save();
//     // ✅ Prevent duplicate team names
//     const existingTeam = await Team.findOne({ teamName });
//     if (existingTeam) {
//       return res.status(400).json({
//         message: "Team name already exists",
//       });
//     }

//     const purse = TEAM_PURSE;

//     const team = await Team.create({
//       teamName,
//       captain,
//       purse,
//       remainingPurse: purse,
//       logo,
//       players: [],
//       auction: auctionId,
//     });

//     const populatedTeam = await team.populate("auction");

//     return res.status(201).json({
//       success: true,
//       message: "Team created successfully",
//       team: populatedTeam,
//     });
//   } catch (error: any) {
//     if (error.name === "ZodError") {
//       return res.status(400).json({
//         message: "Validation Error",
//         errors: error.errors,
//       });
//     }

//     return res.status(500).json({
//       message: "Error creating team",
//       error: error.message,
//     });
//   }
// };
export const createTeam = async (
  req: Request<{ auctionId: string }>,
  res: Response,
) => {
  try {
    const parsed = createTeamSchema.parse(req.body);
    const { auctionId } = req.params;
    const { teamName, captain, logo } = parsed;

    // ✅ Validate auctionId
    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return res.status(400).json({
        message: "Invalid auction ID",
      });
    }

    // ✅ Validate captain ID
    if (!mongoose.Types.ObjectId.isValid(captain)) {
      return res.status(400).json({
        message: "Invalid captain ID",
      });
    }

    // ✅ Check captain exists
    const captainPlayer = await Player.findById(captain);

    if (!captainPlayer) {
      return res.status(404).json({
        message: "Captain player not found",
      });
    }

    // ❌ Prevent captain already sold
    if (captainPlayer.isSold) {
      return res.status(400).json({
        message: "This player is already sold",
      });
    }

    // ❌ Prevent captain from different auction
    if (captainPlayer.auction.toString() !== auctionId) {
      return res.status(400).json({
        message: "Captain does not belong to this auction",
      });
    }

    // ✅ Prevent duplicate team name in same auction
    const existingTeam = await Team.findOne({
      teamName,
      auction: auctionId,
    });

    if (existingTeam) {
      return res.status(400).json({
        message: "Team name already exists",
      });
    }

    const purse = TEAM_PURSE;

    // ✅ Deduct captain price
    const remainingPurse = purse - captainPlayer.basePrice;

    // ❌ Prevent invalid purse
    if (remainingPurse < 0) {
      return res.status(400).json({
        message: "Invalid captain price",
      });
    }

    // ✅ Create team
    const team = await Team.create({
      teamName,
      captain,
      purse,
      remainingPurse,
      logo,
      players: [captainPlayer._id], // include captain
      auction: auctionId,
    });

    // ✅ Update captain
    captainPlayer.isSold = true;
    captainPlayer.soldPrice = captainPlayer.basePrice;
    captainPlayer.isCaptain = true;
    captainPlayer.team = team._id;

    await captainPlayer.save();

    const populatedTeam = await Team.findById(team._id)
      .populate("captain")
      .populate("players");

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      team: populatedTeam,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: error.issues,
      });
    }

    return res.status(500).json({
      message: "Error creating team",
      error: error.message,
    });
  }
};

export const getTeams = async (
  req: Request<{ auctionId: string }>,
  res: Response,
) => {
  try {
    const { auctionId } = req.params;

    // ✅ Validate auctionId
    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return res.status(400).json({
        message: "Invalid auction ID",
      });
    }

    const teams = await Team.find({ auction: auctionId })
      .populate("players")
      .populate("captain")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      teams,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching teams",
      error: error.message,
    });
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
