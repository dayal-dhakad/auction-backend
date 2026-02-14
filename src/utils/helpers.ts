export const generateDramaOrder = (players: any[]) => {
  const elites = players.filter((p) => p.skillLevel === "elite");
  const strong = players.filter((p) => p.skillLevel === "strong");
  const medium = players.filter((p) => p.skillLevel === "medium");
  const beginner = players.filter((p) => p.skillLevel === "beginner");
  const females = players.filter((p) => p.gender === "female");

  const order: any[] = [];

  // 🔥 Phase 1 – Warm-up
  for (let i = 0; i < 3 && (medium.length || strong.length); i++) {
    if (medium.length) order.push(medium.shift());
    if (strong.length) order.push(strong.shift());
  }

  // 💣 First Elite Drop
  if (elites.length) order.push(elites.shift());

  // ⚖ Phase 3 – Balanced Mix
  while (medium.length || strong.length || beginner.length) {
    if (medium.length) order.push(medium.shift());
    if (strong.length) order.push(strong.shift());
    if (beginner.length) order.push(beginner.shift());
  }

  // 👀 Phase 4 – Spread Remaining Females (if any left)
  females.forEach((f) => {
    if (!order.includes(f)) {
      order.splice(Math.floor(order.length / 2), 0, f);
    }
  });

  // 🧨 Final Elite Showdown
  elites.forEach((e) => order.push(e));

  return order;
};
