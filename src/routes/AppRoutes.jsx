import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/login';
import Home from '../pages/home';
import MainLayout from '../layout/MainLayout';
import PrivateRoute from './ProtectedRoute';
import StudentHealthRecord from '../pages/parent/health-records';
import ParentPage from '../pages/parent';
import MedicineForm from '../pages/parent/medicine-submission';
import MedicalEvents from '../pages/school-nurse/medical-events';
import NursePage from '../pages/school-nurse';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<MainLayout />}>
        {/* Public route - Homepage */}
        <Route index element={<Home />} />
        <Route path="home" element={<Home />} />

        {/* Protected routes */}
        <Route path="parent" element={
          <PrivateRoute>
            <ParentPage />
          </PrivateRoute>
        } />
        <Route path="health-records" element={
          <PrivateRoute>
            <StudentHealthRecord />
          </PrivateRoute>
        } />
        <Route path="medications" element={
          <PrivateRoute>
            <MedicineForm />
          </PrivateRoute>
        } />
        <Route path="school-nurse" element={
          <PrivateRoute>
            <NursePage />
          </PrivateRoute>
        } />
        <Route path='medical-events' element={
          <PrivateRoute>
            <MedicalEvents />
          </PrivateRoute>

        } />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
