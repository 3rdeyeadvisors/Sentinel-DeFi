import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm m-4">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-consciousness font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-white/60 mb-6 max-w-md font-body">
            We encountered an error while loading this component. This could be due to a network issue or a temporary glitch.
          </p>
          <Button
            onClick={this.handleRetry}
            variant="outline"
            className="font-consciousness border-white/20 hover:border-violet-500/50"
          >
            Retry Loading
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
