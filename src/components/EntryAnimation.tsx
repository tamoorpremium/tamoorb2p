import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// NEW: Import your SVG as a React component. This is the modern syntax for Vite.
// If you are using an older Create React App, you might need:
// import { ReactComponent as MyLogo } from '../assets/MyLogo.svg';
import MyLogo from '../assets/MyLogo.svg?react';

interface EntryAnimationProps {
  onAnimationComplete: () => void;
}

const EntryAnimation: React.FC<EntryAnimationProps> = ({ onAnimationComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Set a timeout to trigger the exit animation
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 2500); // Animation will last 2.5 seconds before fading out

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);
  
  // This useEffect handles the particle burst animation on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let cw = window.innerWidth;
    let ch = window.innerHeight;
    canvas.width = cw;
    canvas.height = ch;

    const particleCount = 400;
    const particles: Particle[] = [];
    const colors = ['#FFFFFF', '#00FFFF', '#7DF9FF', '#FFFFFF']; // Futuristic colors

    function random(min: number, max: number): number {
      return Math.random() * (max - min) + min;
    }

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;

      constructor() {
        this.x = cw / 2; // Start in the center
        this.y = ch / 2;
        const angle = random(0, Math.PI * 2);
        const speed = random(1, 12);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.radius = random(1, 3);
        this.color = colors[Math.floor(random(0, colors.length))];
        this.alpha = 1;
      }

      update(): boolean {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // A little gravity
        this.alpha -= 0.02;
        return this.alpha > 0;
      }

      draw(context: CanvasRenderingContext2D): void {
        context.globalAlpha = this.alpha;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationFrameId: number;
    function loop() {
      if (!ctx) return;
      animationFrameId = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, cw, ch);
      
      let i = particles.length;
      while (i--) {
        if (!particles[i].update()) {
          particles.splice(i, 1);
        } else {
          particles[i].draw(ctx);
        }
      }
    }
    loop();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-neutral-900 flex items-center justify-center z-[99999]"
        exit={{ opacity: 0, transition: { duration: 0.5 } }}
      >
        {/* Canvas for the background particle burst */}
        <canvas ref={canvasRef} className="absolute inset-0" />
        
        {/* Your logo fading and scaling in on top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 1, ease: 'easeOut' } }}
          className="relative z-10"
        >
          <MyLogo width={150} height={150} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EntryAnimation;