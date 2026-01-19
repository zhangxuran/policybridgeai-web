import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useTranslation } from 'react-i18next';

export default function TermsOfService() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('termsOfService.backToHome')}
          </Button>
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('termsOfService.title')}</h1>
          <p className="text-sm text-gray-600 mb-8">{t('termsOfService.lastUpdated')}</p>

          <div className="prose prose-blue max-w-none">
            <h2>{t('termsOfService.section1.title')}</h2>
            
            <h3>{t('termsOfService.section1.subtitle1')}</h3>
            <p>{t('termsOfService.section1.content1')}</p>
            <ul>
              {t('termsOfService.section1.list1', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3>{t('termsOfService.section1.subtitle2')}</h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
              <p className="font-semibold">{t('termsOfService.section1.warning')}</p>
            </div>
            <p>{t('termsOfService.section1.content2')}</p>
            <ul>
              {t('termsOfService.section1.list2', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>{t('termsOfService.section2.title')}</h2>
            
            <h3>{t('termsOfService.section2.subtitle1')}</h3>
            <ul>
              <li><strong>{t('termsOfService.section2.item1').split(':')[0]}</strong>：{t('termsOfService.section2.item1').split('：')[1]}</li>
              <li><strong>{t('termsOfService.section2.item2').split(':')[0]}</strong>：{t('termsOfService.section2.item2').split('：')[1]}</li>
              <li><strong>{t('termsOfService.section2.item3').split(':')[0]}</strong>：{t('termsOfService.section2.item3').split('：')[1]}</li>
            </ul>

            <h3>{t('termsOfService.section2.subtitle2')}</h3>
            <p>{t('termsOfService.section2.content')}</p>
            <ul>
              {t('termsOfService.section2.list', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3>{t('termsOfService.section2.subtitle3')}</h3>
            <p>{t('termsOfService.section2.userContent')}</p>
            <ul>
              {t('termsOfService.section2.userList', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>{t('termsOfService.section3.title')}</h2>
            
            <h3>{t('termsOfService.section3.subtitle1')}</h3>
            <p>{t('termsOfService.section3.content1')}</p>
            <ul>
              {t('termsOfService.section3.list1', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3>{t('termsOfService.section3.subtitle2')}</h3>
            <p>{t('termsOfService.section3.content2')}</p>
            <ul>
              {t('termsOfService.section3.list2', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3>{t('termsOfService.section3.subtitle3')}</h3>
            <p>{t('termsOfService.section3.content3')}</p>
            <ul>
              {t('termsOfService.section3.list3', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3>{t('termsOfService.section3.subtitle4')}</h3>
            <ul>
              <li><strong>{t('termsOfService.section3.retention1').split(':')[0]}</strong>：{t('termsOfService.section3.retention1').split('：')[1]}</li>
              <li><strong>{t('termsOfService.section3.retention2').split(':')[0]}</strong>：{t('termsOfService.section3.retention2').split('：')[1]}</li>
              <li><strong>{t('termsOfService.section3.retention3').split(':')[0]}</strong>：{t('termsOfService.section3.retention3').split('：')[1]}</li>
            </ul>

            <h3>{t('termsOfService.section3.subtitle5')}</h3>
            <p>{t('termsOfService.section3.content5')}</p>
            <ul>
              {t('termsOfService.section3.list5', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>{t('termsOfService.section4.title')}</h2>
            
            <h3>{t('termsOfService.section4.subtitle1')}</h3>
            <p>{t('termsOfService.section4.content1')}</p>

            <h3>{t('termsOfService.section4.subtitle2')}</h3>
            <ul>
              {t('termsOfService.section4.list', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>{t('termsOfService.section5.title')}</h2>
            <p>{t('termsOfService.section5.content')}</p>
            <ul>
              <li>{t('termsOfService.section5.email')} <a href="mailto:policybridge.ai@gmail.com" className="text-blue-600 hover:text-blue-700">policybridge.ai@gmail.com</a></li>
              <li>{t('termsOfService.section5.response')}</li>
            </ul>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
              <p className="font-semibold">{t('termsOfService.agreement')}</p>
            </div>
          </div>

          {/* Hidden Admin Entry - Subtle link at the bottom */}
          <div className="text-center mt-12 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              © 2026 PolicyBridge AI. All rights reserved.{' '}
              <Link 
                to="/admin" 
                className="text-gray-300 hover:text-gray-400 transition-colors"
                style={{ textDecoration: 'none' }}
              >
                ·
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}