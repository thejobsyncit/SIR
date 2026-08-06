import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppProvider } from './context/AppContext';
import { CrmProvider } from './crm/context/CrmContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CrmProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </CrmProvider>
  </React.StrictMode>
);
