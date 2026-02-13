import mongoose, { Schema, Document } from "mongoose";

export interface IAuction extends Document {
  status: "NOT_STARTED" | "LIVE" | "COMPLETED";
  currentPlayer: mongoose.Types.ObjectId | null;
  currentBid: number;
  currentHighestTeam: mongoose.Types.ObjectId | null;
  order: mongoose.Types.ObjectId[];
  currentIndex: number;
}

const auctionSchema = new Schema<IAuction>({
  status: {
    type: String,
    enum: ["NOT_STARTED", "LIVE", "COMPLETED"],
    default: "NOT_STARTED",
  },

  currentPlayer: {
    type: Schema.Types.ObjectId,
    ref: "Player",
    default: null,
  },

  currentBid: {
    type: Number,
    default: 0,
  },

  currentHighestTeam: {
    type: Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },

  order: [
    {
      type: Schema.Types.ObjectId,
      ref: "Player",
    },
  ],

  currentIndex: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model<IAuction>("Auction", auctionSchema);
