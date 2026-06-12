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

// export const TEAM_COLORS = {
//   "Red Bull Racing": 0x3671c6,
//   "Ferrari": 0xe80020,
//   "Mercedes": 0x27f4d2,
//   "McLaren": 0xff8000,
//   "Aston Martin": 0x006f62,
//   "Williams": 0x005aff,
//   "Alpine": 0xff87bc,
//   "RB": 0x6692ff,
//   "Kick Sauber": 0x52e252,
//   "Haas F1 Team": 0xffffff,
// };

export function getTeamColor(team) {
  return TEAM_COLORS[team] || "#FFFFFF";
}