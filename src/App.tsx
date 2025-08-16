import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import FeaturedProducts from './components/FeaturedProducts';
import Features from './components/Features';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Features />
      <Newsletter />
      <Footer />
    </div>
  );
}

export default App;