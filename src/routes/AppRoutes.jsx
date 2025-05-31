import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Login from '../pages/login';
import Home from '../pages/home';
import MainLayout from '../layout/MainLayout';
import PrivateRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="home" element={<Home />} />
        <Route path="students" element={<div>Quản lý học sinh</div>} />
        <Route path="medical" element={<div>Trang y tế</div>} />
        <Route path="report" element={<div>Báo cáo</div>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
