import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, FileText, Shield, Database, RefreshCw, Globe, CheckCircle, Mail, BookOpen, FileSearch, Zap, Target, Award, Radar } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function Index() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  // Check if current language is Chinese
  const isChineseLanguage = i18n.language === 'zh' || i18n.language === 'zh-CN';

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
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <img 
              src="/images/pba-logo-transparent.png" 
              alt="PBA Logo" 
              className="h-32 w-auto transition-transform duration-300 hover:scale-105" 
            />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-2xl font-bold text-gray-800 mb-4">
            {t('hero.subtitle')}
          </p>
          <p className="text-xl font-semibold text-gray-800 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('hero.description') }} />
          
          {/* Tax Phase 4 promotional text - Only show for Chinese users */}
          {isChineseLanguage && (
            <p className="text-sm font-medium text-orange-600 mt-2 mb-8">
              {t('hero.taxPhase4')}
            </p>
          )}
          
          <div className="flex gap-4 justify-center">
            {user ? (
              <Link to="/dify-chat">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30">
                  {t('hero.startReview')}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30">
                    {t('hero.getStarted')}
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    {t('nav.login')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* AI Comparison Section - Only show for Chinese language */}
      {isChineseLanguage && (
        <section className="container mx-auto px-4 py-12 bg-gradient-to-br from-blue-50/50 to-purple-50/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* Section Header - Compact */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                为什么选择合规桥PBA?
              </h2>
              <p className="text-lg text-gray-600">
                专业的法律AI与普通AI的本质区别
              </p>
            </div>

            {/* Comparison Container - Compact */}
            <div className="relative">
              <div className="grid lg:grid-cols-2 gap-6 items-center">
                {/* Left Side - Other AI */}
                <div className="relative group">
                  {/* Label Badge */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gray-500 text-white px-4 py-1.5 rounded-full shadow-lg text-sm font-semibold">
                      普通AI审查
                    </div>
                  </div>
                  
                  {/* Image Container - Compact */}
                  <div className="relative overflow-hidden rounded-xl border-3 border-gray-300 shadow-lg bg-white p-2 transition-all duration-300 group-hover:shadow-xl mt-6">
                    <img 
                      src="/comparison/other-ai-review.jpg" 
                      alt="普通AI审查结果"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>

                  {/* Feature Tags - Compact */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>基础风险识别</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>缺乏法律依据</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>无案例支撑</span>
                    </div>
                  </div>
                </div>

                {/* VS Divider - Centered */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-4 border-white font-bold text-lg">
                    VS
                  </div>
                </div>

                {/* Right Side - Our AI */}
                <div className="relative group">
                  {/* Label Badge with gradient */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-full shadow-lg text-sm font-semibold flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5" />
                      合规桥PBA专业审查
                    </div>
                  </div>
                  
                  {/* Image Container - Highlighted & Compact */}
                  <div className="relative overflow-hidden rounded-xl border-3 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-0.5 shadow-xl transition-all duration-300 group-hover:shadow-blue-500/50 group-hover:scale-[1.02] mt-6">
                    <div className="bg-white rounded-lg p-2">
                      <img 
                        src="/comparison/pba-ai-review.jpg" 
                        alt="合规桥PBA专业审查结果"
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Feature Tags - Highlighted & Compact */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-blue-700 text-sm">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">深度法律分析</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-700 text-sm">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold">精准识别陷阱条款</span>
                    </div>
                    <div className="flex items-center gap-2 text-pink-700 text-sm">
                      <CheckCircle className="h-4 w-4 text-pink-600" />
                      <span className="font-semibold">完整法律依据与案例</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Summary Cards - Compact */}
            <div className="grid md:grid-cols-3 gap-4 mt-10">
              <Card className="border-2 border-blue-200 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-base text-gray-900">更高的敏感度</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    对"陷阱条款"的识别率提升300%
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <img src="/images/pba-logo.png" alt="PBA Logo" className="h-5 w-auto" />
                    </div>
                    <h3 className="font-bold text-base text-gray-900">更强的权威性</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    基于实时法律数据库与海量案例
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-pink-200 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-pink-100 rounded-lg">
                      <Zap className="h-5 w-5 text-pink-600" />
                    </div>
                    <h3 className="font-bold text-base text-gray-900">更深的专业度</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    提供可执行的修改建议与风险规避方案
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Core Advantage Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('advantage.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('advantage.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* 实时法律数据库 */}
            <Card className="border-2 border-blue-200 shadow-xl bg-white/90 backdrop-blur-sm hover:border-blue-300 transition-colors flex flex-col h-full">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-start gap-3 mb-2">
                  <div className="p-2 bg-blue-600 rounded-lg shadow-md shadow-blue-500/30 flex-shrink-0">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl min-h-[4rem] flex items-center leading-tight">{t('advantage.database.title')}</CardTitle>
                </div>
                {t('advantage.database.subtitle') && (
                  <CardDescription className="text-base min-h-[3rem]">
                    {t('advantage.database.subtitle')}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3 flex-grow">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: t('advantage.database.point1') }} />
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: t('advantage.database.point2') }} />
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: t('advantage.database.point3') }} />
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: t('advantage.database.point4') }} />
                </div>
              </CardContent>
            </Card>

            {/* 海量法律案例数据库 */}
            <Card className="border-2 border-amber-200 shadow-xl bg-white/90 backdrop-blur-sm hover:border-amber-300 transition-colors flex flex-col h-full">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-start gap-3 mb-2">
                  <div className="p-2 bg-amber-600 rounded-lg shadow-md shadow-amber-500/30 flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl min-h-[4rem] flex items-center leading-tight">{t('advantage.caseLaw.title')}</CardTitle>
                </div>
                {t('advantage.caseLaw.subtitle') && (
                  <CardDescription className="text-base min-h-[3rem]">
                    {t('advantage.caseLaw.subtitle')}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3 flex-grow">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: t('advantage.caseLaw.point1') }} />
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: t('advantage.caseLaw.point2') }} />
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: t('advantage.caseLaw.point3') }} />
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: t('advantage.caseLaw.point4') }} />
                </div>
              </CardContent>
            </Card>

            {/* 与传统 LLM 的区别 */}
            <Card className="shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow flex flex-col h-full">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-start gap-3 mb-2">
                  <div className="p-2 bg-indigo-600 rounded-lg shadow-md shadow-indigo-500/30 flex-shrink-0">
                    <RefreshCw className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl min-h-[4rem] flex items-center leading-tight">{t('advantage.difference.title')}</CardTitle>
                </div>
                {t('advantage.difference.subtitle') && (
                  <CardDescription className="text-base min-h-[3rem]">
                    {t('advantage.difference.subtitle')}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3 flex-grow">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: t('advantage.difference.point1') }} />
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: t('advantage.difference.point2') }} />
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: t('advantage.difference.point3') }} />
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: t('advantage.difference.point4') }} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-white/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('features.title')}
          </h2>
          <div className={`grid gap-8 ${isChineseLanguage ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>{t('features.smartReview.title')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('features.smartReview.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>{t('features.riskAlert.title')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('features.riskAlert.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Globe className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>{t('features.multiCountry.title')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('features.multiCountry.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow border-2 border-amber-200 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <FileSearch className="h-6 w-6 text-amber-600" />
                  </div>
                  <CardTitle>{t('features.caseMatching.title')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('features.caseMatching.description')}
                </p>
              </CardContent>
            </Card>

            {/* Tax Compliance Radar - Only show for Chinese users */}
            {isChineseLanguage && (
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-2 border-red-200 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Radar className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle>{t('features.taxCompliance.title')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('features.taxCompliance.description')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-2 border-indigo-200 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">{t('dataSources.title')}</CardTitle>
              <CardDescription className="text-base">
                {t('dataSources.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    {t('dataSources.international.title')}
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• {t('dataSources.international.item1')}</li>
                    <li>• {t('dataSources.international.item2')}</li>
                    <li>• {t('dataSources.international.item3')}</li>
                    <li>• {t('dataSources.international.item4')}</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-600" />
                    {t('dataSources.official.title')}
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• {t('dataSources.official.item1')}</li>
                    <li>• {t('dataSources.official.item2')}</li>
                    <li>• {t('dataSources.official.item3')}</li>
                    <li>• {t('dataSources.official.item4')}</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700 text-center" dangerouslySetInnerHTML={{ __html: t('dataSources.updateFrequency') }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('contact.title')}
          </h2>
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