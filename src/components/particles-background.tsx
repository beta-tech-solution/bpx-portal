
"use client";

import React, { useRef, useEffect, useMemo } from 'react';
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
        particleAmount: 80,
        defaultRadius: 2,
        variantRadius: 2,
        defaultSpeed: 0.1,
        variantSpeed: 0.2,
        linkRadius: 200,
        icons: true,
      },
      signup: {
        particleColor: "hsla(174, 90%, 75%, 0.7)",
        lineColor: "hsla(174, 90%, 65%, 0.4)",
        particleAmount: 80,
        defaultRadius: 2,
        variantRadius: 2,
        defaultSpeed: 0.1,
        variantSpeed: 0.2,
        linkRadius: 200,
        icons: true,
      },
      admin: {
        particleColor: "hsla(174, 100%, 70%, 0.6)",
        lineColor: "hsla(174, 100%, 60%, 0.15)",
        particleAmount: 80,
        defaultRadius: 1.5,
        variantRadius: 1,
        defaultSpeed: 0.2,
        variantSpeed: 0.3,
        linkRadius: 180,
        icons: false,
      }
    };
    const config = options[variant];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: Particle[] = [];

    // Financial Icons as SVG strings
    const dollarIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`;
    const chartIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18.7 8a6 6 0 0 0-6 6"></path><path d="M13 13a2 2 0 0 0 2 2"></path></svg>`;

    const icons = [dollarIcon, chartIcon].map(svgString => {
        const img = new Image();
        img.src = `data:image/svg+xml;base64,${btoa(svgString.replace('currentColor', config.particleColor))}`;
        return img;
    });

    class Particle {
      x: number;
      y: number;
      radius: number;
      speed: number;
      directionAngle: number;
      vector: { x: number, y: number };
      isIcon: boolean;
      icon: HTMLImageElement | null;
      
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
        this.isIcon = config.icons && Math.random() > 0.9; // 10% chance to be an icon
        this.icon = this.isIcon ? icons[Math.floor(Math.random() * icons.length)] : null;
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.isIcon && this.icon && this.icon.complete) {
            ctx.globalAlpha = 0.6;
            ctx.drawImage(this.icon, this.x - 12, this.y - 12, 24, 24);
            ctx.globalAlpha = 1.0;
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = config.particleColor;
            ctx.fill();
        }
      }

      update() {
        this.x += this.vector.x;
        this.y += this.vector.y;
        this.resetPosition();
      }

      resetPosition() {
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
    
    const linkParticles = (ctx: CanvasRenderingContext2D) => {
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
        particle.draw(ctx);
      });
      linkParticles(ctx);

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createParticles();
    }
    
    // Initial setup
    let ready = !config.icons;
    if (config.icons) {
        let loadedCount = 0;
        icons.forEach(icon => {
            icon.onload = () => {
                loadedCount++;
                if (loadedCount === icons.length) {
                    ready = true;
                    createParticles();
                    if(!animationFrameId) animate();
                }
            }
            // Handle cases where the image might already be loaded/cached
            if (icon.complete) {
                loadedCount++;
                 if (loadedCount === icons.length) {
                    ready = true;
                }
            }
        });
    }

    if (ready) {
        createParticles();
        animate();
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
