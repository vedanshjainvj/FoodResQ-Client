import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FoodProvider } from './context/FoodContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import About from './pages/About';
import FoodWasteReduction from './pages/FoodWasteReduction';
import FoodListings from './pages/FoodListings';
import FoodDetail from './pages/FoodDetail';
import FoodForm from './pages/FoodForm';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <FoodProvider>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/food" element={<FoodListings />} />
                <Route path="/food/:id" element={<FoodDetail />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      {/* Only regular users should access this route */}
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/food-waste-reduction"
                  element={
                    <ProtectedRoute>
                      <FoodWasteReduction />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/food/create"
                  element={
                    <AdminRoute>
                      <FoodForm />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/food/edit/:id"
                  element={
                    <AdminRoute>
                      <FoodForm />
                    </AdminRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </FoodProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
