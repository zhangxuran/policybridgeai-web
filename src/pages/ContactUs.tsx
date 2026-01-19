import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ContactUs() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen relative">
      {/* 极光流动背景 - 白色主题 */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
        {/* 浅色渐变基底 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30" />
        
        {/* 大型流动光晕 1 - 蓝青色 */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-300/40 via-cyan-300/40 to-transparent rounded-full filter blur-3xl animate-aurora-1" />
        
        {/* 大型流动光晕 2 - 紫粉色 */}
        <div className="absolute top-20 -right-40 w-[700px] h-[700px] bg-gradient-to-br from-purple-300/40 via-pink-300/40 to-transparent rounded-full filter blur-3xl animate-aurora-2" />
        
        {/* 大型流动光晕 3 - 粉紫色 */}
        <div className="absolute -bottom-40 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-pink-300/35 via-purple-300/35 to-transparent rounded-full filter blur-3xl animate-aurora-3" />
        
        {/* 大型流动光晕 4 - 青蓝色 */}
        <div className="absolute bottom-1/4 -right-20 w-[550px] h-[550px] bg-gradient-to-br from-cyan-300/35 via-blue-300/35 to-transparent rounded-full filter blur-3xl animate-aurora-4" />
        
        {/* 额外的小光晕增加层次 - 靛蓝色 */}
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-indigo-300/30 to-transparent rounded-full filter blur-2xl animate-aurora-5" />
      </div>

      <Navbar />
      
      {/* Contact Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {t('contact.description')}
          </p>
          <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600">{t('contact.email')}</p>
                  <a 
                    href="mailto:policybridge.ai@gmail.com" 
                    className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                  >
                    policybridge.ai@gmail.com
                  </a>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                {t('contact.response')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('hero.title')}</h3>
              <p className="text-gray-400 text-sm">
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                    {t('footer.terms')}
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    {t('footer.privacy')}
                  </a>
                </li>
                <li>
                  <a href="/disclaimer" className="text-gray-400 hover:text-white transition-colors">
                    {t('footer.disclaimer')}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.contactUs')}</h3>
              <p className="text-gray-400 text-sm">
                {t('contact.email')}: policybridge.ai@gmail.com
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
