import { Routes, Route } from 'react-router-dom';
import PublicSite from './PublicSite';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { MerchantApp } from './pages/merchant/MerchantApp';
import { AdminApp } from './pages/admin/AdminApp';
import { RequireRole } from './components/RequireRole';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/merchant/*"
        element={
          <RequireRole role="merchant">
            <MerchantApp />
          </RequireRole>
        }
      />

      <Route
        path="/admin/*"
        element={
          <RequireRole role="admin">
            <AdminApp />
          </RequireRole>
        }
      />

      {/* Public marketing + catalog site handles everything else. */}
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  );
}
