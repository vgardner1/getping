import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { ArrowLeft, CreditCard, Shield, Zap, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
const Checkout = () => {
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock subscription success
    alert("Free trial started! You'll be billed $2.99 monthly after 7 days. Refer 5 friends to get your first month free!");
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
          <div className="text-sm iridescent-text">Secure Checkout</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 pb-28 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="bg-card border-border p-6 h-fit">
            <h2 className="text-2xl font-bold iridescent-text mb-6">Order Summary</h2>
            
            {/* Product Image */}
            <div className="flex justify-center mb-6">
              <img src="/lovable-uploads/b84bdc7d-10d8-4662-ba10-9a10a8cc6b70.png" alt="NFC Ping Ring - Black ring with silver edges and NFC symbol" className="w-[400px] h-[400px] object-contain" />
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold iridescent-text">ping! </h3>
                  <p className="text-sm text-muted-foreground iridescent-text">Access your new network today</p>
                </div>
                <span className="font-semibold iridescent-text">Free Trial</span>
              </div>
              
              <div className="border-t border-border pt-2 mt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="iridescent-text">7-Day Free Trial</span>
                  <span className="iridescent-text">$0.00</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="iridescent-text">Then $2.99/month</span>
                  <span className="text-xs text-muted-foreground iridescent-text">recurring</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="iridescent-text text-primary">Refer 5 friends → First month free</span>
                  <span className="text-xs text-primary iridescent-text">bonus</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="iridescent-text">Due Today</span>
                  <span className="iridescent-text">$0.00</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="iridescent-text">Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="iridescent-text">Instant access</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                <span className="iridescent-text">7 days completely free</span>
              </div>
            </div>
          </Card>

          {/* Checkout Form */}
          <Card className="bg-card border-border p-6">
            <h2 className="text-2xl font-bold iridescent-text mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              Payment Details
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium iridescent-text mb-2">
                    Email
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text" required />
                </div>
                <div>
                  <label className="block text-sm font-medium iridescent-text mb-2">
                    Full Name
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text" required />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">
                  Address
                </label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium iridescent-text mb-2">
                    City
                  </label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text" required />
                </div>
                <div>
                  <label className="block text-sm font-medium iridescent-text mb-2">
                    ZIP Code
                  </label>
                  <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text" required />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">
                  Card Number
                </label>
                <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} placeholder="1234 5678 9012 3456" className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium iridescent-text mb-2">
                    Expiry Date
                  </label>
                  <input type="text" name="expiry" value={formData.expiry} onChange={handleInputChange} placeholder="MM/YY" className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text" required />
                </div>
                <div>
                  <label className="block text-sm font-medium iridescent-text mb-2">
                    CVV
                  </label>
                  <input type="text" name="cvv" value={formData.cvv} onChange={handleInputChange} placeholder="123" className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text" required />
                </div>
              </div>
              
              <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground iridescent-text text-center">
                  Start your 7-day free trial • No payment required today
                </p>
              </div>
              
              <Button type="submit" className="w-full shimmer bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform duration-200 py-4 text-lg font-semibold">
                Start Free Trial
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>;
};
export default Checkout;