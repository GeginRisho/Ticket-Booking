import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      {/* Toast configurations in premium glassmorphism light theme with sticky header offset */}
      <Toaster 
        position="top-center" 
        containerStyle={{
          top: 72,
          zIndex: 99999
        }}
        toastOptions={{
          duration: 3500,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            color: '#1F2937',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            fontWeight: '600',
            fontSize: '13px'
          }
        }} 
      />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
