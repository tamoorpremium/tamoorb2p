import React, { useEffect, useRef } from 'react';
import { Award, Users, Globe, Heart, Leaf, Shield } from 'lucide-react';

const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll('.animate-on-scroll');
            elements.forEach((element, index) => {
              setTimeout(() => {
                element.classList.add('animate-slide-up');
              }, index * 200);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const timeline = [
    { year: '2018', title: 'Foundation', description: 'TAMOOR was founded with a vision to bring premium dry fruits to every home' },
    { year: '2019', title: 'First Milestone', description: 'Reached 1,000 happy customers and expanded to 5 cities' },
    { year: '2020', title: 'Organic Certification', description: 'Achieved USDA organic certification for our premium range' },
    { year: '2021', title: 'International Sourcing', description: 'Established direct partnerships with farms across 15 countries' },
    { year: '2022', title: 'Luxury Packaging', description: 'Introduced premium gift packaging and luxury hampers' },
    { year: '2023', title: 'Digital Innovation', description: 'Launched AI-powered personalized nutrition recommendations' },
    { year: '2024', title: 'Sustainability Focus', description: 'Committed to carbon-neutral packaging and sustainable sourcing' }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Visionary leader with 15+ years in premium food industry'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Sourcing',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Expert in global supply chain and quality assurance'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Nutrition Specialist',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Certified nutritionist ensuring health benefits in every product'
    },
    {
      name: 'David Kumar',
      role: 'Sustainability Director',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Leading our commitment to environmental responsibility'
    }
  ];

  const values = [
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'We source only the finest dry fruits and nuts from premium orchards worldwide',
      gradient: 'from-luxury-gold to-luxury-gold-light'
    },
    {
      icon: Heart,
      title: 'Health First',
      description: 'Every product is carefully selected for maximum nutritional benefits',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'Committed to eco-friendly practices and sustainable sourcing',
      gradient: 'from-luxury-sage to-luxury-sage-dark'
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Rigorous quality control and food safety standards',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Users,
      title: 'Customer Centric',
      description: 'Building lasting relationships through exceptional service',
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Bringing the world\'s finest dry fruits to your doorstep',
      gradient: 'from-orange-500 to-amber-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-luxury-cream via-white to-luxury-cream-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-luxury-gold rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-luxury-sage rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 text-luxury-gold mb-6">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-luxury-gold"></div>
              <span className="text-sm font-medium tracking-wider uppercase">Our Story</span>
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-luxury-gold"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-neutral-800 mb-6">
              The <span className="tamoor-gradient">TAMOOR</span> Legacy
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed font-medium">
              From humble beginnings to becoming a trusted name in premium dry fruits, 
              discover the passion and dedication behind TAMOOR's journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center animate-on-scroll opacity-0">
              <div className="text-4xl font-display font-bold tamoor-gradient mb-2">50K+</div>
              <div className="text-neutral-600 font-medium">Happy Customers</div>
            </div>
            <div className="text-center animate-on-scroll opacity-0">
              <div className="text-4xl font-display font-bold tamoor-gradient mb-2">15+</div>
              <div className="text-neutral-600 font-medium">Countries Sourced</div>
            </div>
            <div className="text-center animate-on-scroll opacity-0">
              <div className="text-4xl font-display font-bold tamoor-gradient mb-2">6</div>
              <div className="text-neutral-600 font-medium">Years of Excellence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section ref={sectionRef} className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-neutral-800 mb-6">
              Our Journey Through Time
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Milestones that shaped TAMOOR into the premium brand it is today
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-luxury-gold to-luxury-sage"></div>
            
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`animate-on-scroll opacity-0 flex items-center ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                    <div className="luxury-card glass rounded-2xl p-6">
                      <div className="text-2xl font-display font-bold tamoor-gradient mb-2">
                        {item.year}
                      </div>
                      <h3 className="text-xl font-display font-semibold text-neutral-800 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-neutral-600 font-medium">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="w-6 h-6 bg-gradient-to-r from-luxury-gold to-luxury-gold-light rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-b from-white to-luxury-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-neutral-800 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              The principles that guide everything we do at TAMOOR
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="animate-on-scroll opacity-0 luxury-card neomorphism rounded-3xl p-8 text-center group"
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${value.gradient} flex items-center justify-center shadow-luxury group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold text-neutral-800 mb-4 group-hover:text-luxury-gold transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed font-medium">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-neutral-800 mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              The passionate individuals behind TAMOOR's success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="animate-on-scroll opacity-0 luxury-card neomorphism rounded-3xl overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-semibold text-neutral-800 mb-2 group-hover:text-luxury-gold transition-colors duration-300">
                    {member.name}
                  </h3>
                  <div className="text-luxury-gold font-medium mb-3">{member.role}</div>
                  <p className="text-neutral-600 text-sm font-medium">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-900 via-neutral-800 to-luxury-charcoal text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-luxury-gold rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-luxury-sage rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Join the <span className="tamoor-gradient">TAMOOR</span> Family
          </h2>
          <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
            Experience the difference that passion, quality, and dedication make. 
            Start your premium dry fruits journey with us today.
          </p>
          <button className="btn-premium text-white px-8 py-4 rounded-full font-semibold text-lg">
            Shop Premium Collection
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;