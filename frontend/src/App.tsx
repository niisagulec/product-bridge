import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminPage from './pages/AdminPage';
import MainLayout from './layouts/MainLayout';
import { useAuth } from './state/auth';

const App = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="pageCenter">
        <div className="card" style={{ maxWidth: 480 }}>
          <div className="muted">Yükleniyor…</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />

      {!user ? (
        <Route path="*" element={<Navigate to="/login" />} />
      ) : (
        <>
          <Route element={<MainLayout role={user.role} userName={user.name} />}>
            <Route path="/" element={<ProductsPage />} />
            <Route
              path="/favorites"
              element={user.role === 'user' ? <FavoritesPage /> : <Navigate to="/" />}
            />
            <Route
              path="/admin"
              element={user.role === 'admin' ? <AdminPage /> : <Navigate to="/" />}
            />
          </Route>

          <Route path="/products" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  );
};

export default App;
