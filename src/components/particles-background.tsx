
"use client";

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ParticlesBackgroundProps {
  className?: string;
  variant?: 'default' | 'admin' | 'signup';
}

const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ className, variant = 'default' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    const options = {
      default: {
        particleColor: "hsla(231, 75%, 80%, 0.5)",
        lineColor: "hsla(231, 75%, 70%, 0.3)",
        particleAmount: 40,
        defaultRadius: 1.5,
        variantRadius: 1,
        defaultSpeed: 0.2,
        variantSpeed: 0.4,
        linkRadius: 200,
        type: 'growth',
      },
      signup: {
        particleColor: "hsla(174, 90%, 75%, 0.7)",
        lineColor: "hsla(174, 90%, 65%, 0.4)",
        particleAmount: 50,
        defaultRadius: 1.5,
        variantRadius: 1.5,
        defaultSpeed: 0.3,
        variantSpeed: 0.5,
        linkRadius: 220,
        type: 'growth',
      },
      admin: {
        particleColor: "hsla(174, 100%, 70%, 0.6)",
        lineColor: "hsla(174, 100%, 60%, 0.15)",
        particleAmount: 60,
        defaultRadius: 1.5,
        variantRadius: 1,
        defaultSpeed: 0.1,
        variantSpeed: 0.2,
        linkRadius: 180,
        type: 'network',
      }
    };
    const config = options[variant];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: (Particle | GrowthParticle)[] = [];

    abstract class BaseParticle {
        x: number;
        y: number;
        radius: number;
        
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = config.defaultRadius + Math.random() * config.variantRadius;
        }

        abstract draw(context: CanvasRenderingContext2D): void;
        abstract update(): void;
    }

    class NetworkParticle extends BaseParticle {
      speed: number;
      directionAngle: number;
      vector: { x: number, y: number };

      constructor() {
        super();
        this.speed = config.defaultSpeed + Math.random() * config.variantSpeed;
        this.directionAngle = Math.floor(Math.random() * 360);
        this.vector = {
          x: Math.cos(this.directionAngle) * this.speed,
          y: Math.sin(this.directionAngle) * this.speed
        };
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = config.particleColor;
        ctx.fill();
      }

      update() {
        this.x += this.vector.x;
        this.y += this.vector.y;
        this.resetPosition();
      }

      resetPosition() {
        if (this.x < -this.radius) this.x = canvas.width + this.radius;
        if (this.x > canvas.width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = canvas.height + this.radius;
        if (this.y > canvas.height + this.radius) this.y = -this.radius;
      }
    }
    
    class GrowthParticle extends BaseParticle {
        speed: number;
        constructor() {
            super();
            this.y = canvas.height + this.radius;
            this.speed = config.defaultSpeed + Math.random() * config.variantSpeed;
        }
        
        draw(ctx: CanvasRenderingContext2D) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = config.particleColor;
            ctx.fill();

            // Draw a tail
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.radius * 4);
            ctx.lineWidth = this.radius * 0.5;
            ctx.strokeStyle = config.lineColor;
            ctx.stroke();
        }

        update() {
            this.y -= this.speed;
            if(this.y < -this.radius * 5) {
                this.y = canvas.height + this.radius;
                this.x = Math.random() * canvas.width;
            }
        }
    }


    const createParticles = () => {
      particles = [];
      for (let i = 0; i < config.particleAmount; i++) {
        if(config.type === 'growth'){
            particles.push(new GrowthParticle());
        } else {
            particles.push(new NetworkParticle());
        }
      }
    };
    
    const linkNetworkParticles = () => {
        if(!ctx) return;
        const networkParticles = particles as NetworkParticle[];
        for (let i = 0; i < networkParticles.length; i++) {
            for (let j = i + 1; j < networkParticles.length; j++) {
                const dx = networkParticles[i].x - networkParticles[j].x;
                const dy = networkParticles[i].y - networkParticles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < config.linkRadius) {
                    const opacity = 1 - (distance / config.linkRadius);
                    ctx.beginPath();
                    ctx.moveTo(networkParticles[i].x, networkParticles[i].y);
                    ctx.lineTo(networkParticles[j].x, networkParticles[j].y);
                    ctx.strokeStyle = config.lineColor.replace(/,\s*\d*\.?\d*\)/, `, ${opacity})`);
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    const animate = () => {
      if(!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });
      
      if(config.type === 'network') {
          linkNetworkParticles();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createParticles();
    }
    
    createParticles();
    animate();
    
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [variant]);

  return <canvas ref={canvasRef} className={cn("fixed top-0 left-0 w-full h-full -z-10", className)} />;
};

export default ParticlesBackground;
