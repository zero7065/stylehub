import React, { useState, useEffect, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ErrorBoundary({ children, fallback }: Props) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      setHasError(true);
      setError(e.error);
    };
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

  useEffect(() => {
    const handler = (e: PromiseRejectionEvent) => {
      setHasError(true);
      setError(e.reason instanceof Error ? e.reason : new Error(String(e.reason)));
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  if (hasError) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="p-6 bg-red-950/20 border border-red-500/30 rounded-2xl text-red-400 font-mono text-xs max-w-lg mx-auto my-8">
        <h2 className="font-black text-sm uppercase tracking-wider mb-2">Runtime Error</h2>
        <pre className="whitespace-pre-wrap break-all text-[11px]">
          {error?.message || "Unknown error"}
        </pre>
        <pre className="whitespace-pre-wrap break-all text-[10px] text-red-500/70 mt-2">
          {error?.stack?.split("\n").slice(0, 6).join("\n") || ""}
        </pre>
        <button
          onClick={() => setHasError(false)}
          className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-xs font-bold cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }
  return <>{children}</>;
}
