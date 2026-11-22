/** Stable hue per name so each person keeps the same avatar color everywhere. */
export function hueFor(name = "") {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)) >>> 0;
  return hash % 360;
}

export function initials(name = "") {
  const parts = name.split(/[._\-\s]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** "you" for the signed-in user, otherwise their username. */
export function displayName(username, me) {
  return username === me ? "You" : username;
}
