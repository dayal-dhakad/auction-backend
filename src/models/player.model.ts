import mongoose, { Schema } from "mongoose";

export interface IPlayer extends Document {
  name: string;
  skillLevel: "elite" | "strong" | "medium" | "beginner";
  basePrice: number;
  soldPrice?: number;
  isSold: boolean;
  team?: mongoose.Types.ObjectId | null;
  image?: string;
  gender: "male" | "female";
}

const playerSchema = new Schema<IPlayer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    skillLevel: {
      type: String,
      enum: ["elite", "strong", "medium", "beginner"],
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    soldPrice: {
      type: Number,
      default: 0,
    },
    isSold: {
      type: Boolean,
      default: false,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IPlayer>("Player", playerSchema);
