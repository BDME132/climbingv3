export const siteConfig = {
  name: "RockClimbUtah",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://rockclimbutah.com",
  defaultAuthor: "RockClimbUtah",
  defaultImage: "/og-image.png",
  description:
    "Curated route guides for Utah climbing areas. Find the best routes at every grade without the information overload.",
};

export function getAbsoluteUrl(path: string): string {
  const baseUrl = siteConfig.url.endsWith("/")
    ? siteConfig.url.slice(0, -1)
    : siteConfig.url;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
