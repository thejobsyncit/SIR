import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppProvider } from './context/AppContext';
import { CrmProvider } from './crm/context/CrmContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <CrmProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </CrmProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
