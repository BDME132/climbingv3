export const siteConfig = {
  name: "MDX Starter",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  defaultAuthor: "Bridger Tower",
  defaultImage: "/og-image.png",
  description:
    "MDX and Next.js Starter made by Bridger Tower at 9d8 and WIP / AC",
};

export function getAbsoluteUrl(path: string): string {
  const baseUrl = siteConfig.url.endsWith("/")
    ? siteConfig.url.slice(0, -1)
    : siteConfig.url;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
