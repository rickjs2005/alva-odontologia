import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://alva-odontologia.vercel.app",
      lastModified: new Date("2026-07-25"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
