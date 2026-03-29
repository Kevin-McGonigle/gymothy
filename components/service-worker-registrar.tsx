"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (navigator.serviceWorker) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
        .catch(() => {});
    }
  }, []);

  return null;
}
