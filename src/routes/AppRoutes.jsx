import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/login';
import Home from '../pages/home/HomePage'; // hoặc import Home from '../pages/home/Home';
import MainLayout from '../layout/MainLayout';
import PrivateRoute from './ProtectedRoute';
import StudentHealthRecord from '../pages/parent/health-records';
import ParentPage from '../pages/parent';
import ManagerPage from '../pages/manager';
import UserManagement from '../pages/manager/manager-user';
import VaccineApprovalPage from '../pages/manager/manager-event';
import ManagerSchoolNurse from '../pages/manager/manager-school';
import ManagerSupplies from '../pages/manager/manager-supply';
import MedicineForm from '../pages/parent/medicine-submission';
import HealthCheckNotification from '../pages/parent/health-check';
import ParentVaccineConfirmation from '../pages/parent/vaccination';
import MedicalEvents from '../pages/school-nurse/medical-events';
import NursePage from '../pages/school-nurse';
import ManageMedication from '../pages/school-nurse/manage-medication';
import ManageVaccination from '../pages/school-nurse/manage-vaccination';
import HealthCheckNurse from '../pages/school-nurse/manage-health-check';
import MedicalAccidentParent from '../pages/parent/medical-accident';

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
            <Home />
          </PrivateRoute>
        } />

        <Route path="school-nurse" element={
          <PrivateRoute allowedRoles={[1]}>
            <Home />
          </PrivateRoute>
        } />

        <Route path="manager-dashboard" element={
          <PrivateRoute>
            <ManagerPage />
          </PrivateRoute>
        } />

        <Route path="manager-supply" element={
          <PrivateRoute>
            <ManagerSupplies />
          </PrivateRoute>
        } />

        <Route path="manager-event" element={
          <PrivateRoute>
            <VaccineApprovalPage />
          </PrivateRoute>
        } />

        <Route path="manager" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />

        <Route path="manager-users" element={
          <PrivateRoute>
            <UserManagement />
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
        <Route path="medical-accident" element={
          <PrivateRoute allowedRoles={[1]}>
            <MedicalAccidentParent />
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
          <PrivateRoute>
            <HealthCheckNurse />
          </PrivateRoute>
        } />
        <Route path='manager-school' element={
          <PrivateRoute>
            <ManagerSchoolNurse />
          </PrivateRoute>
        } />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
