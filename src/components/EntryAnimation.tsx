import React, { useRef, useEffect, useState } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import "../index.css";

interface EntryAnimationProps {
  onAnimationComplete: () => void;
}

const EntryAnimation: React.FC<EntryAnimationProps> = ({ onAnimationComplete }) => {
  const word = "TAMOOR";
  const textRef = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shutterControls = useAnimation();
  const scanControls = useAnimation();
  const glowControls = useAnimation();
  const [textWidth, setTextWidth] = useState(0);

  /** Measure text width dynamically for accurate scan coverage */
  useEffect(() => {
    if (textRef.current) setTextWidth(textRef.current.offsetWidth);
  }, []);

  /** Animation sequence controller */
  useEffect(() => {
    const runSequence = async () => {
      await shutterControls.start("visible");
      await new Promise((resolve) => setTimeout(resolve, 100));
      await scanControls.start("scan");
      await new Promise((resolve) => setTimeout(resolve, 800));
      glowControls.start("glow");
      onAnimationComplete();
    };
    runSequence();
  }, [onAnimationComplete, shutterControls, scanControls, glowControls]);

  /** Responsive Plexus Background Animation */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let cw = window.innerWidth,
      ch = window.innerHeight;
    canvas.width = cw;
    canvas.height = ch;

    // 🔧 Reduce particles on small screens
    const particleCount = cw < 768 ? 70 : 150;
    const particles: any[] = [];
    const colors = ["#DAA520", "#FFD700", "#B8860B"];
    const maxDistance = cw < 768 ? 80 : 100;
    let animationFrameId: number;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      constructor() {
        this.x = Math.random() * cw;
        this.y = Math.random() * ch;
        this.vx = Math.random() * 0.4 - 0.2;
        this.vy = Math.random() * 0.4 - 0.2;
        this.radius = Math.random() * 1.5 + 0.5;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > cw) this.vx *= -1;
        if (this.y < 0 || this.y > ch) this.vy *= -1;
      }
      draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = colors[1];
        context.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    function loop() {
      const context = ctx;
      if (!context) return;

      context.clearRect(0, 0, cw, ch);
      particles.forEach((p) => p.update());

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < maxDistance) {
            context.beginPath();
            context.moveTo(particles[i].x, particles[i].y);
            context.lineTo(particles[j].x, particles[j].y);
            context.strokeStyle = colors[0];
            context.lineWidth = 0.3;
            context.globalAlpha = 1 - dist / maxDistance;
            context.stroke();
          }
        }
      }

      context.globalAlpha = 1;
      particles.forEach((p) => p.draw(context));
      animationFrameId = requestAnimationFrame(loop);
    }

    loop();

    const handleResize = () => {
      cw = window.innerWidth;
      ch = window.innerHeight;
      canvas.width = cw;
      canvas.height = ch;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /** Variants */
  const shutterVariants: Variants = {
    hidden: { y: "0%" },
    visible: {
      y: "-100%",
      transition: { duration: 0.7, ease: [0.7, 0.01, -0.05, 0.9] },
    },
  };

  const scanLineVariants: Variants = {
    initial: { x: -textWidth - 150 },
    scan: {
      x: textWidth + 150,
      transition: { duration: 1.5, ease: "easeInOut" },
    },
  };

  const glowVariants: Variants = {
    initial: { textShadow: "0px 0px 0px rgba(255,215,0,0)" },
    glow: {
      textShadow: [
        "0px 0px 12px rgba(255,215,0,0.6)",
        "0px 0px 22px rgba(255,215,0,0.9)",
        "0px 0px 12px rgba(255,215,0,0.6)",
      ],
      transition: { duration: 2, repeat: Infinity, repeatType: "mirror" },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center z-[99999]"
      style={{ perspective: "800px" }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />

      <div className="relative z-10 text-center">
        <motion.h3
          ref={textRef}
          className="font-serif font-bold tamoor-gradient select-none tracking-widest
           text-[12vw] sm:text-7xl md:text-8xl lg:text-9xl"
          variants={glowVariants}
          initial="initial"
          animate={glowControls}
        >
          {word}
        </motion.h3>

        {/* Shutter cover */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial="hidden"
          animate={shutterControls}
        >
          <motion.div className="absolute inset-0 bg-black" variants={shutterVariants} />
        </motion.div>

        {/* Responsive Scan line */}
        <motion.div
          className="absolute top-[-25%] h-[150%]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,215,0,0.9), transparent)",
            width: "10px",
            boxShadow: "0 0 20px 10px rgba(255,215,0,0.6)",
            skewX: "-15deg",
            mixBlendMode: "color-dodge",
          }}
          variants={scanLineVariants}
          initial="initial"
          animate={scanControls}
        />
      </div>
    </motion.div>
  );
};

export default EntryAnimation;