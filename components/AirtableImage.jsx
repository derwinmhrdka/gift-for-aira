"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const MAX_RETRY = 2;

function withRetryParam(src, attempt) {
  if (!attempt) return src;
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}r=${attempt}`;
}

export default function AirtableImage({
  src,
  alt,
  sizes,
  className = "",
  fill = false,
  fallbackText = "No photo",
}) {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setLoaded(false);
    setFailed(false);
  }, [src]);

  const resolvedSrc = useMemo(() => withRetryParam(src, attempt), [src, attempt]);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-medium text-slate-600">
        {fallbackText}
      </div>
    );
  }

  return (
    <>
      {!loaded ? (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-slate-100 to-slate-50" />
      ) : null}
      <Image
        src={resolvedSrc}
        alt={alt}
        fill={fill}
        sizes={sizes}
        unoptimized
        className={className}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (attempt < MAX_RETRY) {
            setAttempt((a) => a + 1);
            return;
          }
          setFailed(true);
        }}
      />
    </>
  );
}
