import React from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import FeaturedProducts from '../components/FeaturedProducts';
import Features from '../components/Features';
import Newsletter from '../components/Newsletter';

const Home = () => {
  return (
    <div>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Features />
      <Newsletter />
    </div>
  );
};

export default Home;