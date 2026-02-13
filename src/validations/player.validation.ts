import { z } from "zod";

export const createPlayerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),

  skillLevel: z.enum(["elite", "strong", "medium", "beginner"]),

  gender: z.enum(["male", "female"]).describe("Gender must be male or female"),
});

// UPDATE PLAYER (all fields optional)
export const updatePlayerSchema = createPlayerSchema.partial();
