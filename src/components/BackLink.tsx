import Link from "next/link";

/**
 * Consistent "← label" back link used at the top of nested pages.
 * Plain anchor (no client state) so it works in both server and client components.
 */
export function BackLink({
  href,
  label,
  style,
}: {
  href: string;
  label: string;
  style?: React.CSSProperties;
}) {
  return (
    <Link
      href={href}
      className="muted"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        marginBottom: 24,
        ...style,
      }}
    >
      ← {label}
    </Link>
  );
}
