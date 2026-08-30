import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mayur Masala Center",
    short_name: "MM Center",
    description: "Sales, purchase & expense tracker",
    start_url: "/mayurmasala/dashboard",
    scope: "/mayurmasala/",
    display: "standalone",
    background_color: "#FDF6E3",
    theme_color: "#B4182A",
    orientation: "portrait",
    categories: ["business", "finance"],
    icons: [
      {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='192'%3E%3Crect width='192' height='192' fill='%23B4182A' rx='32'/%3E%3Ctext x='96' y='130' font-size='100' font-weight='bold' text-anchor='middle' fill='white' font-family='system-ui'%3EMM%3C/text%3E%3C/svg%3E",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Crect width='512' height='512' fill='%23B4182A' rx='64'/%3E%3Ctext x='256' y='330' font-size='200' font-weight='bold' text-anchor='middle' fill='white' font-family='system-ui'%3EMM%3C/text%3E%3C/svg%3E",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='192'%3E%3Crect width='192' height='192' fill='%23B4182A' rx='32'/%3E%3Ctext x='96' y='130' font-size='100' font-weight='bold' text-anchor='middle' fill='white' font-family='system-ui'%3EMM%3C/text%3E%3C/svg%3E",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}