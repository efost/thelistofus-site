import type { Person } from "@/lib/lists";

export function Avatar({
  person,
  size = 28,
  ring = "var(--surface)",
}: {
  person: Person;
  size?: number;
  /** Colour of the separating ring, or "none". */
  ring?: string;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-heading"
      style={{
        width: size,
        height: size,
        background: person.color,
        color: person.darkText ? "rgba(0,0,0,0.85)" : "#fff",
        fontSize: size * 0.44,
        boxShadow: ring === "none" ? undefined : `0 0 0 2px ${ring}`,
      }}
      title={person.name}
      aria-hidden
    >
      {person.initial}
    </span>
  );
}

/** Overlapping avatars, with "+N" for the rest (including members we can't name). */
export function AvatarStack({
  people,
  extra = 0,
  size = 32,
  limit = 4,
  ring = "var(--surface)",
}: {
  people: Person[];
  extra?: number;
  size?: number;
  limit?: number;
  ring?: string;
}) {
  const shown = people.slice(0, limit);
  const more = people.length - shown.length + extra;
  const overlap = -size * 0.28;
  return (
    <span className="inline-flex items-center">
      {shown.map((p, i) => (
        <span key={p.id ?? p.name} style={{ marginLeft: i === 0 ? 0 : overlap }}>
          <Avatar person={p} size={size} ring={ring} />
        </span>
      ))}
      {more > 0 && (
        <span
          className="inline-flex items-center justify-center rounded-full bg-surface-secondary font-heading text-ink"
          style={{
            width: size,
            height: size,
            marginLeft: shown.length ? overlap : 0,
            fontSize: size * 0.36,
            boxShadow: ring === "none" ? undefined : `0 0 0 2px ${ring}`,
          }}
        >
          +{more}
        </span>
      )}
    </span>
  );
}
