import { hueFor, initials } from "../lib/people";

export function Avatar({ name, size = "md", title }) {
  return (
    <span
      className={`avatar avatar-${size}`}
      style={{ "--hue": hueFor(name) }}
      title={title ?? name}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ names, max = 4 }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <span className="avatar-stack" aria-label={names.join(", ")}>
      {shown.map((n) => (
        <Avatar key={n} name={n} size="sm" />
      ))}
      {extra > 0 && <span className="avatar avatar-sm avatar-more">+{extra}</span>}
    </span>
  );
}
