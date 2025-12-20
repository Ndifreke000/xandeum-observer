import { Buffer } from 'buffer';
// @ts-expect-error - Buffer polyfill for browser compatibility
window.Buffer = Buffer;
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from './components/ErrorBoundary';
import { validateEnv } from './config/env';

// Validate environment variables
validateEnv();

// Track unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // TODO: Send to error tracking service (Sentry, etc.)
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // TODO: Send to error tracking service
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
