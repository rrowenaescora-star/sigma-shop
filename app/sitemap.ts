import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://bloxhop.site",
      lastModified: new Date(),
    },
    {
      url: "https://bloxhop.site/home",
      lastModified: new Date(),
    },

    {
      url: "https://bloxhop.site/mm2",
      lastModified: new Date(),
    },
    {
      url: "https://bloxhop.site/adopt-me",
      lastModified: new Date(),
    },
    {
      url: "https://bloxhop.site/blade-ball",
      lastModified: new Date(),
    },
    {
      url: "https://bloxhop.site/pet-simulator",
      lastModified: new Date(),
    },
    {
      url: "https://bloxhop.site/anime-defenders",
      lastModified: new Date(),
    },

    {
      url: "https://bloxhop.site/track-order",
      lastModified: new Date(),
    },
    {
      url: "https://bloxhop.site/contact",
      lastModified: new Date(),
    },
    {
      url: "https://bloxhop.site/refund-policy",
      lastModified: new Date(),
    },
    {
      url: "https://bloxhop.site/terms",
      lastModified: new Date(),
    },
    {
      url: "https://bloxhop.site/delivery",
      lastModified: new Date(),
    },
  ];
}