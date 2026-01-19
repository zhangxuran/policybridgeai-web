import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('privacyPolicy.backToHome')}
          </Button>
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('privacyPolicy.title')}</h1>
          <p className="text-sm text-gray-600 mb-8">{t('privacyPolicy.effectiveDate')}</p>

          <div className="prose prose-blue max-w-none">
            <h2>{t('privacyPolicy.intro.title')}</h2>
            <p>{t('privacyPolicy.intro.content')}</p>

            <h2>{t('privacyPolicy.section1.title')}</h2>
            
            <h3>{t('privacyPolicy.section1.subtitle1')}</h3>
            <ul>
              <li><strong>{t('privacyPolicy.section1.item1').split(':')[0]}</strong>：{t('privacyPolicy.section1.item1').split('：')[1]}</li>
              <li><strong>{t('privacyPolicy.section1.item2').split(':')[0]}</strong>：{t('privacyPolicy.section1.item2').split('：')[1]}</li>
              <li><strong>{t('privacyPolicy.section1.item3').split(':')[0]}</strong>：{t('privacyPolicy.section1.item3').split('：')[1]}</li>
            </ul>

            <h3>{t('privacyPolicy.section1.subtitle2')}</h3>
            <ul>
              <li><strong>{t('privacyPolicy.section1.item4').split(':')[0]}</strong>：{t('privacyPolicy.section1.item4').split('：')[1]}</li>
              <li><strong>{t('privacyPolicy.section1.item5').split(':')[0]}</strong>：{t('privacyPolicy.section1.item5').split('：')[1]}</li>
              <li><strong>{t('privacyPolicy.section1.item6').split(':')[0]}</strong>：{t('privacyPolicy.section1.item6').split('：')[1]}</li>
            </ul>

            <h2>{t('privacyPolicy.section2.title')}</h2>
            
            <h3>{t('privacyPolicy.section2.subtitle1')}</h3>
            <ul>
              {t('privacyPolicy.section2.list1', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3>{t('privacyPolicy.section2.subtitle2')}</h3>
            <div className="bg-green-50 border-l-4 border-green-400 p-4 my-4">
              <p><strong>{t('privacyPolicy.section2.highlight').split('：')[0]}</strong>：{t('privacyPolicy.section2.highlight').split('：')[1]}</p>
              <p className="mt-2 font-semibold">{t('privacyPolicy.section2.commitment')}</p>
            </div>

            <h2>{t('privacyPolicy.section3.title')}</h2>
            
            <h3>{t('privacyPolicy.section3.subtitle1')}</h3>
            <ul>
              <li><strong>{t('privacyPolicy.section3.item1').split(':')[0]}</strong>：{t('privacyPolicy.section3.item1').split('：')[1]}</li>
              <li><strong>{t('privacyPolicy.section3.item2').split(':')[0]}</strong>：{t('privacyPolicy.section3.item2').split('：')[1]}</li>
              <li><strong>{t('privacyPolicy.section3.item3').split(':')[0]}</strong>：{t('privacyPolicy.section3.item3').split('：')[1]}</li>
              <li><strong>{t('privacyPolicy.section3.item4').split(':')[0]}</strong>：{t('privacyPolicy.section3.item4').split('：')[1]}</li>
            </ul>

            <h3>{t('privacyPolicy.section3.subtitle2')}</h3>
            <ul>
              <li>{t('privacyPolicy.section3.content')}</li>
              <li>{t('privacyPolicy.section3.compliance')}</li>
              <li>{t('privacyPolicy.section3.evaluation')}</li>
            </ul>

            <h2>{t('privacyPolicy.section4.title')}</h2>
            
            <h3>{t('privacyPolicy.section4.subtitle1')}</h3>
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    {t('privacyPolicy.section4.tableHeaders', { returnObjects: true }).map((header: string, index: number) => (
                      <th key={index} className="border border-gray-300 px-4 py-2 text-left">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t('privacyPolicy.section4.tableRows', { returnObjects: true }).map((row: string[], rowIndex: number) => (
                    <tr key={rowIndex}>
                      {row.map((cell: string, cellIndex: number) => (
                        <td key={cellIndex} className="border border-gray-300 px-4 py-2">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3>{t('privacyPolicy.section4.subtitle2')}</h3>
            <p>{t('privacyPolicy.section4.content')}</p>
            <ol>
              <li><strong>{t('privacyPolicy.section4.option1').split(':')[0]}</strong>：{t('privacyPolicy.section4.option1').split('：')[1]}</li>
              <li><strong>{t('privacyPolicy.section4.option2').split(':')[0]}</strong>：{t('privacyPolicy.section4.option2').split('：')[1]}</li>
              <li><strong>{t('privacyPolicy.section4.option3').split(':')[0]}</strong>：{t('privacyPolicy.section4.option3').split('：')[1]}</li>
            </ol>

            <h3>{t('privacyPolicy.section4.subtitle3')}</h3>
            <ul>
              {t('privacyPolicy.section4.methods', { returnObjects: true }).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>{t('privacyPolicy.section5.title')}</h2>
            <ul>
              <li><strong>{t('privacyPolicy.section5.right1').split(':')[0]}</strong>：{t('privacyPolicy.section5.right1').split('：')[1]}</li>
              <li><strong>{t('privacyPolicy.section5.right2').split(':')[0]}</strong>：{t('privacyPolicy.section5.right2').split('：')[1]}</li>
              <li><strong>{t('privacyPolicy.section5.right3').split(':')[0]}</strong>：{t('privacyPolicy.section5.right3').split('：')[1]}</li>
              <li><strong>{t('privacyPolicy.section5.right4').split(':')[0]}</strong>：{t('privacyPolicy.section5.right4').split('：')[1]}</li>
              <li><strong>{t('privacyPolicy.section5.right5').split(':')[0]}</strong>：{t('privacyPolicy.section5.right5').split('：')[1]}</li>
            </ul>

            <h2>{t('privacyPolicy.section6.title')}</h2>
            <p>{t('privacyPolicy.section6.content')}</p>
            <ul>
              <li><strong>{t('privacyPolicy.section6.email')}</strong> <a href="mailto:policybridge.ai@gmail.com" className="text-blue-600 hover:text-blue-700">policybridge.ai@gmail.com</a></li>
              <li><strong>{t('privacyPolicy.section6.response')}</strong></li>
            </ul>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
              <p className="font-semibold">{t('privacyPolicy.agreement')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}