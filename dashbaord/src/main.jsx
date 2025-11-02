/**
 * Main Entry Point
 * 
 * Application entry point that renders the React app
 * Sets up React 18 with StrictMode for better development experience
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Create root and render the application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
