import { Routes, Route } from 'react-router-dom';
import PublicSite from './PublicSite';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { MerchantApp } from './pages/merchant/MerchantApp';
import { AdminApp } from './pages/admin/AdminApp';
import { StorePage } from './pages/StorePage';
import { ContentPolicyPage } from './pages/ContentPolicyPage';
import { ProfilePage } from './pages/ProfilePage';
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

      {/* Individual, shareable store page. */}
      <Route path="/shop/:slug" element={<StorePage />} />
      <Route path="/guidelines" element={<ContentPolicyPage />} />
      <Route path="/account" element={<ProfilePage />} />

      {/* Public marketing + catalog site handles everything else. */}
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  );
}
