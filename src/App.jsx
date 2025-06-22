import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { VaccinationProvider } from './context/VaccinationContext';

function App() {
  return (
    <VaccinationProvider>
      <AppRoutes />
    </VaccinationProvider>
  );
}

export default App;
