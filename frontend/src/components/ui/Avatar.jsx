// Shared avatar. Lives in ui/ rather than beside the editor because the header
// on both shells renders it too, and three copies of "initials on a colour"
// drift apart within a week.

export const AVATAR_COLORS = [
  "#005A36", "#1E3A6E", "#B3261E", "#D4AF37",
  "#5B4B8A", "#8C4A6B", "#1E6F8C", "#6B8E23",
];

export const initialsFor = (name) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "K";

export function Avatar({ name, avatar, size = 56, rounded = "rounded-2xl", className = "" }) {
  if (avatar?.photo) {
    return (
      <img src={avatar.photo} alt="" className={`shrink-0 object-cover ${rounded} ${className}`}
        style={{ width: size, height: size }} />
    );
  }
  return (
    <span className={`grid shrink-0 place-items-center font-bold text-white ${rounded} ${className}`}
      style={{ width: size, height: size, background: avatar?.color || AVATAR_COLORS[0], fontSize: size * 0.32 }}>
      {initialsFor(name)}
    </span>
  );
}
