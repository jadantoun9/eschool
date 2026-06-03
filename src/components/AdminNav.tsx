"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

function isActive(pathname: string, href: string): boolean {
  // The Quizzes tab owns /admin and everything under /admin/quizzes.
  if (href === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/quizzes");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <div className="subjects-nav">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={`pill${isActive(pathname, it.href) ? " pill--active" : ""}`}
          aria-current={isActive(pathname, it.href) ? "page" : undefined}
        >
          {it.label}
        </Link>
      ))}
    </div>
  );
}
