import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import PrivateRoutes from './utils/PrivateRoutes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoutes requiredRole={["admin"]}>
              <AdminDashboard />
            </PrivateRoutes>
          }
        />

        {/* EMPLOYEE ROUTES */}
        <Route
          path="/employee-dashboard"
          element={
            <PrivateRoutes requiredRole={["employee", "admin", "hr"]}>
              <EmployeeDashboard />
            </PrivateRoutes>
          }
        />

        <Route path="/unauthorized" element={<div>Unauthorized</div>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
