import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeesList from './pages/EmployeesList';
import EmployeeDetail from './pages/EmployeeDetail';
import EmployeeForm from './pages/EmployeeForm';
import Departments from './pages/Departments';
import DepartmentForm from './pages/DepartmentForm';
import Payroll from './pages/Payroll';
import PayrollForm from './pages/PayrollForm';
import Users from './pages/Users';
import Profile from './pages/Profile';
import PrivateRoutes from './utils/PrivateRoutes';
import Navbar from './components/Navbar';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="py-8">
        <div className="container-main">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />

            {/* Unified Dashboard */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoutes requiredRole={["admin", "hr", "employee"]}>
                  <Dashboard />
                </PrivateRoutes>
              }
            />

            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Employees */}
            <Route
              path="/employees"
              element={
                <PrivateRoutes requiredRole={["admin", "hr"]}>
                  <EmployeesList />
                </PrivateRoutes>
              }
            />
            <Route
              path="/employees/new"
              element={
                <PrivateRoutes requiredRole={["admin", "hr"]}>
                  <EmployeeForm />
                </PrivateRoutes>
              }
            />
            <Route
              path="/employees/:id"
              element={
                <PrivateRoutes requiredRole={["admin", "hr"]}>
                  <EmployeeDetail />
                </PrivateRoutes>
              }
            />
            <Route
              path="/employees/:id/edit"
              element={
                <PrivateRoutes requiredRole={["admin", "hr"]}>
                  <EmployeeForm />
                </PrivateRoutes>
              }
            />

            {/* Departments */}
            <Route
              path="/departments"
              element={
                <PrivateRoutes requiredRole={["admin", "hr"]}>
                  <Departments />
                </PrivateRoutes>
              }
            />
            <Route
              path="/departments/new"
              element={
                <PrivateRoutes requiredRole={["admin"]}>
                  <DepartmentForm />
                </PrivateRoutes>
              }
            />
            <Route
              path="/departments/:id"
              element={
                <PrivateRoutes requiredRole={["admin", "hr"]}>
                  <DepartmentForm />
                </PrivateRoutes>
              }
            />

            {/* Payroll */}
            <Route
              path="/payroll"
              element={
                <PrivateRoutes requiredRole={["admin", "hr"]}>
                  <Payroll />
                </PrivateRoutes>
              }
            />
            <Route
              path="/payroll/new"
              element={
                <PrivateRoutes requiredRole={["hr"]}>
                  <PayrollForm />
                </PrivateRoutes>
              }
            />
            <Route
              path="/payroll/:id"
              element={
                <PrivateRoutes requiredRole={["admin", "hr"]}>
                  <PayrollForm />
                </PrivateRoutes>
              }
            />

            {/* Users (admin) */}
            <Route
              path="/users"
              element={
                <PrivateRoutes requiredRole={["admin"]}>
                  <Users />
                </PrivateRoutes>
              }
            />

            {/* Profile for current user */}
            <Route
              path="/profile"
              element={
                <PrivateRoutes requiredRole={["admin", "hr", "employee"]}>
                  <Profile />
                </PrivateRoutes>
              }
            />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}

export default App;
