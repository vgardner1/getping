import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { ArrowLeft, CreditCard, Shield, Zap, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OptimizedImage } from "@/components/OptimizedImage";
const Checkout = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      const email = user?.email || '';
      const name = (user?.user_metadata as any)?.display_name || (user?.user_metadata as any)?.full_name || '';

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { email, name },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "payment error",
        description: "there was an issue processing your payment. please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-h-screen bg-background relative">
      <StarField />
      
      {/* Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            <ArrowLeft className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold iridescent-text">ping!</span>
          </Link>
          <div className="text-sm iridescent-text">secure checkout</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 pb-28 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="bg-card border-border p-6 h-fit">
            <h2 className="text-2xl font-bold iridescent-text mb-6">order summary</h2>
            
            {/* Product Image */}
            <div className="flex justify-center mb-6">
              <OptimizedImage 
                src="/lovable-uploads/b84bdc7d-10d8-4662-ba10-9a10a8cc6b70.png" 
                alt="NFC Ping Ring - Black ring with silver edges and NFC symbol" 
                className="w-[400px] h-[400px]" 
                priority={true}
              />
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold iridescent-text">ping! </h3>
                  <p className="text-sm text-muted-foreground iridescent-text">access your new network today</p>
                </div>
                <span className="font-semibold iridescent-text">$9.99</span>
              </div>
              
              <div className="border-t border-border pt-2 mt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="iridescent-text">upfront cost</span>
                  <span className="iridescent-text">$9.99</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="iridescent-text">then $2.99/month</span>
                  <span className="text-xs text-muted-foreground iridescent-text">recurring</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="iridescent-text text-primary">refer 1 friend → first month free</span>
                  <span className="text-xs text-primary iridescent-text">bonus</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="iridescent-text">due today</span>
                  <span className="iridescent-text">$9.99</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="iridescent-text">cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="iridescent-text">instant access</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                <span className="iridescent-text">7 days completely free</span>
              </div>
            </div>
          </Card>

          {/* Checkout Form */}
          <Card className="bg-card border-border p-6">
            <h2 className="text-2xl font-bold iridescent-text mb-6 text-center">
              complete your order
            </h2>
            
            <div className="space-y-6">
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full shimmer bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform duration-200 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "processing..." : "get ping! today - $9.99"}
              </Button>
              
              
              <div className="text-xs text-center text-muted-foreground iridescent-text">
                payment and shipping details will be collected securely through stripe
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>;
};
export default Checkout;