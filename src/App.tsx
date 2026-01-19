import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import AIReview from '@/pages/AIReview';
import DifyChat from '@/pages/DifyChat';
import Pricing from '@/pages/Pricing';
import Orders from '@/pages/Orders';
import OrderDetail from '@/pages/OrderDetail';
import FeatureComparison from '@/pages/FeatureComparison';
import PermissionsDemo from '@/pages/PermissionsDemo';
import BoosterPack from '@/pages/BoosterPack';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentCancel from '@/pages/PaymentCancel';
import TermsOfService from '@/pages/TermsOfService';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Disclaimer from '@/pages/Disclaimer';
import AdminPanel from '@/pages/AdminPanel';
import AuthCallback from '@/pages/AuthCallback';
import '@/i18n/config';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-review" element={<AIReview />} />
          <Route path="/dify-chat" element={<DifyChat />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetail />} />
          <Route path="/feature-comparison" element={<FeatureComparison />} />
          <Route path="/permissions-demo" element={<PermissionsDemo />} />
          <Route path="/booster-pack" element={<BoosterPack />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;