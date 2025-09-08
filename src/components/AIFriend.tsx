import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AIFriend = () => {
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([
    "Want an intro? I can suggest 3 questions based on shared interests.",
    "Looking for pingers nearby? Try Search to find matches.",
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // For v1 we just append a playful reply; can be wired to an edge function later
    setSuggestions((prev) => [
      `Here’s a thoughtful opener: "${message}" → want variants?`,
      ...prev,
    ]);
    setMessage("");
  };

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <Drawer>
        <DrawerTrigger asChild>
          <Button className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl">
            <Sparkles className="h-5 w-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="mx-auto w-[min(680px,96%)] border-border bg-card">
          <DrawerHeader>
            <DrawerTitle className="iridescent-text">AI Friend</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-3">
            <div className="space-y-2 text-sm text-muted-foreground">
              {suggestions.slice(0,4).map((s, i) => (
                <div key={i} className="bg-secondary/20 border border-border rounded-md p-2 iridescent-text">
                  {s}
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask for intros, ideas, or help starting a convo..."
              />
              <Button type="submit" className="shimmer">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default AIFriend;
