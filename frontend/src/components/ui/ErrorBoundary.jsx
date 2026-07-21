import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 border border-red-200 bg-red-50/50 rounded-3xl space-y-4 text-left shadow-sm my-4">
          <div className="flex items-center gap-3 text-red-700 font-extrabold text-lg">
            <FiAlertTriangle size={24} className="shrink-0 animate-bounce" />
            <h3>Widget Error Caught</h3>
          </div>
          <p className="text-xs text-text-secondary">
            {this.props.fallbackMessage || 'An unexpected error occurred in this dashboard widget, but the rest of the application remains fully functional.'}
          </p>
          {this.state.error && (
            <pre className="p-3 bg-red-100/70 border border-red-200 rounded-xl text-[11px] font-mono text-red-900 overflow-x-auto">
              {this.state.error.toString()}
            </pre>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="danger"
              size="sm"
              onClick={this.handleReset}
              className="flex items-center gap-1.5"
            >
              <FiRefreshCw size={14} />
              <span>Retry Widget</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
