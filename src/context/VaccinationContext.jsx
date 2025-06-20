import React, { createContext, useState, useContext } from 'react';

const VaccinationContext = createContext();

export const VaccinationProvider = ({ children }) => {
  const [newVaccinationCount, setNewVaccinationCount] = useState(0);

  const incrementVaccinationCount = () => {
    setNewVaccinationCount(prev => prev + 1);
  };

  const decrementVaccinationCount = () => {
    setNewVaccinationCount(prev => Math.max(0, prev - 1));
  };

  const resetVaccinationCount = () => {
    setNewVaccinationCount(0);
  };

  return (
    <VaccinationContext.Provider value={{
      newVaccinationCount,
      incrementVaccinationCount,
      decrementVaccinationCount,
      resetVaccinationCount
    }}>
      {children}
    </VaccinationContext.Provider>
  );
};

export const useVaccination = () => {
  const context = useContext(VaccinationContext);
  if (!context) {
    throw new Error('useVaccination must be used within a VaccinationProvider');
  }
  return context;
}; 