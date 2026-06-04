export const TEAM_COLORS = {
  "Red Bull Racing": "#3671C6",
  "Ferrari": "#E80020",
  "Mercedes": "#27F4D2",
  "McLaren": "#FF8000",
  "Aston Martin": "#229971",
  "Alpine": "#0090FF",
  "Williams": "#005AFF",
  "RB": "#6692FF",
  "Kick Sauber": "#52E252",
  "Haas F1 Team": "#B6BABD",
};

export function getTeamColor(team) {
  return TEAM_COLORS[team] || "#FFFFFF";
}