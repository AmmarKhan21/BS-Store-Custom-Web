import React, { Component, ReactNode } from 'react';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { error: Error | null };

export default class GalleryErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm font-bold text-[#c9a66b]">3D preview unavailable</p>
            <p className="text-xs text-[#8a9a94]">{this.state.error.message}</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
