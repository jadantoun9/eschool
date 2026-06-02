import Image from "next/image";

type SkelProps = {
  w?: number | string;
  h?: number | string;
  r?: number | string;
  className?: string;
  style?: React.CSSProperties;
};

/** A single shimmer placeholder. Size via w/h (px or any CSS length), r = radius. */
export function Skeleton({ w, h = 14, r, className = "", style }: SkelProps) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{
        width: w,
        height: h,
        borderRadius: r,
        ...style,
      }}
    />
  );
}

/**
 * Static, DB-free copy of the top nav so loading skeletons keep the page shell
 * (brand + placeholder pills) instead of flashing a blank header.
 */
export function NavSkeleton({ pills = 4 }: { pills?: number }) {
  return (
    <nav className="topnav" aria-hidden="true">
      <div className="topnav__left">
        <span className="brand">
          <span className="brand__mark">
            <Image src="/ice-logo.png" alt="" width={44} height={44} priority />
          </span>
          <span className="brand__word">
            <b>ICE</b> Learning
          </span>
        </span>
      </div>
      <div className="topnav__center">
        <div className="subjects-nav">
          {Array.from({ length: pills }).map((_, i) => (
            <Skeleton key={i} w={96} h={38} r={999} />
          ))}
        </div>
      </div>
      <div className="topnav__right">
        <Skeleton w={72} h={34} r={999} />
        <Skeleton w={96} h={38} r={999} />
        <Skeleton w={44} h={44} r={10} />
      </div>
    </nav>
  );
}
