import mongoose, { Schema } from "mongoose";

export interface ITeam extends Document {
  teamName: string;
  captain: mongoose.Types.ObjectId;
  purse: number;
  remainingPurse: number;
  players: mongoose.Types.ObjectId[];
  logo: string;
  auction: mongoose.Types.ObjectId;
}

const teamSchema = new Schema<ITeam>(
  {
    teamName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    captain: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    purse: {
      type: Number,
      required: true,
    },
    remainingPurse: {
      type: Number,
      required: true,
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    logo: {
      type: String,
    },
    auction: {
      type: Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<ITeam>("Team", teamSchema);
