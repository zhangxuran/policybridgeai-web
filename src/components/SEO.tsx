import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = '合规桥PBA - AI智能合同审查平台',
  description = 'PolicyBridge AI (合规桥PBA) - 您的AI智能合同审查平台，为跨境贸易提供专业的合规风险筛选和法律支持。',
  keywords = 'AI, 合同审查, 法律科技, 合规, 风险管理, 跨境贸易, PolicyBridge, PBA',
  ogImage = 'https://www.policybridgeai.com/og-image.png'
}) => {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    // Update title
    document.title = title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', ogImage);
    }

    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', title);
    }

    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', description);
    }

    // Update hreflang tags
    updateHrefLang();

    // Update canonical URL
    updateCanonical();
  }, [title, description, keywords, ogImage, i18n.language, location.pathname]);

  const updateHrefLang = () => {
    // Remove existing hreflang links
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

    // Get base URL and path
    const baseUrl = 'https://www.policybridgeai.com';
    const pathname = location.pathname;
    const languages = ['en', 'zh', 'fr', 'de', 'it', 'es'];

    // Add hreflang links for all languages
    languages.forEach(lang => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = `${baseUrl}${pathname}?lang=${lang}`;
      document.head.appendChild(link);
    });

    // Add x-default hreflang
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.hreflang = 'x-default';
    defaultLink.href = `${baseUrl}${pathname}`;
    document.head.appendChild(defaultLink);
  };

  const updateCanonical = () => {
    const baseUrl = 'https://www.policybridgeai.com';
    const pathname = location.pathname;
    const canonicalUrl = `${baseUrl}${pathname}`;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
  };

  return null;
};
