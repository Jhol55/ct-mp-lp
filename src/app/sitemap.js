export default function sitemap() {
  const baseUrl = "https://maodepedra.com.br";
  const now = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

