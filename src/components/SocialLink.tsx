import { Card } from "@/components/ui/card";
import { ExternalLink, Linkedin, Instagram, Globe, Mail, Phone, DollarSign, Smartphone, MessageCircle, Twitter, Github, MessageSquare } from "lucide-react";

interface SocialLinkProps {
  platform: string;
  title: string;
  url: string;
}

export const SocialLink = ({ platform, title, url }: SocialLinkProps) => {
  const getIcon = () => {
    switch (platform.toLowerCase()) {
      case "linkedin": return Linkedin;
      case "instagram": return Instagram;
      case "email": return Mail;
      case "phone": return Phone;
      case "zelle": return DollarSign;
      case "cashapp": return Smartphone;
      case "reddit": return MessageCircle;
      case "twitter": return Twitter;
      case "github": return Github;
      case "discord": return MessageSquare;
      case "whatsapp": return MessageCircle;
      case "website": return Globe;
      default: return Globe;
    }
  };
  
  const Icon = getIcon();
  const getIconColor = () => {
    switch (platform.toLowerCase()) {
      case "linkedin": return "text-blue-500";
      case "instagram": return "text-pink-500";
      case "email": return "text-green-500";
      case "phone": return "text-blue-600";
      case "zelle": return "text-purple-500";
      case "cashapp": return "text-green-600";
      case "reddit": return "text-orange-500";
      case "twitter": return "text-blue-400";
      case "github": return "text-foreground";
      case "discord": return "text-indigo-500";
      case "whatsapp": return "text-green-500";
      case "website": return "text-primary";
      default: return "text-primary";
    }
  };
  
  const iconColor = getIconColor();

  const formatUrl = (platform: string, url: string) => {
    if (platform === 'email' && !url.startsWith('mailto:')) {
      return `mailto:${url}`;
    }
    if (platform === 'phone' && !url.startsWith('tel:')) {
      return `tel:${url}`;
    }
    if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 shimmer hover:scale-105">
      <a 
        href={formatUrl(platform, url)}
        target={platform === 'email' || platform === 'phone' ? '_self' : '_blank'}
        rel="noopener noreferrer"
        className="flex items-center justify-between p-4 group"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <div>
            <h3 className="font-medium iridescent-text">{title}</h3>
            <p className="text-sm text-muted-foreground iridescent-text">{url}</p>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </a>
    </Card>
  );
};