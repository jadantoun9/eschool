import { Skeleton } from "@/components/Skeleton";

// Shown while a student's answers for one worksheet load.
export default function Loading() {
  return (
    <div>
      <Skeleton w={110} h={14} r={6} style={{ marginBottom: 18 }} />
      <div className="section-head" style={{ marginBottom: 28 }}>
        <div>
          <Skeleton w={140} h={13} r={6} />
          <Skeleton w={380} h={40} r={10} style={{ marginTop: 14 }} />
          <Skeleton w={180} h={14} r={6} style={{ marginTop: 10 }} />
        </div>
        <div className="row" style={{ gap: 28 }}>
          <Skeleton w={80} h={54} r={10} />
          <Skeleton w={80} h={54} r={10} />
        </div>
      </div>

      <div className="col" style={{ gap: 14 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div className="row" style={{ gap: 10, marginBottom: 12 }}>
              <Skeleton w={34} h={22} r={6} />
              <Skeleton w={90} h={22} r={999} />
            </div>
            <Skeleton w="70%" h={18} r={6} style={{ marginBottom: 14 }} />
            <div className="col" style={{ gap: 6 }}>
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} w="100%" h={38} r={10} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
