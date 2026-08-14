import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss'
import App from './App';
import { UserProvider } from './context/userContext.jsx';
import FaviconUpdater from './components/FaviconUpdater';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FaviconUpdater />
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);

