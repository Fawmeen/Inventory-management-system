import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ManageProducts from './pages/ManageProducts';
import Inventory from './pages/Inventory';
import Logs from './pages/Logs';
import Orders from './pages/Orders';
import Notifications from './pages/Notifications';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/products" replace />} />
              <Route path="/products" element={<Products />} />

              <Route element={<ProtectedRoute roles={['MANAGER']} />}>
                <Route path="/manage" element={<ManageProducts />} />
                <Route path="/logs" element={<Logs />} />
              </Route>

              <Route element={<ProtectedRoute roles={['STAFF']} />}>
                <Route path="/inventory" element={<Inventory />} />
              </Route>

              <Route element={<ProtectedRoute roles={['USER']} />}>
                <Route path="/orders" element={<Orders />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
