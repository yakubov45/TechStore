import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#1a1a24',
                        color: '#ffffff',
                        border: '1px solid #00b8d9',
                    },
                    success: {
                        iconTheme: {
                            primary: '#00b8d9',
                            secondary: '#ffffff',
                        },
                    },
                }}
            />
        </BrowserRouter>
    </React.StrictMode>
);
