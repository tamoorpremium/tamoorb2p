import React from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import FeaturedProducts from '../components/FeaturedProducts';
import Features from '../components/Features';
import Newsletter from '../components/Newsletter';
import Fireworks from '../components/Fireworks'; // 1. Import the component
import NewPromoPage from '../components/NewPromoPage';

const Home = () => {
  return (
    <div>
      <Fireworks /> {/* 2. Add the component here */}
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Features />
      <NewPromoPage />
      <Newsletter />
      
    </div>
  );
};

export default Home;