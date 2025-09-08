import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, MessageCircle, PlaySquare } from "lucide-react";

// Authors pool
const authors = [
  { name: "Alex Chen", avatar: "/lovable-uploads/048c22a0-4b6c-4593-89ce-49d2f78449c2.png" },
  { name: "Maya Patel", avatar: "/lovable-uploads/0b122861-6f47-4ba6-85a3-8a6db847c0f6.png" },
  { name: "Sam Rivera", avatar: "/lovable-uploads/1754b949-8d55-41e0-ae70-436edf9b7018.png" },
  { name: "Jordan Kim", avatar: "/lovable-uploads/82b70768-a7f7-433b-aa7c-250bf6b72151.png" },
  { name: "Emily Davis", avatar: "/lovable-uploads/048c22a0-4b6c-4593-89ce-49d2f78449c2.png" },
  { name: "Sarah Johnson", avatar: "/lovable-uploads/9ee1d542-a2fe-4a76-8fef-8094c127a879.png" },
];

// Existing seed posts
const baseProjects = Array.from({ length: 14 }).map((_, i) => {
  const imgs = [
    "/src/assets/dam-chair.jpg",
    "/src/assets/roots-table.jpg",
    "/src/assets/storm-republic.jpg",
    "/src/assets/lucid-republic.jpg",
  ];
  const titles = [
    "Sustainable Chair Prototype",
    "Biomimetic Table Concept",
    "Storm Sculpture Study",
    "Lucid Pavilion V2",
  ];
  const idx = i % titles.length;
  const author = authors[i % authors.length];
  return {
    id: `p-${i}`,
    title: titles[idx],
    author,
    image: imgs[idx],
    likes: 200 + (i * 7) % 320,
    endorsements: 20 + (i * 3) % 90,
    tags: ["Creative", idx % 2 ? "Prototype" : "Concept"],
    description:
      "Exploring material efficiency and expressive form. Feedback welcome — iterating weekly with real‑world constraints.",
  };
});

