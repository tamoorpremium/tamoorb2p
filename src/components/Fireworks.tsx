import React, { useRef, useEffect } from 'react';

// Using React.FC (Functional Component) is a good practice in TypeScript
const Fireworks: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // --- START: Auto-disable code ---
    const launchEndDate = new Date('2025-10-20T00:00:00'); // Set your end date
    const currentDate = new Date();
    if (currentDate > launchEndDate) return;
    // --- END: Auto-disable code ---

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    let cw = window.innerWidth;
    let ch = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    const isMobile = cw < 768;
    const scaleFactor = isMobile ? 0.7 : 1;
    const particleCount = 30; // Explosion size

    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    ctx.scale(dpr, dpr);

    let fireworks: Firework[] = [];
    let particles: Particle[] = [];
    let animationFrameId: number;
    let launchIntervalId: NodeJS.Timeout;

    function random(min: number, max: number): number {
      return Math.random() * (max - min) + min;
    }
    
    // ==================================================================
    // == 🚀 UPDATED Firework class to be a visible rocket 🚀 ==
    // ==================================================================
    class Firework {
      x: number;
      y: number;
      sx: number;
      sy: number;
      tx: number;
      ty: number;
      distanceToTarget: number;
      distanceTraveled: number;
      coords: [number, number][]; // Tracks previous positions for the tail
      angle: number;
      speed: number;
      acceleration: number;
      brightness: number;
      
      constructor() {
        this.sx = random(cw * 0.1, cw * 0.9);
        this.sy = ch;
        this.x = this.sx;
        this.y = this.sy;
        this.tx = random(0, cw);
        this.ty = random(0, ch / 2);

        this.coords = [];
        let coordCount = 3; // Length of the rocket's tail
        while (coordCount--) this.coords.push([this.x, this.y]);

        const xd = this.tx - this.sx;
        const yd = this.ty - this.sy;
        this.distanceToTarget = Math.sqrt(xd * xd + yd * yd);
        this.distanceTraveled = 0;
        
        this.angle = Math.atan2(yd, xd);
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = random(50, 70);
      }

      update(): boolean {
        // Update the tail coordinates
        this.coords.pop();
        this.coords.unshift([this.x, this.y]);

        this.speed *= this.acceleration;
        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;
        this.x += vx;
        this.y += vy;
        this.distanceTraveled = Math.sqrt(Math.pow(this.x - this.sx, 2) + Math.pow(this.y - this.sy, 2));
        
        return this.distanceTraveled >= this.distanceToTarget;
      }

      draw(context: CanvasRenderingContext2D): void {
        // Draw the tail
        context.beginPath();
        context.moveTo(this.coords[this.coords.length - 1][0], this.coords[this.coords.length - 1][1]);
        context.lineTo(this.x, this.y);
        context.strokeStyle = `hsl(${random(0,360)}, 100%, ${this.brightness}%)`;
        context.lineWidth = 2 * scaleFactor;
        context.stroke();

        // Draw the glowing head of the rocket
        context.beginPath();
        context.arc(this.x, this.y, 2 * scaleFactor, 0, Math.PI * 2);
        context.fillStyle = `hsl(${random(0,360)}, 100%, ${this.brightness}%)`;
        context.fill();
      }
    }
    
    class Particle {
      x: number;
      y: number;
      coords: [number, number][];
      angle: number;
      speed: number;
      friction: number;
      gravity: number;
      hue: number;
      brightness: number;
      alpha: number;
      decay: number;
      
      constructor(x: number, y: number, hue: number) {
        this.x = x;
        this.y = y;
        this.coords = [[x,y], [x,y], [x,y]];
        this.angle = random(0, Math.PI * 2);
        this.speed = random(1, 10) * scaleFactor;
        this.friction = 0.95;
        this.gravity = 1 * scaleFactor;
        this.hue = hue;
        this.brightness = random(50, 80);
        this.alpha = 1;
        this.decay = random(0.015, 0.03);
      }
      
      update(): boolean {
        this.coords.pop();
        this.coords.unshift([this.x, this.y]);
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;
        return this.alpha > this.decay;
      }
      
      draw(context: CanvasRenderingContext2D): void {
        context.beginPath();
        context.moveTo(this.coords[this.coords.length - 1][0], this.coords[this.coords.length - 1][1]);
        context.lineTo(this.x, this.y);
        context.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        context.lineWidth = Math.max(1, 2 * scaleFactor);
        context.stroke();
      }
    }
    
    function createParticles(x: number, y: number): void {
      const hue = random(0, 360);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(x, y, hue));
      }
    }

    function loop() {
      if (!ctx) return;
      animationFrameId = requestAnimationFrame(loop);
      
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.globalCompositeOperation = 'lighter';

      let i = fireworks.length;
      while (i--) {
        fireworks[i].draw(ctx);
        if (fireworks[i].update()) {
          createParticles(fireworks[i].x, fireworks[i].y);
          fireworks.splice(i, 1);
        }
      }

      let j = particles.length;
      while (j--) {
        if (!particles[j].update()) {
          particles.splice(j, 1);
        } else {
          particles[j].draw(ctx);
        }
      }
    }

    const handleResize = () => {
      if (!canvas || !ctx) return;
      cw = window.innerWidth;
      ch = window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
      ctx.scale(dpr, dpr);
    };

    launchIntervalId = setInterval(() => {
        fireworks.push(new Firework());
    }, 1000); // Launch a new firework every 1 second

    window.addEventListener('resize', handleResize);
    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(launchIntervalId);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

export default Fireworks;