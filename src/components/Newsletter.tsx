import React, { useState } from 'react';
import { Mail, Gift, Sparkles } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail('');
    }, 3000);
  };

  return (
    <section className="py-24 bg-gradient-to-br from-neutral-900 via-neutral-800 to-luxury-charcoal text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-luxury-gold rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-luxury-sage rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-luxury-gold/50 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-luxury-gold to-luxury-gold-light rounded-full flex items-center justify-center shadow-luxury-lg">
                <Gift className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-luxury-gold animate-pulse" />
              </div>
            </div>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-8">
            Get <span className="luxury-gradient">15% Off</span> Your First Order
          </h2>
          
          <p className="text-xl text-neutral-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Join our exclusive community and receive premium offers, new product updates, 
            healthy recipes, and insider access to limited collections.
          </p>

          <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Mail className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-14 pr-6 py-5 rounded-full glass text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-transparent text-lg font-medium"
                  required
                  disabled={isSubmitted}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitted}
                className="btn-premium text-white px-10 py-5 rounded-full font-semibold text-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitted ? '✓ Subscribed!' : 'Join Premium Club'}
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-neutral-300">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-4 h-4 bg-luxury-gold rounded-full animate-pulse"></div>
              <span className="font-medium">No spam, ever</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-4 h-4 bg-luxury-sage rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span className="font-medium">Exclusive member offers</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-4 h-4 bg-luxury-gold rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span className="font-medium">Unsubscribe anytime</span>
            </div>
          </div>

          <div className="mt-16 pt-12 border-t border-neutral-700">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
              <div className="text-neutral-400">
                <p className="font-medium">Join 50,000+ premium customers</p>
              </div>
              <div className="flex items-center space-x-6">
                <span className="text-neutral-400 font-medium">Trusted by:</span>
                <div className="flex space-x-4">
                  {['⭐', '🏆', '🌟', '💎'].map((emoji, index) => (
                    <div key={index} className="w-10 h-10 glass rounded-full flex items-center justify-center text-lg hover:scale-110 transition-transform duration-300">
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;