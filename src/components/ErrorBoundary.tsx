import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Movie bracket crashed:', error);
  }

  render() {
    if (this.state.crashed) {
      return (
        <div className="screen centered">
          <div className="card setup-card">
            <h1>Something went wrong</h1>
            <p className="muted">
              The app hit an unexpected error, likely from a corrupted saved tournament. Resetting will clear this
              browser's saved state (your TMDb key and tournament history are kept).
            </p>
            <button
              className="primary"
              onClick={() => {
                localStorage.removeItem('movie-bracket-state-v2');
                window.location.reload();
              }}
            >
              Reset tournament &amp; reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
