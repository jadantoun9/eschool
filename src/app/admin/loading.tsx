import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="section-head">
        <div>
          <Skeleton w={120} h={13} r={6} />
          <Skeleton w={260} h={36} r={8} style={{ marginTop: 12 }} />
        </div>
        <Skeleton w={150} h={46} r={12} />
      </div>

      <div className="table" style={{ padding: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2.4fr 1fr 1fr 1fr 0.8fr",
            gap: 16,
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            background: "rgba(0,0,0,0.15)",
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} w={i === 0 ? 90 : 60} h={12} r={6} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, r) => (
          <div
            key={r}
            style={{
              display: "grid",
              gridTemplateColumns: "2.4fr 1fr 1fr 1fr 0.8fr",
              gap: 16,
              alignItems: "center",
              padding: "16px 20px",
              borderBottom: r < 5 ? "1px solid var(--border)" : undefined,
            }}
          >
            <div className="row" style={{ gap: 12 }}>
              <Skeleton w={36} h={36} r={10} />
              <Skeleton w={200} h={16} r={6} />
            </div>
            <Skeleton w={70} h={14} r={6} />
            <Skeleton w={50} h={14} r={6} />
            <Skeleton w={80} h={22} r={999} />
            <div className="row" style={{ justifyContent: "flex-end", gap: 6 }}>
              <Skeleton w={32} h={32} r={8} />
              <Skeleton w={32} h={32} r={8} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
