"use client";

import { useMemo, useState } from "react";

interface SafeProjectImageProps {
  src?: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  showWhenMissing?: boolean;
}

const PLACEHOLDER_SRC = "/images/project-placeholder.svg";

export default function SafeProjectImage({
  src,
  alt,
  style,
  className,
  showWhenMissing = false,
}: SafeProjectImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const resolvedSrc = useMemo(() => {
    if (failed) return PLACEHOLDER_SRC;
    if (src && src.trim()) return src;
    return showWhenMissing ? PLACEHOLDER_SRC : "";
  }, [failed, showWhenMissing, src]);

  if (!resolvedSrc) return null;

  return (
    <div className={`project-image-frame ${className || ""}`} style={style}>
      {!loaded ? <div className="project-image-skeleton" aria-hidden="true" /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedSrc}
        alt={alt}
        className="project-image"
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setFailed(true);
          setLoaded(true);
        }}
      />
    </div>
  );
}
