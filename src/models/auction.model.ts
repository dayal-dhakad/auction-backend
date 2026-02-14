import mongoose, { Schema, Document } from "mongoose";

export interface IBid {
  team: mongoose.Types.ObjectId;
  amount: number;
  timestamp: Date;
}

export interface IAuction extends Document {
  title: string;
  description?: string;

  status: "NOT_STARTED" | "LIVE" | "COMPLETED";

  currentPlayer: mongoose.Types.ObjectId | null;
  currentBid: number;

  order: mongoose.Types.ObjectId[];
  currentIndex: number;
  currentHighestTeam: mongoose.Types.ObjectId | null;
  bids: IBid[];
}

const auctionSchema = new Schema<IAuction>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

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
    currentHighestTeam: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    currentBid: {
      type: Number,
      default: 0,
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
    bids: [
      {
        team: {
          type: Schema.Types.ObjectId,
          ref: "Team",
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model<IAuction>("Auction", auctionSchema);
