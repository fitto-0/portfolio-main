import { experiments } from "@/data/experiments";

function generateSitemap() {
  const baseUrl = 'https://fzel.vercel.app';
  const currentDate = new Date().toISOString().split("T")[0];
  
  // Main routes
  const mainRoutes = ["", "/lab", "/about"];
  
  // Get all experiments (filter out external links if needed)
  const filteredExperiments = experiments.filter(
    (experiment) => experiment.type === "internal" || experiment.mdx
  );

  // Generate XML content
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Add main routes
  mainRoutes.forEach(route => {
    xml += `  <url>
    <loc>${baseUrl}${route || '/'}</loc>
    <lastmod>${currentDate}</lastmod>
  </url>
`;
  });

  // Add experiment pages
  filteredExperiments.forEach(experiment => {
    xml += `  <url>
    <loc>${baseUrl}/lab/${experiment.slug}</loc>
    ${experiment.date ? `<lastmod>${experiment.date}</lastmod>` : ''}
  </url>
`;
  });

  xml += '</urlset>';
  
  return xml;
}

export async function GET() {
  const sitemap = generateSitemap();
  
  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'xml-version': '1.0',
      'encoding': 'UTF-8'
    }
  });
}
