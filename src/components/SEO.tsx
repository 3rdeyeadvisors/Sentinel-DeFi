import { useSiteSettings } from "@/hooks/useSiteSettings";

import SEOAutomation from "./SEOAutomation";

// Standardized SEO component that wraps SEOAutomation
// Maintained for backwards compatibility but uses the new automation system internally

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product" | "course";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  schema?: {
    type: 'Article' | 'Course' | 'FinancialProduct' | 'SoftwareApplication' | 'WebPage' | 'Organization' | 'FAQPage';
    data?: any;
  };
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

const SEO = ({
  title,
  description,
  keywords,
  type = "website",
  article,
  faq
}: SEOProps) => {
  const { settings } = useSiteSettings();

  // Use values from props or settings or defaults
  const effectiveTitle = title || settings?.default_meta_title || "Decentralized DeFi Education & Wealth Tools";
  const effectiveDescription = description || settings?.default_meta_description || "Expert DeFi education and tools.";

  // Convert type to category for SEOAutomation
  const category = type === "course" ? "DeFi Course" : type === "article" ? "DeFi Blog" : "DeFi Education";

  return (
    <SEOAutomation
      title={effectiveTitle}
      description={effectiveDescription}
      category={category}
      faq={faq}
      tags={article?.tags || keywords?.split(",").map(k => k.trim())}
      author={article?.author}
      publishedDate={article?.publishedTime}
    />
  );
};

export default SEO;
