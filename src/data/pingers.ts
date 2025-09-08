export type PingerProfile = {
  id: string;
  name: string;
  city: string;
  role: string;
  bio: string;
  avatar: string;
  lat?: number;
  lng?: number;
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const PINGER_PROFILES: PingerProfile[] = [
  {
    id: slugify("Alex Chen"),
    name: "Alex Chen",
    city: "San Francisco",
    role: "Product Designer",
    bio: "Designing delightful human-centered products.",
    avatar: "/lovable-uploads/048c22a0-4b6c-4593-89ce-49d2f78449c2.png",
    lat: 37.7749,
    lng: -122.4194,
  },
  {
    id: slugify("Maya Patel"),
    name: "Maya Patel",
    city: "Boston",
    role: "Data Scientist",
    bio: "Turning data into decisions with empathy.",
    avatar: "/lovable-uploads/0b122861-6f47-4ba6-85a3-8a6db847c0f6.png",
    lat: 42.3601,
    lng: -71.0589,
  },
  {
    id: slugify("Sam Rivera"),
    name: "Sam Rivera",
    city: "New York",
    role: "Founder",
    bio: "Building communities around impactful tech.",
    avatar: "/lovable-uploads/1754b949-8d55-41e0-ae70-436edf9b7018.png",
    lat: 40.7128,
    lng: -74.006,
  },
  {
    id: slugify("Jordan Kim"),
    name: "Jordan Kim",
    city: "Los Angeles",
    role: "Engineer",
    bio: "Scalable systems and accessible UX.",
    avatar: "/lovable-uploads/82b70768-a7f7-433b-aa7c-250bf6b72151.png",
    lat: 34.0522,
    lng: -118.2437,
  },
  {
    id: slugify("Taylor Swift"),
    name: "Taylor Swift",
    city: "London",
    role: "Creative Director",
    bio: "Storytelling through sound and visuals.",
    avatar: "/lovable-uploads/9330d76c-abaf-4b58-a5d8-ef1efd49f1ba.png",
    lat: 51.5074,
    lng: -0.1278,
  },
  {
    id: slugify("Sarah Johnson"),
    name: "Sarah Johnson",
    city: "Tokyo",
    role: "Researcher",
    bio: "Human-computer interaction and future of work.",
    avatar: "/lovable-uploads/9ee1d542-a2fe-4a76-8fef-8094c127a879.png",
    lat: 35.6762,
    lng: 139.6503,
  },
  {
    id: slugify("Emily Davis"),
    name: "Emily Davis",
    city: "Paris",
    role: "Product Manager",
    bio: "Aligning teams to ship with purpose.",
    avatar: "/lovable-uploads/048c22a0-4b6c-4593-89ce-49d2f78449c2.png",
    lat: 48.8566,
    lng: 2.3522,
  },
  {
    id: slugify("David Park"),
    name: "David Park",
    city: "Berlin",
    role: "Community Lead",
    bio: "Creating spaces where builders thrive.",
    avatar: "/lovable-uploads/0b122861-6f47-4ba6-85a3-8a6db847c0f6.png",
    lat: 52.52,
    lng: 13.405,
  },
  {
    id: slugify("Lisa Wang"),
    name: "Lisa Wang",
    city: "Beijing",
    role: "Marketing",
    bio: "Bridging brands and communities.",
    avatar: "/lovable-uploads/1754b949-8d55-41e0-ae70-436edf9b7018.png",
    lat: 39.9042,
    lng: 116.4074,
  },
  {
    id: slugify("Tom Wilson"),
    name: "Tom Wilson",
    city: "Sydney",
    role: "Designer",
    bio: "Sustainable design for everyday life.",
    avatar: "/lovable-uploads/82b70768-a7f7-433b-aa7c-250bf6b72151.png",
    lat: -33.8688,
    lng: 151.2093,
  },
];
