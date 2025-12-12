import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoutes from './utils/PrivateRoutes';
import Navbar from './components/Navbar';

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

            <Route path="/unauthorized" element={<div>Unauthorized</div>} />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}

export default App;
