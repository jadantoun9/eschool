import { Skeleton, NavSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="page">
      <div className="page-inner">
        <NavSkeleton />
        <section className="section">
          <div className="container">
            {/* grade header */}
            <div className="row" style={{ gap: 20 }}>
              <Skeleton w={72} h={72} r={18} />
              <div>
                <div className="row" style={{ gap: 10 }}>
                  <Skeleton w={140} h={16} r={6} />
                  <Skeleton w={48} h={22} r={6} />
                </div>
                <Skeleton w={360} h={56} r={10} style={{ marginTop: 12 }} />
              </div>
            </div>

            {/* worksheet cards */}
            <div className="grid grid--2" style={{ marginTop: 40 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <Skeleton w={36} h={22} r={999} />
                    <Skeleton w={80} h={22} r={999} />
                  </div>
                  <Skeleton w="80%" h={20} r={6} style={{ marginTop: 16 }} />
                  <Skeleton w="55%" h={20} r={6} style={{ marginTop: 8 }} />
                  <div
                    style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)" }}
                  >
                    <Skeleton w={120} h={13} r={6} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
