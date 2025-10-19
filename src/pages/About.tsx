import React, { useEffect, useState } from 'react';
import { Award, Users, Globe, Heart, Leaf, Shield, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import cus1 from '../assets/videos/cus1.jpeg'
import cus2 from '../assets/videos/cus2.jpeg'
import cus3 from '../assets/videos/cus3.jpeg'

// CountUp hook for smooth number animation
const useCountUp = (end: number, duration = 3000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 12);
    const interval = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [end, duration]);
  return count;
};

const About = () => {
  const happyCustomers = useCountUp(50000);
  const countries = useCountUp(15);
  const years = useCountUp(6);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-slide-up', 'opacity-100');
              entry.target.classList.remove('opacity-0');
            }, i * 150); // staggered reveal
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const timeline = [
    { year: '2018', title: 'Foundation', description: 'TAMOOR was founded with a vision to bring premium dry fruits to every home.' },
    { year: '2019', title: 'First Milestone', description: 'Reached 2,000 happy customers and expanded to 5 cities.' },
    { year: '2020', title: 'Organic Certification', description: 'Achieved USDA organic certification for our premium range.' },
    { year: '2021', title: 'International Sourcing', description: 'Established direct partnerships with farms across 15 countries.' },
    { year: '2022', title: 'Luxury Packaging', description: 'Introduced premium gift packaging and luxury hampers.' },
    { year: '2023', title: 'Digital Innovation', description: 'Launched AI-powered personalized nutrition recommendations.' },
    { year: '2024', title: 'Sustainability Focus', description: 'Committed to carbon-neutral packaging and sustainable sourcing.' }
  ];

  const team = [
    {
      name: 'Firaz Mustaqim',
      role: 'Founder',
      image: 'https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/firaz.jpg',
      description: 'Visionary entrepreneur with extensive experience in AI.'
    },
    {
      name: 'Musaveer Iqbal',
      role: 'Co-Founder & Head of Sourcing',
      image: 'https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/musaveer.jpg',
      description: 'Expert in global supply chain and quality assurance with over 15 years of experience.'
    }
  ];

  const values = [
    { icon: Award, title: 'Premium Quality', description: 'We source only the finest dry fruits and nuts from premium orchards worldwide.', gradient: 'from-luxury-gold to-luxury-gold-light' },
    { icon: Heart, title: 'Health First', description: 'Every product is carefully selected for maximum nutritional benefits.', gradient: 'from-red-500 to-pink-500' },
    { icon: Leaf, title: 'Sustainability', description: 'Committed to eco-friendly practices and sustainable sourcing.', gradient: 'from-luxury-sage to-luxury-sage-dark' },
    { icon: Shield, title: 'Trust & Safety', description: 'Rigorous quality control and food safety standards.', gradient: 'from-blue-500 to-indigo-500' },
    { icon: Users, title: 'Customer Centric', description: 'Building lasting relationships through exceptional service.', gradient: 'from-purple-500 to-violet-500' },
    { icon: Globe, title: 'Global Reach', description: 'Bringing the world’s finest dry fruits to your doorstep.', gradient: 'from-orange-500 to-amber-500' }
  ];

  const testimonials = [
    { name: "Dhnaush", text: "The quality of Tamoor dry fruits is unmatched. The luxury packaging made it perfect for gifting!", image: cus1 },
    { name: "Anusha Gowda", text: "I loved the freshness and taste. Customer service was also top-notch!", image: cus2 },
    { name: "Abhishek k", text: "Tamoor brings health and luxury together. Highly recommend their hampers!", image: cus3 }
  ];

  const certifications = [
    "https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/fssai-removebg-preview.png",
    "https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/iso-removebg-preview.png",
    "https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/msme-removebg-preview.png"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white">
      {/* Hero Section with Background Video */}
      <section className="relative h-[90vh] flex items-center justify-center text-center overflow-hidden">
        {/* Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster="https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-videos/About.mp4"
        >
          <source src="https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-videos/About.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Content */}
          <div className="relative z-10 max-w-3xl px-6">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
              The <span className="tamoor-gradient font-serif font-extrabold">TAMOOR</span> Legacy
            </h1>
            <p className="text-lg md:text-xl text-neutral-200 leading-relaxed font-medium">
              From humble beginnings to becoming a trusted name in premium dry fruits,
              discover the passion and dedication behind TAMOOR&apos;s journey.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="btn-premium text-white px-8 py-4 rounded-full font-semibold text-lg relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-luxury-gold to-luxury-gold-light animate-pulse opacity-20"></span>
                <span className="relative z-10">Shop Premium Collection</span>
              </Link>

              {/* Smooth scroll button */}
              <button
                onClick={() =>
                  document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 rounded-full font-semibold text-lg bg-white/10 border border-white/30 backdrop-blur-md text-white hover:bg-white/20 transition"
              >
                Discover Our Story
              </button>
            </div>
          </div>

      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-br from-luxury-cream via-white to-luxury-cream-dark relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="text-center animate-on-scroll opacity-0">
              <div className="text-4xl font-display font-bold tamoor-gradient mb-2">{happyCustomers.toLocaleString()}+</div>
              <div className="text-neutral-600 font-medium">Happy Customers</div>
            </div>
            <div className="text-center animate-on-scroll opacity-0">
              <div className="text-4xl font-display font-bold tamoor-gradient mb-2">{countries}+</div>
              <div className="text-neutral-600 font-medium">Countries Sourced</div>
            </div>
            <div className="text-center animate-on-scroll opacity-0">
              <div className="text-4xl font-display font-bold tamoor-gradient mb-2">{years}</div>
              <div className="text-neutral-600 font-medium">Years of Excellence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section id="timeline" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-800 mb-16 text-center">
            Our Journey Through Time
          </h2>

          {/* Mobile Timeline - Vertical (Innovative) */}
            <div className="md:hidden relative border-l-2 border-luxury-gold/40 ml-6 space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="relative pl-6 animate-on-scroll opacity-0">
                  {/* Dot */}
                  <div className="absolute -left-3 top-2 w-4 h-4 rounded-full bg-gradient-to-r from-luxury-gold to-luxury-gold-light shadow-lg"></div>

                  {/* Content */}
                  <div className="luxury-card glass rounded-xl p-4">
                    <div className="text-xl font-display font-bold tamoor-gradient mb-1">
                      {item.year}
                    </div>
                    <h3 className="text-lg font-display font-semibold text-neutral-800">
                      {item.title}
                    </h3>
                    <p className="text-neutral-600 text-sm font-medium mt-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>


          {/* 💻 Desktop Timeline */}
          <div className="hidden md:block relative">
            <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-luxury-gold to-luxury-sage"></div>
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`animate-on-scroll opacity-0 flex flex-col md:flex-row items-center ${
                    index % 2 !== 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div className="md:w-1/2 md:px-12 mb-6 md:mb-0 text-center md:text-left">
                    <div className="luxury-card glass rounded-2xl p-6">
                      <div className="text-2xl font-display font-bold tamoor-gradient mb-2">
                        {item.year}
                      </div>
                      <h3 className="text-xl font-display font-semibold text-neutral-800 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-neutral-600 font-medium">{item.description}</p>
                    </div>
                  </div>
                  <div className="relative z-10 hidden md:block">
                    <div className="w-6 h-6 bg-gradient-to-r from-luxury-gold to-luxury-gold-light rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="md:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Core Values */}
      <section className="py-20 bg-gradient-to-b from-white to-luxury-cream">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-800 mb-16 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="animate-on-scroll opacity-0 luxury-card neomorphism rounded-3xl p-8 text-center group">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${value.gradient} flex items-center justify-center shadow-luxury group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold text-neutral-800 mb-4 group-hover:text-luxury-gold transition-colors duration-300">{value.title}</h3>
                <p className="text-neutral-600 leading-relaxed font-medium">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-800 mb-16 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="animate-on-scroll opacity-0 luxury-card neomorphism rounded-3xl overflow-hidden group">
                <div className="relative overflow-hidden">
                  <img src={member.image} alt={`${member.name}, ${member.role}`} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-4">
                    <a href="#" className="text-white hover:text-luxury-gold"><Linkedin size={20} /></a>
                    <a href="#" className="text-white hover:text-luxury-gold"><Twitter size={20} /></a>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-semibold text-neutral-800 mb-2 group-hover:text-luxury-gold transition-colors duration-300">{member.name}</h3>
                  <div className="text-luxury-gold font-medium mb-3">{member.role}</div>
                  <p className="text-neutral-600 text-sm font-medium">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-luxury-cream to-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-800 mb-16">What Our Customers Say</h2>
          <div className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-4">
            {testimonials.map((t, i) => (
              <div key={i} className="min-w-[300px] max-w-sm mx-auto luxury-card neomorphism rounded-3xl p-6 text-center snap-center">
                <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full mx-auto mb-4 object-cover" />
                <p className="text-neutral-600 italic mb-4">“{t.text}”</p>
                <h4 className="text-lg font-display font-semibold text-neutral-800">{t.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 flex items-center justify-center gap-8 flex-wrap">
          {certifications.map((logo, i) => (
            <img key={i} src={logo} alt="Certification logo" className="h-16 object-contain transition" />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-neutral-900 via-neutral-800 to-luxury-charcoal text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Join the <span className="tamoor-gradient font-serif font-extrabold">TAMOOR</span> Family
          </h2>
          <p className="text-lg md:text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
            Experience the difference that passion, quality, and dedication make. Start your premium dry fruits journey with us today.
          </p>
          <Link to="/products" className="btn-premium text-white px-8 py-4 rounded-full font-semibold text-lg inline-block relative overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-r from-luxury-gold to-luxury-gold-light animate-pulse opacity-20"></span>
            <span className="relative z-10">Shop Premium Collection</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
