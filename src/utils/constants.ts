type SkillLevel = "elite" | "strong" | "medium" | "beginner";

export const BASE_PRICE_MAP: Record<SkillLevel, number> = {
  elite: 300,
  strong: 200,
  medium: 120,
  beginner: 80,
};

export const TEAM_PURSE = 1000;

// playerBasePrice = BASE_PRICE_MAP[player.skillLevel]
