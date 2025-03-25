import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    console.error("Error capturado pela Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Você pode renderizar uma UI personalizada
      return (
        <div className="error-container">
          <h2>Algo deu errado.</h2>
          <button 
            onClick={() => {
              // Limpar o cache e tentar novamente
              import('../services/api').then(module => {
                module.default.clearCache();
                this.setState({ hasError: false });
                window.location.reload();
              });
            }}
            className="retry-button"
          >
            Tentar novamente
          </button>
          {this.props.showDetails && (
            <details style={{ marginTop: 20, whiteSpace: 'pre-wrap' }}>
              <summary>Detalhes do erro</summary>
              {this.state.error && this.state.error.toString()}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
