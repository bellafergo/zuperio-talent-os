"use client";

import * as React from "react";

type BoundaryState = { error: Error | null };

/**
 * Catches render errors in client descendants so optional UI (e.g. exports) cannot crash the route.
 */
export class OptionalClientSectionBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  BoundaryState
> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <>{this.props.fallback}</>;
    }
    return this.props.children;
  }
}
