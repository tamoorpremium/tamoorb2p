// src/components/LogoIntro.jsx

import React from 'react';
import tamoorLogo from '../assets/logo/tamoorlogo.png';

const LogoIntro = () => {
  return (
    <section 
      className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-luxury-cream via-white to-luxury-cream-dark"
    >
      {/* This div uses a CSS animation to gently fade in and scale up the logo, 
        creating a premium feel.
      */}
      <div className="animate-fadeInScale">
        <img
          src={tamoorLogo}
          alt="TAMOOR Logo"
          className="h-24 sm:h-32 lg:h-40 w-auto" // Logo is larger here for impact
        />
      </div>
    </section>
  );
};

export default LogoIntro;