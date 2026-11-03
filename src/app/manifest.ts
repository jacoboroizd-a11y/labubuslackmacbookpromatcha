import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Frame — Tu universo de streaming",
    short_name: "Frame",
    description: "Tu biblioteca personal de streaming",
    start_url: "/",
    display: "standalone",
    background_color: "#101214",
    theme_color: "#101214",
    lang: "es",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
