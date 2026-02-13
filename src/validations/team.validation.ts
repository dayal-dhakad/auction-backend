import { z } from "zod";

// simple ObjectId validation (24 hex characters)
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const createTeamSchema = z.object({
  teamName: z.string().min(2, "Team name must be at least 2 characters").trim(),

  captainName: objectIdSchema,

  purse: z.number().positive("Purse must be greater than 0"),

  logo: z.string().url("Logo must be a valid URL").optional(),
});

export const updateTeamSchema = createTeamSchema.partial();
