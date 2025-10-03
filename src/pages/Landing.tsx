import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarField } from "@/components/StarField";
import { Link } from "react-router-dom";
import Ring3D from "@/components/Ring3D";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
const Landing = () => {
  const [visibleText, setVisibleText] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleText(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !phoneNumber) {
      toast({
        title: "missing information",
        description: "please provide your name, email, and phone number",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert({
          full_name: fullName,
          email: email,
          phone_number: phoneNumber
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "already registered",
            description: "this email is already on the waitlist!",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "you're on the list! 🎉",
          description: "we'll notify you when ping! launches"
        });
        setFullName('');
        setEmail('');
        setPhoneNumber('');
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Waitlist signup error:', error);
      toast({
        title: "something went wrong",
        description: "please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-background relative overflow-hidden">
      <StarField />
      
      {/* Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold iridescent-text">ping!</h1>
          <Link to="/auth">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 py-2">
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
            <p className="text-xl md:text-2xl text-muted-foreground iridescent-text max-w-2xl mx-auto">the future of networking is here.
your new network is waiting</p>
          </div>

          {/* Waitlist Button */}
          <div className={`transition-all duration-1000 delay-500 ${visibleText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="shimmer bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-200 px-12 py-6 text-xl font-semibold"
                >
                  join the waitlist
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold iridescent-text">join the waitlist</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    be the first to experience the future of networking
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleWaitlistSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground">full name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="john doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="bg-background/50 border-primary/30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background/50 border-primary/30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">phone number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="bg-background/50 border-primary/30"
                    />
                  </div>

                  <Button 
                    type="submit"
                    size="lg" 
                    disabled={isSubmitting}
                    className="shimmer w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 px-8 py-4 text-lg font-semibold"
                  >
                    {isSubmitting ? 'joining...' : 'join the waitlist'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Features */}
          <div className={`grid md:grid-cols-3 gap-8 mt-16 transition-all duration-1000 delay-1000 ${visibleText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📱</span>
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