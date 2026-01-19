import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function Index() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  // Check if current language is Chinese
  const isChineseLanguage = i18n.language === 'zh' || i18n.language === 'zh-CN';

  return (
    <div className="min-h-screen relative">
      {/* 深蓝 + 金色配色的背景 */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
        {/* 浅色渐变基底 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-blue-50/30 to-amber-50/30" />
        
        {/* 深蓝色光晕 - 左上 */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-900/20 via-blue-700/20 to-transparent rounded-full filter blur-3xl animate-aurora-1" />
        
        {/* 金色光晕 - 右上 */}
        <div className="absolute top-20 -right-40 w-[700px] h-[700px] bg-gradient-to-br from-amber-300/20 via-yellow-300/20 to-transparent rounded-full filter blur-3xl animate-aurora-2" />
        
        {/* 深蓝色光晕 - 左下 */}
        <div className="absolute -bottom-40 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-blue-800/15 via-blue-600/15 to-transparent rounded-full filter blur-3xl animate-aurora-3" />
        
        {/* 金色光晕 - 右下 */}
        <div className="absolute bottom-1/4 -right-20 w-[550px] h-[550px] bg-gradient-to-br from-amber-200/15 via-yellow-200/15 to-transparent rounded-full filter blur-3xl animate-aurora-4" />
      </div>

      <Navbar />
      
      {/* Hero Section - 新设计 */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* 左侧 - 文字内容 */}
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/images/pba-logo-transparent.png" 
                alt="PBA Logo" 
                className="h-16 w-auto" 
              />
            </div>

            {/* 标题 */}
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-slate-900 leading-tight">
                {t('hero.title')}
              </h1>
              <p className="text-2xl font-semibold text-slate-700">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* 描述 */}
            <p className="text-lg text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('hero.description') }} />

            {/* 税务风险提示 - 仅中文显示 */}
            {isChineseLanguage && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded">
                <p className="text-sm font-semibold text-amber-900">
                  ✨ {t('hero.taxPhase4')}
                </p>
              </div>
            )}

            {/* CTA 按钮 */}
            <div className="flex gap-4 pt-4">
              {user ? (
                <Link to="/dify-chat">
                  <Button size="lg" className="bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-950 hover:to-blue-800 text-white shadow-lg shadow-blue-900/30 px-8 py-6 text-lg font-semibold rounded-lg">
                    {t('hero.startReview')}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 shadow-lg shadow-amber-400/30 px-8 py-6 text-lg font-semibold rounded-lg">
                      {t('hero.getStarted')}
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="border-2 border-slate-900 text-slate-900 hover:bg-slate-50 px-8 py-6 text-lg font-semibold rounded-lg">
                      {t('nav.login')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* 右侧 - 浅金色背景区域（可放置插图） */}
          <div className="relative">
            <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl p-12 shadow-2xl aspect-square flex items-center justify-center">
              {/* 这里可以放置 3D 插图或其他视觉元素 */}
              <div className="text-center">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-semibold text-slate-700">
                  智能合同审查
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  AI 驱动的法律风险识别
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-transparent to-slate-50/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('contact.description')}
          </p>
          <Card className="shadow-xl bg-white/90 backdrop-blur-sm border-2 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full">
                  <Mail className="h-6 w-6 text-amber-300" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600">{t('contact.email')}</p>
                  <a 
                    href="mailto:policybridge.ai@gmail.com" 
                    className="text-lg font-semibold text-blue-900 hover:text-blue-700"
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

          {/* 快速链接 */}
          <div className="mt-12 flex justify-center gap-6">
            <Link to="/product-introduction" className="text-blue-900 hover:text-blue-700 font-semibold">
              产品介绍
            </Link>
            <span className="text-gray-400">|</span>
            <Link to="/pricing" className="text-blue-900 hover:text-blue-700 font-semibold">
              {t('nav.pricing')}
            </Link>
            <span className="text-gray-400">|</span>
            <Link to="/contact" className="text-blue-900 hover:text-blue-700 font-semibold">
              联系我们
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
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
                  <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                    {t('footer.terms')}
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    {t('footer.privacy')}
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer" className="text-gray-400 hover:text-white transition-colors">
                    {t('footer.disclaimer')}
                  </Link>
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
