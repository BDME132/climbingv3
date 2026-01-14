import { siteConfig, getAbsoluteUrl } from "@/lib/seo";

interface WebSiteJsonLdProps {
  url?: string;
  name?: string;
  description?: string;
}

export function WebSiteJsonLd({
  url = siteConfig.url,
  name = siteConfig.name,
  description = siteConfig.description,
}: WebSiteJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface ArticleJsonLdProps {
  title: string;
  description?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url: string;
  image?: string;
}

export function ArticleJsonLd({
  title,
  description,
  datePublished,
  dateModified,
  author,
  url,
  image,
}: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: author || siteConfig.defaultAuthor,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    image: image ? getAbsoluteUrl(image) : getAbsoluteUrl(siteConfig.defaultImage),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
