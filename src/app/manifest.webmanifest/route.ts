/**
 * PWA manifest.
 *
 * Served from a route rather than a static file so the icon can be generated
 * inline — no binary assets to keep in sync with the accent colour, and one
 * fewer thing to forget when the brand changes.
 */
export const dynamic = "force-static";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#e2560f"/>
  <text x="50%" y="52%" dominant-baseline="central" text-anchor="middle"
        font-family="system-ui, sans-serif" font-size="300" font-weight="700" fill="#fff">L</text>
</svg>`;

export function GET() {
  const icon = `data:image/svg+xml,${encodeURIComponent(ICON)}`;

  return Response.json({
    name: "Lingo — languages, out loud",
    short_name: "Lingo",
    description:
      "Learn a language in phrases, out loud. Lessons, pronunciation drills and conversation practice.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["education"],
    icons: [
      { src: icon, sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: icon, sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  });
}
