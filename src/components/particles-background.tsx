
"use client";

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ParticlesBackgroundProps {
  className?: string;
  variant?: 'default' | 'admin';
}

const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ className, variant = 'default' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    const options = {
      default: {
        particleColor: "hsla(231, 75%, 80%, 0.8)",
        lineColor: "hsla(231, 75%, 70%, 0.4)",
        particleAmount: 50,
        defaultRadius: 2.5,
        variantRadius: 2,
        defaultSpeed: 0.1,
        variantSpeed: 0.2,
        linkRadius: 220,
      },
      admin: {
        particleColor: "hsla(174, 100%, 70%, 0.6)",
        lineColor: "hsla(174, 100%, 60%, 0.15)",
        particleAmount: 60,
        defaultRadius: 1.5,
        variantRadius: 1.5,
        defaultSpeed: 0.2,
        variantSpeed: 0.5,
        linkRadius: 180,
      }
    };
    const config = options[variant];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      x: number;
      y: number;
      radius: number;
      speed: number;
      directionAngle: number;
      vector: { x: number, y: number };

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = config.defaultRadius + Math.random() * config.variantRadius;
        this.speed = config.defaultSpeed + Math.random() * config.variantSpeed;
        this.directionAngle = Math.floor(Math.random() * 360);
        this.vector = {
          x: Math.cos(this.directionAngle) * this.speed,
          y: Math.sin(this.directionAngle) * this.speed
        };
      }

      draw() {
        if(!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = config.particleColor;
        ctx.fill();
      }

      update() {
        this.x += this.vector.x;
        this.y += this.vector.y;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
    }

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < config.particleAmount; i++) {
        particles.push(new Particle());
      }
    };
    
    const linkParticles = () => {
        if(!ctx || !config.linkRadius) return;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < config.linkRadius) {
                    const opacity = 1 - (distance / config.linkRadius);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
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
        particle.draw();
      });
      linkParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    createParticles();
    animate();
    
    const handleResize = () => {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createParticles();
    }
    
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [variant]);

  return <canvas ref={canvasRef} className={cn("fixed top-0 left-0 w-full h-full -z-10", className)} />;
};

export default ParticlesBackground;
