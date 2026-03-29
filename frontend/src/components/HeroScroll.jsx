import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const HeroScroll = ({ children }) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const [images, setImages] = useState([]);
    const frameCount = 240;

    // Scroll progress for the entire container
    // Offset: ["start start", "end end"] means the animation happens while the container is pinned
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Map scroll progress (0-1) to image index (0-239)
    const frameIndex = useTransform(scrollYProgress, [0, 1], [1, frameCount]);
    
    // Smooth the frame transition
    const smoothFrame = useSpring(frameIndex, {
        stiffness: 300,
        damping: 30,
        restDelta: 0.001
    });

    // Preload images
    useEffect(() => {
        const loadedImages = [];
        let loadedCount = 0;

        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            const paddedNumber = i.toString().padStart(3, '0');
            img.src = `/hero_section1/ezgif-frame-${paddedNumber}.jpg`;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === frameCount) {
                    // All images loaded
                }
            };
            loadedImages.push(img);
        }
        setImages(loadedImages);
    }, []);

    // Draw to canvas whenever smoothFrame changes
    useEffect(() => {
        const unsubscribe = smoothFrame.on("change", (latest) => {
            const index = Math.floor(latest);
            if (images[index - 1] && canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                const img = images[index - 1];
                
                // Cover behavior
                const canvas = canvasRef.current;
                const canvasAspect = canvas.width / canvas.height;
                const imgAspect = img.width / img.height;
                
                let drawWidth, drawHeight, offsetX, offsetY;
                
                if (canvasAspect > imgAspect) {
                    drawWidth = canvas.width;
                    drawHeight = canvas.width / imgAspect;
                    offsetX = 0;
                    offsetY = (canvas.height - drawHeight) / 2;
                } else {
                    drawWidth = canvas.height * imgAspect;
                    drawHeight = canvas.height;
                    offsetX = (canvas.width - drawWidth) / 2;
                    offsetY = 0;
                }
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            }
        });

        return () => unsubscribe();
    }, [images]);

    // Update canvas size on mount and resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                const dpr = window.devicePixelRatio || 1;
                canvasRef.current.width = window.innerWidth * dpr;
                canvasRef.current.height = window.innerHeight * dpr;
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Text animations based on scroll
    const titleOpacity = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0]);
    const titleScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
    
    const subOpacity = useTransform(scrollYProgress, [0.35, 0.45, 0.55, 0.65], [0, 1, 1, 0]);
    const subY = useTransform(scrollYProgress, [0.35, 0.45, 0.65], [50, 0, -50]);

    const featureOpacity = useTransform(scrollYProgress, [0.7, 0.8, 1], [0, 1, 1]);
    const featureScale = useTransform(scrollYProgress, [0.7, 0.8], [1.2, 1]);

    return (
        <div ref={containerRef} style={{ height: '400vh', position: 'relative' }}>
            <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden' }}>
                <canvas 
                    ref={canvasRef} 
                    style={{ 
                        display: 'block', 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                    }} 
                />
                
                {/* Overlay Text Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
                    {/* PANEL 1 — Brand Title */}
                    <motion.div 
                        style={{ opacity: titleOpacity, scale: titleScale }}
                        className="max-w-6xl w-full"
                    >
                        <h1 style={{
                            fontFamily: "'Bebas Neue', Impact, sans-serif",
                            fontSize: 'clamp(5rem, 18vw, 20rem)',
                            lineHeight: 0.88,
                            letterSpacing: '-0.02em',
                            /* Skeleton effect — transparent fill, warm amber-gold stroke */
                            color: 'transparent',
                            WebkitTextStroke: 'clamp(1px, 0.2vw, 2.5px) rgba(255, 195, 100, 0.92)',
                            textShadow: '0 0 120px rgba(66, 61, 61, 0.25)',
                            paintOrder: 'stroke fill',
                        }}>
                            SKYLOOMS
                        </h1>
                        <p style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: 'clamp(1.2rem, 3vw, 2.8rem)',
                            fontStyle: 'italic',
                            fontWeight: 350,
                            letterSpacing: '0.35em',
                            /* Warm peach/rose-gold to match sunset */
                            color: 'rgba(255, 255, 255, 0.85)',
                            marginTop: '1.5rem',
                            textTransform: 'uppercase',
                            textShadow: '0 2px 20px rgba(0,0,0,0.4)',

                        }}>
                            Redefining the Horizon
                        </p>
                    </motion.div>

                    {/* PANEL 2 — Tagline */}
                    <motion.div 
                        style={{ opacity: subOpacity, y: subY }}
                        className="absolute max-w-4xl px-8"
                    >
                        <h2 style={{
                            fontFamily: "'Bebas Neue', Impact, sans-serif",
                            fontSize: 'clamp(3.5rem, 10vw, 9rem)',
                            lineHeight: 0.92,
                            letterSpacing: '0.01em',
                            color: '#38bdf8',
                            textShadow: '0 0 60px rgba(56,189,248,0.5), 0 4px 30px rgba(0,0,0,0.5)',
                        }}>
                            Seamless<br/>Journeys.
                        </h2>
                        <p style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: 'clamp(1.1rem, 2.5vw, 1.8rem)',
                            fontStyle: 'italic',
                            fontWeight: 350,
                            color: 'rgba(255, 255, 255, 0.65)',
                            marginTop: '1.5rem',
                            letterSpacing: '0.05em',
                            textShadow: '0 2px 15px rgba(0,0,0,0.6)',
                        }}>
                            Experience travel that breathes with you.<br/>Every frame, every mile, perfectly woven.
                        </p>
                    </motion.div>

                    {/* PANEL 3 — CTA */}
                    <motion.div 
                        style={{ opacity: featureOpacity, scale: featureScale }}
                        className="absolute max-w-3xl text-center"
                    >
                        <h2 style={{
                            fontFamily: "'Bebas Neue', Impact, sans-serif",
                            fontSize: 'clamp(3rem, 8vw, 7rem)',
                            lineHeight: 0.9,
                            letterSpacing: '0.02em',
                            color: 'white',
                            textShadow: '0 0 50px rgba(255,255,255,0.2), 0 4px 30px rgba(0,0,0,0.6)',
                            marginBottom: '1rem',
                        }}>
                            Ready to Explore?
                        </h2>
                        <p style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                            fontStyle: 'italic',
                            color: 'rgba(255,255,255,0.55)',
                            letterSpacing: '0.08em',
                            marginBottom: '2rem',
                        }}>
                            The sky isn't the limit — it's just the beginning.
                        </p>
                        <button 
                            className="pointer-events-auto btn-primary px-10 py-4 text-lg rounded-full"
                            style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '0.08em', fontWeight: 700 }}
                            onClick={() => window.scrollTo({ top: window.innerHeight * 4, behavior: 'smooth' })}
                        >
                            Book Your Adventure
                        </button>
                    </motion.div>
                </div>


                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-main)] to-transparent" />
                
                {/* Scroll Indicator */}
                <motion.div 
                    style={{ opacity: titleOpacity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30">Scroll to Explore</span>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-sky-500 to-transparent" />
                </motion.div>
            </div>
        </div>
    );
};

export default HeroScroll;
