"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Signed-in users without a purchase get redirected here as `/?upgrade=true`
 * by the proxy. Drop them at the pricing block rather than the top of the page.
 */
export default function UpgradeScroller() {
  const searchParams = useSearchParams();
  const upgrade = searchParams.get("upgrade");

  useEffect(() => {
    if (upgrade === "true") {
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [upgrade]);

  return null;
}
