import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import ProductIntroduction from '@/pages/ProductIntroduction';
import ContactUs from '@/pages/ContactUs';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import AuthCallback from '@/pages/AuthCallback';
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
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import WechatCallback from '@/pages/WechatCallback';
import VerifyEmail from '@/pages/VerifyEmail';
import '@/i18n/config';
function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/product-introduction" element={<ProductIntroduction />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/wechat/callback" element={<WechatCallback />} />
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
      </LanguageProvider>
    </Router>
  );
}
export default App;
