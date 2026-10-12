import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Headliner",
    short_name: "Headliner",
    description: "Who to book. Who to sponsor. Backed by evidence.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#E8412A",
    theme_color: "#E8412A",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
