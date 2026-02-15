type SkillLevel = "elite" | "strong" | "medium" | "beginner";

export const BASE_PRICE_MAP: Record<SkillLevel, number> = {
  elite: 300,
  strong: 200,
  medium: 120,
  beginner: 80,
};

export const TEAM_PLAYER_LIMIT = 6;
export const MIN_BASE_PRICE = BASE_PRICE_MAP.beginner;
export const TEAM_PURSE = 1000;
export const BID_INCREMENT = 20;

// playerBasePrice = BASE_PRICE_MAP[player.skillLevel]
