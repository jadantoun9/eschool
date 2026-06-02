import { Skeleton, NavSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="page">
      <div className="page-inner">
        <NavSkeleton />
        <section className="section">
          <div className="container">
            {/* subject header */}
            <div className="row" style={{ gap: 20 }}>
              <Skeleton w={72} h={72} r={18} />
              <div>
                <Skeleton w={120} h={24} r={999} />
                <Skeleton w={320} h={56} r={10} style={{ marginTop: 12 }} />
              </div>
            </div>

            {/* grade cards grid */}
            <div
              className="grid"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", marginTop: 48 }}
            >
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <Skeleton w={64} h={24} r={6} />
                    <Skeleton w={36} h={36} r={999} />
                  </div>
                  <Skeleton w={70} h={56} r={8} style={{ marginTop: 28 }} />
                  <Skeleton w={110} h={13} r={6} style={{ marginTop: 14 }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
