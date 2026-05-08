import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, Copy } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  copied?: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  private handleCopy = async () => {
    const { error, errorInfo } = this.state;
    const text = [
      `Message: ${error?.message ?? "(no message)"}`,
      `Name: ${error?.name ?? "Error"}`,
      `URL: ${typeof window !== "undefined" ? window.location.href : ""}`,
      `UA: ${typeof navigator !== "undefined" ? navigator.userAgent : ""}`,
      "",
      "Stack:",
      error?.stack ?? "(no stack)",
      "",
      "Component stack:",
      errorInfo?.componentStack ?? "(no component stack)",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      // ignore
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, copied } = this.state;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm m-4">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-consciousness font-bold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-white/60 mb-6 max-w-md font-body">
            We encountered an error while loading this component. This could be due to a network issue or a temporary glitch.
          </p>

          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <Button
              onClick={this.handleRetry}
              variant="outline"
              className="font-consciousness border-white/20 hover:border-violet-500/50"
            >
              Retry Loading
            </Button>
            <Button
              onClick={this.handleCopy}
              variant="outline"
              className="font-consciousness border-white/20 hover:border-violet-500/50"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Copied!" : "Copy error details"}
            </Button>
          </div>

          {error && (
            <details className="w-full max-w-2xl text-left bg-black/40 border border-white/10 rounded-lg p-4 text-xs">
              <summary className="cursor-pointer text-white/80 font-mono mb-2">
                Error details ({error.name}: {error.message || "no message"})
              </summary>
              <pre className="mt-3 whitespace-pre-wrap break-words text-white/60 max-h-64 overflow-auto">
{error.stack || "(no stack trace)"}
              </pre>
              {errorInfo?.componentStack && (
                <>
                  <div className="mt-3 text-white/80 font-mono">Component stack:</div>
                  <pre className="mt-1 whitespace-pre-wrap break-words text-white/60 max-h-64 overflow-auto">
{errorInfo.componentStack}
                  </pre>
                </>
              )}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
