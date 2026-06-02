import { Skeleton, NavSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="page">
      <div className="page-inner">
        <NavSkeleton />
        <section className="section" style={{ paddingTop: 40, paddingBottom: 24 }}>
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1.05fr) minmax(0,1fr)",
                gap: 80,
                alignItems: "center",
              }}
            >
              <div>
                <Skeleton w={220} h={30} r={999} />
                <div style={{ marginTop: 28 }}>
                  <Skeleton w="90%" h={64} r={12} />
                  <Skeleton w="60%" h={64} r={12} style={{ marginTop: 12 }} />
                </div>
                <div style={{ marginTop: 28 }}>
                  <Skeleton w="100%" h={16} r={6} />
                  <Skeleton w="80%" h={16} r={6} style={{ marginTop: 10 }} />
                </div>
                <div className="row" style={{ gap: 12, marginTop: 36 }}>
                  <Skeleton w={180} h={48} r={12} />
                  <Skeleton w={150} h={48} r={12} />
                </div>
                <div className="stats" style={{ marginTop: 48 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="stat">
                      <Skeleton w={56} h={40} r={8} />
                      <Skeleton w={72} h={13} r={6} style={{ marginTop: 8 }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="col" style={{ gap: 14 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card card--row">
                    <Skeleton w={52} h={52} r={14} />
                    <div style={{ flex: 1 }}>
                      <Skeleton w={160} h={22} r={6} />
                      <Skeleton w={120} h={13} r={6} style={{ marginTop: 8 }} />
                    </div>
                    <Skeleton w={36} h={36} r={999} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
