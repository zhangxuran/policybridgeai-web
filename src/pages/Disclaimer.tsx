import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useTranslation } from 'react-i18next';

export default function Disclaimer() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('disclaimer.backToHome')}
          </Button>
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t('disclaimer.title')}</h1>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <p className="font-semibold text-yellow-800">{t('disclaimer.importantNotice')}</p>
          </div>

          <div className="prose prose-blue max-w-none">
            <h2>{t('disclaimer.section1.title')}</h2>
            
            <h3>{t('disclaimer.section1.subtitle1')}</h3>
            <p dangerouslySetInnerHTML={{ __html: t('disclaimer.section1.content1') }} />

            <h3>{t('disclaimer.section1.subtitle2')}</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
              <p className="font-semibold text-red-900 mb-3">{t('disclaimer.section1.warning')}</p>
              <ul className="space-y-2">
                {t('disclaimer.section1.notConstitute', { returnObjects: true }).map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <h3>{t('disclaimer.section1.subtitle3')}</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
              <p className="font-semibold text-green-900 mb-3">{t('disclaimer.section1.recommend')}</p>
              <ul className="space-y-2">
                {t('disclaimer.section1.recommendations', { returnObjects: true }).map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <h2>{t('disclaimer.section2.title')}</h2>
            
            <h3>{t('disclaimer.section2.subtitle1')}</h3>
            <p>{t('disclaimer.section2.commitment')}</p>
            <ul>
              {t('disclaimer.section2.commitments', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3>{t('disclaimer.section2.subtitle2')}</h3>
            <p><strong>{t('disclaimer.section2.cannot')}</strong></p>
            <ul>
              {t('disclaimer.section2.limitations', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>{t('disclaimer.section3.title')}</h2>
            
            <h3>{t('disclaimer.section3.subtitle1')}</h3>
            <p>{t('disclaimer.section3.content1')}</p>
            <ul>
              {t('disclaimer.section3.limits', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3>{t('disclaimer.section3.subtitle2')}</h3>
            <p>{t('disclaimer.section3.suitableFor')}</p>
            <ul>
              {t('disclaimer.section3.suitable', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p><strong>{t('disclaimer.section3.notSuitableFor')}</strong></p>
            <ul>
              {t('disclaimer.section3.notSuitable', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>{t('disclaimer.section4.title')}</h2>
            <p>{t('disclaimer.section4.content')}</p>
            <ul>
              {t('disclaimer.section4.noLiability', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>{t('disclaimer.section5.title')}</h2>
            <p>{t('disclaimer.section5.content')}</p>
            <ul>
              {t('disclaimer.section5.responsibilities', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>{t('disclaimer.section6.title')}</h2>
            <p>{t('disclaimer.section6.content')}</p>
            <ul>
              {t('disclaimer.section6.limitations', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="mt-4"><strong>{t('disclaimer.section6.privacyTitle')}</strong></p>
            <ul>
              {t('disclaimer.section6.privacyTips', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>{t('disclaimer.section7.title')}</h2>
            <p>{t('disclaimer.section7.content')}</p>
            <ul>
              <li><strong>{t('disclaimer.section7.email')}</strong> <a href="mailto:policybridge.ai@gmail.com" className="text-blue-600 hover:text-blue-700">policybridge.ai@gmail.com</a></li>
              <li><strong>{t('disclaimer.section7.response')}</strong></li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8">
              <h3 className="text-lg font-bold text-blue-900 mb-4">{t('disclaimer.reminder.title')}</h3>
              <p className="font-semibold text-blue-900 mb-3">{t('disclaimer.reminder.content')}</p>
              <ul className="space-y-2">
                {t('disclaimer.reminder.checklist', { returnObjects: true }).map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-100 border-l-4 border-gray-400 p-4 my-6">
              <p className="font-semibold">{t('disclaimer.finalAgreement')}</p>
            </div>

            <p className="text-sm text-gray-600 mt-8">{t('disclaimer.lastUpdated')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}