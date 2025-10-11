import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, Variants, useAnimation } from 'framer-motion';

interface EntryAnimationProps {
  onAnimationComplete: () => void;
}

const EntryAnimation: React.FC<EntryAnimationProps> = ({ onAnimationComplete }) => {
  const word = "TAMOOR";
  const letters = word.split("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanControls = useAnimation(); // Animation controls for the scan line

  const handleWordAnimationComplete = async () => {
    // 1. Once the word is formed, trigger the scan line animation
    await scanControls.start("scan");
    
    // 2. After the scan, hold for a moment
    const holdDuration = 1500; // Hold for 1.5 seconds after the scan
    setTimeout(() => {
      onAnimationComplete();
    }, holdDuration);
  };

  // This useEffect handles the "Plexus" background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let cw = window.innerWidth;
    let ch = window.innerHeight;
    canvas.width = cw;
    canvas.height = ch;

    const particleCount = 150; 
    const particles: Particle[] = [];
    const colors = ['#DAA520', '#FFD700', '#B8860B'];
    const maxDistance = 100;
    let animationFrameId: number;

    class Particle {
      x: number; y: number; vx: number; vy: number; radius: number;
      constructor() { this.x = Math.random() * cw; this.y = Math.random() * ch; this.vx = Math.random() * 0.4 - 0.2; this.vy = Math.random() * 0.4 - 0.2; this.radius = Math.random() * 1.5 + 0.5; }
      update(): void { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > cw) this.vx *= -1; if (this.y < 0 || this.y > ch) this.vy *= -1; }
      draw(context: CanvasRenderingContext2D): void { context.beginPath(); context.arc(this.x, this.y, this.radius, 0, Math.PI * 2); context.fillStyle = colors[1]; context.fill(); context.closePath(); }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function loop() {
      if (!ctx) return;
      ctx.clearRect(0, 0, cw, ch);
      particles.forEach(p => p.update());
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = colors[0];
            ctx.lineWidth = 0.3;
            ctx.globalAlpha = 1 - (dist / maxDistance);
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
      ctx.globalAlpha = 1;
      particles.forEach(p => p.draw(ctx));
      animationFrameId = requestAnimationFrame(loop);
    }
    loop();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 }},
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 20, rotateX: -90 },
    visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: 'spring', damping: 12, stiffness: 200 }},
  };

  const scanLineVariants: Variants = {
    initial: {
      left: '-10%',
      opacity: 0,
    },
    scan: {
      left: '100%',
      opacity: [0, 1, 1, 0],
      transition: { duration: 0.7, ease: 'easeInOut', times: [0, 0.1, 0.9, 1] },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center z-[99999] overflow-hidden"
      style={{ perspective: '800px' }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-[99990]" />

      <motion.h3
        // ✅ ADDED font-serif and font-bold here
        className="text-7xl sm:text-8xl md:text-9xl font-serif font-bold flex relative overflow-hidden z-[99991]"
        style={{
          background: 'linear-gradient(135deg, #DAA520, #FFD700, #B8860B)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {letters.map((letter, index) => (
          <motion.span 
            key={index} 
            variants={letterVariants}
            onAnimationComplete={index === letters.length - 1 ? handleWordAnimationComplete : undefined}
          >
            {letter}
          </motion.span>
        ))}

        <motion.div
          className="absolute top-[-10%] h-[120%]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.8), transparent)',
            width: '50px',
            boxShadow: '0 0 20px 10px rgba(255, 215, 0, 0.5)',
            skewX: -15,
          }}
          variants={scanLineVariants}
          initial="initial"
          animate={scanControls}
        />
      </motion.h3>
    </motion.div>
  );
};

export default EntryAnimation;