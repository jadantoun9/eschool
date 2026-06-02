import { Skeleton, NavSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="page">
      <div className="page-inner">
        <NavSkeleton />
        <section className="section">
          <div className="container container--narrow">
            {/* header */}
            <Skeleton w={140} h={13} r={6} />
            <Skeleton w="70%" h={34} r={8} style={{ marginTop: 12 }} />
            {/* progress bar */}
            <Skeleton w="100%" h={6} r={999} style={{ marginTop: 24 }} />

            {/* question cards */}
            {Array.from({ length: 2 }).map((_, c) => (
              <div key={c} className="card" style={{ marginTop: 20 }}>
                <Skeleton w={110} h={22} r={999} />
                <Skeleton w="85%" h={18} r={6} style={{ marginTop: 16 }} />
                <Skeleton w="60%" h={18} r={6} style={{ marginTop: 8 }} />
                <div className="col" style={{ gap: 10, marginTop: 18 }}>
                  {Array.from({ length: 4 }).map((_, o) => (
                    <div
                      key={o}
                      className="row"
                      style={{
                        gap: 14,
                        padding: "16px 18px",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        background: "var(--surface)",
                      }}
                    >
                      <Skeleton w={32} h={32} r={8} />
                      <Skeleton w={`${50 + ((o * 13) % 35)}%`} h={15} r={6} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Skeleton w="100%" h={56} r={12} style={{ marginTop: 24 }} />
          </div>
        </section>
      </div>
    </div>
  );
}
