import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Database, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTAClick = () => {
    if (user) {
      navigate('/dify-chat');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8 animate-fade-in">
            <Shield className="w-4 h-4 mr-2" />
            基于完整法律数据库的AI审核系统
          </div>

          {/* Main heading with 合规桥 PBA */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in-up">
            合规桥 PBA
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">
              AI驱动的国际贸易合同审核
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            专为中小型跨国贸易企业打造，基于完整的各国贸易法律数据库。每条审核结论都有法律依据，成本仅为传统律师审核的1/10
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up animation-delay-400">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={handleCTAClick}
            >
              {user ? '开始AI审核' : '立即开始'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Key advantages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in-up animation-delay-600">
            <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Database className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium">完整法律数据库支持</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Shield className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium">避免AI幻觉，有据可依</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <RefreshCw className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium">数据库持续更新</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
