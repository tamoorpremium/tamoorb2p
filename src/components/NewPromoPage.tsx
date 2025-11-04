import React from 'react';
// import { Link } from 'react-router-dom'; // Link is no longer used

// 1. Import Swiper React components and modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';

// 2. Import Swiper styles
// You'll need to install Swiper first: npm install swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// 3. TODO: Update these paths with your own images
// I'm using your asset structure as a reference
import heroDesktop from '../assets/brands/bannerlap/Lindt_Kunafa_web_banner.webp'; // Placeholder
import heroD2 from '../assets/brands/bannerlap/Lindt_Bannerr.webp';
import heroD3 from '../assets/brands/bannerlap/Hershey_web_banner_1800x800_c1854cfe-09f0-48c3-b54b-b161431ad91c.webp';
import heroD5 from '../assets/brands/bannerlap/web_banner_4.webp';
import heroD4 from '../assets/brands/bannerlap/cc_offer_bundle-WEB_banner.webp';
import heroD6 from '../assets/brands/bannerlap/website_banner_C.webp';
import heroMobile from '../assets/brands/bannerm/Lindt_Kunafa_mob_banner.webp';   // Placeholder
import herom1 from '../assets/brands/bannerm/Lindt_Banner.webp';
import herom2 from '../assets/brands/bannerm/mobile_banner_1.webp';
import herom3 from '../assets/brands/bannerm/Hersheym.webp';
import herom4 from '../assets/brands/bannerm/mobile_banner_2.webp';
import herom5 from '../assets/brands/bannerm/ccm.webp';


import brand1 from '../assets/brands/Top_Brands_Feastables.webp'; // Placeholder
import brand2 from '../assets/brands/cadburi.webp'; // Placeholder
import brand3 from '../assets/brands/her.webp'; // Placeholder
import brand4 from '../assets/brands/lindtt.webp'; // Placeholder
import brand5 from '../assets/brands/malt.webp'; // Placeholder
import brand6 from '../assets/brands/mm.webp'; // Placeholder
import brand7 from '../assets/brands/neu.webp';
import brand8 from '../assets/brands/rhine.webp';
import brand9 from '../assets/brands/tob.webp';
import brand10 from '../assets/brands/whitt.webp';


import stickerImg from '../assets/brands/Top_Picks.png'; // Placeholder for "Top Picks"

// Updated imports for "Top Picks" banners
import banner1Desktop from '../assets/brands/bannerlap/Maltesersd.webp'; // Renamed from banner1
import banner2Desktop from '../assets/brands/bannerlap/website_banner_2.webp'; // Renamed from banner2
import banner1Mobile from '../assets/brands/bannerm/Malteser_750X1100_1.webp'; // TODO: Update this path
import banner2Mobile from '../assets/brands/bannerm/mobile_web_banner_3.webp'; // TODO: Update this path


