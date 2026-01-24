import { Link } from 'react-router-dom';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, CheckCircle2, Zap, Shield, FileText, BarChart3, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function Index() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  // Feature card hover expansion state
  const [expandedFeatureIdx, setExpandedFeatureIdx] = React.useState<number | null>(null);

  // Check if current language is Chinese
  const isChineseLanguage = i18n.language === 'zh' || i18n.language === 'zh-CN';

  // 社会证明数据
  const testimonials = [
    { name: '张先生', company: '科技公司', avatar: '/images/testimonial-1.png' },
    { name: '李女士', company: '律师事务所', avatar: '/images/testimonial-2.png' },
    { name: '王先生', company: '投资公司', avatar: '/images/testimonial-3.png' },
    { name: '陈女士', company: '企业集团', avatar: '/images/testimonial-4.png' },
  ];

  // 特性数据
  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: t('home.features.fastReview'),
      description: t('home.features.fastReviewDesc'),
      details: '⚡ 上传合同后30秒内即可获得完整的风险分析报告。 📄 支持PDF、Word、图片等多种文件格式。 🎯 AI智能引擎快速识别关键条款和潜在风险。 ✨ 无需等待，立即了解合同中的重要信息。'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('home.features.accurateDetection'),
      description: t('home.features.accurateDetectionDesc')
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: t('home.features.multiCountryLaw'),
      description: t('home.features.multiCountryLawDesc')
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: t('home.features.realTimeUpdate'),
      description: t('home.features.realTimeUpdateDesc')
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: t('home.features.detailedReport'),
      description: t('home.features.detailedReportDesc')
    },
    {
      icon: <CheckCircle2 className="h-8 w-8" />,
      title: t('home.features.dataSecurity'),
      description: t('home.features.dataSecurityDesc')
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
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
      
      {/* Hero Section - 极简风格 */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* 超大标题 - 高级字体效果 */}
          <div className="space-y-4">
            <h1 className="text-7xl md:text-8xl font-black text-slate-900 leading-tight tracking-tight">
              <span className="block">{t('home.heroTitle')}</span>
              <span className="block">
                <span className="bg-gradient-to-r from-blue-900 via-amber-500 to-blue-900 bg-clip-text text-transparent">
                  {t('home.heroTitleGradient')}
                </span>
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl font-light text-slate-600 leading-relaxed tracking-wide">
              {t('home.heroDescription')}
            </p>
          </div>

          {/* 税务风险提示 - 仅中文显示 */}
          {isChineseLanguage && (
            <div className="p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-lg max-w-2xl mx-auto">
              <p className="text-lg font-semibold text-amber-900">
                ✨ {t('home.taxWarning')}
              </p>
            </div>
          )}

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            {user ? (
              <Link to="/dify-chat">
                <Button size="lg" className="bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-950 hover:to-blue-800 text-white shadow-lg shadow-blue-900/30 px-10 py-7 text-lg font-semibold rounded-xl">
                  {t('hero.startReview')}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 shadow-lg shadow-amber-400/30 px-10 py-7 text-lg font-semibold rounded-xl">
                    {t('home.startFreeReview')}
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-2 border-slate-900 text-slate-900 hover:bg-slate-50 px-10 py-7 text-lg font-semibold rounded-xl">
                    {t('nav.login')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* 社会证明 */}
          <div className="pt-8 border-t border-slate-200">
            <div className="flex flex-col items-center gap-6">
              {/* 用户头像 */}
              <div className="flex -space-x-3">
                {testimonials.map((person, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden"
                    title={person.name}
                  >
                    <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              {/* 评分 */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-xl">★</span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-700">{t('home.rating')}</span>
              </div>
              {/* 文字 */}
              <p className="text-sm text-slate-500 font-medium tracking-wide">{t('home.trustedBy')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 无限滚动轮播 */}
      <section className="py-16 overflow-hidden bg-gradient-to-b from-transparent to-slate-50/30">
        <div className="relative">
          {/* 标题 */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              {t('carousel.title')}
            </h2>
            <p className="text-lg text-slate-600">
              {t('carousel.subtitle')}
            </p>
          </div>

          {/* 无限滚动容器 */}
          <div className="relative">
            {/* 左侧渐变遮罩 */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
            {/* 右侧渐变遮罩 */}
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
            
            {/* 滚动轨道 */}
            <div className="flex animate-scroll-infinite">
              {/* 第一组图片 */}
              <div className="flex gap-8 px-4">
                {/* 对比图 - 普通AI */}
                <div className="flex-shrink-0 w-[600px] h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-red-200 bg-white">
                  <img src="/images/carousel/generic-ai.jpg" alt="普通AI分析" className="w-full h-full object-cover" />
                </div>

                {/* 对比图 - PolicyBridge AI */}
                <div className="flex-shrink-0 w-[600px] h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-green-200 bg-white">
                  <img src="/images/carousel/pba-ai.png" alt="PolicyBridge AI分析" className="w-full h-full object-cover" />
                </div>

                {/* 多角色选择 */}
                <div className="flex-shrink-0 w-[600px] h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-200 bg-white">
                  <img src="/images/carousel/role-selection.png" alt="多角色选择" className="w-full h-full object-cover" />
                </div>

                {/* 核心功能 */}
                <div className="flex-shrink-0 w-[600px] h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-200 bg-white">
                  <img src="/images/carousel/core-features.png" alt="核心功能" className="w-full h-full object-cover" />
                </div>

                {/* 数据库1 */}
                <div className="flex-shrink-0 w-[600px] h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-200 bg-white">
                  <img src="/images/carousel/database-1.png" alt="案例数据库" className="w-full h-full object-cover" />
                </div>

                {/* 数据库2 */}
                <div className="flex-shrink-0 w-[600px] h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-indigo-200 bg-white">
                  <img src="/images/carousel/database-2.png" alt="法规数据库" className="w-full h-full object-cover" />
                </div>

                {/* 数据库3 */}
                <div className="flex-shrink-0 w-[600px] h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-pink-200 bg-white">
                  <img src="/images/carousel/database-3.png" alt="税法数据库" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* 第二组图片（重复，实现无缝循环） */}
              <div className="flex gap-8 px-4">
                {/* 对比图 - 普通AI */}
                <div className="flex-shrink-0 w-[600px] h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-red-200 bg-white">
                  <img src="/images/carousel/generic-ai.jpg" alt="普通AI分析" className="w-full h-full object-cover" />
                </div>

                {/* 对比图 - PolicyBridge AI */}
                <div className="flex-shrink-0 w-[600px] h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-green-200 bg-white">
                  <img src="/images/carousel/pba-ai.png" alt="PolicyBridge AI分析" className="w-full h-full object-cover" />
                </div>

                {/* 多角色选择 */}
                <div className="flex-shrink-0 w-[600px] h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-200 bg-white">
                  <img src="/images/carousel/role-selection.png" alt="多角色选择" className="w-full h-full object-cover" />
                </div>

                {/* 核心功能 */}
                <div className="flex-shrink-0 w-[600px] h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-200 bg-white">
                  <img src="/images/carousel/core-features.png" alt="核心功能" className="w-full h-full object-cover" />
                </div>

                {/* 数据库1 */}
                <div className="flex-shrink-0 w-[600px] h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-200 bg-white">
                  <img src="/images/carousel/database-1.png" alt="案例数据库" className="w-full h-full object-cover" />
                </div>

                {/* 数据库2 */}
                <div className="flex-shrink-0 w-[600px] h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-indigo-200 bg-white">
                  <img src="/images/carousel/database-2.png" alt="法规数据库" className="w-full h-full object-cover" />
                </div>

                {/* 数据库3 */}
                <div className="flex-shrink-0 w-[600px] h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-pink-200 bg-white">
                  <img src="/images/carousel/database-3.png" alt="税法数据库" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 为什么选择 PolicyBridge AI */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
              {t('home.whyChoose')}
            </h2>
            <p className="text-xl text-slate-600">
              {t('home.whyChooseSubtitle')}
            </p>
          </div>

          {/* 特性网格 - 带悬停展开效果 */}
          <div className="relative min-h-[400px] px-4" onMouseLeave={() => setExpandedFeatureIdx(null)}>
            {expandedFeatureIdx !== null ? (
              <div className="max-w-2xl mx-auto transition-all duration-300">
                <div className="p-8 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-amber-300 shadow-2xl shadow-amber-200/30 transition-all duration-500">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-900/20 to-amber-400/20 flex items-center justify-center flex-shrink-0">
                      <div className="text-blue-900 text-2xl">
                        {features[expandedFeatureIdx].icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        {features[expandedFeatureIdx].title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-lg">
                        {features[expandedFeatureIdx].description}
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-200">
                    {features[expandedFeatureIdx]?.details && (
                      <p className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap">
                        {features[expandedFeatureIdx].details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-300">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="group p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-slate-200 hover:border-amber-300 transition-all duration-300 hover:shadow-xl hover:shadow-amber-200/20 cursor-pointer"
                    onMouseEnter={() => setExpandedFeatureIdx(idx)}
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-900/10 to-amber-400/10 flex items-center justify-center mb-6 group-hover:from-blue-900/20 group-hover:to-amber-400/20 transition-colors">
                      <div className="text-blue-900 group-hover:text-amber-500 transition-colors">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-transparent to-slate-50/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
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
              {t('home.quickLinks')}
            </Link>
            <span className="text-gray-400">|</span>
            <Link to="/pricing" className="text-blue-900 hover:text-blue-700 font-semibold">
              {t('nav.pricing')}
            </Link>
            <span className="text-gray-400">|</span>
            <Link to="/contact" className="text-blue-900 hover:text-blue-700 font-semibold">
              {t('home.contactUsLink')}
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
