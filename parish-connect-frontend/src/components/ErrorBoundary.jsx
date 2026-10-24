import { Component } from 'react';

// Keep a render error from turning the entire app into a blank white screen.
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('ParishConnect interface error:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return <div className="app-error-page">
                <div className="card">
                    <h1>ParishConnect encountered a display error.</h1>
                    <p>The page could not be displayed. Your account and database records have not been changed by this error.</p>
                    <button type="button" onClick={() => window.location.reload()}>Reload ParishConnect</button>
                </div>
            </div>;
        }
        return this.props.children;
    }
}