// Main component
const NewPromoPage = () => {

  // === NEW HERO SLIDES DATA ===
  const heroSlides = [
    {
      id: 1,
      mobileImg: heroMobile, // 750x1100
      desktopImg: heroDesktop, // 1800x800
      alt: 'Shop our new collection',
      link: '/products?reset=true' // From original code
    },
    {
      id: 2,
      mobileImg: herom1, // TODO: Add your 750x1100 image
      desktopImg: heroD2, // TODO: Add your 1800x800 image
      alt: 'Promotion 2',
      link: '/products?reset=true'
    },
    {
      id: 3,
      mobileImg: herom2, // TODO: Add your 750x1100 image
      desktopImg: heroD3, // TODO: Add your 1800x800 image
      alt: 'Promotion 3',
      link: '/products?reset=true'
    },
    {
      id: 4,
      mobileImg: herom3, // TODO: Add your 750x1100 image
      desktopImg: heroD4, // TODO: Add your 1800x800 image
      alt: 'Promotion 4',
      link: '/products?reset=true'
    },
    {
      id: 5,
      mobileImg: herom4, // TODO: Add your 750x1100 image
      desktopImg: heroD5, // TODO: Add your 1800x800 image
      alt: 'Promotion 4',
      link: '/products?reset=true'
     },{
      id: 6,
      mobileImg: herom5, // TODO: Add your 750x1100 image
      desktopImg: heroD6, // TODO: Add your 1800x800 image
      alt: 'Promotion 4',
      link: '/products?reset=true'
    },
  ];

  // A simple array for the brand data, just like in your other components
  const topBrands = [
    { name: 'Lindt', img: brand1, link: '/products?reset=true' },
    { name: 'Rhine Valley', img: brand2, link: '/products?reset=true' },
    { name: 'Mr.Beast', img: brand3, link: '/products?reset=true' },
    { name: 'Whittakers', img: brand4, link: '/products?reset=true' },
    { name: 'Venchi', img: brand5, link: '/products?reset=true' },
    { name: 'Neuhaus', img: brand6, link: '/products?reset=true' },
    { name: 'Neuhaus', img: brand7, link: '/products?reset=true' },
    { name: 'Neuhaus', img: brand8, link: '/products?reset=true' },
    { name: 'Neuhaus', img: brand9, link: '/products?reset=true' },
    { name: 'Neuhaus', img: brand10, link: '/products?reset=true' },
  ];

  // === NEW "TOP PICKS" SLIDES DATA ===
  const topPicksSlides = [
    {
      id: 1,
      mobileImg: banner1Mobile, // 750x1100
      desktopImg: banner1Desktop, // 1800x800
      alt: 'Promotion Banner 1',
    },
    {
      id: 2,
      mobileImg: banner2Mobile, // 750x1100
      desktopImg: banner2Desktop, // 1800x800
      alt: 'Promotion Banner 2',
    }
  ];

  return (
    <div className="bg-white">
      
      {/* === 1. HERO BANNER (NOW A SWIPER) === */}
      <section className="hero-slider w-full">
        <Swiper
          modules={[EffectFade, Autoplay, Pagination, Navigation]}
          loop={true}
          effect="fade" // This creates the cross-fade effect
          fadeEffect={{ crossFade: true }}
          autoplay={{
            delay: 3000, // <-- CHANGED from 5000
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation={true} // Enabled navigation arrows
          className="w-full"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div
                aria-label={slide.alt}
                className="block aspect-[750/1100] md:aspect-[1800/800] w-full bg-gray-100"
              >
                <picture className="w-full h-full">
                  {/* Desktop Image (shows on screens 768px and wider) */}
                  <source media="(min-width: 768px)" srcSet={slide.desktopImg} />
                  {/* Mobile Image (default) */}
                  <img 
                    src={slide.mobileImg} 
                    alt={slide.alt} 
                    className="w-full h-full object-cover" // Fills the container
                  />
                </picture>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* === 2. TOP BRANDS SLIDER ("Moving Cards") === */}
     <section className="py-16 sm:py-24 bg-gray-50">
       <div className="container mx-auto px-4">
         {/* Using your project's styles for the heading */}
         <h2 className="text-3xl sm:text-5xl font-display font-bold text-neutral-800 text-center mb-12">
           Top Chocolate Brands
         </h2>
         
         <Swiper
           modules={[Navigation, Autoplay]}
           loop={true}
           autoplay={{
             delay: 2500, // <-- CHANGED from 3000
             disableOnInteraction: false,
           }}
           spaceBetween={30}
           slidesPerView={2} // 2 slides visible on mobile
           navigation
           breakpoints={{
             // when window width is >= 768px
             768: {
               slidesPerView: 4, // 4 slides on tablet
             },
             // when window width is >= 1024px
             1024: {
               slidesPerView: 5, // 5 slides on desktop
             },
           }}
           className="w-full"
         >
           {topBrands.map((brand) => (
             <SwiperSlide key={brand.name}>
               <div className="block group"> {/* Replaced Link with div */}
                 {/* Styled to look like the Cococart cards */}
                 <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                   <img 
                     src={brand.img} 
                     alt={brand.name} 
                     className="w-full object-cover" 
                     style={{ aspectRatio: '330 / 495' }} // Set to your image's 330x495 aspect ratio
                   />
                 </div>
               </div>
             </SwiperSlide>
           ))}
         </Swiper>
       </div>
     </section>

      {/* === 3 & 4. STICKY STICKER ON SLIDESHOW === */}
      <section className="relative mt-24 mb-12 sm:mb-24">
        
        {/* 3. The Sticker */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-36 sm:w-44">
          <img 
            src={stickerImg} 
            alt="Top Picks" 
            className="w-full h-auto drop-shadow-lg" 
          />
        </div>

        {/* 4. The Changing Banners */}
        <div className="container mx-auto px-4">
          <Swiper
            modules={[EffectFade, Autoplay, Pagination]}
            loop={true}
            effect="fade" // This creates the cross-fade effect
            fadeEffect={{ crossFade: true }}
            autoplay={{
              delay: 3000, // <-- CHANGED from 5000
              disableOnInteraction: false,
            }}
            pagination={{ clickable: true }}
            // Added responsive aspect ratio to the Swiper container
            className="w-full rounded-2xl overflow-hidden shadow-lg aspect-[750/1100] md:aspect-[1800/800] bg-gray-100"
          >
            {topPicksSlides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div aria-label={slide.alt} className="w-full h-full"> {/* Replaced Link with div */}
                  <picture className="w-full h-full">
                    {/* Desktop Image (shows on screens 768px and wider) */}
                    <source media="(min-width: 768px)" srcSet={slide.desktopImg} />
                    {/* Mobile Image (default) */}
                    <img 
                      src={slide.mobileImg} 
                      alt={slide.alt} 
                      className="w-full h-full object-cover" // Fills the container
                    />
                  </picture>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

    </div>
  );
};

export default NewPromoPage;