// 20 new unique posts spanning Product, UI, AI, Creative
const newPosts = [
  { id: "n-01", title: "Echo One Smart Speaker", author: authors[0], image: "/src/assets/feed/feed-01.jpg", likes: 812, endorsements: 64, tags: ["Product", "Audio"] , description: "Minimalist, fabric‑wrapped smart speaker tuned for warm living spaces." },
  { id: "n-02", title: "ModPack Travel System", author: authors[1], image: "/src/assets/feed/feed-02.jpg", likes: 640, endorsements: 51, tags: ["Product", "Outdoor"] , description: "Detachable modules for flexible trips — from commute to weekend hike." },
  { id: "n-03", title: "BioSole v3 Prototype", author: authors[2], image: "/src/assets/feed/feed-03.jpg", likes: 701, endorsements: 58, tags: ["Product", "Sustainable"] , description: "Sneaker prototype using algae‑based foam and recycled knit." },
  { id: "n-04", title: "FinSight Dashboard", author: authors[3], image: "/src/assets/feed/feed-04.jpg", likes: 990, endorsements: 77, tags: ["UI", "Fintech"] , description: "Dark‑mode KPIs, multi‑asset charts, and anomaly alerts." },
  { id: "n-05", title: "Wellnest Mobile UI", author: authors[4], image: "/src/assets/feed/feed-05.jpg", likes: 845, endorsements: 66, tags: ["UI", "Health"] , description: "Sleep, heart rate, and recovery insights with friendly color system." },
  { id: "n-06", title: "Nimbus Admin", author: authors[5], image: "/src/assets/feed/feed-06.jpg", likes: 902, endorsements: 72, tags: ["UI", "SaaS"] , description: "Glassmorphism analytics with role‑based controls and audit trails." },
  { id: "n-07", title: "MicroFab Robotics", author: authors[0], image: "/src/assets/feed/feed-07.jpg", likes: 756, endorsements: 63, tags: ["AI", "Robotics"] , description: "Precision assembly workflows powered by vision models." },
  { id: "n-08", title: "Neon Flow Fields", author: authors[1], image: "/src/assets/feed/feed-08.jpg", likes: 678, endorsements: 49, tags: ["AI", "Generative"] , description: "Particle simulation driven by diffusion‑based color mapping." },
  { id: "n-09", title: "Home Voice Agent", author: authors[2], image: "/src/assets/feed/feed-09.jpg", likes: 590, endorsements: 41, tags: ["AI", "IoT"] , description: "Ambient interface for hands‑free home orchestration." },
  { id: "n-10", title: "Lattice Lights", author: authors[3], image: "/src/assets/feed/feed-10.jpg", likes: 774, endorsements: 55, tags: ["Creative", "Installation"] , description: "Immersive LED sculpture mapping audio to color gradients." },
  { id: "n-11", title: "Torque Ribbon", author: authors[4], image: "/src/assets/feed/feed-11.jpg", likes: 612, endorsements: 47, tags: ["Creative", "Sculpture"] , description: "Kinetic piece exploring torsion and reflective surfaces." },
  { id: "n-12", title: "FlowBottle Exploded", author: authors[5], image: "/src/assets/feed/feed-12.jpg", likes: 821, endorsements: 65, tags: ["Product", "Industrial"] , description: "Filtered bottle system designed for on‑the‑go refills." },
  { id: "n-13", title: "Ledger Lite App", author: authors[0], image: "/src/assets/feed/feed-13.jpg", likes: 708, endorsements: 59, tags: ["UI", "Crypto"] , description: "Holdings, gas fees, and trending assets in a calm UI." },
  { id: "n-14", title: "CoLab AI Notebook", author: authors[1], image: "/src/assets/feed/feed-14.jpg", likes: 931, endorsements: 74, tags: ["AI", "Tools"] , description: "Chat‑assisted coding with inline visualizations and prompts." },
  { id: "n-15", title: "Lucent Pavilion", author: authors[2], image: "/src/assets/feed/feed-15.jpg", likes: 860, endorsements: 68, tags: ["Creative", "Arch"] , description: "Translucent pavilion with curved panels and soft glow." },
  { id: "n-16", title: "Spectra AR Glasses", author: authors[3], image: "/src/assets/feed/feed-16.jpg", likes: 999, endorsements: 82, tags: ["Product", "Wearable"] , description: "Lightweight AR frames emphasizing comfort and clarity." },
  { id: "n-17", title: "Voyage Booking UI", author: authors[4], image: "/src/assets/feed/feed-17.jpg", likes: 675, endorsements: 53, tags: ["UI", "Travel"] , description: "Map‑centric search with rich filters and itinerary planner." },
  { id: "n-18", title: "Falcon Micro‑Drone", author: authors[5], image: "/src/assets/feed/feed-18.jpg", likes: 742, endorsements: 61, tags: ["AI", "Aero"] , description: "Carbon fiber shell with autonomous navigation stack." },
  { id: "n-19", title: "Hearth Lamp", author: authors[0], image: "/src/assets/feed/feed-19.jpg", likes: 588, endorsements: 44, tags: ["Creative", "Craft"] , description: "Hand‑thrown ceramic lamp with warm diffused glow." },
  { id: "n-20", title: "Casa Smart UI", author: authors[1], image: "/src/assets/feed/feed-20.jpg", likes: 720, endorsements: 57, tags: ["UI", "Home"] , description: "Scenes, energy usage, and automations in a friendly mobile UI." },
];

const projects = newPosts;

const Feed = () => {
  useEffect(() => {
    document.title = "Project Feed • Ping";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold iridescent-text flex items-center gap-2">
            <PlaySquare className="h-5 w-5 text-primary" />
            Project Feed
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-6 pb-28">
        {projects.map((p) => (
          <Card key={p.id} className="bg-card border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-3">
              <img src={p.author.avatar} alt={`${p.author.name} avatar`} className="w-9 h-9 rounded-full border border-border object-cover" loading="lazy" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium iridescent-text truncate">{p.author.name}</div>
                    <div className="text-xs text-muted-foreground">{p.tags.join(" • ")}</div>
                  </div>
                  <Badge variant="secondary" className="bg-primary/15 text-primary">New</Badge>
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="relative aspect-[4/5] bg-muted/20">
              <img src={p.image} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
            </div>

            {/* Body */}
            <div className="p-3 space-y-2">
              <div className="font-semibold iridescent-text">{p.title}</div>
              <p className="text-sm text-muted-foreground">{p.description}</p>

              <div className="flex items-center gap-4 pt-1">
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Heart className="h-4 w-4" /> {p.likes.toLocaleString()}
                </button>
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <MessageCircle className="h-4 w-4" /> {p.endorsements}
                </button>
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
            </div>
          </Card>
        ))}
      </main>
    </div>
  );
};

export default Feed;
