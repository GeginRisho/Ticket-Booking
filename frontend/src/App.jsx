import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      {/* Toast configurations in premium glassmorphism light theme */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 3500,
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            color: '#1F2937',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            fontWeight: '500',
            fontSize: '14px'
          }
        }} 
      />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
