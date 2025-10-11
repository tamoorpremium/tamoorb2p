import React, { useRef, useEffect } from 'react';

// Using React.FC (Functional Component) is a good practice in TypeScript
const ConfettiCannon: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    let cw = window.innerWidth;
    let ch = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    ctx.scale(dpr, dpr);

    const confettiCount = 300;
    const particles: Particle[] = [];

    const colors = [
      '#FFD700', // Gold
      '#FF69B4', // Hot Pink
      '#00CED1', // Dark Turquoise
      '#FF4500', // Orange Red
      '#9370DB', // Medium Purple
    ];

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
      angle: number;
      rotation: number;

      constructor() {
        this.x = cw / 2;
        this.y = ch;
        this.vx = random(-10, 10);
        this.vy = random(-15, -30);
        this.radius = random(4, 8);
        this.color = colors[Math.floor(random(0, colors.length))];
        this.alpha = 1;
        this.angle = 0;
        this.rotation = random(-0.1, 0.1);
      }

      update(): boolean {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3;
        this.vx *= 0.99;
        this.alpha -= 0.005;
        this.angle += this.rotation;
        return this.alpha > 0;
      }

      draw(context: CanvasRenderingContext2D): void {
        context.save();
        context.globalAlpha = this.alpha;
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.fillStyle = this.color;
        context.fillRect(-this.radius, -this.radius / 2, this.radius * 2, this.radius);
        context.restore();
      }
    }
    
    for (let i = 0; i < confettiCount; i++) {
        particles.push(new Particle());
    }

    let animationFrameId: number;
    function loop() {
      if (!ctx) return;

      animationFrameId = requestAnimationFrame(loop);
      
      // ✅ This line is now fixed to clear the background transparently
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

    return () => {
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
        zIndex: 100,
      }}
    />
  );
};

export default ConfettiCannon;