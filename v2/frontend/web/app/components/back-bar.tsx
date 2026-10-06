"use client";

import { useRouter } from "next/navigation";

interface BackBarProps {
  fallbackHref?: string;
}

export default function BackBar({ fallbackHref = "/" }: BackBarProps) {
  const router = useRouter();

  return (
    <div className="back-bar">
      <button
        type="button"
        className="back-button"
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
            return;
          }
          router.push(fallbackHref);
        }}
      >
        ← Retour
      </button>
    </div>
  );
}
