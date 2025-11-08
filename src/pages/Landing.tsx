import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarField } from "@/components/StarField";
import { Link } from "react-router-dom";
import Ring3D from "@/components/Ring3D";
import Model3DViewer from "@/components/Model3DViewer";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Nfc } from "lucide-react";
const waitlistSchema = z.object({
  full_name: z.string().trim().min(2, {
    message: "name must be at least 2 characters"
  }).max(120),
  email: z.string().trim().email({
    message: "invalid email address"
  }).max(255),
  phone_number: z.string().trim().min(7, {
    message: "phone number looks too short"
  }).max(20, {
    message: "phone number looks too long"
  })
});
const Landing = () => {
  const [visibleText, setVisibleText] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleText(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = waitlistSchema.safeParse({
      full_name: fullName.trim(),
      email: email.trim(),
      phone_number: phoneNumber.trim()
    });
    if (!parsed.success) {
      toast({
        title: "invalid input",
        description: parsed.error.issues[0]?.message ?? "please check your details",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Store user info for after payment
      sessionStorage.setItem('waitlist_user', JSON.stringify(parsed.data));

      // Create Stripe checkout session
      const res = await fetch("https://ahksxziueqkacyaqtgeu.supabase.co/functions/v1/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: parsed.data.email,
          name: parsed.data.full_name
        })
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        toast({
          title: "checkout failed",
          description: json.error || "please try again later",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Redirect to Stripe checkout
      window.location.href = json.url;
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "something went wrong",
        description: "please try again later",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-background relative overflow-hidden">
      <StarField />
      
      {/* Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold iridescent-text">ping!</h1>
          <Link to="/auth" className="relative z-20">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50 cursor-pointer">
              sign in
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="text-center space-y-12 max-w-4xl">
          {/* 3D Ring */}
          <div className="flex justify-center">
            <Ring3D />
          </div>

          {/* Hero Text */}
          <div className={`space-y-6 transition-all duration-1000 ${visibleText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-5xl md:text-7xl font-bold iridescent-text leading-tight">
              ping!
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground iridescent-text max-w-2xl mx-auto">the future of connection is approaching.</p>
          </div>

          {/* Waitlist Button */}
          <div className={`transition-all duration-1000 delay-500 ${visibleText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shimmer bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-200 px-12 py-6 text-xl font-semibold">
                  get ping! - $9.99
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold iridescent-text">get ping! - $9.99</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    one-time payment - instant access to ping!
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleWaitlistSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground">full name *</Label>
                    <Input id="fullName" type="text" placeholder="john doe" value={fullName} onChange={e => setFullName(e.target.value)} required className="bg-background/50 border-primary/30" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">email *</Label>
                    <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="bg-background/50 border-primary/30" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">phone number *</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required className="bg-background/50 border-primary/30" />
                  </div>

                  <Button type="submit" size="lg" disabled={isSubmitting} className="shimmer w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 px-8 py-4 text-lg font-semibold">
                    {isSubmitting ? 'processing...' : 'buy now - $9.99'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Features */}
          <div className={`grid md:grid-cols-3 gap-8 mt-16 transition-all duration-1000 delay-1000 ${visibleText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Nfc className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold iridescent-text">instant share</h3>
              <p className="text-sm text-muted-foreground iridescent-text">
                tap your ring to any nfc-enabled device to share your profile instantly
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold iridescent-text">track analytics</h3>
              <p className="text-sm text-muted-foreground iridescent-text">
                see who views your profile and track engagement with detailed analytics
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-lg font-semibold iridescent-text">all-in-one</h3>
              <p className="text-sm text-muted-foreground iridescent-text">
                linkedin, instagram, x, email, phone, venmo - all in one place
              </p>
            </div>
          </div>
          
        </div>
      </main>
    </div>;
};
export default Landing;