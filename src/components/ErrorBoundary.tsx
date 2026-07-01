import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global ErrorBoundary.
 * Catches uncaught React render/lifecycle errors and shows a safe fallback UI
 * instead of unmounting the entire app (white screen).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        role="alert"
        className="min-h-screen flex items-center justify-center bg-background p-6"
      >
        <div className="max-w-md w-full text-center space-y-4">
          <div className="flex justify-center">
            <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold">Une erreur inattendue est survenue</h1>
          <p className="text-muted-foreground text-sm">
            L'application a rencontré un problème. Vous pouvez réessayer ou recharger la page.
          </p>
          {this.state.error?.message && (
            <pre className="text-xs text-left bg-muted p-3 rounded overflow-auto max-h-40">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={this.handleReset}>
              Réessayer
            </Button>
            <Button onClick={this.handleReload}>Recharger la page</Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
