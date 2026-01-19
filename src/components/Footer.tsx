import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white text-xl font-bold mb-4">合规桥 PolicyBridge.AI</h3>
            <p className="text-sm leading-relaxed">
              专为中小型跨国贸易企业打造的智能合同审核服务，帮助您规避合同风险，降低法务成本。
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white text-lg font-semibold mb-4">快速链接</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  产品功能
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  价格方案
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-white transition-colors">
                  客户案例
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  联系我们
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-white text-lg font-semibold mb-4">联系方式</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <a href="mailto:contact@aicontract.com" className="hover:text-white transition-colors">
                  contact@aicontract.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <a href="tel:+8640012345678" className="hover:text-white transition-colors">
                  400-123-4567
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>深圳市南山区科技园</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="text-white text-lg font-semibold mb-4">关注我们</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm mt-4">
              <strong className="text-white">工作时间：</strong>
              <br />
              周一至周五 9:00-18:00
            </p>
          </div>
        </div>

        {/* Bottom Bar with Brand Name */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; 2026 合规桥 PolicyBridge.AI (PBA). All Rights Reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">
                服务条款
              </a>
              <a href="#" className="hover:text-white transition-colors">
                隐私政策
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie政策
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
