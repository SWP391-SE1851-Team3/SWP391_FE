import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/login';
import Home from '../pages/home/HomePage'; // hoặc import Home from '../pages/home/Home';
import MainLayout from '../layout/MainLayout';
import PrivateRoute from './ProtectedRoute';
import StudentHealthRecord from '../pages/parent/health-records';
import ParentPage from '../pages/parent';
import MedicineForm from '../pages/parent/medicine-submission';
import HealthCheckNotification from '../pages/parent/health-check';
import ParentVaccineConfirmation from '../pages/parent/vaccination';
import MedicalEvents from '../pages/school-nurse/medical-events';
import NursePage from '../pages/school-nurse';
import ManageMedication from '../pages/school-nurse/manage-medication';
import ManageVaccination from '../pages/school-nurse/manage-vaccination';
import ManagerPage from '../pages/manager';
import HealthCheckNurse from '../pages/school-nurse/manage-health-check';

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
          <PrivateRoute allowedRoles={[1]}>
            <ParentPage />
          </PrivateRoute>
        } />
        <Route path="manager" element={
          <PrivateRoute>
            <ManagerPage />
          </PrivateRoute>
        } />
        <Route path="health-records" element={
          <PrivateRoute allowedRoles={[1]}>
            <StudentHealthRecord />
          </PrivateRoute>
        } />

        <Route path="medications" element={
          <PrivateRoute allowedRoles={[1]}>
            <MedicineForm />
          </PrivateRoute>
        } />
        <Route path="health-check" element={
          <PrivateRoute allowedRoles={[1]}>
            <HealthCheckNotification />
          </PrivateRoute>
        } />
        <Route path="vaccination" element={
          <PrivateRoute allowedRoles={[1]}>
            <ParentVaccineConfirmation />
          </PrivateRoute>
        } />
        <Route path="school-nurse" element={
          <PrivateRoute allowedRoles={[2]}>
            <NursePage />
          </PrivateRoute>
        } />
        <Route path='medical-events' element={
          <PrivateRoute allowedRoles={[2]}>
            <MedicalEvents />
          </PrivateRoute>

        } />
        <Route path='manage-medication' element={
          <PrivateRoute allowedRoles={[2]}>
            <ManageMedication />
          </PrivateRoute>
        } />

        <Route path='manage-vaccination' element={
          <PrivateRoute allowedRoles={[2]}>
            <ManageVaccination />
          </PrivateRoute>
        } />
         <Route path='manage-health-check' element={
          <PrivateRoute allowedRoles={[2]}>
            <HealthCheckNurse />
          </PrivateRoute>
        } />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
