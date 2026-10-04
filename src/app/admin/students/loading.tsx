import { Skeleton } from "@/components/Skeleton";

// Shown while the students list or a single student page loads.
export default function Loading() {
  return (
    <div>
      <Skeleton w={110} h={14} r={6} style={{ marginBottom: 18 }} />
      <div className="section-head" style={{ marginBottom: 36 }}>
        <div>
          <Skeleton w={120} h={13} r={6} />
          <Skeleton w={300} h={48} r={10} style={{ marginTop: 14 }} />
        </div>
        <div className="row" style={{ gap: 28 }}>
          <Skeleton w={80} h={54} r={10} />
          <Skeleton w={80} h={54} r={10} />
        </div>
      </div>

      <div className="table" style={{ padding: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 0.8fr 0.8fr 1fr 0.6fr",
            gap: 16,
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            background: "rgba(0,0,0,0.15)",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} w={i === 0 ? 90 : 60} h={12} r={6} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, r) => (
          <div
            key={r}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 0.8fr 0.8fr 1fr 0.6fr",
              gap: 16,
              alignItems: "center",
              padding: "18px 20px",
              borderBottom: r < 5 ? "1px solid var(--border)" : undefined,
            }}
          >
            <Skeleton w={180} h={16} r={6} />
            <Skeleton w={70} h={14} r={6} />
            <Skeleton w={30} h={14} r={6} />
            <Skeleton w={40} h={14} r={6} />
            <Skeleton w={90} h={14} r={6} />
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <Skeleton w={64} h={32} r={8} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
