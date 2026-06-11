import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="p-6 bg-red-950/20 border border-red-500/30 rounded-2xl text-red-400 font-mono text-xs max-w-lg mx-auto my-8">
          <h2 className="font-black text-sm uppercase tracking-wider mb-2">Runtime Error</h2>
          <pre className="whitespace-pre-wrap break-all text-[11px]">
            {this.state.error?.message || "Unknown error"}
          </pre>
          <pre className="whitespace-pre-wrap break-all text-[10px] text-red-500/70 mt-2">
            {this.state.error?.stack?.split("\n").slice(0, 6).join("\n") || ""}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-xs font-bold cursor-pointer"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
